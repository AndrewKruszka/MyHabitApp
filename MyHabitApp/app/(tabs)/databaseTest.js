// MyHabitApp/src/screens/DatabaseTestScreen.js
import React, { useState } from 'react';
import { View, Text, Button, ScrollView, StyleSheet } from 'react-native';
import { create, getById, cleanDatabase, runTransaction, getDatabase, remove } from '../../src/services/database.js';

export default function DatabaseTestScreen() {
  const [results, setResults] = useState([]);

  const runTests = async () => {
    const testResults = [];
    try {
      await cleanDatabase();

      // 1.6.1: Create a trackable and verify its ID is returned
      const trackableData = {
        name: 'Test Trackable',
        type: 'numeric',
        options: JSON.stringify({ min: 0, max: 10 }),
      };
      const trackableId = await create('Trackables', trackableData);
      if (typeof trackableId === 'number') {
        testResults.push('✅ Trackable ID returned: ' + trackableId);
      } else {
        testResults.push('❌ Trackable ID not returned');
      }
      const trackable = await getById('Trackables', trackableId);
      if (trackable && trackable.name === 'Test Trackable' && trackable.type === 'numeric') {
        testResults.push('✅ Trackable created and verified successfully.');
      } else {
        testResults.push('❌ Trackable verification failed.');
      }

      // 1.6.1: Create a daily report and verify its ID is returned
      const reportData = {
        date: '2024-05-01',
        notes: 'Test daily report',
      };
      const reportId = await create('DailyReports', reportData);
      if (typeof reportId === 'number') {
        testResults.push('✅ DailyReport ID returned: ' + reportId);
      } else {
        testResults.push('❌ DailyReport ID not returned');
      }
      const report = await getById('DailyReports', reportId);
      if (report && report.date === '2024-05-01' && report.notes === 'Test daily report') {
        testResults.push('✅ DailyReport created and verified successfully.');
      } else {
        testResults.push('❌ DailyReport verification failed.');
      }

      // 1.6.1: Create a daily report entry and verify its ID is returned
      // Need a new report and trackable for foreign keys
      const entryReportId = await create('DailyReports', { date: '2024-05-02', notes: 'Entry test' });
      const entryTrackableId = await create('Trackables', { name: 'Entry Trackable', type: 'numeric', options: '{}' });
      const entryData = {
        daily_report_id: entryReportId,
        trackable_id: entryTrackableId,
        value: '5',
      };
      const entryId = await create('DailyReportEntries', entryData);
      if (typeof entryId === 'number') {
        testResults.push('✅ DailyReportEntry ID returned: ' + entryId);
      } else {
        testResults.push('❌ DailyReportEntry ID not returned');
      }
      const entry = await getById('DailyReportEntries', entryId);
      if (
        entry &&
        entry.daily_report_id === entryReportId &&
        entry.trackable_id === entryTrackableId &&
        entry.value === '5'
      ) {
        testResults.push('✅ DailyReportEntry created and verified successfully.');
      } else {
        testResults.push('❌ DailyReportEntry verification failed.');
      }

      // 1.6.1: Create an insight and verify its ID is returned
      const insightData = {
        title: 'Test Insight',
        description: 'Insight description',
        query_data: '{}',
      };
      const insightId = await create('Insights', insightData);
      if (typeof insightId === 'number') {
        testResults.push('✅ Insight ID returned: ' + insightId);
      } else {
        testResults.push('❌ Insight ID not returned');
      }
      const insight = await getById('Insights', insightId);
      if (
        insight &&
        insight.title === 'Test Insight' &&
        insight.description === 'Insight description'
      ) {
        testResults.push('✅ Insight created and verified successfully.');
      } else {
        testResults.push('❌ Insight verification failed.');
      }

      // 1.6.1: Create a subpage and verify its ID is returned
      const subPageData = {
        name: 'Test SubPage',
        description: 'SubPage description',
      };
      const subPageId = await create('SubPages', subPageData);
      if (typeof subPageId === 'number') {
        testResults.push('✅ SubPage ID returned: ' + subPageId);
      } else {
        testResults.push('❌ SubPage ID not returned');
      }
      const subPage = await getById('SubPages', subPageId);
      if (
        subPage &&
        subPage.name === 'Test SubPage' &&
        subPage.description === 'SubPage description'
      ) {
        testResults.push('✅ SubPage created and verified successfully.');
      } else {
        testResults.push('❌ SubPage verification failed.');
      }

      // 1.6.1: Create a subpage entry and verify its ID is returned
      // Need a new subpage for foreign key
      const entrySubPageId = await create('SubPages', { name: 'Entry SubPage', description: 'For entry' });
      const subPageEntryData = {
        sub_page_id: entrySubPageId,
        content: 'SubPage entry content',
      };
      const subPageEntryId = await create('SubPageEntries', subPageEntryData);
      if (typeof subPageEntryId === 'number') {
        testResults.push('✅ SubPageEntry ID returned: ' + subPageEntryId);
      } else {
        testResults.push('❌ SubPageEntry ID not returned');
      }
      const subPageEntry = await getById('SubPageEntries', subPageEntryId);
      if (
        subPageEntry &&
        subPageEntry.sub_page_id === entrySubPageId &&
        subPageEntry.content === 'SubPage entry content'
      ) {
        testResults.push('✅ SubPageEntry created and verified successfully.');
      } else {
        testResults.push('❌ SubPageEntry verification failed.');
      }

      // --- TRANSACTION TESTS ---
      // 2.1: Successful transaction commits all operations
      let txReportId, txEntryId1, txEntryId2;
      let transactionSuccess = true;
      try {
        await runTransaction(async () => {
          txReportId = await create('DailyReports', { date: '2024-05-10', notes: 'Transaction test' });
          const txTrackableId = await create('Trackables', { name: 'T1', type: 'numeric', options: '{}' });
          txEntryId1 = await create('DailyReportEntries', { daily_report_id: txReportId, trackable_id: txTrackableId, value: '1' });
          txEntryId2 = await create('DailyReportEntries', { daily_report_id: txReportId, trackable_id: txTrackableId, value: '2' });
        });
      } catch (err) {
        transactionSuccess = false;
        testResults.push('❌ Transaction (commit) threw error: ' + err.message);
      }
      if (transactionSuccess) {
        const txReport = await getById('DailyReports', txReportId);
        const txEntry1 = await getById('DailyReportEntries', txEntryId1);
        const txEntry2 = await getById('DailyReportEntries', txEntryId2);
        if (txReport && txEntry1 && txEntry2) {
          testResults.push('✅ Transaction commit: All records created and verified.');
        } else {
          testResults.push('❌ Transaction commit: Records missing after transaction.');
        }
      }

      // 2.2: Transaction rolls back on error (no partial commit)
      let rollbackReportId = null;
      let rollbackErrorCaught = false;
      try {
        await runTransaction(async () => {
          rollbackReportId = await create('DailyReports', { date: '2024-05-11', notes: 'Rollback test' });
          // Intentionally use a bad trackable_id to cause a foreign key error
          await create('DailyReportEntries', { daily_report_id: rollbackReportId, trackable_id: 999999, value: 'bad' });
        });
      } catch (err) {
        rollbackErrorCaught = true;
        testResults.push('✅ Transaction rollback: Error caught as expected.');
      }
      if (!rollbackErrorCaught) {
        testResults.push('❌ Transaction rollback: No error was thrown.');
      }
      // After rollback, neither the report nor the entry should exist
      const rollbackReport = await getById('DailyReports', rollbackReportId);
      if (rollbackReport === null) {
        testResults.push('✅ Transaction rollback: No records committed after error.');
      } else {
        testResults.push('❌ Transaction rollback: Report still exists after rollback.');
      }

      // --- RELATIONSHIP TESTS ---
      // 3.1: Create a daily report with multiple entries and verify relationship
      const relReportId = await create('DailyReports', { date: '2024-05-20', notes: 'Relationship test' });
      const relTrackableId1 = await create('Trackables', { name: 'Rel T1', type: 'numeric', options: '{}' });
      const relTrackableId2 = await create('Trackables', { name: 'Rel T2', type: 'numeric', options: '{}' });
      const relEntryId1 = await create('DailyReportEntries', { daily_report_id: relReportId, trackable_id: relTrackableId1, value: '10' });
      const relEntryId2 = await create('DailyReportEntries', { daily_report_id: relReportId, trackable_id: relTrackableId2, value: '20' });
      // Fetch all entries for the report
      const db = await getDatabase();
      const relEntries = await db.getAllAsync('SELECT * FROM DailyReportEntries WHERE daily_report_id = ?;', relReportId);
      if (relEntries.length === 2 && relEntries[0].daily_report_id === relReportId && relEntries[1].daily_report_id === relReportId) {
        testResults.push('✅ Relationship: Fetched all entries for report.');
      } else {
        testResults.push('❌ Relationship: Failed to fetch correct entries for report.');
      }
      // 3.2: Cascade delete - delete the report and verify entries are deleted
      await remove('DailyReports', relReportId);
      const relEntriesAfterDelete = await db.getAllAsync('SELECT * FROM DailyReportEntries WHERE daily_report_id = ?;', relReportId);
      if (relEntriesAfterDelete.length === 0) {
        testResults.push('✅ Relationship: Cascade delete removed all entries for deleted report.');
      } else {
        testResults.push('❌ Relationship: Cascade delete did not remove all entries.');
      }

      // --- UTILITY FUNCTION TESTS ---
      // 4.1: Date range query for insights
      await db.runAsync('DELETE FROM Insights;');
      const now = Date.now();
      const insightId1 = await create('Insights', { title: 'Insight 1', description: 'Desc 1', query_data: '{}', created_at: now - 100000, updated_at: now - 100000 });
      const insightId2 = await create('Insights', { title: 'Insight 2', description: 'Desc 2', query_data: '{}', created_at: now, updated_at: now });
      const insightId3 = await create('Insights', { title: 'Insight 3', description: 'Desc 3', query_data: '{}', created_at: now + 100000, updated_at: now + 100000 });
      const { getInsightsByDateRange, getRecentDailyReports } = await import('../../src/services/database.js');
      const insightsInRange = await getInsightsByDateRange(now - 50000, now + 50000);
      if (insightsInRange.length === 1 && insightsInRange[0].title === 'Insight 2') {
        testResults.push('✅ Utility: Date range query for insights returned correct result.');
      } else {
        testResults.push('❌ Utility: Date range query for insights failed.');
      }

      // 4.2: Limit parameter in recent daily reports
      const reportIds = [];
      for (let i = 0; i < 5; i++) {
        const id = await create('DailyReports', { date: `2024-05-2${i}`, notes: `Report ${i}` });
        reportIds.push(id);
      }
      const recentReports = await getRecentDailyReports(3);
      if (recentReports.length === 3 && recentReports[0].date > recentReports[1].date) {
        testResults.push('✅ Utility: getRecentDailyReports(limit) returns correct number and order.');
      } else {
        testResults.push('❌ Utility: getRecentDailyReports(limit) failed.');
      }

      // 4.3: Proper joining of related data (entries for a trackable)
      const joinTrackableId = await create('Trackables', { name: 'Join T', type: 'numeric', options: '{}' });
      const joinReportId = await create('DailyReports', { date: '2024-05-30', notes: 'Join test' });
      await create('DailyReportEntries', { daily_report_id: joinReportId, trackable_id: joinTrackableId, value: '99' });
      const joinedEntries = await db.getAllAsync('SELECT dre.* FROM DailyReportEntries dre JOIN Trackables t ON dre.trackable_id = t.id WHERE t.id = ?;', joinTrackableId);
      if (joinedEntries.length === 1 && joinedEntries[0].trackable_id === joinTrackableId) {
        testResults.push('✅ Utility: Join query for entries by trackable returned correct result.');
      } else {
        testResults.push('❌ Utility: Join query for entries by trackable failed.');
      }

    } catch (error) {
      testResults.push(`❌ Error: ${error.message}`);
    }
    setResults(testResults);
  };

  return (
    <View style={styles.container}>
      <Button title="Run Database Tests" onPress={runTests} />
      <ScrollView style={styles.resultsContainer}>
        {results.map((result, idx) => (
          <Text key={idx} style={{ marginVertical: 4 }}>{result}</Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
  },
  resultsContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 0,
  },
});