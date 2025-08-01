import { Box, CircularProgress, FormControl, Grid, InputLabel, MenuItem, Paper, Select, Typography } from '@mui/material';
import Papa from 'papaparse';
import { useEffect, useState } from 'react';
import { Bar, BarChart, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const CSV_URL = 'https://raw.githubusercontent.com/Anikesh20/NepalDisasterManagement/master/assets/incident_report_cleaned.csv';
const importantHeaders = [
  'District', 'Incident Date', 'Incident', 'Death Male', 'Death Female', 'Death Unknown', 'Total Death',
  'Missing People', 'Estimated Loss', 'Injured', 'Property Loss', 'Cattles Loss', 'Source',
];

type RowType = { [key: string]: string };

export default function HistoricalData() {
  const [data, setData] = useState<RowType[]>([]);
  const [filteredData, setFilteredData] = useState<RowType[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [incidentTypes, setIncidentTypes] = useState<string[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedIncidentType, setSelectedIncidentType] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCSV() {
      setLoading(true);
      try {
        const response = await fetch(CSV_URL);
        if (!response.ok) throw new Error('Failed to fetch CSV');
        const csvString = await response.text();
        const parsed = Papa.parse(csvString, { header: true, skipEmptyLines: true });
        // Fix filter type error by casting parsed.data to RowType[]
        const rows: RowType[] = (parsed.data as RowType[]).filter((row: RowType) => !!row['District']);
        setData(rows);
        // Extract unique districts and years
        const uniqueDistricts = Array.from(new Set(rows.map((row: RowType) => row['District']).filter(Boolean))).sort();
        const uniqueYears = Array.from(new Set(rows.map((row: RowType) => {
          const date = row['Incident Date'];
          if (!date || typeof date !== 'string') return null;
          if (date.includes('-')) return date.split('-')[0];
          if (date.includes('/')) { const parts = date.split('/'); return parts.length === 3 ? parts[2] : null; }
          return null;
        }).filter((y): y is string => Boolean(y)))).sort();
        setDistricts(uniqueDistricts);
        setYears(uniqueYears);
        // Extract unique incident types
        const uniqueIncidentTypes = Array.from(new Set(rows.map((row: RowType) => row['Incident']).filter(Boolean))).sort();
        setIncidentTypes(uniqueIncidentTypes);
      } catch (e) {
        // eslint-disable-next-line no-alert
        alert('Failed to load data: ' + (e as any).message);
      } finally {
        setLoading(false);
      }
    }
    loadCSV();
  }, []);

  useEffect(() => {
    if (selectedDistrict && selectedYear) {
      let filtered = data.filter((row: RowType) => row['District'] === selectedDistrict);
      filtered = filtered.filter((row: RowType) => {
        const date = row['Incident Date'];
        if (!date || typeof date !== 'string') return false;
        let year = '';
        if (date.includes('/')) year = date.split('/').pop() || '';
        else if (date.includes('-')) year = date.split('-')[0];
        return year === selectedYear;
      });
      if (selectedIncidentType) {
        filtered = filtered.filter((row: RowType) => row['Incident'] === selectedIncidentType);
      }
      setFilteredData(filtered);
    } else {
      setFilteredData([]);
    }
  }, [data, selectedDistrict, selectedYear, selectedIncidentType]);

  // Summary stats
  const summary = filteredData.reduce(
    (acc, row: RowType) => {
      acc.deathMale += parseInt(row['Death Male'] || '0', 10);
      acc.deathFemale += parseInt(row['Death Female'] || '0', 10);
      acc.deathUnknown += parseInt(row['Death Unknown'] || '0', 10);
      acc.totalDeath += parseInt(row['Total Death'] || '0', 10);
      acc.missing += parseInt(row['Missing People'] || '0', 10);
      acc.injured += parseInt(row['Injured'] || '0', 10);
      acc.estimatedLoss += parseInt(row['Estimated Loss'] || '0', 10);
      acc.propertyLoss += parseInt(row['Property Loss'] || '0', 10);
      acc.cattleLoss += parseInt(row['Cattles Loss'] || '0', 10);
      return acc;
    },
    {
      deathMale: 0,
      deathFemale: 0,
      deathUnknown: 0,
      totalDeath: 0,
      missing: 0,
      injured: 0,
      estimatedLoss: 0,
      propertyLoss: 0,
      cattleLoss: 0,
    }
  );

  // Chart data: Deaths and Injured by month
  const deathsByMonth: { [month: string]: number } = {};
  const injuredByMonth: { [month: string]: number } = {};
  if (selectedYear) {
    filteredData.forEach((row: RowType) => {
      const date = row['Incident Date'];
      if (!date || typeof date !== 'string') return;
      let month = '';
      if (date.includes('-')) { const parts = date.split('-'); month = parts.length >= 2 ? parts[1] : ''; }
      else if (date.includes('/')) { const parts = date.split('/'); month = parts.length === 3 ? parts[0].padStart(2, '0') : ''; }
      if (month) {
        deathsByMonth[month] = (deathsByMonth[month] || 0) + parseInt(row['Total Death'] || '0', 10);
        injuredByMonth[month] = (injuredByMonth[month] || 0) + parseInt(row['Injured'] || '0', 10);
      }
    });
  }
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const deathsByMonthChart = monthLabels.map((label, idx) => ({
    month: label,
    deaths: deathsByMonth[(idx + 1).toString().padStart(2, '0')] || 0,
    injured: injuredByMonth[(idx + 1).toString().padStart(2, '0')] || 0,
  }));

  // Chart data: Incident type distribution
  const incidentTypeCount: { [type: string]: number } = {};
  filteredData.forEach((row: RowType) => {
    const type = row['Incident'];
    if (!type) return;
    incidentTypeCount[type] = (incidentTypeCount[type] || 0) + 1;
  });
  const pieColors = [
    '#1976D2', '#E53935', '#FB8C00', '#43A047', '#3949AB', '#00897B', '#D81B60', '#757575', '#FBC02D', '#8E24AA', '#00ACC1', '#F4511E',
  ];
  const incidentPieData = Object.keys(incidentTypeCount)
    .map((type, i) => ({
      name: type,
      value: incidentTypeCount[type],
      fill: pieColors[i % pieColors.length],
    }))
    .sort((a, b) => b.value - a.value); // Sort descending by count

  // --- Heatmap Data: Month vs. Incident Type ---
  const heatmapIncidentTypes = Array.from(new Set(filteredData.map(row => row['Incident']).filter(Boolean)));
  const heatmapData = monthLabels.map((monthLabel, idx) => {
    const month = (idx + 1).toString().padStart(2, '0');
    const row: any = { month: monthLabel };
    heatmapIncidentTypes.forEach(type => {
      row[type] = filteredData.filter(row2 => {
        const date = row2['Incident Date'];
        let m = '';
        if (date && date.includes('-')) m = date.split('-')[1];
        else if (date && date.includes('/')) m = date.split('/')[0].padStart(2, '0');
        return m === month && row2['Incident'] === type;
      }).length;
    });
    return row;
  });

  // --- Bar Chart: Top 5 Incidents by Total Deaths ---
  const deathsByIncident: { [type: string]: number } = {};
  filteredData.forEach(row => {
    const type = row['Incident'];
    deathsByIncident[type] = (deathsByIncident[type] || 0) + parseInt(row['Total Death'] || '0', 10);
  });
  const topIncidents = Object.entries(deathsByIncident)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([type, deaths]) => ({ type, deaths }));

  // --- Stacked Bar Chart: Deaths by Gender per Month ---
  const deathsByGenderPerMonth = monthLabels.map((label, idx) => {
    const month = (idx + 1).toString().padStart(2, '0');
    let male = 0, female = 0, unknown = 0;
    filteredData.forEach(row => {
      const date = row['Incident Date'];
      let m = '';
      if (date && date.includes('-')) m = date.split('-')[1];
      else if (date && date.includes('/')) m = date.split('/')[0].padStart(2, '0');
      if (m === month) {
        male += parseInt(row['Death Male'] || '0', 10);
        female += parseInt(row['Death Female'] || '0', 10);
        unknown += parseInt(row['Death Unknown'] || '0', 10);
      }
    });
    return { month: label, Male: male, Female: female, Unknown: unknown };
  });

  return (
    <Box sx={{ width: '100%', maxWidth: 1400, mx: 'auto', p: { xs: 2, md: 6 } }}>
      <Typography variant="h3" sx={{ fontWeight: 900, mb: 5, color: 'primary.main', fontSize: { xs: 32, md: 44 } }}>Historical Disaster Data</Typography>
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 12 }}>
          <CircularProgress size={60} />
          <Typography sx={{ mt: 3, fontSize: 22 }}>Loading data...</Typography>
        </Box>
      ) : (
        <>
          <Paper sx={{ p: { xs: 2, md: 4 }, mb: 5, display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
            <FormControl sx={{ minWidth: 220, fontSize: 18 }} size="medium">
              <InputLabel sx={{ fontSize: 18 }}>District</InputLabel>
              <Select value={selectedDistrict} label="District" onChange={e => setSelectedDistrict(e.target.value)} sx={{ fontSize: 18 }}>
                <MenuItem value=""><em>Select District</em></MenuItem>
                {districts.map(d => <MenuItem key={d} value={d} sx={{ fontSize: 18 }}>{d}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 160, fontSize: 18 }} size="medium">
              <InputLabel sx={{ fontSize: 18 }}>Year</InputLabel>
              <Select value={selectedYear} label="Year" onChange={e => setSelectedYear(e.target.value)} sx={{ fontSize: 18 }}>
                <MenuItem value=""><em>Select Year</em></MenuItem>
                {years.map(y => <MenuItem key={y} value={y} sx={{ fontSize: 18 }}>{y}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 220, fontSize: 18 }} size="medium">
              <InputLabel sx={{ fontSize: 18 }}>Incident Type</InputLabel>
              <Select value={selectedIncidentType} label="Incident Type" onChange={e => setSelectedIncidentType(e.target.value)} sx={{ fontSize: 18 }}>
                <MenuItem value=""><em>All Types</em></MenuItem>
                {incidentTypes.map(type => <MenuItem key={type} value={type} sx={{ fontSize: 18 }}>{type}</MenuItem>)}
              </Select>
            </FormControl>
          </Paper>

          {(!selectedDistrict || !selectedYear) ? (
            <Paper sx={{ p: 6, textAlign: 'center', color: '#888', fontSize: 24, fontWeight: 600 }}>
              Please select both a district and a year to view data.
            </Paper>
          ) : (
            <>
              {/* Summary Stats */}
              <Grid container spacing={4} sx={{ mb: 5 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 4, textAlign: 'center', background: '#e3f2fd', borderRadius: 4, boxShadow: 3 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: 22 }}>Total Deaths</Typography>
                    <Typography sx={{ fontSize: 40, fontWeight: 900, color: '#E53935', mt: 1 }}>{summary.totalDeath}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 4, textAlign: 'center', background: '#fff3e0', borderRadius: 4, boxShadow: 3 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: 22 }}>Injured</Typography>
                    <Typography sx={{ fontSize: 40, fontWeight: 900, color: '#FB8C00', mt: 1 }}>{summary.injured}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 4, textAlign: 'center', background: '#f3e5f5', borderRadius: 4, boxShadow: 3 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: 22 }}>Est. Loss</Typography>
                    <Typography sx={{ fontSize: 32, fontWeight: 900, color: '#3949AB', mt: 1 }}>Rs. {summary.estimatedLoss}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 4, textAlign: 'center', background: '#e8f5e9', borderRadius: 4, boxShadow: 3 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: 22 }}>Top Incident</Typography>
                    <Typography sx={{ fontSize: 26, fontWeight: 900, color: '#00897B', mt: 1 }}>
                      {topIncidents.length > 0 ? `${topIncidents[0].type} (${topIncidents[0].deaths})` : 'N/A'}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Line Chart: Deaths & Injured Trend (by Month) */}
              <Paper sx={{ p: 4, mb: 5 }}>
                <Typography sx={{ fontWeight: 800, fontSize: 22, mb: 3 }}>Deaths & Injured Trend (by Month)</Typography>
                {deathsByMonthChart.some(d => d.deaths > 0 || d.injured > 0) ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={deathsByMonthChart} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorDeaths" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#E53935" stopOpacity={0.6}/>
                          <stop offset="95%" stopColor="#E53935" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorInjured" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1976D2" stopOpacity={0.6}/>
                          <stop offset="95%" stopColor="#1976D2" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="deaths"
                        stroke="#E53935"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        fillOpacity={1}
                        fill="url(#colorDeaths)"
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="injured"
                        stroke="#1976D2"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        fillOpacity={1}
                        fill="url(#colorInjured)"
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : <Typography color="text.secondary">No data for chart</Typography>}
              </Paper>

              {/* Pie Chart: Incident Type Distribution (3D Effect) */}
              <Paper sx={{ p: 4, mb: 5 }}>
                <Typography sx={{ fontWeight: 800, fontSize: 22, mb: 3 }}>Incident Type Distribution (3D Effect)</Typography>
                {incidentPieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <defs>
                        {incidentPieData.map((entry, i) => (
                          <radialGradient key={entry.name} id={`pie3d-gradient-${i}`} cx="50%" cy="50%" r="80%">
                            <stop offset="20%" stopColor={entry.fill} stopOpacity={0.95} />
                            <stop offset="100%" stopColor={darkenColor(entry.fill, 0.5)} stopOpacity={1} />
                          </radialGradient>
                        ))}
                      </defs>
                      <Pie data={incidentPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                        {incidentPieData.map((entry, i) => (
                          <Cell key={entry.name} fill={`url(#pie3d-gradient-${i})`} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <Typography color="text.secondary">No data for chart</Typography>}
              </Paper>

              {/* Heatmap: Month vs. Incident Type */}
              <Paper sx={{ p: 4, mb: 5 }}>
                <Typography sx={{ fontWeight: 800, fontSize: 22, mb: 3 }}>Heatmap: Month vs. Incident Type</Typography>
                {heatmapIncidentTypes.length > 0 && filteredData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={40 + 30 * heatmapIncidentTypes.length}>
                    <BarChart
                      data={heatmapData}
                      layout="vertical"
                      margin={{ top: 10, right: 30, left: 80, bottom: 10 }}
                      barCategoryGap={2}
                    >
                      <XAxis type="number" allowDecimals={false} hide />
                      <YAxis type="category" dataKey="month" width={60} />
                      <Tooltip />
                      {heatmapIncidentTypes.map((type, i) => (
                        <Bar
                          key={type}
                          dataKey={type}
                          stackId="a"
                          fill={pieColors[i % pieColors.length]}
                          isAnimationActive={false}
                          barSize={20}
                        />
                      ))}
                      <Legend />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <Typography color="text.secondary">No data for heatmap</Typography>}
              </Paper>

              {/* Bar Chart: Top 5 Incidents by Total Deaths */}
              <Paper sx={{ p: 4, mb: 5 }}>
                <Typography sx={{ fontWeight: 800, fontSize: 22, mb: 3 }}>Top 5 Incidents by Total Deaths</Typography>
                {topIncidents.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={topIncidents} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#FF4081" />
                          <stop offset="100%" stopColor="#FF9100" />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="type" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="deaths" fill="url(#barGradient)" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <Typography color="text.secondary">No data for bar chart</Typography>}
              </Paper>

              {/* Stacked Bar Chart: Deaths by Gender per Month */}
              <Paper sx={{ p: 4, mb: 5 }}>
                <Typography sx={{ fontWeight: 800, fontSize: 22, mb: 3 }}>Deaths by Gender per Month</Typography>
                {deathsByGenderPerMonth.some(d => d.Male > 0 || d.Female > 0 || d.Unknown > 0) ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={deathsByGenderPerMonth} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <XAxis dataKey="month" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="Male" stackId="a" fill="#1976D2" />
                      <Bar dataKey="Female" stackId="a" fill="#D81B60" />
                      <Bar dataKey="Unknown" stackId="a" fill="#757575" />
                      <Legend />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <Typography color="text.secondary">No data for stacked bar chart</Typography>}
              </Paper>
            </>
          )}
        </>
      )}
    </Box>
  );
}

function darkenColor(hex: string, amount: number) {
  // hex: #RRGGBB, amount: 0 (no change) to 1 (black)
  let c = hex.replace('#', '');
  if (c.length === 3) c = c[0]+c[0]+c[1]+c[1]+c[2]+c[2];
  const num = parseInt(c, 16);
  let r = (num >> 16) & 0xFF;
  let g = (num >> 8) & 0xFF;
  let b = num & 0xFF;
  r = Math.round(r * (1 - amount));
  g = Math.round(g * (1 - amount));
  b = Math.round(b * (1 - amount));
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
} 