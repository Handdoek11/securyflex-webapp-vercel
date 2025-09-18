#!/usr/bin/env node

/**
 * SecuryFlex Backup Scheduler
 *
 * Manages automated backup scheduling with configurable intervals
 * Supports cron-like scheduling and monitoring
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { CronJob } from "cron";
import { type BackupConfig, DatabaseBackup } from "./database-backup";

interface ScheduleConfig {
  enabled: boolean;
  cronExpression: string;
  timezone: string;
  backupConfig: BackupConfig;
}

interface BackupHistory {
  timestamp: string;
  success: boolean;
  duration: number;
  fileSize?: number;
  error?: string;
}

interface SchedulerState {
  lastRun?: string;
  nextRun?: string;
  history: BackupHistory[];
  isRunning: boolean;
}

class BackupScheduler {
  private config: ScheduleConfig;
  private cronJob: CronJob | null = null;
  private stateFile: string;
  private state: SchedulerState;

  constructor(config: ScheduleConfig) {
    this.config = config;
    this.stateFile = join(process.cwd(), "backup-scheduler.json");
    this.state = this.loadState();
  }

  /**
   * Start the backup scheduler
   */
  start(): void {
    if (!this.config.enabled) {
      console.log("⏸️ Backup scheduler is disabled");
      return;
    }

    if (this.cronJob) {
      console.log("⚠️ Scheduler is already running");
      return;
    }

    console.log("🚀 Starting backup scheduler...");
    console.log(`📅 Schedule: ${this.config.cronExpression}`);
    console.log(`🌍 Timezone: ${this.config.timezone}`);

    this.cronJob = new CronJob(
      this.config.cronExpression,
      () => this.executeScheduledBackup(),
      null,
      true,
      this.config.timezone,
    );

    // Update next run time
    this.state.nextRun = this.cronJob.nextDate().toJSDate().toISOString();
    this.saveState();

    console.log(`⏰ Next backup scheduled for: ${this.state.nextRun}`);
    console.log("✅ Backup scheduler started successfully");
  }

  /**
   * Stop the backup scheduler
   */
  stop(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
      this.state.nextRun = undefined;
      this.saveState();
      console.log("🛑 Backup scheduler stopped");
    }
  }

  /**
   * Get scheduler status
   */
  getStatus(): {
    isRunning: boolean;
    lastRun?: string;
    nextRun?: string;
    schedule: string;
    recentBackups: BackupHistory[];
  } {
    return {
      isRunning: this.cronJob !== null,
      lastRun: this.state.lastRun,
      nextRun: this.state.nextRun,
      schedule: this.config.cronExpression,
      recentBackups: this.state.history.slice(-10).reverse(),
    };
  }

  /**
   * Execute a manual backup
   */
  async executeManualBackup(): Promise<void> {
    if (this.state.isRunning) {
      throw new Error("Backup is already running");
    }

    console.log("🔧 Executing manual backup...");
    await this.executeScheduledBackup();
  }

  /**
   * Execute scheduled backup
   */
  private async executeScheduledBackup(): Promise<void> {
    if (this.state.isRunning) {
      console.log("⚠️ Backup already in progress, skipping...");
      return;
    }

    this.state.isRunning = true;
    this.state.lastRun = new Date().toISOString();
    this.saveState();

    const backup = new DatabaseBackup(this.config.backupConfig);

    try {
      console.log("📦 Starting scheduled backup...");
      const result = await backup.executeBackup();

      // Record backup history
      const historyEntry: BackupHistory = {
        timestamp: this.state.lastRun,
        success: result.success,
        duration: result.duration,
        fileSize: result.fileSize,
        error: result.error,
      };

      this.state.history.push(historyEntry);

      // Keep only last 100 entries
      if (this.state.history.length > 100) {
        this.state.history = this.state.history.slice(-100);
      }

      if (result.success) {
        console.log("✅ Scheduled backup completed successfully");
      } else {
        console.error("❌ Scheduled backup failed:", result.error);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("💥 Backup scheduler error:", errorMessage);

      this.state.history.push({
        timestamp: this.state.lastRun,
        success: false,
        duration: 0,
        error: errorMessage,
      });
    } finally {
      this.state.isRunning = false;

      // Update next run time if scheduler is still active
      if (this.cronJob) {
        this.state.nextRun = this.cronJob.nextDate().toJSDate().toISOString();
      }

      this.saveState();
    }
  }

  /**
   * Load scheduler state from file
   */
  private loadState(): SchedulerState {
    if (existsSync(this.stateFile)) {
      try {
        const stateData = readFileSync(this.stateFile, "utf-8");
        return JSON.parse(stateData);
      } catch (_error) {
        console.warn("⚠️ Could not load scheduler state, using defaults");
      }
    }

    return {
      history: [],
      isRunning: false,
    };
  }

  /**
   * Save scheduler state to file
   */
  private saveState(): void {
    try {
      writeFileSync(this.stateFile, JSON.stringify(this.state, null, 2));
    } catch (error) {
      console.error("❌ Could not save scheduler state:", error);
    }
  }

  /**
   * Generate backup health report
   */
  generateHealthReport(): {
    overall: "healthy" | "warning" | "critical";
    recentSuccessRate: number;
    averageBackupSize: number;
    lastSuccessfulBackup?: string;
    issues: string[];
  } {
    const recentBackups = this.state.history.slice(-10);
    const issues: string[] = [];
    let overall: "healthy" | "warning" | "critical" = "healthy";

    // Calculate success rate
    const successfulBackups = recentBackups.filter((b) => b.success).length;
    const successRate =
      recentBackups.length > 0
        ? (successfulBackups / recentBackups.length) * 100
        : 0;

    // Calculate average backup size
    const successfulBackupsWithSize = recentBackups.filter(
      (b) => b.success && b.fileSize,
    );
    const averageSize =
      successfulBackupsWithSize.length > 0
        ? successfulBackupsWithSize.reduce(
            (sum, b) => sum + (b.fileSize || 0),
            0,
          ) / successfulBackupsWithSize.length
        : 0;

    // Find last successful backup
    const lastSuccessful = recentBackups.reverse().find((b) => b.success);

    // Check for issues
    if (successRate < 50) {
      overall = "critical";
      issues.push("Low backup success rate (< 50%)");
    } else if (successRate < 80) {
      overall = "warning";
      issues.push("Moderate backup success rate (< 80%)");
    }

    if (lastSuccessful) {
      const daysSinceLastSuccess =
        (Date.now() - new Date(lastSuccessful.timestamp).getTime()) /
        (1000 * 60 * 60 * 24);
      if (daysSinceLastSuccess > 7) {
        overall = "critical";
        issues.push(
          `No successful backup in ${Math.floor(daysSinceLastSuccess)} days`,
        );
      } else if (daysSinceLastSuccess > 2) {
        if (overall !== "critical") overall = "warning";
        issues.push(
          `Last successful backup was ${Math.floor(daysSinceLastSuccess)} days ago`,
        );
      }
    } else {
      overall = "critical";
      issues.push("No successful backups found");
    }

    if (!this.cronJob) {
      if (overall !== "critical") overall = "warning";
      issues.push("Backup scheduler is not running");
    }

    return {
      overall,
      recentSuccessRate: successRate,
      averageBackupSize: averageSize,
      lastSuccessfulBackup: lastSuccessful?.timestamp,
      issues,
    };
  }
}

/**
 * CLI commands
 */
async function main() {
  const command = process.argv[2];

  const scheduleConfig: ScheduleConfig = {
    enabled: process.env.BACKUP_SCHEDULE_ENABLED !== "false",
    cronExpression: process.env.BACKUP_CRON || "0 2 * * *", // Daily at 2 AM
    timezone: process.env.BACKUP_TIMEZONE || "Europe/Amsterdam",
    backupConfig: {
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
    },
  };

  const scheduler = new BackupScheduler(scheduleConfig);

  switch (command) {
    case "start":
      scheduler.start();
      // Keep process alive
      process.on("SIGINT", () => {
        console.log("\n🛑 Shutting down backup scheduler...");
        scheduler.stop();
        process.exit(0);
      });
      break;

    case "stop":
      scheduler.stop();
      break;

    case "status": {
      const status = scheduler.getStatus();
      console.log("📊 Backup Scheduler Status:");
      console.log(`  Running: ${status.isRunning ? "✅" : "❌"}`);
      console.log(`  Schedule: ${status.schedule}`);
      console.log(`  Last Run: ${status.lastRun || "Never"}`);
      console.log(`  Next Run: ${status.nextRun || "Not scheduled"}`);
      console.log(`  Recent Backups: ${status.recentBackups.length}`);
      break;
    }

    case "health": {
      const health = scheduler.generateHealthReport();
      const healthEmoji =
        health.overall === "healthy"
          ? "✅"
          : health.overall === "warning"
            ? "⚠️"
            : "❌";
      console.log(
        `${healthEmoji} Backup Health: ${health.overall.toUpperCase()}`,
      );
      console.log(`  Success Rate: ${health.recentSuccessRate.toFixed(1)}%`);
      console.log(
        `  Average Size: ${(health.averageBackupSize / 1024 / 1024).toFixed(1)} MB`,
      );
      console.log(`  Last Success: ${health.lastSuccessfulBackup || "Never"}`);
      if (health.issues.length > 0) {
        console.log("  Issues:");
        health.issues.forEach((issue) => {
          console.log(`    - ${issue}`);
        });
      }
      break;
    }

    case "backup":
      try {
        await scheduler.executeManualBackup();
        console.log("✅ Manual backup completed");
      } catch (error) {
        console.error("❌ Manual backup failed:", error);
        process.exit(1);
      }
      break;

    default:
      console.log("SecuryFlex Backup Scheduler");
      console.log("");
      console.log("Commands:");
      console.log("  start   - Start the backup scheduler");
      console.log("  stop    - Stop the backup scheduler");
      console.log("  status  - Show scheduler status");
      console.log("  health  - Show backup health report");
      console.log("  backup  - Execute manual backup");
      console.log("");
      console.log("Environment Variables:");
      console.log(
        "  BACKUP_SCHEDULE_ENABLED - Enable/disable scheduler (default: true)",
      );
      console.log('  BACKUP_CRON - Cron expression (default: "0 2 * * *")');
      console.log('  BACKUP_TIMEZONE - Timezone (default: "Europe/Amsterdam")');
      break;
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { BackupScheduler };
export type { ScheduleConfig };
