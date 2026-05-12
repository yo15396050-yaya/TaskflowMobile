import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import api from '@/services/api-service';

export default function ExpensesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const [searchQuery, setSearchQuery] = useState('');
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchExpenses = async () => {
    try {
      const response = await api.get('/finance/expenses');
      setExpenses(response.data.data || response.data);
      if (response.data.total_amount) {
          setTotal(response.data.total_amount);
      } else {
          // Calculer le total manuellement si non fourni
          const sum = (response.data.data || response.data).reduce((acc: number, curr: any) => acc + (parseFloat(curr.amount) || 0), 0);
          setTotal(sum);
      }
    } catch (error) {
      console.error('Erreur dépenses:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchExpenses();
  };

  const filteredExpenses = expenses.filter(item => 
    (item.title || item.reason || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.category || item.category_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderExpense = ({ item }: { item: any }) => {
    const statusColor = item.status === 'Payé' || item.status === 'Approuvé' ? '#27ae60' : item.status === 'Rejeté' ? '#e74c3c' : '#f39c12';
    
    return (
      <TouchableOpacity 
        style={[styles.expenseCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}
        onPress={() => router.push(`/finance/depenses/${item.id}`)}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: (item.color || '#3498db') + '15' }]}>
              <Ionicons name={(item.icon || 'receipt-outline') as any} size={22} color={item.color || '#3498db'} />
          </View>
          <View style={styles.mainInfo}>
              <Text style={[styles.expenseTitle, { color: themeColors.text }]}>{item.title || item.reason}</Text>
              <Text style={styles.expenseSub}>{item.category || item.category_name} • {item.date}</Text>
          </View>
          <View style={styles.amountContainer}>
              <Text style={[styles.amountText, { color: themeColors.text }]}>{item.amount} {item.currency || 'FCFA'}</Text>
              <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
          </View>
        </View>
        
        <View style={styles.cardFooter}>
           <TouchableOpacity style={styles.receiptBtn}>
              <Ionicons name="document-attach-outline" size={16} color="#888" />
              <Text style={styles.receiptLink}>Voir le reçu</Text>
           </TouchableOpacity>
           <Ionicons name="chevron-forward" size={16} color="#CCC" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header with Summary */}
      <View style={[styles.header, { backgroundColor: '#181818' }]}>
        <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="#FFCC00" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Notes de Frais</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/finance/depenses/create')}>
                <Ionicons name="add" size={24} color="#000" />
            </TouchableOpacity>
        </View>

        <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Total Dépenses</Text>
            <Text style={styles.totalAmount}>{total.toLocaleString()} <Text style={styles.currency}>FCFA</Text></Text>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="rgba(255,255,255,0.5)" />
          <TextInput
            placeholder="Rechercher une dépense..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={filteredExpenses}
        renderItem={renderExpense}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFCC00" />
        }
        ListHeaderComponent={<Text style={[styles.listTitle, { color: themeColors.text }]}>Dernières dépenses</Text>}
        ListEmptyComponent={
            loading ? (
                <ActivityIndicator color="#FFCC00" size="large" style={{ marginTop: 50 }} />
            ) : (
                <View style={{ alignItems: 'center', marginTop: 50 }}>
                    <Text style={{ color: themeColors.textSecondary }}>Aucune dépense trouvée</Text>
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
    paddingBottom: 35,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  addBtn: {
    backgroundColor: '#FFCC00',
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryBox: {
    alignItems: 'center',
  },
  summaryLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  totalAmount: { color: '#FFF', fontSize: 32, fontWeight: '900', marginTop: 5 },
  currency: { fontSize: 16, color: '#FFCC00', fontWeight: '700' },
  listContent: { padding: 25, paddingBottom: 100 },
  listTitle: { fontSize: 18, fontWeight: '900', marginBottom: 20 },
  expenseCard: {
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainInfo: { flex: 1, marginLeft: 15 },
  expenseTitle: { fontSize: 15, fontWeight: '800', marginBottom: 2 },
  expenseSub: { fontSize: 12, color: '#888', fontWeight: '600' },
  amountContainer: { alignItems: 'flex-end' },
  amountText: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  searchInput: { flex: 1, color: '#FFF', marginLeft: 10, fontSize: 15 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 48,
    marginTop: 25,
  },
  statusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  cardFooter: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.03)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  receiptLink: { fontSize: 12, color: '#888', fontWeight: '700' },
});
