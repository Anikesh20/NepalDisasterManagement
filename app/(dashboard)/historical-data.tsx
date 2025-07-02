// To fix missing packages/types, run:
// npm install papaparse react-native-picker-select expo-sharing
// npm install --save-dev @types/papaparse
//
// Set your CSV URL here (e.g., a GitHub raw link):
const CSV_URL = 'https://raw.githubusercontent.com/yourusername/yourrepo/main/assets/incident_report_cleaned.csv';

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import Papa from 'papaparse';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import RNPickerSelect from 'react-native-picker-select';

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
        // Fetch CSV from remote URL
        const response = await fetch(CSV_URL);
        if (!response.ok) throw new Error('Failed to fetch CSV');
        const csvString = await response.text();
        const parsed = Papa.parse(csvString, { header: true, skipEmptyLines: true });
        const rows: RowType[] = Array.isArray(parsed.data) ? parsed.data.filter((row: RowType) => !!row['District']) : [];
        setData(rows);
        // Extract unique districts and years
        const uniqueDistricts = Array.from(new Set(rows.map((row: RowType) => row['District']).filter(Boolean))).sort();
        const uniqueYears = Array.from(new Set(rows.map((row: RowType) => {
          const date = row['Incident Date'];
          if (!date) return null;
          const year = typeof date === 'string' ? date.split('-')[0] : null;
          return year;
        }).filter(Boolean) as string[])).sort();
        setDistricts(uniqueDistricts);
        setYears(uniqueYears);
        setLoading(false);
      } catch (e: any) {
        setLoading(false);
        alert('Failed to load data: ' + e.message);
      }
    };
    loadCSV();
  }, []);

  // Filter data when filters change
  useEffect(() => {
    let filtered = data;
    if (selectedDistrict) {
      filtered = filtered.filter((row: RowType) => row['District'] === selectedDistrict);
    }
    if (selectedYear) {
      filtered = filtered.filter((row: RowType) => {
        const date = row['Incident Date'];
        if (!date || typeof date !== 'string') return false;
        return date.startsWith(selectedYear);
      });
    }
    setFilteredData(filtered);
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

  // Chart data: Deaths by year
  const deathsByYear: { [year: string]: number } = {};
  filteredData.forEach((row: RowType) => {
    const date = row['Incident Date'];
    if (!date || typeof date !== 'string') return;
    const year = date.split('-')[0];
    deathsByYear[year] = (deathsByYear[year] || 0) + parseInt(row['Total Death'] || '0', 10);
  });
  const deathsByYearChart = {
    labels: Object.keys(deathsByYear),
    datasets: [{ data: Object.values(deathsByYear) }],
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
    <ScrollView style={styles.container}>
      {/* Filters */}
      <View style={styles.filters}>
        <View style={styles.pickerContainer}>
          <Text>District:</Text>
          <RNPickerSelect
            onValueChange={setSelectedDistrict}
            items={districts.map((d: string) => ({ label: d, value: d }))}
            value={selectedDistrict}
            placeholder={{ label: 'All', value: null }}
          />
        </View>
        <View style={styles.pickerContainer}>
          <Text>Year:</Text>
          <RNPickerSelect
            onValueChange={setSelectedYear}
            items={years.map((y: string) => ({ label: y, value: y }))}
            value={selectedYear}
            placeholder={{ label: 'All', value: null }}
          />
        </View>
        <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
          <Text style={{ color: 'white' }}>Export CSV</Text>
        </TouchableOpacity>
      </View>

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

      {/* Charts */}
      <Text style={styles.chartTitle}>Deaths by Year</Text>
      {deathsByYearChart.labels.length > 0 ? (
        <BarChart
          data={deathsByYearChart}
          width={screenWidth - 32}
          height={220}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={chartConfig}
          style={styles.chart}
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

      {/* Data Table */}
      <Text style={styles.chartTitle}>Filtered Data</Text>
      <FlatList
        data={filteredData}
        keyExtractor={(_, idx) => idx.toString()}
        horizontal={true}
        renderItem={({ item }: { item: RowType }) => (
          <View style={styles.row}>
            {importantHeaders.map((header: string) => (
              <View key={header} style={styles.cell}>
                <Text style={styles.cellHeader}>{header}</Text>
                <Text style={styles.cellValue}>{item[header]}</Text>
              </View>
            ))}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.noData}>No data for selection</Text>}
        style={{ marginBottom: 32 }}
      />
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

export default HistoricalDataScreen;
