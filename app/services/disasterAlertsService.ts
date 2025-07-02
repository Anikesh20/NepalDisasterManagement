import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';

// Fetch disaster alerts from GDACS (RSS/XML)
export async function fetchGDACSAlerts() {
  const url = 'https://www.gdacs.org/xml/rss.xml';
  const { data } = await axios.get(url);
  const parser = new XMLParser();
  const parsed = parser.parse(data);
  // Normalize GDACS alerts
  const items = parsed.rss.channel.item || [];
  return items.map((item: any) => ({
    title: item.title,
    description: item.description,
    link: item.link,
    pubDate: item.pubDate,
    source: 'GDACS',
  }));
}

// Fetch disaster events from ReliefWeb
export async function fetchReliefWebAlerts() {
  const url = 'https://api.reliefweb.int/v1/disasters?appname=nepal-disaster-app&profile=full&limit=10';
  const { data } = await axios.get(url);
  // Normalize ReliefWeb alerts
  return data.data.map((item: any) => ({
    title: item.fields.name,
    description: item.fields.description,
    link: item.fields.url,
    pubDate: item.fields.date.created,
    source: 'ReliefWeb',
  }));
}

// Aggregate all alerts (now only from free sources)
export async function fetchAllDisasterAlerts(lat: number, lon: number) {
  let gdacs = [];
  let reliefweb = [];
  let otherError = null;
  try {
    [gdacs, reliefweb] = await Promise.all([
      fetchGDACSAlerts(),
      fetchReliefWebAlerts(),
    ]);
  } catch (err: any) {
    otherError = err;
    console.warn('GDACS/ReliefWeb alerts failed:', err?.message || err);
  }

  // Show all alerts globally for testing
  const allAlerts = [...gdacs, ...reliefweb];
  if (allAlerts.length === 0 && otherError) {
    throw new Error('Failed to load disaster alerts from all sources.');
  }
  return allAlerts;
} 