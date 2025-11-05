import { PrismaClient } from '@prisma/client';

// Validate DATABASE_URL is set
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('[DB Error] DATABASE_URL environment variable is not set!');
  console.error('[DB Error] In Railway: Make sure you have linked the PostgreSQL database to your backend service.');
  console.error('[DB Error] In Railway: Go to your backend service → Variables → Add Reference Variable → Select your database → DATABASE_URL');
  throw new Error('DATABASE_URL environment variable is required');
}

// Validate DATABASE_URL format
if (!DATABASE_URL.startsWith('postgresql://') && !DATABASE_URL.startsWith('postgres://')) {
  console.error('[DB Error] DATABASE_URL must start with postgresql:// or postgres://');
  console.error('[DB Error] Current DATABASE_URL format is invalid:', DATABASE_URL.substring(0, 50) + '...');
  throw new Error('Invalid DATABASE_URL format');
}

// Log database connection info (without sensitive data)
try {
  const urlObj = new URL(DATABASE_URL);
  console.log('[DB Config] Database host:', urlObj.hostname);
  console.log('[DB Config] Database port:', urlObj.port || '5432 (default)');
  console.log('[DB Config] Database name:', urlObj.pathname.split('/').pop() || 'unknown');
} catch (err) {
  console.warn('[DB Config] Could not parse DATABASE_URL for logging');
}

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Test database connection on startup (non-blocking)
// Connection will be tested on first query, but we log here for visibility
prisma.$connect()
  .then(() => {
    console.log('[DB] ✅ Successfully connected to database');
  })
  .catch((error) => {
    console.error('[DB Error] ❌ Failed to connect to database:', error.message);
    console.error('[DB Error] DATABASE_URL status:', DATABASE_URL ? 'SET' : 'NOT SET');
    if (DATABASE_URL) {
      try {
        const urlObj = new URL(DATABASE_URL);
        console.error('[DB Error] Trying to connect to:', urlObj.hostname, 'port:', urlObj.port || 5432);
      } catch (e) {
        console.error('[DB Error] DATABASE_URL format is invalid');
      }
    }
    console.error('[DB Error] If using Railway, ensure:');
    console.error('  1. PostgreSQL database service is created and running');
    console.error('  2. Database is linked to backend service via Reference Variable');
    console.error('  3. Go to: Backend Service → Variables → Add Reference Variable → Select Database → DATABASE_URL');
    console.error('[DB Error] Server will start but database queries will fail until DATABASE_URL is fixed');
    // Don't exit - let the server start so we can see the error in logs
  });

export default prisma;

