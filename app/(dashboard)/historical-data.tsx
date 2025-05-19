import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import DisasterCard from '../components/DisasterCard';
import { DisasterType, getDisasterColor } from '../services/disasterService';
import historicalDataService, { DisasterStatistics, HistoricalDisasterData, MonthlyDisasterData } from '../services/historicalDataService';
import { colors, shadows } from '../styles/theme';

const { width } = Dimensions.get('window');

const CHART_WIDTH = width - 40;
const CHART_HEIGHT = 220;

export default function HistoricalDataScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historicalDisasters, setHistoricalDisasters] = useState<HistoricalDisasterData[]>([]);
  const [statistics, setStatistics] = useState<DisasterStatistics | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyDisasterData[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedType, setSelectedType] = useState<DisasterType | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'charts' | 'list'>('charts');

  useEffect(() => {
    fetchData();
  }, [selectedYear, selectedType]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Set date range for the selected year
      const startDate = `${selectedYear}-01-01T00:00:00Z`;
      const endDate = `${selectedYear}-12-31T23:59:59Z`;

      // Fetch historical disasters
      const disasters = await historicalDataService.getHistoricalDisasters(
        startDate,
        endDate,
        selectedType === 'all' ? undefined : selectedType
      );
      setHistoricalDisasters(disasters);

      // Fetch statistics
      const stats = await historicalDataService.getDisasterStatistics(startDate, endDate);
      setStatistics(stats);

      // Fetch monthly data for charts
      const monthly = await historicalDataService.getMonthlyDisasterData(selectedYear);
      setMonthlyData(monthly);
    } catch (err: any) {
      console.error('Error fetching historical data:', err);
      setError(err.message || 'Failed to fetch historical data');
    } finally {
      setLoading(false);
    }
  };

  const renderYearSelector = () => {
    const currentYear = new Date().getFullYear();
    const years = [currentYear - 2, currentYear - 1, currentYear];

    return (
      <View style={styles.yearSelector}>
        <Text style={styles.selectorLabel}>Year:</Text>
        <View style={styles.yearButtons}>
          {years.map(year => (
            <TouchableOpacity
              key={year}
              style={[
                styles.yearButton,
                selectedYear === year && styles.selectedYearButton
              ]}
              onPress={() => setSelectedYear(year)}
            >
              <Text
                style={[
                  styles.yearButtonText,
                  selectedYear === year && styles.selectedYearButtonText
                ]}
              >
                {year}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderTypeSelector = () => {
    const types = [
      { value: 'all', label: 'All Types' },
      { value: DisasterType.EARTHQUAKE, label: 'Earthquake' },
      { value: DisasterType.FLOOD, label: 'Flood' },
      { value: DisasterType.FIRE, label: 'Fire' },
      { value: DisasterType.LANDSLIDE, label: 'Landslide' },
      { value: DisasterType.STORM, label: 'Storm' },
    ];

    return (
      <View style={styles.typeSelector}>
        <Text style={styles.selectorLabel}>Disaster Type:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.typeButtons}
        >
          {types.map(type => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.typeButton,
                selectedType === type.value && styles.selectedTypeButton,
                selectedType === type.value && { backgroundColor: type.value === 'all' ? colors.primary : getDisasterColor(type.value as DisasterType) }
              ]}
              onPress={() => setSelectedType(type.value as DisasterType | 'all')}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  selectedType === type.value && styles.selectedTypeButtonText
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderTabSelector = () => {
    return (
      <View style={styles.tabSelector}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'charts' && styles.activeTabButton
          ]}
          onPress={() => setActiveTab('charts')}
        >
          <Ionicons
            name="bar-chart"
            size={18}
            color={activeTab === 'charts' ? colors.primary : colors.textLight}
          />
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'charts' && styles.activeTabButtonText
            ]}
          >
            Charts
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'list' && styles.activeTabButton
          ]}
          onPress={() => setActiveTab('list')}
        >
          <Ionicons
            name="list"
            size={18}
            color={activeTab === 'list' ? colors.primary : colors.textLight}
          />
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'list' && styles.activeTabButtonText
            ]}
          >
            List View
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderStatistics = () => {
    if (!statistics) return null;

    return (
      <View style={styles.statisticsContainer}>
        <Text style={styles.sectionTitle}>Disaster Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{statistics.totalDisasters}</Text>
            <Text style={styles.statLabel}>Total Disasters</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{statistics.totalCasualties}</Text>
            <Text style={styles.statLabel}>Casualties</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{statistics.totalEvacuees}</Text>
            <Text style={styles.statLabel}>Evacuees</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>${(statistics.totalEconomicLoss / 1000000).toFixed(2)}M</Text>
            <Text style={styles.statLabel}>Economic Loss</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderMonthlyChart = () => {
    if (monthlyData.length === 0) return null;

    const chartData = {
      labels: monthlyData.map(item => item.month),
      datasets: [
        {
          data: monthlyData.map(item => item.count),
          color: (opacity = 1) => colors.primary,
        },
      ],
    };

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Monthly Disaster Occurrences</Text>
        <LineChart
          data={chartData}
          width={CHART_WIDTH}
          height={CHART_HEIGHT}
          chartConfig={{
            backgroundColor: colors.card,
            backgroundGradientFrom: colors.card,
            backgroundGradientTo: colors.card,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255, 90, 95, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: colors.primary,
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>
    );
  };

  const renderDisasterTypeChart = () => {
    if (!statistics) return null;

    const chartData = Object.entries(statistics.byType)
      .filter(([_, value]) => value > 0)
      .map(([key, value]) => {
        const type = key as DisasterType;
        return {
          name: type.charAt(0).toUpperCase() + type.slice(1),
          count: value,
          color: getDisasterColor(type),
          legendFontColor: colors.text,
          legendFontSize: 12,
        };
      });

    if (chartData.length === 0) return null;

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Disasters by Type</Text>
        <PieChart
          data={chartData}
          width={CHART_WIDTH}
          height={CHART_HEIGHT}
          chartConfig={{
            backgroundColor: colors.card,
            backgroundGradientFrom: colors.card,
            backgroundGradientTo: colors.card,
            color: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
          }}
          accessor="count"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>
    );
  };

  const renderCasualtiesChart = () => {
    if (monthlyData.length === 0) return null;

    const chartData = {
      labels: monthlyData.map(item => item.month),
      datasets: [
        {
          data: monthlyData.map(item => item.casualties),
          color: (opacity = 1) => colors.danger,
        },
      ],
    };

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Monthly Casualties</Text>
        <BarChart
          data={chartData}
          width={CHART_WIDTH}
          height={CHART_HEIGHT}
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: colors.card,
            backgroundGradientFrom: colors.card,
            backgroundGradientTo: colors.card,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(231, 76, 60, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            barPercentage: 0.5,
          }}
          style={styles.chart}
        />
      </View>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary }} />
          <Text style={styles.loadingText}>Loading historical data...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchData}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (activeTab === 'charts') {
      return (
        <ScrollView showsVerticalScrollIndicator={false}>
          {renderStatistics()}
          {renderMonthlyChart()}
          {renderDisasterTypeChart()}
          {renderCasualtiesChart()}
        </ScrollView>
      );
    } else {
      return (
        <FlatList
          data={historicalDisasters}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <DisasterCard disaster={item} />}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="information-circle-outline" size={64} color={colors.textLight} />
              <Text style={styles.emptyText}>No historical data found for the selected filters</Text>
            </View>
          }
        />
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historical Data</Text>
      </View>

      <View style={styles.filtersContainer}>
        {renderYearSelector()}
        {renderTypeSelector()}
        {renderTabSelector()}
      </View>

      <View style={styles.contentContainer}>
        {renderContent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 16,
  },
  filtersContainer: {
    padding: 16,
    backgroundColor: colors.card,
    ...shadows.small,
  },
  yearSelector: {
    marginBottom: 16,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  yearButtons: {
    flexDirection: 'row',
  },
  yearButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginRight: 8,
    ...shadows.small,
  },
  selectedYearButton: {
    backgroundColor: colors.primary,
  },
  yearButtonText: {
    fontSize: 14,
    color: colors.text,
  },
  selectedYearButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  typeSelector: {
    marginBottom: 16,
  },
  typeButtons: {
    paddingRight: 16,
  },
  typeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginRight: 8,
    ...shadows.small,
  },
  selectedTypeButton: {
    backgroundColor: colors.primary,
  },
  typeButtonText: {
    fontSize: 14,
    color: colors.text,
  },
  selectedTypeButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  tabSelector: {
    flexDirection: 'row',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
    ...shadows.small,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabButtonText: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 8,
  },
  activeTabButtonText: {
    color: colors.primary,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  statisticsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    ...shadows.small,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
    ...shadows.small,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  chart: {
    borderRadius: 12,
  },
  listContainer: {
    paddingBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
  },
});
