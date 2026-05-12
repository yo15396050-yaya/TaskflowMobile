import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import api from '@/services/api-service';

export default function TresorerieScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [treasuryData, setTreasuryData] = useState<any[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTreasuryData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/treasury');
      if (response.data) {
        setTreasuryData(response.data.data);
        setTotalBalance(response.data.totalBalance);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la trésorerie:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTreasuryData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTreasuryData();
  };

  const filteredData = treasuryData.filter(item =>
    item.accountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.bankName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatAmount = (amount: number) => {
    return (amount || 0).toLocaleString('fr-FR') + ' FCFA';
  };

  const renderItem = ({ item }: { item: typeof TRESORERIE_DATA[0] }) => (
    <View style={[styles.card, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: item.paymentType === 'Banque' ? '#3498db20' : '#2ecc7120' }]}>
          <Ionicons 
            name={item.paymentType === 'Banque' ? 'business-outline' : item.paymentType === 'Mobile' ? 'phone-portrait-outline' : 'wallet-outline'} 
            size={24} 
            color={item.paymentType === 'Banque' ? '#3498db' : '#2ecc71'} 
          />
        </View>
        <View style={styles.headerInfo}>
          <Text style={[styles.accountName, { color: themeColors.text }]}>{item.accountName}</Text>
          <Text style={styles.bankName}>{item.bankName} • {item.accountType}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'Actif' ? '#2ecc7120' : '#e74c3c20' }]}>
          <View style={[styles.statusDot, { backgroundColor: item.status === 'Actif' ? '#2ecc71' : '#e74c3c' }]} />
          <Text style={[styles.statusText, { color: item.status === 'Actif' ? '#2ecc71' : '#e74c3c' }]}>{item.status}</Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: themeColors.border }]} />

      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.balanceLabel}>Solde actuel</Text>
          <Text style={[styles.balanceValue, { color: themeColors.text }]}>{formatAmount(item.balance)}</Text>
        </View>
        <TouchableOpacity 
          style={styles.detailsBtn}
          onPress={() => router.push(`/tresorerie/${item.id}`)}
        >
          <Text style={styles.detailsBtnText}>Détails</Text>
          <Ionicons name="chevron-forward" size={16} color="#FFCC00" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={[styles.header, { backgroundColor: '#181818' }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFCC00" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Trésorerie</Text>
          <TouchableOpacity style={styles.addBtn}>
            <Ionicons name="add" size={24} color="#181818" />
          </TouchableOpacity>
        </View>

        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Solde Total Global</Text>
          <Text style={styles.totalValue}>{formatAmount(totalBalance)}</Text>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#888" />
          <TextInput
            placeholder="Rechercher un compte..."
            placeholderTextColor="#888"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFCC00" />
        }
        ListHeaderComponent={() => (
          <View style={styles.listHeader}>
            <Text style={[styles.listSubtitle, { color: themeColors.textSecondary }]}>Vos comptes et caisses</Text>
          </View>
        )}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color="#FFCC00" style={{ marginTop: 50 }} />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="wallet-outline" size={60} color={themeColors.textSecondary} />
              <Text style={{ color: themeColors.textSecondary, marginTop: 10, fontSize: 14, fontWeight: '600' }}>
                Aucun compte trouvé
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
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backBtn: { padding: 5, marginLeft: -5 },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: '800' },
  addBtn: {
    backgroundColor: '#FFCC00',
    width: 35,
    height: 35,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  totalContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  totalLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  totalValue: { color: '#FFF', fontSize: 24, fontWeight: '900', marginTop: 5 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 18,
    paddingHorizontal: 15,
    height: 50,
  },
  searchInput: { flex: 1, color: '#FFF', fontSize: 14, marginLeft: 10, fontWeight: '500' },
  listContent: { paddingHorizontal: 25, paddingBottom: 100 },
  listHeader: { marginTop: 25, marginBottom: 15 },
  listSubtitle: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  card: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  headerInfo: { flex: 1 },
  accountName: { fontSize: 15, fontWeight: '800', marginBottom: 2 },
  bankName: { color: '#888', fontSize: 12, fontWeight: '600' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  divider: { height: 1, marginVertical: 15, opacity: 0.1 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  balanceLabel: { color: '#888', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  balanceValue: { fontSize: 18, fontWeight: '900' },
  detailsBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailsBtnText: { color: '#FFCC00', fontSize: 13, fontWeight: '700' },
  emptyState: { alignItems: 'center', marginTop: 100 },
});
