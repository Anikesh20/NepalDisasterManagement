import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import DataTable from '../components/admin/DataTable';
import adminService from '../services/adminService';
import { getDisasterIcon } from '../services/disasterService';
import { DisasterReport, getReportStatusColor, getReportStatusText } from '../services/reportService';
import { colors } from '../styles/theme';

export default function ReportsManagement() {
  const [reports, setReports] = useState<DisasterReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const data = await adminService.getAllReports();
      setReports(data);
    } catch (error) {
      console.error('Error loading reports:', error);
      Alert.alert('Error', 'Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  const handleViewReport = (report: DisasterReport) => {
    Alert.alert(
      'Report Details',
      `ID: ${report.id}\nTitle: ${report.title}\nType: ${report.type}\nLocation: ${report.location}, ${report.district}\nSeverity: ${report.severity}\nDescription: ${report.description}\nReported By: User ID ${report.reportedBy}\nContact: ${report.contactNumber || 'Not provided'}\nStatus: ${getReportStatusText(report.status)}\nTimestamp: ${new Date(report.timestamp).toLocaleString()}`
    );
  };

  const handleVerifyReport = (report: DisasterReport) => {
    Alert.alert(
      'Verify Report',
      'Are you sure you want to verify this report?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Verify',
          onPress: () => {
            // In a real app, this would call an API to update the report status
            const updatedReports = reports.map(r => 
              r.id === report.id ? { ...r, status: 'verified' as const } : r
            );
            setReports(updatedReports);
            Alert.alert('Success', 'Report has been verified');
          },
        },
      ]
    );
  };

  const handleRejectReport = (report: DisasterReport) => {
    Alert.alert(
      'Reject Report',
      'Are you sure you want to reject this report?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reject',
          onPress: () => {
            // In a real app, this would call an API to update the report status
            const updatedReports = reports.map(r => 
              r.id === report.id ? { ...r, status: 'rejected' as const } : r
            );
            setReports(updatedReports);
            Alert.alert('Success', 'Report has been rejected');
          },
        },
      ]
    );
  };

  // Format the timestamp to a readable format
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const columns = [
    {
      id: 'type',
      label: 'Type',
      render: (item: DisasterReport) => (
        <View style={styles.typeContainer}>
          <Ionicons name={getDisasterIcon(item.type)} size={20} color={colors.text} />
          <Text style={styles.typeText}>{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</Text>
        </View>
      ),
      sortable: true,
      width: 120,
    },
    {
      id: 'title',
      label: 'Title',
      sortable: true,
    },
    {
      id: 'district',
      label: 'District',
      sortable: true,
      width: 100,
    },
    {
      id: 'status',
      label: 'Status',
      render: (item: DisasterReport) => (
        <View style={styles.badgeContainer}>
          <View
            style={[
              styles.badge,
              { backgroundColor: getReportStatusColor(item.status) },
            ]}
          >
            <Text style={styles.badgeText}>
              {getReportStatusText(item.status).toUpperCase()}
            </Text>
          </View>
        </View>
      ),
      sortable: true,
      width: 100,
    },
    {
      id: 'timestamp',
      label: 'Date',
      render: (item: DisasterReport) => (
        <Text>{formatTime(item.timestamp)}</Text>
      ),
      sortable: true,
      width: 180,
    },
  ];

  const getActions = (report: DisasterReport) => {
    const baseActions = [
      {
        icon: 'eye-outline' as const,
        label: 'View',
        onPress: handleViewReport,
        color: colors.primary,
      },
    ];

    // Only show verify/reject actions for pending reports
    if (report.status === 'pending') {
      return [
        ...baseActions,
        {
          icon: 'checkmark-circle-outline' as const,
          label: 'Verify',
          onPress: handleVerifyReport,
          color: '#4CAF50',
        },
        {
          icon: 'close-circle-outline' as const,
          label: 'Reject',
          onPress: handleRejectReport,
          color: '#F44336',
        },
      ];
    }

    return baseActions;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Report Management</Text>
        <Text style={styles.headerSubtitle}>
          {reports.filter(r => r.status === 'pending').length} pending reports
        </Text>
      </View>

      <View style={styles.tableContainer}>
        <DataTable
          data={reports}
          columns={columns}
          isLoading={isLoading}
          onRowPress={handleViewReport}
          searchable
          searchKeys={['title', 'location', 'district', 'type']}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          actions={reports.length > 0 ? getActions(reports[0]) : []}
          emptyMessage="No reports found"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 4,
  },
  tableContainer: {
    flex: 1,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeText: {
    marginLeft: 8,
    color: colors.text,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
