#!/usr/bin/env node

/**
 * SecuryFlex Database Backup Script
 *
 * Automated backup solution for production PostgreSQL database
 * Supports both local and cloud storage with compression and encryption
 */

import { execSync } from "node:child_process";
import { createCipher } from "node:crypto";
import {
  createReadStream,
  createWriteStream,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  unlinkSync,
} from "node:fs";
import { join } from "node:path";
import { createGzip } from "node:zlib";

interface BackupNotificationDetails {
  // Success notification details
  filePath?: string;
  fileSize?: number;
  compressed?: boolean;
  encrypted?: boolean;
  // Failure notification details
  error?: string;
}

interface BackupConfig {
  databaseUrl: string;
  backupDir: string;
  retentionDays: number;
  enableCompression: boolean;
  enableEncryption: boolean;
  encryptionKey?: string;
  cloudStorage?: {
    provider: "aws" | "azure" | "gcp";
    bucket: string;
    region: string;
  };
  notifications?: {
    webhook?: string;
    email?: string;
  };
}

interface BackupResult {
  success: boolean;
  filePath?: string;
  fileSize?: number;
  duration: number;
  error?: string;
  compressed?: boolean;
  encrypted?: boolean;
}

class DatabaseBackup {
  private config: BackupConfig;
  private timestamp: string;

  constructor(config: BackupConfig) {
    this.config = config;
    this.timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  }

  /**
   * Main backup execution
   */
  async executeBackup(): Promise<BackupResult> {
    const startTime = Date.now();

    try {
      console.log("🔄 Starting database backup...");

      // Ensure backup directory exists
      this.ensureBackupDirectory();

      // Generate backup filename
      const baseFilename = `securyflex_backup_${this.timestamp}.sql`;
      const backupPath = join(this.config.backupDir, baseFilename);

      // Create database dump
      console.log("📦 Creating database dump...");
      await this.createDatabaseDump(backupPath);

      let finalPath = backupPath;
      let compressed = false;
      let encrypted = false;

      // Apply compression if enabled
      if (this.config.enableCompression) {
        console.log("🗜️ Compressing backup...");
        finalPath = await this.compressBackup(finalPath);
        compressed = true;
      }

      // Apply encryption if enabled
      if (this.config.enableEncryption && this.config.encryptionKey) {
        console.log("🔐 Encrypting backup...");
        finalPath = await this.encryptBackup(finalPath);
        encrypted = true;
      }

      // Get file size
      const fileSize = statSync(finalPath).size;

      // Upload to cloud storage if configured
      if (this.config.cloudStorage) {
        console.log("☁️ Uploading to cloud storage...");
        await this.uploadToCloudStorage(finalPath);
      }

      // Clean up old backups
      console.log("🧹 Cleaning up old backups...");
      await this.cleanupOldBackups();

      // Send success notification
      await this.sendNotification(true, {
        filePath: finalPath,
        fileSize,
        compressed,
        encrypted,
      });

      const duration = Date.now() - startTime;

      console.log("✅ Backup completed successfully!");
      console.log(`📁 File: ${finalPath}`);
      console.log(`📊 Size: ${this.formatFileSize(fileSize)}`);
      console.log(`⏱️ Duration: ${this.formatDuration(duration)}`);

      return {
        success: true,
        filePath: finalPath,
        fileSize,
        duration,
        compressed,
        encrypted,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      console.error("❌ Backup failed:", errorMessage);

      // Send failure notification
      await this.sendNotification(false, { error: errorMessage });

      return {
        success: false,
        duration,
        error: errorMessage,
      };
    }
  }

  /**
   * Create PostgreSQL database dump
   */
  private async createDatabaseDump(outputPath: string): Promise<void> {
    const pgDumpCommand = [
      "pg_dump",
      "--verbose",
      "--no-password",
      "--format=custom",
      "--compress=6",
      "--file",
      `"${outputPath}"`,
      `"${this.config.databaseUrl}"`,
    ].join(" ");

    try {
      execSync(pgDumpCommand, {
        stdio: "inherit",
        env: { ...process.env, PGPASSWORD: this.extractPasswordFromUrl() },
      });
    } catch (error) {
      throw new Error(`pg_dump failed: ${error}`);
    }
  }

  /**
   * Compress backup file using gzip
   */
  private async compressBackup(inputPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const outputPath = `${inputPath}.gz`;
      const gzip = createGzip({ level: 9 });
      const input = createReadStream(inputPath);
      const output = createWriteStream(outputPath);

      input.pipe(gzip).pipe(output);

      output.on("close", () => {
        // Remove original uncompressed file
        unlinkSync(inputPath);
        resolve(outputPath);
      });

      output.on("error", reject);
    });
  }

  /**
   * Encrypt backup file
   */
  private async encryptBackup(inputPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.config.encryptionKey) {
        reject(new Error("Encryption key not provided"));
        return;
      }

      const outputPath = `${inputPath}.enc`;
      const cipher = createCipher("aes-256-cbc", this.config.encryptionKey);
      const input = createReadStream(inputPath);
      const output = createWriteStream(outputPath);

      input.pipe(cipher).pipe(output);

      output.on("close", () => {
        // Remove original unencrypted file
        unlinkSync(inputPath);
        resolve(outputPath);
      });

      output.on("error", reject);
    });
  }

  /**
   * Upload backup to cloud storage
   */
  private async uploadToCloudStorage(_filePath: string): Promise<void> {
    if (!this.config.cloudStorage) return;

    // This would be implemented based on the cloud provider
    // For now, we'll just log the intention
    const { provider, bucket, region } = this.config.cloudStorage;

    console.log(
      `📤 Would upload to ${provider} bucket: ${bucket} in region: ${region}`,
    );

    // TODO: Implement actual cloud upload logic
    // - AWS S3: Use AWS SDK
    // - Azure: Use Azure Storage SDK
    // - GCP: Use Google Cloud Storage SDK
  }

  /**
   * Remove old backups based on retention policy
   */
  private async cleanupOldBackups(): Promise<void> {
    const files = readdirSync(this.config.backupDir);
    const backupFiles = files.filter(
      (file: string) =>
        file.startsWith("securyflex_backup_") &&
        (file.endsWith(".sql") ||
          file.endsWith(".gz") ||
          file.endsWith(".enc")),
    );

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);

    let deletedCount = 0;

    for (const file of backupFiles) {
      const filePath = join(this.config.backupDir, file);
      const stats = statSync(filePath);

      if (stats.mtime < cutoffDate) {
        unlinkSync(filePath);
        deletedCount++;
        console.log(`🗑️ Deleted old backup: ${file}`);
      }
    }

    if (deletedCount === 0) {
      console.log("✨ No old backups to clean up");
    }
  }

  /**
   * Send backup notification
   */
  private async sendNotification(
    success: boolean,
    details: BackupNotificationDetails,
  ): Promise<void> {
    if (!this.config.notifications) return;

    const message = success
      ? `✅ SecuryFlex database backup completed successfully\n\nFile: ${details.filePath}\nSize: ${this.formatFileSize(details.fileSize || 0)}\nCompressed: ${details.compressed ? "Yes" : "No"}\nEncrypted: ${details.encrypted ? "Yes" : "No"}`
      : `❌ SecuryFlex database backup failed\n\nError: ${details.error}`;

    // Send webhook notification
    if (this.config.notifications.webhook) {
      try {
        await fetch(this.config.notifications.webhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: message,
            success,
            timestamp: new Date().toISOString(),
            details,
          }),
        });
      } catch (error) {
        console.error("Failed to send webhook notification:", error);
      }
    }

    // TODO: Implement email notifications
    if (this.config.notifications.email) {
      console.log(
        `📧 Would send email notification to: ${this.config.notifications.email}`,
      );
    }
  }

  /**
   * Utility methods
   */
  private ensureBackupDirectory(): void {
    if (!existsSync(this.config.backupDir)) {
      mkdirSync(this.config.backupDir, { recursive: true });
      console.log(`📁 Created backup directory: ${this.config.backupDir}`);
    }
  }

  private extractPasswordFromUrl(): string {
    try {
      const url = new URL(this.config.databaseUrl);
      return url.password || "";
    } catch {
      return "";
    }
  }

  private formatFileSize(bytes: number): string {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round((bytes / 1024 ** i) * 100) / 100} ${sizes[i]}`;
  }

  private formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);

    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  }
}

/**
 * CLI execution
 */
async function main() {
  const config: BackupConfig = {
    databaseUrl: process.env.DATABASE_URL || process.env.DIRECT_URL || "",
    backupDir: process.env.BACKUP_DIR || join(process.cwd(), "backups"),
    retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || "30", 10),
    enableCompression: process.env.BACKUP_COMPRESSION !== "false",
    enableEncryption: process.env.BACKUP_ENCRYPTION === "true",
    encryptionKey: process.env.BACKUP_ENCRYPTION_KEY,
    cloudStorage: process.env.BACKUP_CLOUD_PROVIDER
      ? {
          provider: process.env.BACKUP_CLOUD_PROVIDER as
            | "aws"
            | "azure"
            | "gcp",
          bucket: process.env.BACKUP_CLOUD_BUCKET || "",
          region: process.env.BACKUP_CLOUD_REGION || "",
        }
      : undefined,
    notifications: {
      webhook: process.env.BACKUP_WEBHOOK_URL,
      email: process.env.BACKUP_EMAIL,
    },
  };

  if (!config.databaseUrl) {
    console.error(
      "❌ DATABASE_URL or DIRECT_URL environment variable is required",
    );
    process.exit(1);
  }

  const backup = new DatabaseBackup(config);
  const result = await backup.executeBackup();

  process.exit(result.success ? 0 : 1);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { DatabaseBackup };
export type { BackupConfig, BackupResult };
