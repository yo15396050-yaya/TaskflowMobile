import { StyleSheet, Text, View, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import api from '@/services/api-service';

export default function TaxSituationScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/situations-fiscal/user'); // On peut passer 'user' car le contrôleur utilise getApiUser()
      setData(response.data);
    } catch (error) {
      console.error('Erreur chargement situation fiscale:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' F';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'payé': return '#2ecc71';
      case 'en attente': return '#f39c12';
      case 'impayé': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={[styles.card, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
      <View style={styles.cardHeader}>
        <View style={styles.typeBadge}>
          <Ionicons name="receipt-outline" size={16} color="#FFCC00" />
          <Text style={styles.typeName}>{item.type}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Période</Text>
          <Text style={[styles.value, { color: themeColors.text }]}>{item.periode}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Régime</Text>
          <Text style={[styles.value, { color: themeColors.text }]}>{item.regime}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Échéance</Text>
          <Text style={[styles.value, { color: themeColors.text }]}>{item.date_paiement}</Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: themeColors.border }]} />

      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.amountLabel}>Montant dû</Text>
          <Text style={[styles.amountValue, { color: themeColors.text }]}>{formatAmount(item.montant)}</Text>
        </View>
        {item.document && (
          <TouchableOpacity 
            style={styles.downloadBtn}
            onPress={() => Linking.openURL(`https://flowtask.dc-knowing.com/user-uploads/situation-fiscale/${item.document}`)}
          >
            <Ionicons name="download-outline" size={18} color="#181818" />
            <Text style={styles.downloadText}>Justificatif</Text>
          </TouchableOpacity>
        )}
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
          <Text style={styles.headerTitle}>Situation Fiscale</Text>
          <View style={{ width: 40 }} />
        </View>
        <Text style={styles.headerSubtitle}>Suivi de vos obligations fiscales</Text>
      </View>

      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFCC00" />
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color="#FFCC00" style={{ marginTop: 50 }} />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={60} color="#888" />
              <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>Aucune donnée fiscale trouvée</Text>
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
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  backBtn: { padding: 5, marginLeft: -5 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  headerSubtitle: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '500' },
  listContent: { padding: 20, paddingBottom: 100 },
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  typeName: { color: '#FFCC00', fontSize: 14, fontWeight: '800' },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  cardBody: { gap: 10 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { color: '#888', fontSize: 12, fontWeight: '600' },
  value: { fontSize: 13, fontWeight: '700' },
  divider: { height: 1, marginVertical: 15, opacity: 0.1 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  amountLabel: { color: '#888', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 2 },
  amountValue: { fontSize: 18, fontWeight: '900' },
  downloadBtn: {
    backgroundColor: '#FFCC00',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  downloadText: { color: '#181818', fontSize: 12, fontWeight: '800' },
  emptyContainer: { alignItems: 'center', marginTop: 100, gap: 15 },
  emptyText: { fontSize: 15, fontWeight: '600' },
});
