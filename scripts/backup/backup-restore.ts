#!/usr/bin/env node

/**
 * SecuryFlex Database Restore Script
 *
 * Restores database from backup files with support for
 * compressed and encrypted backups
 */

import { execSync } from 'child_process'
import { existsSync, createReadStream, createWriteStream } from 'fs'
import { createGunzip } from 'zlib'
import { createDecipher } from 'crypto'
import { join } from 'path'
import { promisify } from 'util'
import readline from 'readline'

interface RestoreConfig {
  backupFile: string
  targetDatabaseUrl: string
  force: boolean
  skipConfirmation: boolean
  verbose: boolean
  tempDir?: string
}

interface RestoreResult {
  success: boolean
  duration: number
  error?: string
  restoredTables?: string[]
}

class DatabaseRestore {
  private config: RestoreConfig

  constructor(config: RestoreConfig) {
    this.config = config
  }

  /**
   * Main restore execution
   */
  async executeRestore(): Promise<RestoreResult> {
    const startTime = Date.now()

    try {
      console.log('🔄 Starting database restore...')
      console.log(`📁 Backup file: ${this.config.backupFile}`)

      // Validate backup file exists
      if (!existsSync(this.config.backupFile)) {
        throw new Error(`Backup file not found: ${this.config.backupFile}`)
      }

      // Safety confirmation
      if (!this.config.skipConfirmation) {
        const confirmed = await this.confirmRestore()
        if (!confirmed) {
          console.log('❌ Restore cancelled by user')
          return { success: false, duration: Date.now() - startTime }
        }
      }

      // Prepare backup file (decompress/decrypt if needed)
      const preparedFile = await this.prepareBackupFile()

      try {
        // Execute the restore
        console.log('📦 Restoring database...')
        await this.restoreDatabase(preparedFile)

        // Verify restore
        console.log('✅ Verifying restore...')
        const restoredTables = await this.verifyRestore()

        const duration = Date.now() - startTime

        console.log('✅ Database restore completed successfully!')
        console.log(`📊 Restored ${restoredTables.length} tables`)
        console.log(`⏱️ Duration: ${this.formatDuration(duration)}`)

        return {
          success: true,
          duration,
          restoredTables
        }

      } finally {
        // Clean up temporary files
        if (preparedFile !== this.config.backupFile) {
          this.cleanupTempFile(preparedFile)
        }
      }

    } catch (error) {
      const duration = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      console.error('❌ Database restore failed:', errorMessage)

      return {
        success: false,
        duration,
        error: errorMessage
      }
    }
  }

  /**
   * Prepare backup file (decompress and/or decrypt)
   */
  private async prepareBackupFile(): Promise<string> {
    let currentFile = this.config.backupFile
    const tempDir = this.config.tempDir || join(process.cwd(), 'temp')

    // Check if file is encrypted
    if (currentFile.endsWith('.enc')) {
      console.log('🔐 Decrypting backup file...')
      currentFile = await this.decryptFile(currentFile, tempDir)
    }

    // Check if file is compressed
    if (currentFile.endsWith('.gz')) {
      console.log('🗜️ Decompressing backup file...')
      currentFile = await this.decompressFile(currentFile, tempDir)
    }

    return currentFile
  }

  /**
   * Decrypt backup file
   */
  private async decryptFile(inputPath: string, tempDir: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const encryptionKey = process.env.BACKUP_ENCRYPTION_KEY

      if (!encryptionKey) {
        reject(new Error('BACKUP_ENCRYPTION_KEY environment variable is required for encrypted backups'))
        return
      }

      const outputPath = join(tempDir, 'decrypted_backup.sql.gz')
      const decipher = createDecipher('aes-256-cbc', encryptionKey)
      const input = createReadStream(inputPath)
      const output = createWriteStream(outputPath)

      // Ensure temp directory exists
      if (!existsSync(tempDir)) {
        require('fs').mkdirSync(tempDir, { recursive: true })
      }

      input.pipe(decipher).pipe(output)

      output.on('close', () => resolve(outputPath))
      output.on('error', reject)
      decipher.on('error', reject)
    })
  }

  /**
   * Decompress backup file
   */
  private async decompressFile(inputPath: string, tempDir: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const outputPath = join(tempDir, 'decompressed_backup.sql')
      const gunzip = createGunzip()
      const input = createReadStream(inputPath)
      const output = createWriteStream(outputPath)

      // Ensure temp directory exists
      if (!existsSync(tempDir)) {
        require('fs').mkdirSync(tempDir, { recursive: true })
      }

      input.pipe(gunzip).pipe(output)

      output.on('close', () => resolve(outputPath))
      output.on('error', reject)
      gunzip.on('error', reject)
    })
  }

  /**
   * Restore database from backup file
   */
  private async restoreDatabase(backupFile: string): Promise<void> {
    // Drop existing connections (if force mode)
    if (this.config.force) {
      console.log('🔄 Terminating existing database connections...')
      await this.terminateConnections()
    }

    const pgRestoreCommand = [
      'pg_restore',
      '--verbose',
      '--clean',
      '--no-owner',
      '--no-privileges',
      '--if-exists',
      '--dbname', `"${this.config.targetDatabaseUrl}"`,
      `"${backupFile}"`
    ].join(' ')

    if (this.config.verbose) {
      console.log('🔧 Executing restore command:', pgRestoreCommand)
    }

    try {
      execSync(pgRestoreCommand, {
        stdio: 'inherit',
        env: { ...process.env, PGPASSWORD: this.extractPasswordFromUrl() }
      })
    } catch (error) {
      throw new Error(`pg_restore failed: ${error}`)
    }
  }

  /**
   * Terminate existing database connections
   */
  private async terminateConnections(): Promise<void> {
    const dbName = this.extractDatabaseName()

    const terminateQuery = `
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE datname = '${dbName}'
        AND pid <> pg_backend_pid()
    `

    const psqlCommand = [
      'psql',
      '--command', `"${terminateQuery}"`,
      `"${this.config.targetDatabaseUrl}"`
    ].join(' ')

    try {
      execSync(psqlCommand, {
        stdio: this.config.verbose ? 'inherit' : 'pipe',
        env: { ...process.env, PGPASSWORD: this.extractPasswordFromUrl() }
      })
    } catch (error) {
      console.warn('⚠️ Could not terminate existing connections:', error)
    }
  }

  /**
   * Verify restore by checking table count and basic structure
   */
  private async verifyRestore(): Promise<string[]> {
    const verifyQuery = `
      SELECT schemaname, tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `

    const psqlCommand = [
      'psql',
      '--tuples-only',
      '--no-align',
      '--field-separator=|',
      '--command', `"${verifyQuery}"`,
      `"${this.config.targetDatabaseUrl}"`
    ].join(' ')

    try {
      const output = execSync(psqlCommand, {
        encoding: 'utf-8',
        env: { ...process.env, PGPASSWORD: this.extractPasswordFromUrl() }
      })

      const tables = output
        .trim()
        .split('\n')
        .filter(line => line.trim())
        .map(line => line.split('|')[1])
        .filter(Boolean)

      if (tables.length === 0) {
        throw new Error('No tables found after restore - verification failed')
      }

      return tables

    } catch (error) {
      throw new Error(`Restore verification failed: ${error}`)
    }
  }

  /**
   * Confirm restore operation with user
   */
  private async confirmRestore(): Promise<boolean> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    const question = promisify(rl.question).bind(rl) as unknown as (query: string) => Promise<string>

    try {
      console.log('')
      console.log('⚠️  WARNING: This will overwrite the target database!')
      console.log(`   Target: ${this.maskConnectionString(this.config.targetDatabaseUrl)}`)
      console.log(`   Backup: ${this.config.backupFile}`)
      console.log('')

      const answer = await question('Are you sure you want to continue? (type "yes" to confirm): ')

      return answer.toLowerCase() === 'yes'

    } finally {
      rl.close()
    }
  }

  /**
   * Cleanup temporary files
   */
  private cleanupTempFile(filePath: string): void {
    try {
      require('fs').unlinkSync(filePath)
      console.log(`🧹 Cleaned up temporary file: ${filePath}`)
    } catch (error) {
      console.warn(`⚠️ Could not clean up temporary file: ${filePath}`)
    }
  }

  /**
   * Utility methods
   */
  private extractPasswordFromUrl(): string {
    try {
      const url = new URL(this.config.targetDatabaseUrl)
      return url.password || ''
    } catch {
      return ''
    }
  }

  private extractDatabaseName(): string {
    try {
      const url = new URL(this.config.targetDatabaseUrl)
      return url.pathname.slice(1) // Remove leading slash
    } catch {
      return 'postgres'
    }
  }

  private maskConnectionString(url: string): string {
    try {
      const parsed = new URL(url)
      parsed.password = '****'
      return parsed.toString()
    } catch {
      return url.replace(/:[^:@]+@/, ':****@')
    }
  }

  private formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)

    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    }
    return `${seconds}s`
  }
}

/**
 * CLI execution
 */
async function main() {
  const args = process.argv.slice(2)
  const backupFile = args[0]

  if (!backupFile) {
    console.log('SecuryFlex Database Restore')
    console.log('')
    console.log('Usage: ts-node backup-restore.ts <backup-file> [options]')
    console.log('')
    console.log('Options:')
    console.log('  --target <url>      Target database URL (default: DATABASE_URL)')
    console.log('  --force             Force restore by terminating existing connections')
    console.log('  --yes               Skip confirmation prompt')
    console.log('  --verbose           Enable verbose output')
    console.log('  --temp-dir <path>   Temporary directory for decompression/decryption')
    console.log('')
    console.log('Environment Variables:')
    console.log('  DATABASE_URL               Target database connection')
    console.log('  BACKUP_ENCRYPTION_KEY      Encryption key for encrypted backups')
    console.log('')
    console.log('Examples:')
    console.log('  # Restore from local backup')
    console.log('  ts-node backup-restore.ts ./backups/backup.sql')
    console.log('')
    console.log('  # Restore compressed backup with confirmation skip')
    console.log('  ts-node backup-restore.ts ./backups/backup.sql.gz --yes')
    console.log('')
    console.log('  # Restore encrypted backup to specific database')
    console.log('  ts-node backup-restore.ts ./backups/backup.sql.enc --target postgresql://user:pass@host/db')
    process.exit(1)
  }

  const config: RestoreConfig = {
    backupFile,
    targetDatabaseUrl: getArgValue(args, '--target') || process.env.DATABASE_URL || process.env.DIRECT_URL || '',
    force: args.includes('--force'),
    skipConfirmation: args.includes('--yes'),
    verbose: args.includes('--verbose'),
    tempDir: getArgValue(args, '--temp-dir')
  }

  if (!config.targetDatabaseUrl) {
    console.error('❌ Target database URL is required (use --target or set DATABASE_URL)')
    process.exit(1)
  }

  const restore = new DatabaseRestore(config)
  const result = await restore.executeRestore()

  process.exit(result.success ? 0 : 1)
}

function getArgValue(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag)
  return index !== -1 && index + 1 < args.length ? args[index + 1] : undefined
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error)
}

export { DatabaseRestore }
export type { RestoreConfig, RestoreResult }