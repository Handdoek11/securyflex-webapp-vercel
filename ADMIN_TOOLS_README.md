# 🛠️ SecuryFlex Admin Tools

## Overview
Minimale maar effectieve admin tools voor het beheren van het SecuryFlex platform.

## 🔐 Setup

### 1. Environment Variables
Voeg deze toe aan je `.env.local` file:
```env
# Admin emails (comma-separated)
ADMIN_EMAILS=stef@securyflex.com,robert@securyflex.com

# Admin tools password voor gevaarlijke acties
ADMIN_TOOLS_PASSWORD=YourSecurePassword123!
```

### 2. Admin Accounts Aanmaken
```bash
# Check of admin accounts bestaan
npm run admin:check

# Maak admin accounts aan (indien nodig)
npm run admin:create
```

## 📊 Web Interface

### Admin Tools Dashboard
Bezoek: `http://localhost:3000/admin/tools`

Features:
- **Quick Stats**: Real-time overzicht van platform metrics
- **Quick Actions**: Unlock accounts, reset passwords
- **Data Export**: Download CSV exports
- **External Links**: Direct links naar Supabase, Vercel, etc.

### Andere Admin Pages
- `/admin/auth-monitor` - Security logs en authenticatie monitoring
- `/admin/document-review` - Document verificatie management
- `/admin/login` - Admin login page

## 🖥️ Command Line Tools

### User Management
```bash
# Unlock een geblokkeerd account
npm run admin:unlock-user user@example.com

# Reset een user password
npm run admin:reset-password user@example.com
```

### Reports & Exports
```bash
# Genereer daily report
npm run admin:daily-report

# Export alle users naar CSV
npm run admin:export-users
# Output: ./exports/users-export-YYYY-MM-DD.csv
```

### Maintenance
```bash
# Cleanup test data (ALLEEN in development!)
npm run admin:cleanup-test
```

## 🔒 Security Notes

### Admin Authenticatie
- Admin emails worden gecontroleerd via environment variables
- Alle admin acties worden gelogd in SecurityLog tabel
- Extra password verificatie voor gevaarlijke acties

### Best Practices
1. **NOOIT** admin credentials delen via onversleutelde kanalen
2. **ALTIJD** gebruikers adviseren om passwords te wijzigen na reset
3. **CHECK** altijd twee keer voor gevaarlijke acties
4. **LOG** alle admin acties voor audit trail

## 📝 Quick Actions Cheatsheet

| Actie | Web Interface | Command Line |
|-------|--------------|--------------|
| Unlock Account | Admin Tools > Quick Actions | `npm run admin:unlock-user <email>` |
| Reset Password | Admin Tools > Quick Actions | `npm run admin:reset-password <email>` |
| View Security Logs | Auth Monitor page | `npm run admin:daily-report` |
| Export Users | Admin Tools > Export | `npm run admin:export-users` |
| Check System Health | Admin Tools Dashboard | `npm run admin:daily-report` |

## 🚨 Troubleshooting

### "Admin access denied"
- Check of je email in `ADMIN_EMAILS` staat
- Controleer of je ingelogd bent met het juiste account

### "Invalid admin password"
- Controleer `ADMIN_TOOLS_PASSWORD` in `.env.local`
- Wachtwoord moet minimaal 8 karakters zijn

### Export folders niet aanwezig
```bash
# Maak exports directory
mkdir exports
```

### Database connection issues
- Check `DATABASE_URL` in `.env.local`
- Verifieer dat Prisma client is gegenereerd: `npx prisma generate`

## 🔗 External Dashboards

Direct links (ook beschikbaar in Admin Tools UI):

- **Supabase**: https://supabase.com/dashboard
- **Vercel**: https://vercel.com/dashboard
- **Sentry**: https://sentry.io
- **Prisma Studio**: Run `npx prisma studio` locally

## 📞 Support

Voor vragen of problemen:
1. Check de logs in `/admin/auth-monitor`
2. Run `npm run admin:daily-report` voor system health check
3. Contact andere admin via beveiligd kanaal

---

**Laatste update**: December 2024
**Versie**: 1.0.0