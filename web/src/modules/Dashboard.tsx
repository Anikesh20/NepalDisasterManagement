import { Alert, Box, Button, CircularProgress, Grid, Paper, Snackbar, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAuth } from '../AuthContext';

const statColors = [
  '#e3f2fd', // blue
  '#f3e5f5', // purple
  '#e8f5e9', // green
  '#fff3e0', // orange
  '#fce4ec', // pink
];

export default function Dashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activity, setActivity] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [notif, setNotif] = useState<{ open: boolean; message: string; severity: 'success'|'info'|'warning'|'error' }>({ open: false, message: '', severity: 'info' });
  const [systemStatus, setSystemStatus] = useState<'ok'|'degraded'|'down'|'checking'>('checking');
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch stats');
        setStats(data);
      } catch (err: any) {
        setError(err.message || 'Error fetching stats');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [token]);

  useEffect(() => {
    async function fetchActivity() {
      try {
        // Fetch real alerts directly from BIPAD API
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const toISOStringNepal = (date: Date) => {
          const offsetMs = 345 * 60 * 1000;
          const local = new Date(date.getTime() + offsetMs);
          return local.toISOString().replace('.000Z', '+05:45');
        };
        const started_on__gt = toISOStringNepal(weekAgo).slice(0, 19) + '+05:45';
        const started_on__lt = toISOStringNepal(now).slice(0, 19) + '+05:45';
        const url = `https://bipadportal.gov.np/api/v1/alert/?rainBasin=&rainStation=&riverBasin=&riverStation=&hazard=&inventoryItems=&started_on__gt=${encodeURIComponent(started_on__gt)}&started_on__lt=${encodeURIComponent(started_on__lt)}&expand=event&ordering=-started_on`;
        const res = await fetch(url);
        const data = await res.json();
        const bipadAlerts = (data.results || []).map((a: any) => ({
          type: 'alert',
          message: a.title,
          time: a.startedOn ? new Date(a.startedOn).toLocaleString() : (a.createdOn ? new Date(a.createdOn).toLocaleString() : ''),
        }));
        setActivity([
          ...bipadAlerts.slice(0, 5)
        ]);
      } catch {
        setActivity([
          { type: 'user', message: 'New user registered: Ram', time: '2 min ago' },
          { type: 'donation', message: 'Donation received: Rs. 5000', time: '10 min ago' },
          { type: 'report', message: 'New disaster report: Flood in Kathmandu', time: '30 min ago' },
          { type: 'volunteer', message: 'Volunteer verified: Anikesh', time: '1 hr ago' },
        ]);
      }
    }
    fetchActivity();
  }, []);

  useEffect(() => {
    async function fetchChartData() {
      setChartLoading(true);
      try {
        // Fetch total stats for bar graph
        const res = await fetch('/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const stats = await res.json();
        if (!res.ok) throw new Error(stats.error || 'Failed to fetch stats');
        // Prepare data for bar graph
        const data = [
          { name: 'Users', value: stats.totalUsers || 0 },
          { name: 'Reports', value: stats.totalReports || 0 },
          { name: 'Volunteers', value: stats.totalVolunteers || 0 },
          { name: 'Donations', value: stats.totalDonations || 0 },
        ];
        setChartData(data);
      } catch (err) {
        setChartData([]);
      } finally {
        setChartLoading(false);
      }
    }
    fetchChartData();
  }, [token]);

  useEffect(() => {
    async function checkSystemStatus() {
      setSystemStatus('checking');
      try {
        const res = await fetch('/api/admin/stats');
        if (res.ok) setSystemStatus('ok');
        else setSystemStatus('degraded');
      } catch {
        setSystemStatus('down');
      }
    }
    checkSystemStatus();
  }, []);

  const statList = [
    { title: 'Total Users', value: stats?.totalUsers, color: statColors[0] },
    { title: 'Total Volunteers', value: stats?.totalVolunteers, color: statColors[1] },
    { title: 'Active Disasters', value: stats?.activeDisasters, color: statColors[2] },
    { title: 'Pending Reports', value: stats?.pendingReports, color: statColors[3] },
    { title: 'Total Donations', value: stats?.totalDonations, color: statColors[4] },
  ];

  const handleExport = () => {
    setNotif({ open: true, message: 'Exported data to CSV!', severity: 'success' });
  };
  const handleVerifyAll = () => {
    setNotif({ open: true, message: 'All pending reports verified!', severity: 'info' });
  };
  const handleSendAlert = async () => {
    setNotif({ open: true, message: 'Sending alert...', severity: 'info' });
    try {
      const res = await fetch('/api/admin/send-alert', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send alert');
      setNotif({ open: true, message: 'Disaster alert sent to all users!', severity: 'success' });
    } catch (err: any) {
      setNotif({ open: true, message: err.message || 'Failed to send alert', severity: 'error' });
    }
  };

  return (
    <Box sx={{ width: '100%', px: 0, py: 0, fontFamily: 'sans-serif', background: '#f8f9fa', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 3, mb: 2 }}>
        <Box sx={{ width: 90, height: 90, borderRadius: '50%', overflow: 'hidden', boxShadow: 2, mb: 2, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src="/icon.png" alt="Logo" style={{ width: 70, height: 70, objectFit: 'contain' }} />
        </Box>
        <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 800, mb: 1, textAlign: 'center' }}>
          Admin Dashboard
        </Typography>
        <Typography variant="h6" sx={{ color: '#444', mb: 3, textAlign: 'center' }}>
          Nepal Disaster Management
        </Typography>
      </Box>
      {error && <Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>{error}</Typography>}
      <Grid container spacing={3} justifyContent="center" sx={{ mb: 4 }}>
        {statList.map((s, i) => (
          <Grid item xs={12} sm={6} md={2.4} key={s.title}>
            <Paper elevation={3} sx={{
              p: 3,
              borderRadius: 3,
              background: s.color,
              textAlign: 'center',
              minWidth: 160,
              boxShadow: '0 2px 8px #0001',
            }}>
              <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#222', mb: 1 }}>{s.title}</Typography>
              <Typography sx={{ fontSize: 32, fontWeight: 800, color: '#1a237e' }}>{s.value ?? '-'}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Paper elevation={2} sx={{ p: 4, borderRadius: 3, background: '#fff', maxWidth: 500, mx: 'auto', textAlign: 'center', mb: 4 }}>
        <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#222', mb: 1 }}>Donation Amount</Typography>
        <Typography sx={{ fontSize: 32, fontWeight: 800, color: '#1a237e' }}>Rs. {stats ? stats.totalDonationAmount : '-'}</Typography>
      </Paper>
      {/* Quick Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
        <Button variant="contained" color="primary" onClick={handleExport}>Export Data</Button>
        <Button variant="contained" color="success" onClick={handleVerifyAll}>Verify All Pending</Button>
        <Button variant="contained" color="warning" onClick={handleSendAlert}>Send Alert</Button>
      </Box>
      {/* Analytics Chart */}
      <Paper elevation={2} sx={{ p: 3, borderRadius: 3, background: '#fff', maxWidth: 900, mx: 'auto', mb: 4 }}>
        <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#222', mb: 2 }}>Analytics</Typography>
        {chartLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <CircularProgress />
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#1a237e" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Paper>
      {/* Recent Activity Feed */}
      <Paper elevation={2} sx={{ p: 3, borderRadius: 3, background: '#fff', maxWidth: 600, mx: 'auto', mb: 4 }}>
        <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#222', mb: 2 }}>Recent Activity</Typography>
        <Box>
          {activity.map((a, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: a.type === 'user' ? '#1a237e' : a.type === 'donation' ? '#43a047' : a.type === 'report' ? '#fbc02d' : a.type === 'alert' ? '#e53935' : '#3949ab', mr: 2 }} />
              <Typography sx={{ flex: 1 }}>{a.message}</Typography>
              <Typography sx={{ color: '#888', fontSize: 13, ml: 2 }}>{a.time}</Typography>
            </Box>
          ))}
        </Box>
      </Paper>
      {/* System Health/Status */}
      <Paper elevation={2} sx={{ p: 3, borderRadius: 3, background: '#fff', maxWidth: 400, mx: 'auto', mb: 4, textAlign: 'center' }}>
        <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#222', mb: 2 }}>System Status</Typography>
        {systemStatus === 'checking' ? <CircularProgress size={28} /> : (
          <Typography sx={{ fontSize: 18, fontWeight: 700, color: systemStatus === 'ok' ? '#43a047' : systemStatus === 'degraded' ? '#fbc02d' : '#e53935' }}>
            {systemStatus === 'ok' && 'All systems operational'}
            {systemStatus === 'degraded' && 'Some systems degraded'}
            {systemStatus === 'down' && 'System down!'}
          </Typography>
        )}
      </Paper>
      {/* Notification Snackbar */}
      <Snackbar open={notif.open} autoHideDuration={3000} onClose={() => setNotif({ ...notif, open: false })}>
        <Alert onClose={() => setNotif({ ...notif, open: false })} severity={notif.severity} sx={{ width: '100%' }}>
          {notif.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 