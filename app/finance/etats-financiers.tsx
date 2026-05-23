import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import api from '@/services/api-service';

export default function EtatsFinanciersScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [financialData, setFinancialData] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    totalBudget: 0,
    totalDepenses: 0,
    totalRecettes: 0,
    totalSolde: 0
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/financial-states');
      if (response.data) {
        setFinancialData(response.data.data);
        setSummary(response.data.summary);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des états financiers:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFinancialData();
  };

  const filters = [
    { id: 'all', label: 'Tous' },
    { id: 'profitable', label: 'Rentable' },
    { id: 'deficit', label: 'Déficitaire' },
    { id: 'ongoing', label: 'En cours' },
  ];

  const filteredData = financialData.filter(item => {
    const matchSearch = item.diligence.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.client.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedFilter === 'all') return matchSearch;
    if (selectedFilter === 'profitable') return matchSearch && item.status === 'Rentable';
    if (selectedFilter === 'deficit') return matchSearch && item.status === 'Déficitaire';
    if (selectedFilter === 'ongoing') return matchSearch && item.status === 'En cours';
    return matchSearch;
  });

  const totalBudget = summary.totalBudget;
  const totalDepenses = summary.totalDepenses;
  const totalRecettes = summary.totalRecettes;
  const totalSolde = summary.totalSolde;

  const formatAmount = (amount: number) => {
    return (amount || 0).toLocaleString('fr-FR') + ' F';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Rentable': return '#2ecc71';
      case 'Déficitaire': return '#e74c3c';
      case 'En cours': return '#f39c12';
      default: return '#95a5a6';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Rentable': return 'trending-up';
      case 'Déficitaire': return 'trending-down';
      case 'En cours': return 'time-outline';
      default: return 'help-circle-outline';
    }
  };

  const renderFinancialItem = ({ item }: { item: typeof FINANCIAL_DATA[0] }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}
      onPress={() => Alert.alert('Résumé des indicateurs', `Budget global alloué : ${formatAmount(item.budget)}\nTotal des factures encaissées : ${formatAmount(item.recettes)}\nCharges cumulées : ${formatAmount(item.depenses)}\nSolde net exact : ${formatAmount(item.solde)}`, [{ text: 'Fermer', style: 'cancel' }])}
    >
      {/* Card Header */}
      <View style={styles.cardTop}>
        <View style={styles.cardTitleArea}>
          <Text style={[styles.diligenceName, { color: themeColors.text }]} numberOfLines={1}>
            {item.diligence}
          </Text>
          <View style={styles.clientRow}>
            <Ionicons name="business-outline" size={12} color="#888" />
            <Text style={styles.clientName}>{item.client}</Text>
          </View>
        </View>
        <View style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) + '18' }]}>
          <Ionicons name={getStatusIcon(item.status) as any} size={12} color={getStatusColor(item.status)} />
          <Text style={[styles.statusLabel, { color: getStatusColor(item.status) }]}>{item.status}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressLabel, { color: themeColors.textSecondary }]}>Avancement</Text>
          <Text style={[styles.progressValue, { color: themeColors.text }]}>{Math.round(item.progression * 100)}%</Text>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: themeColors.border }]}>
          <View style={[
            styles.progressFill,
            { width: `${item.progression * 100}%`, backgroundColor: getStatusColor(item.status) }
          ]} />
        </View>
      </View>

      {/* Financial Grid */}
      <View style={styles.financialGrid}>
        <View style={styles.finItem}>
          <Text style={[styles.finLabel, { color: themeColors.textSecondary }]}>Budget</Text>
          <Text style={[styles.finValue, { color: themeColors.text }]}>{formatAmount(item.budget)}</Text>
        </View>
        <View style={[styles.finItem, styles.finItemCenter]}>
          <Text style={[styles.finLabel, { color: themeColors.textSecondary }]}>Dépenses</Text>
          <Text style={[styles.finValue, { color: '#e74c3c' }]}>{formatAmount(item.depenses)}</Text>
        </View>
        <View style={styles.finItem}>
          <Text style={[styles.finLabel, { color: themeColors.textSecondary }]}>Recettes</Text>
          <Text style={[styles.finValue, { color: '#2ecc71' }]}>{formatAmount(item.recettes)}</Text>
        </View>
      </View>

      {/* Solde */}
      <View style={[styles.soldeRow, { borderTopColor: themeColors.border }]}>
        <Text style={[styles.soldeLabel, { color: themeColors.textSecondary }]}>Solde net</Text>
        <Text style={[styles.soldeValue, { color: item.solde >= 0 ? '#2ecc71' : '#e74c3c' }]}>
          {item.solde >= 0 ? '+' : ''}{formatAmount(item.solde)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const ListHeader = () => (
    <View>
      {/* Summary Cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.summaryScroll} contentContainerStyle={styles.summaryContainer}>
        <View style={[styles.summaryCard, { backgroundColor: '#3498db15' }]}>
          <View style={[styles.summaryIcon, { backgroundColor: '#3498db25' }]}>
            <Ionicons name="wallet-outline" size={20} color="#3498db" />
          </View>
          <Text style={styles.summaryLabel}>Budget Total</Text>
          <Text style={[styles.summaryValue, { color: '#3498db' }]}>{formatAmount(totalBudget)}</Text>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: '#e74c3c15' }]}>
          <View style={[styles.summaryIcon, { backgroundColor: '#e74c3c25' }]}>
            <Ionicons name="arrow-down-circle-outline" size={20} color="#e74c3c" />
          </View>
          <Text style={styles.summaryLabel}>Dépenses</Text>
          <Text style={[styles.summaryValue, { color: '#e74c3c' }]}>{formatAmount(totalDepenses)}</Text>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: '#2ecc7115' }]}>
          <View style={[styles.summaryIcon, { backgroundColor: '#2ecc7125' }]}>
            <Ionicons name="arrow-up-circle-outline" size={20} color="#2ecc71" />
          </View>
          <Text style={styles.summaryLabel}>Recettes</Text>
          <Text style={[styles.summaryValue, { color: '#2ecc71' }]}>{formatAmount(totalRecettes)}</Text>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: totalSolde >= 0 ? '#2ecc7115' : '#e74c3c15' }]}>
          <View style={[styles.summaryIcon, { backgroundColor: totalSolde >= 0 ? '#2ecc7125' : '#e74c3c25' }]}>
            <Ionicons name="trending-up" size={20} color={totalSolde >= 0 ? '#2ecc71' : '#e74c3c'} />
          </View>
          <Text style={styles.summaryLabel}>Solde Net</Text>
          <Text style={[styles.summaryValue, { color: totalSolde >= 0 ? '#2ecc71' : '#e74c3c' }]}>
            {totalSolde >= 0 ? '+' : ''}{formatAmount(totalSolde)}
          </Text>
        </View>
      </ScrollView>

      {/* Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContainer}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            onPress={() => setSelectedFilter(filter.id)}
            style={[
              styles.filterChip,
              selectedFilter === filter.id
                ? { backgroundColor: '#FFCC00' }
                : { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border, borderWidth: 1 }
            ]}
          >
            <Text style={[
              styles.filterLabel,
              { color: selectedFilter === filter.id ? '#000' : themeColors.textSecondary }
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={[styles.listTitle, { color: themeColors.text }]}>
        {filteredData.length} diligence{filteredData.length > 1 ? 's' : ''}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: '#181818' }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFCC00" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>États Financiers</Text>
          <TouchableOpacity onPress={() => Alert.alert('Exportation', 'Préparation du rapport consolidé en cours...')}>
            <Ionicons name="download-outline" size={24} color="#FFCC00" />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#888" />
          <TextInput
            placeholder="Rechercher une diligence ou un client..."
            placeholderTextColor="#888"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={filteredData}
        renderItem={renderFinancialItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<ListHeader />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFCC00" />
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color="#FFCC00" style={{ marginTop: 50 }} />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="bar-chart-outline" size={60} color={themeColors.textSecondary} />
              <Text style={{ color: themeColors.textSecondary, marginTop: 10, fontSize: 14, fontWeight: '600' }}>
                Aucun état financier trouvé
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 55,
    paddingHorizontal: 25,
    paddingBottom: 25,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    elevation: 5,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backBtn: { padding: 5, marginLeft: -5 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 18,
    paddingHorizontal: 15,
    height: 50,
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 14,
    marginLeft: 10,
    fontWeight: '500',
  },
  listContent: { paddingBottom: 100 },

  // Summary Cards
  summaryScroll: { marginTop: 20 },
  summaryContainer: { paddingHorizontal: 25, gap: 12 },
  summaryCard: {
    width: 150,
    borderRadius: 20,
    padding: 15,
  },
  summaryIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: { color: '#888', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryValue: { fontSize: 14, fontWeight: '900', marginTop: 4 },

  // Filters
  filtersContainer: { paddingHorizontal: 25, gap: 8, marginTop: 20, marginBottom: 5 },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25,
  },
  filterLabel: { fontSize: 13, fontWeight: '700' },

  listTitle: { fontSize: 14, fontWeight: '800', marginTop: 20, marginBottom: 10, marginLeft: 25 },

  // Card
  card: {
    marginHorizontal: 25,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  cardTitleArea: { flex: 1, marginRight: 10 },
  diligenceName: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  clientRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  clientName: { color: '#888', fontSize: 12, fontWeight: '600' },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusLabel: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },

  // Progress
  progressSection: { marginBottom: 15 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontSize: 11, fontWeight: '700' },
  progressValue: { fontSize: 11, fontWeight: '800' },
  progressTrack: { height: 6, borderRadius: 3 },
  progressFill: { height: 6, borderRadius: 3 },

  // Financial Grid
  financialGrid: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  finItem: { flex: 1 },
  finItemCenter: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  finLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 4 },
  finValue: { fontSize: 13, fontWeight: '800' },

  // Solde
  soldeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 12,
  },
  soldeLabel: { fontSize: 13, fontWeight: '700' },
  soldeValue: { fontSize: 16, fontWeight: '900' },

  emptyState: { alignItems: 'center', marginTop: 100 },
});
