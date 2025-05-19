import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { colors, shadows } from '../../styles/theme';

interface Column {
  id: string;
  label: string;
  render?: (item: any) => React.ReactNode;
  sortable?: boolean;
  width?: number | string;
}

interface DataTableProps {
  data: any[];
  columns: Column[];
  isLoading?: boolean;
  onRowPress?: (item: any) => void;
  keyExtractor?: (item: any) => string;
  emptyMessage?: string;
  searchable?: boolean;
  searchKeys?: string[];
  refreshing?: boolean;
  onRefresh?: () => void;
  actions?: {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    label: string;
    onPress: (item: any) => void;
    color?: string;
  }[];
}

export default function DataTable({
  data,
  columns,
  isLoading = false,
  onRowPress,
  keyExtractor = (item) => item.id?.toString() || Math.random().toString(),
  emptyMessage = 'No data available',
  searchable = false,
  searchKeys = [],
  refreshing = false,
  onRefresh,
  actions = [],
}: DataTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Filter data based on search query
  const filteredData = searchable && searchQuery
    ? data.filter(item => {
        const query = searchQuery.toLowerCase();
        return searchKeys.some(key => {
          const value = item[key];
          return value && value.toString().toLowerCase().includes(query);
        });
      })
    : data;

  // Sort data based on sort config
  const sortedData = sortConfig
    ? [...filteredData].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue === bValue) return 0;
        
        const comparison = aValue < bValue ? -1 : 1;
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      })
    : filteredData;

  const handleSort = (columnId: string) => {
    setSortConfig(prevSortConfig => {
      if (prevSortConfig?.key === columnId) {
        return prevSortConfig.direction === 'asc'
          ? { key: columnId, direction: 'desc' }
          : null;
      }
      return { key: columnId, direction: 'asc' };
    });
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {columns.map(column => (
        <TouchableOpacity
          key={column.id}
          style={[
            styles.headerCell,
            column.width ? { width: column.width } : { flex: 1 },
            column.sortable && styles.sortableHeader,
          ]}
          onPress={() => column.sortable && handleSort(column.id)}
          disabled={!column.sortable}
        >
          <Text style={styles.headerText}>{column.label}</Text>
          {column.sortable && sortConfig?.key === column.id && (
            <Ionicons
              name={sortConfig.direction === 'asc' ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={colors.text}
              style={styles.sortIcon}
            />
          )}
        </TouchableOpacity>
      ))}
      {actions.length > 0 && <View style={styles.actionsHeader} />}
    </View>
  );

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => onRowPress && onRowPress(item)}
      disabled={!onRowPress}
    >
      {columns.map(column => (
        <View
          key={column.id}
          style={[
            styles.cell,
            column.width ? { width: column.width } : { flex: 1 },
          ]}
        >
          {column.render ? (
            column.render(item)
          ) : (
            <Text style={styles.cellText} numberOfLines={1}>
              {item[column.id]?.toString() || '-'}
            </Text>
          )}
        </View>
      ))}
      {actions.length > 0 && (
        <View style={styles.actionsCell}>
          {actions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.actionButton, { backgroundColor: action.color || colors.primary }]}
              onPress={() => action.onPress(item)}
            >
              <Ionicons name={action.icon} size={16} color="#fff" />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <>
          <Ionicons name="document-text-outline" size={48} color={colors.textLight} />
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {searchable && (
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.textLight}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={colors.textLight} />
            </TouchableOpacity>
          ) : null}
        </View>
      )}

      <FlatList
        data={sortedData}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        stickyHeaderIndices={[0]}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    ...shadows.medium,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    margin: 12,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: colors.text,
  },
  clearButton: {
    padding: 4,
  },
  headerContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  headerCell: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
  },
  sortableHeader: {
    cursor: 'pointer',
  },
  headerText: {
    fontWeight: 'bold',
    color: colors.text,
    fontSize: 14,
  },
  sortIcon: {
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  cell: {
    justifyContent: 'center',
    paddingRight: 8,
  },
  cellText: {
    color: colors.text,
    fontSize: 14,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 12,
    color: colors.textLight,
    fontSize: 16,
    textAlign: 'center',
  },
  actionsHeader: {
    width: 80,
  },
  actionsCell: {
    flexDirection: 'row',
    width: 80,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
