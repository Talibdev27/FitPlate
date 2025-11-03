# FitPlate Deployment Guide

## Deployment Options

### Option 1: VPS Server (Recommended for Start)
- **Providers**: DigitalOcean, Linode, Vultr, AWS EC2, Hetzner
- **Requirements**: 2GB RAM minimum, 1 CPU core, 20GB storage
- **Cost**: $5-20/month
- **Best for**: Small to medium scale, full control

### Option 2: Cloud Platform (Recommended for Scale)
- **Providers**: 
  - **Vercel** (Frontend) + **Railway/Render** (Backend + DB)
  - **AWS** (Elastic Beanstalk, ECS, or EC2)
  - **Google Cloud Platform** (Cloud Run or Compute Engine)
  - **Azure** (App Service or Container Instances)
- **Cost**: $10-50/month (varies by traffic)
- **Best for**: Auto-scaling, managed services

### Option 3: Docker Hosting
- **Providers**: 
  - **DigitalOcean App Platform**
  - **Fly.io**
  - **Render**
  - **Railway**
- **Cost**: $5-25/month
- **Best for**: Easy Docker deployment

## Step-by-Step Deployment (VPS Server)

### Prerequisites
1. VPS server with Ubuntu 20.04+ or similar
2. Domain name (optional but recommended)
3. SSH access to server
4. Docker and Docker Compose installed on server

### Step 1: Server Setup

```bash
# SSH into your server
ssh user@your-server-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
```

### Step 2: Clone Repository

```bash
# Create app directory
mkdir -p ~/fitplate
cd ~/fitplate

# Clone repository
git clone https://github.com/Talibdev27/FitPlate.git .

# Or use your repository URL
```

### Step 3: Create Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: fitplate_db
    environment:
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME:-food_delivery}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    networks:
      - fitplate-network
    # Remove ports in production for security
    # Only expose if needed for external access

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    container_name: fitplate_backend
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://${DB_USER:-postgres}:${DB_PASSWORD}@postgres:5432/${DB_NAME:-food_delivery}?schema=public
      - PORT=5001
      - JWT_SECRET=${JWT_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
      - FRONTEND_URL=${FRONTEND_URL}
      - CLICK_MERCHANT_ID=${CLICK_MERCHANT_ID}
      - CLICK_SERVICE_ID=${CLICK_SERVICE_ID}
      - CLICK_SECRET_KEY=${CLICK_SECRET_KEY}
      - CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME}
      - CLOUDINARY_API_KEY=${CLOUDINARY_API_KEY}
      - CLOUDINARY_API_SECRET=${CLOUDINARY_API_SECRET}
      - SMS_API_KEY=${SMS_API_KEY}
      - SMS_API_URL=${SMS_API_URL}
      - EMAIL_SERVICE_API_KEY=${EMAIL_SERVICE_API_KEY}
      - EMAIL_FROM_ADDRESS=${EMAIL_FROM_ADDRESS}
    ports:
      - "5001:5001"
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - fitplate-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    container_name: fitplate_frontend
    environment:
      - REACT_APP_API_URL=${FRONTEND_API_URL}
    ports:
      - "3000:80"
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - fitplate-network

volumes:
  postgres_data:
    driver: local

networks:
  fitplate-network:
    driver: bridge
```

### Step 4: Create Production Dockerfiles

**Backend: `backend/Dockerfile.prod`**
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl libc6-compat

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

# Copy built files and dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

# Expose port
EXPOSE 5001

# Run migrations and start
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
```

**Frontend: `frontend/Dockerfile.prod`**
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Frontend: `frontend/nginx.conf`**
```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Step 5: Environment Variables

Create `.env.production` on server:

```bash
# Database
DB_USER=fitplate_user
DB_PASSWORD=your_strong_password_here
DB_NAME=food_delivery

# Backend
NODE_ENV=production
PORT=5001
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_REFRESH_SECRET=your_super_secret_refresh_key_min_32_chars
FRONTEND_URL=https://yourdomain.com
FRONTEND_API_URL=https://yourdomain.com/api

# Payment (Click)
CLICK_MERCHANT_ID=your_merchant_id
CLICK_SERVICE_ID=your_service_id
CLICK_SECRET_KEY=your_secret_key

# Cloudinary (Image Storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# SMS (Optional)
SMS_API_KEY=your_sms_key
SMS_API_URL=your_sms_url

# Email (Optional)
EMAIL_SERVICE_API_KEY=your_email_key
EMAIL_FROM_ADDRESS=noreply@yourdomain.com
```

**Generate secure secrets:**
```bash
# Generate JWT secrets
openssl rand -base64 32
openssl rand -base64 32
```

### Step 6: Deploy

```bash
# On your server
cd ~/fitplate

# Pull latest code
git pull origin main

# Build and start services
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build

# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Check status
docker-compose -f docker-compose.prod.yml ps
```

### Step 7: Setup Nginx Reverse Proxy

Install Nginx:
```bash
sudo apt install nginx
```

Create `/etc/nginx/sites-available/fitplate`:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS (after SSL setup)
    # return 301 https://$server_name$request_uri;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Host $host;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:5001/health;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/fitplate /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 8: Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal (already set up by certbot)
sudo certbot renew --dry-run
```

### Step 9: Database Migrations

```bash
# Run migrations on server
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# Or create admin user
docker-compose -f docker-compose.prod.yml exec backend npm run create-admin
```

### Step 10: Firewall Setup

```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## Alternative: Quick Deploy Platforms

### Railway.app

1. Connect GitHub repository
2. Add services:
   - PostgreSQL database
   - Backend service (Node.js)
   - Frontend service (static site)
3. Set environment variables
4. Deploy automatically

### Render.com

1. Create Web Service for backend
2. Create PostgreSQL database
3. Create Static Site for frontend
4. Set environment variables
5. Deploy

### Vercel + Railway

1. **Frontend (Vercel)**:
   - Connect GitHub repo
   - Set build command: `npm run build`
   - Set output directory: `dist`
   - Set environment: `REACT_APP_API_URL=https://your-backend.railway.app/api`

2. **Backend + DB (Railway)**:
   - Add PostgreSQL plugin
   - Add Node.js service
   - Set environment variables
   - Deploy

## Post-Deployment Checklist

- [ ] Test user registration
- [ ] Test admin login
- [ ] Verify database connection
- [ ] Check API endpoints
- [ ] Test file uploads (if configured)
- [ ] Verify email sending (if configured)
- [ ] Setup monitoring (optional)
- [ ] Setup backups (database)
- [ ] Configure domain DNS
- [ ] SSL certificate active
- [ ] Firewall configured
- [ ] Environment variables secure

## Monitoring & Maintenance

### View Logs
```bash
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
```

### Update Application
```bash
cd ~/fitplate
git pull origin main
docker-compose -f docker-compose.prod.yml up -d --build
```

### Backup Database
```bash
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres food_delivery > backup_$(date +%Y%m%d).sql
```

### Restore Database
```bash
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U postgres food_delivery < backup_20241103.sql
```

## Troubleshooting

### Backend won't start
- Check logs: `docker-compose logs backend`
- Verify environment variables
- Check database connection
- Verify Prisma migrations ran

### Frontend can't connect to backend
- Check `REACT_APP_API_URL` environment variable
- Verify backend is running
- Check CORS settings
- Verify reverse proxy configuration

### Database connection errors
- Verify database container is running
- Check `DATABASE_URL` environment variable
- Verify network connectivity between containers
- Check database credentials

## Cost Estimation

### VPS Deployment
- VPS (2GB RAM): $12/month
- Domain: $10-15/year
- Total: ~$13-15/month

### Cloud Platform
- Railway/Render: $5-20/month
- Vercel (frontend): Free tier or $20/month
- Total: $5-40/month

## Security Considerations

1. **Never commit** `.env` files
2. Use **strong passwords** for database
3. **Rotate JWT secrets** regularly
4. Enable **firewall** on server
5. Keep **Docker and system** updated
6. Use **HTTPS only** in production
7. Implement **rate limiting** (already in code)
8. Regular **backups** of database
9. Monitor **logs** for suspicious activity
10. Use **secrets management** for sensitive data

