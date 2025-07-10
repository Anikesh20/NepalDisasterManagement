import axios from 'axios';

// Fetch disaster alerts from bipadportal.gov.np
export async function fetchBipadAlerts() {
  // You may want to dynamically set the date range, but for now, fetch recent alerts
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
  const { data } = await axios.get(url);
  // Normalize bipadportal alerts
  return (data.results || []).map((item: any) => ({
    title: item.title,
    description: item.description,
    link: '', // No direct link in API, can be updated if available
    pubDate: item.startedOn || item.createdOn,
    source: item.source || 'BIPAD',
  }));
}

// Aggregate all alerts (now only from bipadportal.gov.np)
export async function fetchAllDisasterAlerts(lat: number, lon: number) {
  let bipad = [];
  let otherError = null;
  try {
    bipad = await fetchBipadAlerts();
  } catch (err: any) {
    otherError = err;
    console.warn('BIPAD alerts failed:', err?.message || err);
  }

  if (bipad.length === 0 && otherError) {
    throw new Error('Failed to load disaster alerts from BIPAD.');
  }
  return bipad;
} 