import * as SQLite from 'expo-sqlite';
import { getDatabase } from './database';

// Migration status constants
export const MIGRATION_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
  ROLLED_BACK: 'rolled_back'
};

// Migration logging utility
const logMigration = async (db, version, status, error = null) => {
  const timestamp = Date.now();
  await db.executeSql(
    `INSERT INTO migration_logs (version, status, error, timestamp) 
     VALUES (?, ?, ?, ?);`,
    [version, status, error ? JSON.stringify(error) : null, timestamp]
  );
};

// Initialize migration tracking tables
export const initializeMigrationTables = async () => {
  const db = getDatabase();
  
  try {
    // Create version tracking table
    await db.executeSql(
      `CREATE TABLE IF NOT EXISTS db_version (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        version INTEGER NOT NULL,
        last_migration_date INTEGER
      );`
    );

    // Create migration logs table
    await db.executeSql(
      `CREATE TABLE IF NOT EXISTS migration_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version INTEGER NOT NULL,
        status TEXT NOT NULL,
        error TEXT,
        timestamp INTEGER NOT NULL
      );`
    );

    // Insert initial version if not exists
    const [versionResult] = await db.executeSql(
      'SELECT version FROM db_version WHERE id = 1'
    );
    
    if (versionResult.rows.length === 0) {
      await db.executeSql(
        'INSERT INTO db_version (id, version, last_migration_date) VALUES (1, 0, ?)',
        [Date.now()]
      );
    }

    return true;
  } catch (error) {
    console.error('Failed to initialize migration tables:', error);
    throw error;
  }
};

// Get current database version
export const getCurrentVersion = async () => {
  const db = getDatabase();
  try {
    const [result] = await db.executeSql(
      'SELECT version FROM db_version WHERE id = 1'
    );
    return result.rows.length > 0 ? result.rows.item(0).version : 0;
  } catch (error) {
    console.error('Failed to get current version:', error);
    throw error;
  }
};

// Update database version
const updateVersion = async (newVersion) => {
  const db = getDatabase();
  try {
    await db.executeSql(
      'UPDATE db_version SET version = ?, last_migration_date = ? WHERE id = 1',
      [newVersion, Date.now()]
    );
  } catch (error) {
    console.error('Failed to update version:', error);
    throw error;
  }
};

// Run a specific migration with rollback support
export const runMigration = async (version, up, down) => {
  const db = getDatabase();
  
  try {
    // Start transaction
    await db.transaction(async (tx) => {
      // Log migration start
      await logMigration(db, version, MIGRATION_STATUS.IN_PROGRESS);
      
      try {
        // Run the up migration
        await up(tx);
        
        // Update version and log success
        await updateVersion(version);
        await logMigration(db, version, MIGRATION_STATUS.COMPLETED);
      } catch (error) {
        // If migration fails, attempt rollback
        console.error(`Migration ${version} failed:`, error);
        
        try {
          if (down) {
            await down(tx);
            await logMigration(db, version, MIGRATION_STATUS.ROLLED_BACK);
          }
        } catch (rollbackError) {
          console.error(`Rollback for migration ${version} failed:`, rollbackError);
          await logMigration(db, version, MIGRATION_STATUS.FAILED, rollbackError);
          throw rollbackError;
        }
        
        await logMigration(db, version, MIGRATION_STATUS.FAILED, error);
        throw error;
      }
    });
    
    return true;
  } catch (error) {
    console.error(`Migration ${version} transaction failed:`, error);
    throw error;
  }
};

// Run all pending migrations in sequence
export const runPendingMigrations = async (migrations) => {
  try {
    const currentVersion = await getCurrentVersion();
    const pendingMigrations = migrations.filter(m => m.version > currentVersion)
                                      .sort((a, b) => a.version - b.version);
    
    for (const migration of pendingMigrations) {
      console.log(`Running migration ${migration.version}...`);
      await runMigration(migration.version, migration.up, migration.down);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to run pending migrations:', error);
    throw error;
  }
};

// Get migration history
export const getMigrationHistory = async () => {
  const db = getDatabase();
  try {
    const [result] = await db.executeSql(
      `SELECT * FROM migration_logs 
       ORDER BY timestamp DESC 
       LIMIT 100;`
    );
    return result.rows._array;
  } catch (error) {
    console.error('Failed to get migration history:', error);
    throw error;
  }
}; 