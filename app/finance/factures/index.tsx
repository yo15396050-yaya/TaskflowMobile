import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

const MOCK_INVOICES = [
  { id: '1', invoiceNumber: 'INV#054', client: '2N IMMOBILIER', amount: '250 000 FCFA', date: '12 Oct 2023', status: 'Payé', statusColor: '#2ecc71' },
  { id: '2', invoiceNumber: 'INV#055', client: '2TK & ASSOCIES', amount: '125 000 FCFA', date: '15 Oct 2023', status: 'En attente', statusColor: '#f1c40f' },
  { id: '3', invoiceNumber: 'INV#056', client: 'A & I VENTURE', amount: '450 000 FCFA', date: '20 Oct 2023', status: 'Annulé', statusColor: '#e74c3c' },
  { id: '4', invoiceNumber: 'INV#057', client: 'AFRICA MOOV', amount: '75 000 FCFA', date: '22 Oct 2023', status: 'Partiel', statusColor: '#3498db' },
  { id: '5', invoiceNumber: 'INV#058', client: 'BIOFOSSE GROUP', amount: '300 000 FCFA', date: '25 Oct 2023', status: 'Payé', statusColor: '#2ecc71' },
];

export default function InvoicesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const [searchQuery, setSearchQuery] = useState('');

  const filteredInvoices = MOCK_INVOICES.filter(inv => 
    inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.client.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderInvoiceItem = ({ item }: { item: typeof MOCK_INVOICES[0] }) => (
    <TouchableOpacity 
      style={[styles.invoiceCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}
      onPress={() => router.push(`/finance/factures/${item.id}`)}
    >
      <View style={styles.invoiceHeader}>
        <View style={styles.numberContainer}>
          <Text style={[styles.invoiceNumber, { color: themeColors.text }]}>{item.invoiceNumber}</Text>
          <Text style={styles.invoiceDate}>{item.date}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.statusColor + '20' }]}>
          <Text style={[styles.statusText, { color: item.statusColor }]}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.clientContainer}>
        <Ionicons name="business-outline" size={16} color={themeColors.textSecondary} />
        <Text style={[styles.clientName, { color: themeColors.text }]}>{item.client}</Text>
      </View>

      <View style={styles.amountContainer}>
        <Text style={styles.amountLabel}>Total à payer</Text>
        <Text style={[styles.amountValue, { color: themeColors.accent }]}>{item.amount}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: '#181818' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFCC00" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Factures</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/finance/factures/create' as any)}>
          <Ionicons name="add-circle" size={32} color="#FFCC00" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={[styles.searchBar, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
          <Ionicons name="search" size={20} color={themeColors.textSecondary} />
          <TextInput
            placeholder="Rechercher une facture..."
            placeholderTextColor={themeColors.textSecondary}
            style={[styles.searchInput, { color: themeColors.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={filteredInvoices}
        renderItem={renderInvoiceItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={60} color={themeColors.textSecondary} />
            <Text style={{ color: themeColors.textSecondary, marginTop: 10 }}>Aucune facture trouvée</Text>
          </View>
        }
      />
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
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: '800' },
  addBtn: { width: 40, height: 40, alignItems: 'flex-end', justifyContent: 'center' },
  searchSection: { padding: 20 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 50,
    borderRadius: 15,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 15, fontWeight: '600' },
  listContent: { padding: 20, paddingTop: 0, gap: 15 },
  invoiceCard: {
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    gap: 12,
  },
  invoiceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  numberContainer: { gap: 2 },
  invoiceNumber: { fontSize: 16, fontWeight: '800' },
  invoiceDate: { fontSize: 12, color: '#888', fontWeight: '600' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  statusText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  clientContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  clientName: { fontSize: 14, fontWeight: '700' },
  amountContainer: {
    marginTop: 5,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabel: { fontSize: 12, color: '#888', fontWeight: '600' },
  amountValue: { fontSize: 18, fontWeight: '900' },
  emptyState: { alignItems: 'center', marginTop: 100 },
});
