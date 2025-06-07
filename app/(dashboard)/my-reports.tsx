import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getDisasterColor, getDisasterIcon } from '../services/disasterService';
import reportService, { DisasterReport, getReportStatusColor, getReportStatusText } from '../services/reportService';
import { colors, shadows } from '../styles/theme';

export default function MyReportsScreen() {
  const router = useRouter();
  const [reports, setReports] = useState<DisasterReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);

      // In a real app, this would use the actual user ID
      const userReports = await reportService.getUserReports('current-user-id');
      setReports(userReports);
    } catch (err: any) {
      console.error('Error fetching reports:', err);
      setError(err.message || 'Failed to fetch your reports');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderReportItem = ({ item }: { item: DisasterReport }) => {
    return (
      <TouchableOpacity
        style={styles.reportCard}
        onPress={() => {
          // In a real app, this would navigate to a report details screen
          console.log('View report details:', item.id);
        }}
      >
        <View style={styles.reportHeader}>
          <View style={[styles.typeIcon, { backgroundColor: getDisasterColor(item.type) + '20' }]}>
            <Ionicons name={getDisasterIcon(item.type)} size={24} color={getDisasterColor(item.type)} />
          </View>
          <View style={styles.reportInfo}>
            <Text style={styles.reportTitle}>{item.title}</Text>
            <Text style={styles.reportLocation}>{item.location}, {item.district}</Text>
          </View>
        </View>

        <Text style={styles.reportDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.reportFooter}>
          <Text style={styles.reportDate}>{formatDate(item.timestamp)}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getReportStatusColor(item.status) + '20' }
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getReportStatusColor(item.status) }
              ]}
            >
              {getReportStatusText(item.status)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary }} />
          <Text style={styles.emptyText}>Loading your reports...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.danger} />
          <Text style={styles.emptyText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchReports}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (reports.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color={colors.textLight} />
          <Text style={styles.emptyText}>You haven't submitted any reports yet</Text>
          <TouchableOpacity
            style={styles.reportButton}
            onPress={() => router.push('/(dashboard)/report-disaster')}
          >
            <Text style={styles.reportButtonText}>Report a Disaster</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id || item.timestamp}
        renderItem={renderReportItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContainer: {
    padding: 16,
  },
  reportCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...shadows.small,
  },
  reportHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  reportLocation: {
    fontSize: 14,
    color: colors.textLight,
  },
  reportDescription: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportDate: {
    fontSize: 12,
    color: colors.textLight,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 400,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 16,
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
  reportButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  reportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
