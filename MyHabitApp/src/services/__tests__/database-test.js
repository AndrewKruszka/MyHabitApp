import { create, getById, cleanDatabase, runTransaction } from '../database';

describe('Database CRUD Operations', () => {
  beforeAll(async () => {
    // Clean database before running tests
    await cleanDatabase();
  });

  afterAll(async () => {
    // Clean up after tests
    await cleanDatabase();
  });

  test('1.6.1: Create a trackable and verify its ID is returned', async () => {
    const trackableData = {
      name: 'Test Trackable',
      type: 'numeric',
      options: JSON.stringify({ min: 0, max: 10 })
    };
    const id = await create('Trackables', trackableData);
    expect(typeof id).toBe('number');
    const trackable = await getById('Trackables', id);
    expect(trackable).not.toBeNull();
    expect(trackable.name).toBe('Test Trackable');
    expect(trackable.type).toBe('numeric');
  });

  test('1.6.1: Create a daily report and verify its ID is returned', async () => {
    const reportData = {
      date: '2024-05-01',
      notes: 'Test daily report'
    };
    const id = await create('DailyReports', reportData);
    expect(typeof id).toBe('number');
    const report = await getById('DailyReports', id);
    expect(report).not.toBeNull();
    expect(report.date).toBe('2024-05-01');
    expect(report.notes).toBe('Test daily report');
    expect(typeof report.created_at).toBe('number');
    expect(typeof report.updated_at).toBe('number');
  });

  test('1.6.1: Create a daily report entry and verify its ID is returned', async () => {
    // First, create required DailyReport and Trackable
    const reportId = await create('DailyReports', { date: '2024-05-02', notes: 'Entry test' });
    const trackableId = await create('Trackables', { name: 'Entry Trackable', type: 'numeric', options: '{}' });
    const entryData = {
      daily_report_id: reportId,
      trackable_id: trackableId,
      value: '5'
    };
    const id = await create('DailyReportEntries', entryData);
    expect(typeof id).toBe('number');
    const entry = await getById('DailyReportEntries', id);
    expect(entry).not.toBeNull();
    expect(entry.daily_report_id).toBe(reportId);
    expect(entry.trackable_id).toBe(trackableId);
    expect(entry.value).toBe('5');
    expect(typeof entry.created_at).toBe('number');
    expect(typeof entry.updated_at).toBe('number');
  });

  test('1.6.1: Create an insight and verify its ID is returned', async () => {
    const insightData = {
      title: 'Test Insight',
      description: 'Insight description',
      query_data: '{}'
    };
    const id = await create('Insights', insightData);
    expect(typeof id).toBe('number');
    const insight = await getById('Insights', id);
    expect(insight).not.toBeNull();
    expect(insight.title).toBe('Test Insight');
    expect(insight.description).toBe('Insight description');
    expect(typeof insight.created_at).toBe('number');
    expect(typeof insight.updated_at).toBe('number');
  });

  test('1.6.1: Create a subpage and verify its ID is returned', async () => {
    const subPageData = {
      name: 'Test SubPage',
      description: 'SubPage description'
    };
    const id = await create('SubPages', subPageData);
    expect(typeof id).toBe('number');
    const subPage = await getById('SubPages', id);
    expect(subPage).not.toBeNull();
    expect(subPage.name).toBe('Test SubPage');
    expect(subPage.description).toBe('SubPage description');
    expect(typeof subPage.created_at).toBe('number');
    expect(typeof subPage.updated_at).toBe('number');
  });

  test('1.6.1: Create a subpage entry and verify its ID is returned', async () => {
    // First, create required SubPage
    const subPageId = await create('SubPages', { name: 'Entry SubPage', description: 'For entry' });
    const entryData = {
      sub_page_id: subPageId,
      content: 'SubPage entry content'
    };
    const id = await create('SubPageEntries', entryData);
    expect(typeof id).toBe('number');
    const entry = await getById('SubPageEntries', id);
    expect(entry).not.toBeNull();
    expect(entry.sub_page_id).toBe(subPageId);
    expect(entry.content).toBe('SubPage entry content');
    expect(typeof entry.created_at).toBe('number');
    expect(typeof entry.updated_at).toBe('number');
  });

  // Additional tests will be added for other cases
});

describe('Database Transaction Tests', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  test('2.1: Successful transaction commits all operations', async () => {
    let reportId, entryId1, entryId2;
    await runTransaction(async (txDb) => {
      reportId = await create('DailyReports', { date: '2024-05-10', notes: 'Transaction test' });
      const trackableId = await create('Trackables', { name: 'T1', type: 'numeric', options: '{}' });
      entryId1 = await create('DailyReportEntries', { daily_report_id: reportId, trackable_id: trackableId, value: '1' });
      entryId2 = await create('DailyReportEntries', { daily_report_id: reportId, trackable_id: trackableId, value: '2' });
    });
    // After transaction, all should exist
    const report = await getById('DailyReports', reportId);
    const entry1 = await getById('DailyReportEntries', entryId1);
    const entry2 = await getById('DailyReportEntries', entryId2);
    expect(report).not.toBeNull();
    expect(entry1).not.toBeNull();
    expect(entry2).not.toBeNull();
  });

  test('2.2: Transaction rolls back on error (no partial commit)', async () => {
    let reportId = null;
    try {
      await runTransaction(async (txDb) => {
        reportId = await create('DailyReports', { date: '2024-05-11', notes: 'Rollback test' });
        // Intentionally use a bad trackable_id to cause a foreign key error
        await create('DailyReportEntries', { daily_report_id: reportId, trackable_id: 999999, value: 'bad' });
      });
    } catch (err) {
      // Expected error
    }
    // After rollback, neither the report nor the entry should exist
    const report = await getById('DailyReports', reportId);
    const entries = await getById('DailyReportEntries', 1); // Should be null or not exist
    expect(report).toBeNull();
    // Optionally, check that no entries exist for that reportId
  });
}); 