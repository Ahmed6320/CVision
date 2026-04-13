#!/usr/bin/env node

/**
 * CVision Database Migration Manager
 * Usage: node migrate.js [up|down|reset]
 */

import fs from 'fs';
import path from 'path';
import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const migrationsDir = path.join(process.cwd(), 'migrations');

// Ensure migrations directory exists
if (!fs.existsSync(migrationsDir)) {
  fs.mkdirSync(migrationsDir, { recursive: true });
}

// Create migrations table if it doesn't exist
async function initMigrationsTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMP DEFAULT NOW()
    );
  `;
  await pool.query(query);
}

// Get list of executed migrations
async function getExecutedMigrations() {
  const result = await pool.query('SELECT name FROM migrations ORDER BY executed_at');
  return result.rows.map(row => row.name);
}

// Get list of pending migrations
async function getPendingMigrations() {
  const executed = await getExecutedMigrations();
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();
  
  return files.filter(f => !executed.includes(f));
}

// Run migration up
async function migrateUp() {
  try {
    await initMigrationsTable();
    const pending = await getPendingMigrations();
    
    if (pending.length === 0) {
      console.log('✓ All migrations are up to date');
      return;
    }

    for (const migration of pending) {
      console.log(`⏳ Running migration: ${migration}`);
      const filePath = path.join(migrationsDir, migration);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('INSERT INTO migrations (name) VALUES ($1)', [migration]);
        await client.query('COMMIT');
        console.log(`✓ Migration completed: ${migration}`);
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    }
    
    console.log('✓ All migrations completed successfully');
  } catch (e) {
    console.error('✗ Migration failed:', e.message);
    process.exit(1);
  }
}

// Reset database
async function resetDatabase() {
  try {
    console.log('⚠️  Resetting database (this will delete all data)...');
    
    const client = await pool.connect();
    try {
      // Drop all tables
      await client.query(`
        DROP SCHEMA public CASCADE;
        CREATE SCHEMA public;
      `);
      
      // Re-run all migrations
      await migrateUp();
    } finally {
      client.release();
    }
  } catch (e) {
    console.error('✗ Reset failed:', e.message);
    process.exit(1);
  }
}

// Create new migration file
async function createMigration(name) {
  const timestamp = Date.now();
  const filename = `${timestamp}_${name}.sql`;
  const filepath = path.join(migrationsDir, filename);
  
  const template = `-- Migration: ${name}
-- Created: ${new Date().toISOString()}

BEGIN;

-- Your SQL here

COMMIT;
`;

  fs.writeFileSync(filepath, template);
  console.log(`✓ Migration created: ${filename}`);
}

// Main
async function main() {
  const command = process.argv[2] || 'status';

  try {
    switch (command) {
      case 'up':
        await migrateUp();
        break;
      
      case 'status':
        await initMigrationsTable();
        const executed = await getExecutedMigrations();
        const pending = await getPendingMigrations();
        console.log('\n📊 Migration Status:');
        console.log(`Executed: ${executed.length}`);
        if (executed.length > 0) {
          executed.forEach(m => console.log(`  ✓ ${m}`));
        }
        console.log(`Pending: ${pending.length}`);
        if (pending.length > 0) {
          pending.forEach(m => console.log(`  ⏳ ${m}`));
        }
        break;
      
      case 'reset':
        await resetDatabase();
        break;
      
      case 'create':
        if (!process.argv[3]) {
          console.error('Usage: node migrate.js create <migration-name>');
          process.exit(1);
        }
        await createMigration(process.argv[3]);
        break;
      
      default:
        console.error(`Unknown command: ${command}`);
        console.log('Usage: node migrate.js [up|down|reset|status|create <name>]');
        process.exit(1);
    }
  } finally {
    await pool.end();
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
