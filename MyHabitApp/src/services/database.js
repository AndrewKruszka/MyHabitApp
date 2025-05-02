import * as SQLite from 'expo-sqlite';

let db = null;

export const getDatabase = async () => {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('habittracker.db');
  await db.execAsync('PRAGMA foreign_keys = ON;');
  return db;
};

const toArray = (rows) => {
  const arr = [];
  for (let i = 0; i < rows.length; i++) {
    arr.push(rows.item(i));
  }
  return arr;
};

export const initializeDatabase = async () => {
  const db = await getDatabase();
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS DailyReports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL UNIQUE,
        notes TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS Trackables (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('boolean', 'numeric', 'selection', 'text')),
        options TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS DailyReportEntries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        daily_report_id INTEGER NOT NULL,
        trackable_id INTEGER NOT NULL,
        value TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (daily_report_id) REFERENCES DailyReports (id) ON DELETE CASCADE,
        FOREIGN KEY (trackable_id) REFERENCES Trackables (id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS Insights (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        query_data TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS SubPages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS SubPageEntries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sub_page_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (sub_page_id) REFERENCES SubPages (id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_daily_reports_date ON DailyReports(date);
      CREATE INDEX IF NOT EXISTS idx_trackables_name ON Trackables(name);
      CREATE INDEX IF NOT EXISTS idx_daily_report_entries_report_id ON DailyReportEntries(daily_report_id);
      CREATE INDEX IF NOT EXISTS idx_daily_report_entries_trackable_id ON DailyReportEntries(trackable_id);
    `);
    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

export const create = async (table, data) => {
    const db = await getDatabase();
    const timestamp = Date.now();
    const fields = Object.keys(data);
    const values = Object.values(data);
  
    // Only add created_at/updated_at if not provided
    if (!fields.includes('created_at')) {
      fields.push('created_at');
      values.push(timestamp);
    }
    if (!fields.includes('updated_at')) {
      fields.push('updated_at');
      values.push(timestamp);
    }
  
    const placeholders = fields.map(() => '?').join(',');
    const query = `INSERT INTO ${table} (${fields.join(',')}) VALUES (${placeholders})`;
    const result = await db.runAsync(query, ...values);
    return result.lastInsertRowId;
  };

export const getById = async (table, id) => {
  const db = await getDatabase();
  const row = await db.getFirstAsync(`SELECT * FROM ${table} WHERE id = ?;`, id);
  return row || null;
};

export const update = async (table, id, data) => {
  const db = await getDatabase();
  const timestamp = Date.now();
  const fields = Object.keys(data);
  const values = Object.values(data);
  const setClause = fields.map(field => `${field} = ?`).join(',');
  values.push(timestamp, id);
  const query = `UPDATE ${table} SET ${setClause}, updated_at = ? WHERE id = ?`;
  const result = await db.runAsync(query, ...values);
  return result.changes > 0;
};

export const remove = async (table, id) => {
  const db = await getDatabase();
  const result = await db.runAsync(`DELETE FROM ${table} WHERE id = ?;`, id);
  return result.changes > 0;
};

export const getRecentDailyReports = async (limit = 7) => {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    `SELECT * FROM DailyReports ORDER BY date DESC LIMIT ?;`,
    limit
  );
  return rows;
};

export const getTrackableStats = async (trackableId, { startDate, endDate }) => {
  const db = await getDatabase();
  const row = await db.getFirstAsync(
    `SELECT 
       COUNT(*) as total_entries,
       AVG(CAST(value AS FLOAT)) as average_value,
       MAX(CAST(value AS FLOAT)) as max_value,
       MIN(CAST(value AS FLOAT)) as min_value
     FROM DailyReportEntries dre
     JOIN DailyReports dr ON dre.daily_report_id = dr.id
     WHERE dre.trackable_id = ? 
       AND dr.date BETWEEN ? AND ?;`,
    trackableId, startDate, endDate
  );
  return row;
};

export const searchDailyReportsByNote = async (searchTerm) => {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    `SELECT * FROM DailyReports WHERE notes LIKE ? ORDER BY date DESC;`,
    `%${searchTerm}%`
  );
  return rows;
};

export const getTrackablesByType = async (type) => {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    `SELECT * FROM Trackables WHERE type = ? ORDER BY name;`,
    type
  );
  return rows;
};

export const getInsightsByDateRange = async (startDate, endDate) => {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    `SELECT * FROM Insights WHERE created_at BETWEEN ? AND ? ORDER BY created_at DESC;`,
    startDate, endDate
  );
  return rows;
};

export const runTransaction = async (callback) => {
  const db = await getDatabase();
  await db.withTransactionAsync(callback);
};

export const testDatabaseConnection = async () => {
  const db = await getDatabase();
  const tables = ['DailyReports', 'Trackables', 'SubPages', 'DailyReportEntries', 'SubPageEntries', 'Insights'];
  for (const table of tables) {
    const row = await db.getFirstAsync(
      "SELECT name FROM sqlite_master WHERE type='table' AND name=?;",
      table
    );
    console.log(`Table ${table} exists:`, !!row);
  }
  return true;
};

export const cleanDatabase = async () => {
  const db = await getDatabase();
  const tables = ['DailyReportEntries', 'SubPageEntries', 'Insights', 'DailyReports', 'SubPages', 'Trackables'];
  for (const table of tables) {
    await db.runAsync(`DELETE FROM ${table};`);
  }
};

export const resetDatabaseForDev = async () => {
  const db = await getDatabase();
  // Drop all tables
  await db.execAsync(`
    DROP TABLE IF EXISTS DailyReportEntries;
    DROP TABLE IF EXISTS SubPageEntries;
    DROP TABLE IF EXISTS Insights;
    DROP TABLE IF EXISTS DailyReports;
    DROP TABLE IF EXISTS SubPages;
    DROP TABLE IF EXISTS Trackables;
  `);
  await initializeDatabase();
};