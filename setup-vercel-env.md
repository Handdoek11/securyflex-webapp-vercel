# Vercel Environment Variables Setup

## 🚀 Quick Setup voor SecuryFlex op Vercel

### Stap 1: Ga naar Vercel Dashboard
1. Open https://vercel.com/handdoek11s-projects/secury-flex-1/settings/environment-variables
2. Of ga naar je Vercel dashboard → SecuryFlex-1 → Settings → Environment Variables

### Stap 2: Voeg deze ESSENTIËLE variables toe

Voor een testomgeving heb je minimaal deze nodig:

#### Database (Supabase)
- `DATABASE_URL` - Je Supabase pooled connection string
- `DIRECT_URL` - Je Supabase direct connection string (voor migrations)
- `NEXT_PUBLIC_SUPABASE_URL` - Je Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Je Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Je Supabase service role key

#### Authentication
- `NEXTAUTH_URL` - https://secury-flex-1.vercel.app (of je custom domain)
- `NEXTAUTH_SECRET` - Genereer met: `openssl rand -base64 32`

#### Optional maar recommended
- `RESEND_API_KEY` - Voor email functionaliteit
- `EMAIL_FROM` - Je email from address
- `NEXT_PUBLIC_APP_URL` - https://secury-flex-1.vercel.app

### Stap 3: Kopieer van lokaal
Je kunt de values uit je `.env.local` file kopiëren.

### Stap 4: Deploy commando's

#### Preview deployment (voor testing):
```bash
vercel
```

#### Production deployment:
```bash
vercel --prod
```

## 🔍 Belangrijke Notes:

1. **Supabase URLs**: Zorg dat je Supabase project de Vercel domain accepteert in de allowed URLs
2. **NextAuth URL**: Moet matchen met je Vercel deployment URL
3. **Database**: Gebruik de pooled connection voor DATABASE_URL
4. **Secrets**: Gebruik sterke, unieke wachtwoorden voor production

## 📝 Test Checklist:
- [ ] Homepage laadt zonder errors
- [ ] `/notes` pagina toont Supabase data
- [ ] Authentication werkt (login/register)
- [ ] Database connectie werkt
- [ ] Environment variables correct geladen

## 🔧 Troubleshooting:
- Als je 500 errors krijgt → Check environment variables
- Als auth niet werkt → Controleer NEXTAUTH_URL
- Database errors → Check DATABASE_URL format