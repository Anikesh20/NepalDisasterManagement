const fetch = require('node-fetch');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { XMLParser } = require('fast-xml-parser');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_m8KwGUQuLOz7@ep-cold-union-a47hx6do-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

// Fetch disaster alerts from GDACS (RSS/XML)
async function fetchGDACSAlerts() {
  const url = 'https://www.gdacs.org/xml/rss.xml';
  const res = await fetch(url);
  const data = await res.text();
  const parser = new XMLParser();
  const parsed = parser.parse(data);
  const items = parsed.rss.channel.item || [];
  return items.map(item => ({
    title: item.title,
    description: item.description,
    link: item.link,
    pubDate: item.pubDate,
    source: 'GDACS',
  }));
}

// Fetch disaster events from ReliefWeb
async function fetchReliefWebAlerts() {
  const url = 'https://api.reliefweb.int/v1/disasters?appname=nepal-disaster-app&profile=full&limit=10';
  const res = await fetch(url);
  const data = await res.json();
  return data.data.map(item => ({
    title: item.fields.name,
    description: item.fields.description,
    link: item.fields.url,
    pubDate: item.fields.date.created,
    source: 'ReliefWeb',
  }));
}

// Aggregate all alerts
async function fetchAllDisasterAlerts() {
  let gdacs = [];
  let reliefweb = [];
  try {
    [gdacs, reliefweb] = await Promise.all([
      fetchGDACSAlerts(),
      fetchReliefWebAlerts(),
    ]);
  } catch (err) {
    console.warn('GDACS/ReliefWeb alerts failed:', err?.message || err);
  }
  return [...gdacs, ...reliefweb];
}

// Get all user Expo push tokens
async function getAllExpoPushTokens() {
  const res = await pool.query('SELECT id, expo_push_token FROM users WHERE expo_push_token IS NOT NULL');
  return res.rows;
}

// Send push notification via Expo
async function sendPushNotification(expoPushToken, message, data = {}) {
  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: expoPushToken,
      sound: 'default',
      title: 'New Disaster Alert',
      body: message,
      data,
    }),
  });
}

// Store last sent alert info in a file
const LAST_ALERT_FILE = path.join(__dirname, 'last_sent_alert.json');
function getLastSentAlert() {
  if (fs.existsSync(LAST_ALERT_FILE)) {
    return JSON.parse(fs.readFileSync(LAST_ALERT_FILE, 'utf8'));
  }
  return null;
}
function setLastSentAlert(alert) {
  fs.writeFileSync(LAST_ALERT_FILE, JSON.stringify(alert, null, 2));
}

// Add: Get top disaster from your own DB (last 24 hours, highest severity or most recent)
async function getTopDisasterFromDB() {
  const res = await pool.query(`
    SELECT * FROM disaster_reports
    WHERE created_at > NOW() - INTERVAL '24 hours'
    ORDER BY severity DESC, created_at DESC
    LIMIT 1
  `);
  return res.rows[0];
}

// Fetch disaster reports from BIPAD portal
async function fetchBipadDisasterReports() {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const toISOStringNepal = (date) => {
    // Nepal is UTC+5:45, so add 5*60+45=345 minutes
    const offsetMs = 345 * 60 * 1000;
    const local = new Date(date.getTime() + offsetMs);
    return local.toISOString().replace('.000Z', '+05:45');
  };
  const started_on__gt = toISOStringNepal(weekAgo).slice(0, 19) + '+05:45';
  const started_on__lt = toISOStringNepal(now).slice(0, 19) + '+05:45';
  const url = `https://bipadportal.gov.np/api/v1/alert/?rainBasin=&rainStation=&riverBasin=&riverStation=&hazard=&inventoryItems=&started_on__gt=${encodeURIComponent(started_on__gt)}&started_on__lt=${encodeURIComponent(started_on__lt)}&expand=event&ordering=-started_on`;
  const res = await fetch(url);
  const data = await res.json();
  return (data.results || []).map((item) => ({
    title: item.title,
    description: item.description,
    startedOn: item.startedOn || item.createdOn,
    pubDate: item.startedOn || item.createdOn, // Add pubDate for frontend compatibility
    hazard: item.hazard,
    district: item.district,
    event: item.event,
    source: 'BIPAD',
  }));
}

module.exports = {
  fetchGDACSAlerts,
  fetchReliefWebAlerts,
  fetchBipadDisasterReports,
  getAllExpoPushTokens,
  sendPushNotification,
};

// Main function
async function main() {
  const alerts = await fetchAllDisasterAlerts();
  const lastSent = getLastSentAlert();
  let sent = false;
  if (alerts.length) {
    // Find the newest alert
    const newestAlert = alerts[0];
    if (!lastSent || lastSent.title !== newestAlert.title || lastSent.pubDate !== newestAlert.pubDate) {
      // New alert detected
      const users = await getAllExpoPushTokens();
      for (const user of users) {
        await sendPushNotification(user.expo_push_token, newestAlert.title, { alert: newestAlert });
      }
      setLastSentAlert({ title: newestAlert.title, pubDate: newestAlert.pubDate });
      console.log('Sent push notification for new alert:', newestAlert.title);
      sent = true;
    }
  }
  if (!sent) {
    // No new alert, send top disaster from DB every 2 hours
    const now = new Date();
    const lastSentTime = lastSent && lastSent.pubDate ? new Date(lastSent.pubDate) : null;
    if (!lastSentTime || (now - lastSentTime) > 2 * 60 * 60 * 1000) { // 2 hours
      const topDisaster = await getTopDisasterFromDB();
      if (topDisaster) {
        const users = await getAllExpoPushTokens();
        for (const user of users) {
          await sendPushNotification(
            user.expo_push_token,
            `Top Disaster: ${topDisaster.title} (${topDisaster.severity}) in ${topDisaster.district}`,
            { disaster: topDisaster }
          );
        }
        setLastSentAlert({ title: topDisaster.title, pubDate: now.toISOString() });
        console.log('Sent top disaster notification:', topDisaster.title);
      } else {
        console.log('No top disaster found in DB for last 24 hours.');
      }
    } else {
      console.log('No new alert and not yet time for top disaster notification.');
    }
  }
  await pool.end();
}

if (require.main === module) {
  main().catch(err => {
    console.error('Error in sendDisasterPushNotifications:', err);
    process.exit(1);
  });
} 