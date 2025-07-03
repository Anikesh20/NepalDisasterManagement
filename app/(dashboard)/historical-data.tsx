// To fix missing packages/types, run:
// npm install papaparse react-native-picker-select expo-sharing
// npm install --save-dev @types/papaparse
//
// Set your CSV URL here (e.g., a GitHub raw link):
const CSV_URL = 'https://raw.githubusercontent.com/Anikesh20/NepalDisasterManagement/refs/heads/master/assets/incident_report_cleaned.csv';

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import Papa from 'papaparse';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import RNPickerSelect from 'react-native-picker-select';
import StatsCard from '../components/admin/StatsCard';

const importantHeaders = [
  'District',
  'Incident Date',
  'Incident',
  'Death Male',
  'Death Female',
  'Death Unknown',
  'Total Death',
  'Missing People',
  'Estimated Loss',
  'Injured',
  'Property Loss',
  'Cattles Loss',
  'Source',
];

const screenWidth = Dimensions.get('window').width;

type RowType = {
  [key: string]: string;
};

const HistoricalDataScreen = () => {
  const [data, setData] = useState<RowType[]>([]);
  const [filteredData, setFilteredData] = useState<RowType[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Parse CSV on mount
  useEffect(() => {
    const loadCSV = async () => {
      setLoading(true);
      try {
        console.log('[CSV] Fetching:', CSV_URL);
        const response = await fetch(CSV_URL);
        console.log('[CSV] Response status:', response.status);
        if (!response.ok) {
          console.log('[CSV] Fetch failed:', response.status, response.statusText);
          throw new Error('Failed to fetch CSV');
        }
        const csvString = await response.text();
        console.log('[CSV] CSV loaded, length:', csvString.length);
        const parsed = Papa.parse(csvString, { header: true, skipEmptyLines: true });
        console.log('[CSV] Papa.parse result:', parsed);
        const rows: RowType[] = Array.isArray(parsed.data) ? parsed.data.filter((row: RowType) => !!row['District']) : [];
        console.log('[CSV] Rows loaded:', rows.length);
        setData(rows);
        // Extract unique districts and years
        const uniqueDistricts = Array.from(new Set(rows.map((row: RowType) => row['District']).filter(Boolean))).sort();
        const uniqueYears = Array.from(new Set(rows.map((row: RowType) => {
          const date = row['Incident Date'];
          if (!date || typeof date !== 'string') return null;
          // yyyy-mm-dd
          if (date.includes('-')) {
            return date.split('-')[0];
          }
          // mm/dd/yyyy
          if (date.includes('/')) {
            const parts = date.split('/');
            return parts.length === 3 ? parts[2] : null;
          }
          return null;
        }).filter((y): y is string => Boolean(y)))).sort();
        console.log('[CSV] Unique districts:', uniqueDistricts);
        console.log('[CSV] Unique years:', uniqueYears);
        setDistricts(uniqueDistricts);
        setYears(uniqueYears);
        setLoading(false);
      } catch (e: any) {
        setLoading(false);
        console.log('[CSV] Error:', e.message);
        alert('Failed to load data: ' + e.message);
      }
    };
    loadCSV();
  }, []);

  // Filter data when filters change
  useEffect(() => {
    if (selectedDistrict && selectedYear) {
      let filtered = data.filter((row: RowType) => row['District'] === selectedDistrict);
      filtered = filtered.filter((row: RowType) => {
        const date = row['Incident Date'];
        if (!date || typeof date !== 'string') return false;
        let year = '';
        if (date.includes('/')) {
          year = date.split('/').pop();
        } else if (date.includes('-')) {
          year = date.split('-')[0];
        }
        return year === selectedYear;
      });
      setFilteredData(filtered);
    } else {
      setFilteredData([]);
    }
  }, [data, selectedDistrict, selectedYear]);

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

  // Chart data: Deaths by month (for trend line)
  const deathsByMonth: { [month: string]: number } = {};
  if (selectedYear) {
    filteredData.forEach((row: RowType) => {
      const date = row['Incident Date'];
      if (!date || typeof date !== 'string') return;
      let month = '';
      // yyyy-mm-dd
      if (date.includes('-')) {
        const parts = date.split('-');
        month = parts.length >= 2 ? parts[1] : '';
      }
      // mm/dd/yyyy
      else if (date.includes('/')) {
        const parts = date.split('/');
        month = parts.length === 3 ? parts[0].padStart(2, '0') : '';
      }
      if (month) {
        deathsByMonth[month] = (deathsByMonth[month] || 0) + parseInt(row['Total Death'] || '0', 10);
      }
    });
  }
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const deathsByMonthChart = {
    labels: monthLabels,
    datasets: [{
      data: monthLabels.map((_, idx) => deathsByMonth[(idx + 1).toString().padStart(2, '0')] || 0)
    }]
  };

  // Chart data: Incident type distribution
  const incidentTypeCount: { [type: string]: number } = {};
  filteredData.forEach((row: RowType) => {
    const type = row['Incident'];
    if (!type) return;
    incidentTypeCount[type] = (incidentTypeCount[type] || 0) + 1;
  });
  const incidentPieData = Object.keys(incidentTypeCount).map((type: string) => ({
    name: type,
    count: incidentTypeCount[type],
    color: getRandomColor(type),
    legendFontColor: '#333',
    legendFontSize: 12,
  }));

  // Helper for pie chart colors
  function getRandomColor(key: string) {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = key.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF)
      .toString(16)
      .toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
  }

  // Export filtered data as CSV
  const handleExport = async () => {
    // Only works on device or with Expo Go
    const csv = Papa.unparse(filteredData, { columns: importantHeaders });
    const fileUri = `${FileSystem.cacheDirectory}filtered_data.csv`;
    await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });
    await Sharing.shareAsync(fileUri);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Filters */}
      <View style={styles.filters}>
        <View style={styles.pickerContainer}>
          <Text>District:</Text>
          <RNPickerSelect
            onValueChange={setSelectedDistrict}
            items={districts.map((d: string) => ({ label: d, value: d }))}
            value={selectedDistrict}
            placeholder={{ label: 'Select District', value: null }}
          />
        </View>
        <View style={styles.pickerContainer}>
          <Text>Year:</Text>
          <RNPickerSelect
            onValueChange={setSelectedYear}
            items={years.map((y: string) => ({ label: y, value: y }))}
            value={selectedYear}
            placeholder={{ label: 'Select Year', value: null }}
          />
        </View>
        <TouchableOpacity style={styles.exportBtn} onPress={handleExport} disabled={filteredData.length === 0}>
          <Text style={{ color: filteredData.length === 0 ? '#ccc' : 'white' }}>Export CSV</Text>
        </TouchableOpacity>
      </View>

      {/* Only show data if both filters are selected */}
      {(!selectedDistrict || !selectedYear) ? (
        <View style={styles.centered}>
          <Text style={{ color: '#888', marginTop: 32 }}>Please select both a district and a year to view data.</Text>
        </View>
      ) : (
        <>
          {/* Summary Stats */}
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>Summary</Text>
            <Text>Total Deaths: {summary.totalDeath}</Text>
            <Text>Male: {summary.deathMale} | Female: {summary.deathFemale} | Unknown: {summary.deathUnknown}</Text>
            <Text>Missing: {summary.missing} | Injured: {summary.injured}</Text>
            <Text>Estimated Loss: Rs. {summary.estimatedLoss}</Text>
            <Text>Property Loss: Rs. {summary.propertyLoss}</Text>
            <Text>Cattle Loss: {summary.cattleLoss}</Text>
          </View>

          {/* Infographic Cards */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginVertical: 16 }}>
            <StatsCard
              title="Total Deaths"
              value={summary.totalDeath}
              icon="skull-outline"
              color="#E53935"
            />
            <StatsCard
              title="Injured"
              value={summary.injured}
              icon="medkit-outline"
              color="#FB8C00"
            />
            <StatsCard
              title="Est. Loss"
              value={`Rs. ${summary.estimatedLoss}`}
              icon="cash-outline"
              color="#3949AB"
            />
            <StatsCard
              title="Top Incident"
              value={incidentPieData.length > 0 ? incidentPieData[0].name : 'N/A'}
              icon="alert-circle-outline"
              color="#00897B"
            />
          </View>

          {/* Trend Line Chart: Deaths by Month */}
          <Text style={styles.chartTitle}>Deaths Trend (by Month)</Text>
          {deathsByMonthChart.datasets[0].data.some(val => val > 0) ? (
            <LineChart
              data={deathsByMonthChart}
              width={screenWidth - 32}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={chartConfig}
              style={styles.chart}
              bezier
            />
          ) : <Text style={styles.noData}>No data for chart</Text>}

          <Text style={styles.chartTitle}>Incident Type Distribution</Text>
          {incidentPieData.length > 0 ? (
            <PieChart
              data={incidentPieData}
              width={screenWidth - 32}
              height={220}
              chartConfig={chartConfig}
              accessor="count"
              backgroundColor="transparent"
              paddingLeft="15"
            />
          ) : <Text style={styles.noData}>No data for chart</Text>}

          {/* Animated Progress Bars for Gender Proportion */}
          <Text style={styles.chartTitle}>Deaths by Gender</Text>
          <AnimatedProgressBar label="Male" value={summary.deathMale} total={summary.totalDeath} color="#1976D2" />
          <AnimatedProgressBar label="Female" value={summary.deathFemale} total={summary.totalDeath} color="#D81B60" />
          <AnimatedProgressBar label="Unknown" value={summary.deathUnknown} total={summary.totalDeath} color="#757575" />

          {/* Animated Progress Bars for Top 3 Incident Types */}
          <Text style={styles.chartTitle}>Top Incident Types</Text>
          {incidentPieData.slice(0, 3).map((item, idx) => (
            <AnimatedProgressBar
              key={item.name}
              label={item.name}
              value={item.count}
              total={filteredData.length}
              color={item.color}
            />
          ))}
        </>
      )}
    </ScrollView>
  );
};

const chartConfig = {
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
  barPercentage: 0.7,
  decimalPlaces: 0,
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9f9f9' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  filters: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' },
  pickerContainer: { flex: 1, minWidth: 120, marginRight: 8 },
  exportBtn: { backgroundColor: '#007AFF', padding: 10, borderRadius: 6, marginTop: 8 },
  summary: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 16, elevation: 2 },
  summaryTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  chartTitle: { fontWeight: 'bold', fontSize: 16, marginTop: 16, marginBottom: 8 },
  chart: { borderRadius: 8 },
  noData: { color: '#888', marginVertical: 8 },
  row: { flexDirection: 'row', backgroundColor: '#fff', marginBottom: 8, borderRadius: 6, padding: 8, elevation: 1 },
  cell: { minWidth: 120, marginRight: 8 },
  cellHeader: { fontWeight: 'bold', fontSize: 12 },
  cellValue: { fontSize: 12 },
});

// Animated progress bar component
function AnimatedProgressBar({ label, value, total, color }: { label: string, value: number, total: number, color: string }) {
  const percent = total > 0 ? value / total : 0;
  const widthAnim = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: percent,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [percent]);
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={{ fontSize: 14, marginBottom: 2 }}>{label}: {value} ({Math.round(percent * 100)}%)</Text>
      <View style={{ height: 16, backgroundColor: '#eee', borderRadius: 8, overflow: 'hidden' }}>
        <Animated.View style={{ height: 16, width: widthAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }), backgroundColor: color, borderRadius: 8 }} />
      </View>
    </View>
  );
}

export default HistoricalDataScreen;
