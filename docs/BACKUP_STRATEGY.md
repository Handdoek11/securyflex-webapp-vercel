# SecuryFlex Database Backup Strategy

## Overview

SecuryFlex implements a comprehensive database backup strategy to ensure data protection and business continuity. The backup system supports automated scheduling, compression, encryption, and cloud storage integration.

## Components

### 1. Database Backup Script (`scripts/backup/database-backup.ts`)

Core backup functionality that creates PostgreSQL dumps with the following features:

- **pg_dump Integration**: Uses PostgreSQL's native backup tool
- **Compression**: Gzip compression to reduce storage requirements
- **Encryption**: AES-256-CBC encryption for sensitive data protection
- **Cloud Storage**: Support for AWS S3, Azure Blob, and Google Cloud Storage
- **Notifications**: Webhook and email alerts for backup status
- **Cleanup**: Automatic removal of old backups based on retention policy

#### Usage

```bash
# Manual backup
npm run backup

# With environment variables
BACKUP_COMPRESSION=true BACKUP_ENCRYPTION=true npm run backup
```

### 2. Backup Scheduler (`scripts/backup/backup-scheduler.ts`)

Automated scheduling system using cron expressions:

- **Cron Scheduling**: Flexible scheduling with timezone support
- **Health Monitoring**: Tracks backup success rate and performance
- **State Management**: Persistent state tracking and history
- **Manual Execution**: Support for on-demand backups

#### Usage

```bash
# Start scheduler (runs continuously)
npm run backup:start

# Check status
npm run backup:status

# Health report
npm run backup:health

# Execute manual backup
npm run backup:schedule backup
```

### 3. Backup Restore (`scripts/backup/backup-restore.ts`)

Restore functionality for disaster recovery:

- **Decompression**: Automatic handling of compressed backups
- **Decryption**: Support for encrypted backup restoration
- **Safety Checks**: Confirmation prompts and connection termination
- **Verification**: Post-restore validation of database structure

#### Usage

```bash
# Restore from backup
npm run backup:restore ./backups/backup.sql

# Force restore (terminates existing connections)
npm run backup:restore ./backups/backup.sql.gz --force

# Skip confirmation
npm run backup:restore ./backups/backup.sql.enc --yes
```

### 4. Docker Integration (`scripts/backup/docker-backup.yml`)

Production-ready containerized backup service:

- **Isolated Service**: Runs in separate container
- **Health Checks**: Built-in monitoring and alerting
- **Resource Limits**: Controlled CPU and memory usage
- **Persistent Storage**: Volume mounting for backup persistence

#### Usage

```bash
# Start backup service
docker-compose -f scripts/backup/docker-backup.yml up -d

# View logs
docker-compose -f scripts/backup/docker-backup.yml logs -f

# Manual backup
docker-compose -f scripts/backup/docker-backup.yml exec securyflex-backup npm run backup
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `BACKUP_SCHEDULE_ENABLED` | Enable/disable scheduler | `true` |
| `BACKUP_CRON` | Cron expression for scheduling | `0 2 * * *` (2 AM daily) |
| `BACKUP_TIMEZONE` | Timezone for scheduling | `Europe/Amsterdam` |
| `BACKUP_DIR` | Local backup storage directory | `./backups` |
| `BACKUP_RETENTION_DAYS` | Days to keep backups | `30` |
| `BACKUP_COMPRESSION` | Enable gzip compression | `true` |
| `BACKUP_ENCRYPTION` | Enable AES encryption | `false` |
| `BACKUP_ENCRYPTION_KEY` | Encryption key (required if encryption enabled) | - |
| `BACKUP_CLOUD_PROVIDER` | Cloud provider (`aws`, `azure`, `gcp`) | - |
| `BACKUP_CLOUD_BUCKET` | Cloud storage bucket name | - |
| `BACKUP_CLOUD_REGION` | Cloud storage region | - |
| `BACKUP_WEBHOOK_URL` | Webhook URL for notifications | - |
| `BACKUP_EMAIL` | Email address for notifications | - |

### Scheduling Examples

```bash
# Daily at 2 AM
BACKUP_CRON="0 2 * * *"

# Every 6 hours
BACKUP_CRON="0 */6 * * *"

# Weekly on Sunday at midnight
BACKUP_CRON="0 0 * * 0"

# Every 30 minutes (development/testing)
BACKUP_CRON="*/30 * * * *"
```

## Security Considerations

### Encryption

When `BACKUP_ENCRYPTION=true`:
- Backups are encrypted using AES-256-CBC
- Encryption key must be stored securely
- Key is required for restoration

### Access Control

- Database credentials should use least-privilege principle
- Backup files should be stored with restricted permissions
- Cloud storage should use IAM roles and bucket policies

### Network Security

- Use SSL/TLS for database connections
- Encrypt data in transit to cloud storage
- Implement network segmentation for backup services

## Monitoring and Alerting

### Health Metrics

The backup system tracks:
- **Success Rate**: Percentage of successful backups
- **Backup Size**: Average and trending backup sizes
- **Duration**: Time taken for backup operations
- **Last Success**: Timestamp of last successful backup

### Alert Conditions

- Backup failure
- Success rate below 80%
- No successful backup in 48 hours
- Backup size significantly different from baseline
- Storage space issues

### Notification Channels

1. **Webhook**: POST to configured URL with backup status
2. **Email**: SMTP notifications (TODO: implementation pending)
3. **Logs**: Structured logging for monitoring systems

## Disaster Recovery Procedures

### Full Database Restore

1. **Stop Application**: Prevent new database connections
2. **Backup Current State**: Create emergency backup if possible
3. **Execute Restore**: Use backup restore script
4. **Verify Integrity**: Check data consistency
5. **Resume Operations**: Restart application services

### Point-in-Time Recovery

For point-in-time recovery beyond backup intervals:
1. Use PostgreSQL's Write-Ahead Logging (WAL)
2. Combine backup with WAL replay
3. Requires continuous WAL archiving (not currently implemented)

## Best Practices

### Backup Frequency

- **Production**: Daily backups minimum
- **Critical Systems**: Every 6 hours
- **Development**: Weekly or before major changes

### Testing

- **Monthly**: Test backup restore procedure
- **Quarterly**: Full disaster recovery simulation
- **Annually**: Review and update backup strategy

### Storage

- **3-2-1 Rule**: 3 copies, 2 different media, 1 offsite
- **Local**: Fast recovery for recent issues
- **Cloud**: Long-term retention and disaster recovery
- **Verification**: Regular backup integrity checks

## Troubleshooting

### Common Issues

1. **pg_dump not found**
   - Install PostgreSQL client tools
   - Add to system PATH

2. **Permission denied**
   - Check database user permissions
   - Verify file system permissions

3. **Backup size anomalies**
   - Check for data growth patterns
   - Verify compression settings

4. **Schedule not running**
   - Check cron expression syntax
   - Verify timezone settings
   - Check process status

### Debug Commands

```bash
# Test database connection
psql "postgresql://user:pass@host/db" -c "SELECT version();"

# Check backup directory permissions
ls -la ./backups/

# Validate cron expression
npm run backup:status

# Test manual backup
npm run backup
```

## Future Enhancements

### Planned Features

1. **Incremental Backups**: Reduce backup time and storage
2. **WAL Archiving**: Enable point-in-time recovery
3. **Multi-Database Support**: Backup multiple databases
4. **Backup Validation**: Automated integrity checks
5. **Performance Metrics**: Detailed backup performance tracking
6. **Cloud Provider SDKs**: Full cloud storage integration

### Monitoring Integration

- **Prometheus Metrics**: Export backup metrics
- **Grafana Dashboards**: Visualize backup health
- **AlertManager**: Advanced alerting rules
- **Slack Integration**: Team notifications

## Support

For backup-related issues:
1. Check logs in backup directory
2. Review environment variable configuration
3. Test database connectivity
4. Consult troubleshooting section above

Remember: Regular backup testing is as important as the backups themselves!