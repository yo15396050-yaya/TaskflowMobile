import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Mock data for the specific account details
const ACCOUNT_DETAILS = {
  id: '6',
  name: 'DC-KNOWING WAVE',
  balance: 0,
  currency: 'FCFA',
  recentTransactions: [
    { id: '1', title: 'Appro Caisse par Wave', date: '09/12/2024', amount: -40000, type: 'Debit' },
    { id: '2', title: 'Ravitaillement', date: '28/11/2024', amount: 40000, type: 'Credit' },
    { id: '3', title: 'Initialisation', date: '28/11/2024', amount: 0, type: 'Credit' },
  ],
  stats: [
    { month: 'Jan', credit: 0, debit: 0 },
    { month: 'Fév', credit: 0, debit: 0 },
    { month: 'Mar', credit: 150000, debit: 50000 },
    { month: 'Avr', credit: 0, debit: 40000 },
  ]
};

const formatAmount = (amount: number) => {
  const sign = amount > 0 ? '+ ' : amount < 0 ? '- ' : '';
  const absAmount = Math.abs(amount);
  return `${sign}${absAmount.toLocaleString('fr-FR')} FCFA`;
};

export default function TresorerieDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  // In a real app, we would fetch data based on id
  const data = ACCOUNT_DETAILS;

  const renderTransaction = ({ item }: { item: typeof ACCOUNT_DETAILS.recentTransactions[0] }) => (
    <View style={[styles.transactionItem, { borderBottomColor: themeColors.border }]}>
      <View style={styles.transactionIcon}>
        <Ionicons 
          name={item.amount >= 0 ? 'arrow-down-circle' : 'arrow-up-circle'} 
          size={24} 
          color={item.amount >= 0 ? '#2ecc71' : '#e74c3c'} 
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.transactionTitle, { color: themeColors.text }]}>{item.title || 'Sans titre'}</Text>
        <Text style={styles.transactionDate}>{item.date}</Text>
      </View>
      <Text style={[
        styles.transactionAmount, 
        { color: item.amount > 0 ? '#2ecc71' : item.amount < 0 ? '#e74c3c' : '#888' }
      ]}>
        {formatAmount(item.amount)}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: '#181818' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFCC00" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{data.name}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Balance Card */}
        <View style={[styles.balanceCard, { backgroundColor: themeColors.cardBackground }]}>
          <View style={styles.balanceHeader}>
            <View style={styles.balanceInfo}>
              <Text style={styles.balanceLabel}>Solde actuel</Text>
              <Text style={[styles.balanceValue, { color: themeColors.text }]}>
                {data.balance.toLocaleString('fr-FR')} <Text style={styles.currency}>{data.currency}</Text>
              </Text>
            </View>
            <View style={styles.accountIcon}>
              <Ionicons name="card-outline" size={32} color="#FFCC00" />
            </View>
          </View>
          
          <TouchableOpacity style={[styles.statementBtn, { backgroundColor: '#FFCC00' }]}>
            <Ionicons name="document-text-outline" size={20} color="#181818" />
            <Text style={styles.statementBtnText}>Générer une déclaration</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Summary (Simplified chart representation) */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Crédit vs Débit (4 mois)</Text>
        </View>
        <View style={[styles.statsCard, { backgroundColor: themeColors.cardBackground }]}>
          <View style={styles.chartPlaceholder}>
            {data.stats.map((stat, index) => (
              <View key={index} style={styles.chartCol}>
                <View style={[styles.barContainer]}>
                   <View style={[styles.bar, { height: 20, backgroundColor: '#2ecc71', opacity: 0.3 }]} />
                   <View style={[styles.bar, { height: 10, backgroundColor: '#e74c3c', opacity: 0.3 }]} />
                </View>
                <Text style={styles.chartLabel}>{stat.month}</Text>
              </View>
            ))}
          </View>
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#2ecc71' }]} />
              <Text style={styles.legendText}>Crédit</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#e74c3c' }]} />
              <Text style={styles.legendText}>Débit</Text>
            </View>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Transactions récentes</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>Tout voir</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.transactionsCard, { backgroundColor: themeColors.cardBackground }]}>
          {data.recentTransactions.map((item) => (
            <View key={item.id}>
              {renderTransaction({ item })}
            </View>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: { padding: 5 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  balanceCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  balanceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 25 },
  balanceInfo: { flex: 1 },
  balanceLabel: { color: '#888', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  balanceValue: { fontSize: 32, fontWeight: '900' },
  currency: { fontSize: 16, color: '#888', fontWeight: '600' },
  accountIcon: { backgroundColor: '#FFCC0020', padding: 12, borderRadius: 16 },
  statementBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 10,
  },
  statementBtnText: { color: '#181818', fontSize: 14, fontWeight: '800' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, marginTop: 5 },
  sectionTitle: { fontSize: 16, fontWeight: '800' },
  seeAllText: { color: '#FFCC00', fontWeight: '700', fontSize: 14 },
  statsCard: { borderRadius: 24, padding: 20, marginBottom: 25 },
  chartPlaceholder: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 100, paddingHorizontal: 10 },
  chartCol: { alignItems: 'center' },
  barContainer: { gap: 4, alignItems: 'center' },
  bar: { width: 12, borderRadius: 6 },
  chartLabel: { marginTop: 8, fontSize: 10, color: '#888', fontWeight: '700' },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 20 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, color: '#888', fontWeight: '600' },
  transactionsCard: { borderRadius: 24, padding: 20 },
  transactionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1 },
  transactionIcon: { marginRight: 15 },
  transactionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  transactionDate: { fontSize: 12, color: '#888', fontWeight: '500' },
  transactionAmount: { fontSize: 14, fontWeight: '800' },
});
