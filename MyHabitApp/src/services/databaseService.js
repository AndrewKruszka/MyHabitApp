// ... existing code ...

// --- Common Query Patterns ---

// Get all entries for a specific daily report
export const getDailyReportEntries = async (dailyReportId) => {
    try {
      const db = await getDatabase();
      const result = await db.getAllAsync(
        `SELECT dre.*, t.name as trackable_name, t.type as trackable_type 
         FROM DailyReportEntries dre
         LEFT JOIN Trackables t ON t.id = dre.trackable_id
         WHERE dre.daily_report_id = ?
         ORDER BY dre.created_at ASC;`,
        [dailyReportId]
      );
      return toArray(result);
    } catch (error) {
      console.error('Error fetching daily report entries:', error);
      throw error;
    }
  };
  
  // Get all entries for a specific trackable
  export const getTrackableEntries = async (trackableId, limit = 30) => {
    try {
      const db = await getDatabase();
      const result = await db.getAllAsync(
        `SELECT dre.*, dr.date 
         FROM DailyReportEntries dre
         JOIN DailyReports dr ON dr.id = dre.daily_report_id
         WHERE dre.trackable_id = ?
         ORDER BY dr.date DESC
         LIMIT ?;`,
        [trackableId, limit]
      );
      return toArray(result);
    } catch (error) {
      console.error('Error fetching entries for trackable:', error);
      throw error;
    }
  };
  
  // Get recent daily reports with mood ratings
  export const getRecentDailyReports = async (limit = 7) => {
    try {
      const db = await getDatabase();
      const result = await db.getAllAsync(
        `SELECT * FROM DailyReports 
         ORDER BY date DESC 
         LIMIT ?;`,
        [limit]
      );
      return toArray(result);
    } catch (error) {
      console.error('Error fetching recent daily reports:', error);
      throw error;
    }
  };
  
  // Get statistics for a trackable over time
  export const getTrackableStats = async (trackableId, { startDate, endDate }) => {
    try {
      const db = await getDatabase();
      const result = await db.getAllAsync(
        `SELECT 
           COUNT(*) as total_entries,
           AVG(CASE WHEN value REGEXP '^[0-9]+(\.[0-9]+)?$' THEN CAST(value AS FLOAT) ELSE NULL END) as average_value,
           MAX(CASE WHEN value REGEXP '^[0-9]+(\.[0-9]+)?$' THEN CAST(value AS FLOAT) ELSE NULL END) as max_value,
           MIN(CASE WHEN value REGEXP '^[0-9]+(\.[0-9]+)?$' THEN CAST(value AS FLOAT) ELSE NULL END) as min_value
         FROM DailyReportEntries dre
         JOIN DailyReports dr ON dr.id = dre.daily_report_id
         WHERE dre.trackable_id = ? 
           AND dr.date BETWEEN ? AND ?;`,
        [trackableId, startDate, endDate]
      );
      return toArray(result)[0] || null;
    } catch (error) {
      console.error('Error calculating trackable stats:', error);
      throw error;
    }
  };
  
  // Search daily reports by note content
  export const searchDailyReportsByNote = async (searchTerm) => {
    try {
      const db = await getDatabase();
      const result = await db.getAllAsync(
        `SELECT * FROM DailyReports 
         WHERE notes LIKE ? 
         ORDER BY date DESC;`,
        [`%${searchTerm}%`]
      );
      return toArray(result);
    } catch (error) {
      console.error('Error searching daily reports:', error);
      throw error;
    }
  };
  
  // Get trackables filtered by type
  export const getTrackablesByType = async (type) => {
    try {
      const db = await getDatabase();
      const result = await db.getAllAsync(
        `SELECT * FROM Trackables 
         WHERE type = ? AND archived = 0
         ORDER BY order_index ASC, name ASC;`,
        [type]
      );
      return toArray(result);
    } catch (error) {
      console.error('Error fetching trackables by type:', error);
      throw error;
    }
  };
  
  // Get insights within a date range
  export const getInsightsByDateRange = async (startDate, endDate) => {
    try {
      const db = await getDatabase();
      const result = await db.getAllAsync(
        `SELECT i.*, dr.date as report_date
         FROM Insights i
         JOIN DailyReports dr ON dr.id = i.daily_report_id
         WHERE dr.date BETWEEN ? AND ?
         ORDER BY dr.date DESC;`,
        [startDate, endDate]
      );
      return toArray(result);
    } catch (error) {
      console.error('Error fetching insights by date range:', error);
      throw error;
    }
  };
  
  // Calculate mood trends over time
  export const getMoodTrends = async (days = 30) => {
    try {
      const db = await getDatabase();
      const result = await db.getAllAsync(
        `SELECT 
           date,
           mood_rating as daily_mood,
           AVG(mood_rating) OVER (
             ORDER BY date 
             ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
           ) as weekly_average
         FROM DailyReports
         WHERE date >= date('now', ?) 
           AND mood_rating IS NOT NULL
         ORDER BY date;`,
        [`-${days} days`]
      );
      return toArray(result);
    } catch (error) {
      console.error('Error calculating mood trends:', error);
      throw error;
    }
  };
  
  // ... existing code ...