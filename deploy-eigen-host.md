# 🚀 Deploy SecuryFlex op je Eigen Host

## Optie 1: VPS met Node.js (Aanbevolen)

### Requirements:
- VPS met Ubuntu/Debian
- Node.js 18+
- PM2 voor process management
- Nginx als reverse proxy

### Stappen:

1. **Build het project lokaal:**
```bash
npm run build
```

2. **Upload deze folders naar je server:**
- `.next/` (build output)
- `public/` (static files)
- `node_modules/` (dependencies)
- `package.json`
- `prisma/` (database schema)
- `.env.production` (maak deze aan met je production env vars)

3. **Op de server:**
```bash
# Installeer PM2
npm install -g pm2

# Start de applicatie
pm2 start npm --name "securyflex" -- start

# Save PM2 config
pm2 save
pm2 startup
```

4. **Nginx config:**
```nginx
server {
    listen 80;
    server_name jouwdomein.nl;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Optie 2: Docker Container

### Dockerfile:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Deploy:
```bash
docker build -t securyflex .
docker run -d -p 3000:3000 --env-file .env.production securyflex
```

## Optie 3: Directe Node.js

1. **Zip het hele project**
2. **Upload naar server**
3. **Unzip en run:**
```bash
npm install
npm run build
npm start
```

## Environment Variables (.env.production)

Maak een `.env.production` file met:
```
DATABASE_URL=je_database_url
DIRECT_URL=je_direct_url
NEXT_PUBLIC_SUPABASE_URL=je_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=je_anon_key
SUPABASE_SERVICE_ROLE_KEY=je_service_key
NEXTAUTH_URL=https://jouwdomein.nl
NEXTAUTH_SECRET=je_secret
NODE_ENV=production
```

## Belangrijk:
- Zorg dat port 3000 open is (of gebruik Nginx)
- SSL certificaat via Let's Encrypt
- Database moet bereikbaar zijn vanaf je host
- PM2 voor auto-restart bij crashes

## Simpelste Optie:
Als je echt geen zin hebt in gedoe, gebruik een managed Node.js host zoals:
- Railway.app
- Render.com
- Fly.io
- DigitalOcean App Platform

Deze doen automatisch de build en deployment voor je.