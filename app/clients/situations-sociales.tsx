import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import api from '@/services/api-service';
import * as SecureStore from 'expo-secure-store';

const FILTERS = ['Tous', 'À jour', 'En retard', 'En attente'];

export default function SituationsSocialesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const [socialData, setSocialData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Tous');
  const [search, setSearch] = useState('');

  const fetchSocialData = async () => {
    try {
      const userData = await SecureStore.getItemAsync('user_data');
      const user = userData ? JSON.parse(userData) : null;
      const userId = user?.id || '531';
      
      const response = await api.get(`/dashboard/situationsSocial/${userId}`);
      setSocialData(response.data.data || response.data || []);
    } catch (error) {
      console.error('Erreur social:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSocialData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSocialData();
  };

  const filtered = socialData.filter(item => {
    const matchFilter = activeFilter === 'Tous' || item.status === activeFilter;
    const matchSearch = (item.client || item.name || '').toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const totalEffectif = socialData.reduce((sum, d) => sum + (parseInt(d.effectif) || 0), 0);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'À jour': return { bg: '#dcfce7', color: '#16a34a', icon: 'checkmark-circle' };
      case 'En retard': return { bg: '#fee2e2', color: '#dc2626', icon: 'alert-circle' };
      case 'En attente': return { bg: '#fef3c7', color: '#d97706', icon: 'time' };
      default: return { bg: '#f0f0f0', color: '#666', icon: 'help-circle' };
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const statusStyle = getStatusStyle(item.status || 'En attente');
    return (
      <TouchableOpacity 
        style={[styles.card, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}
        activeOpacity={0.7}
      >
        <View style={styles.cardTop}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.clientName, { color: themeColors.text }]} numberOfLines={1}>{item.client || item.name || 'Inconnu'}</Text>
            <Text style={[styles.cnps, { color: themeColors.textSecondary }]}>CNPS: {item.cnps || 'N/A'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Ionicons name={statusStyle.icon as any} size={12} color={statusStyle.color} />
            <Text style={[styles.statusText, { color: statusStyle.color }]}>{item.status || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>Type cotisation</Text>
            <View style={[styles.typeBadge, { backgroundColor: 'rgba(52, 152, 219, 0.1)' }]}>
              <Text style={[styles.typeText, { color: '#3498db' }]}>{item.type || 'CNPS'}</Text>
            </View>
          </View>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>Effectif</Text>
            <View style={styles.effectifRow}>
              <Ionicons name="people" size={16} color={themeColors.accent} />
              <Text style={[styles.effectifValue, { color: themeColors.text }]}>{item.effectif || 0} employés</Text>
            </View>
          </View>
        </View>

        <View style={[styles.cardBottom, { borderTopColor: themeColors.border }]}>
          <View style={styles.bottomItem}>
            <Ionicons name="calendar-outline" size={14} color={themeColors.textSecondary} />
            <Text style={[styles.bottomText, { color: themeColors.textSecondary }]}>Dern. cotis: {item.dernCotis || item.date || 'N/A'}</Text>
          </View>
          <Text style={[styles.montant, { color: themeColors.accent }]}>{item.montant || item.total || '0 XOF'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFCC00" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Situations Sociales</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un client..."
            placeholderTextColor="#999"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{socialData.length}</Text>
            <Text style={styles.summaryLabel}>Entreprises</Text>
          </View>
          <View style={[styles.summaryItem, styles.summaryDivider]}>
            <Text style={[styles.summaryNumber, { color: '#9b59b6' }]}>{totalEffectif}</Text>
            <Text style={styles.summaryLabel}>Effectif total</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: '#e74c3c' }]}>{socialData.filter(d => d.status === 'En retard').length || 0}</Text>
            <Text style={styles.summaryLabel}>En retard</Text>
          </View>
        </View>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            onPress={() => setActiveFilter(f)}
            style={[styles.filterChip, activeFilter === f && { backgroundColor: themeColors.accent, borderColor: themeColors.accent }]}
          >
            <Text style={[styles.filterText, { color: activeFilter === f ? '#000' : themeColors.textSecondary }]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeColors.accent} />}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={themeColors.accent} style={{ marginTop: 50 }} />
          ) : (
            <View style={styles.empty}>
              <Ionicons name="people-circle-outline" size={64} color={themeColors.border} />
              <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>Aucun résultat trouvé</Text>
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
    backgroundColor: '#181818',
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  backBtn: { padding: 5, marginLeft: -5 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  searchBar: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 48,
    marginBottom: 20,
  },
  searchInput: { flex: 1, color: '#FFF', marginLeft: 10, fontSize: 15 },
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    padding: 15,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryDivider: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  summaryNumber: { color: '#2ecc71', fontSize: 22, fontWeight: '900' },
  summaryLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', marginTop: 2 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 15, gap: 10 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#ddd' },
  filterText: { fontSize: 12, fontWeight: '700' },
  list: { paddingHorizontal: 20, paddingBottom: 100 },
  card: { borderRadius: 22, padding: 18, marginBottom: 16, borderWidth: 1, elevation: 2 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  clientName: { fontSize: 16, fontWeight: '800', marginBottom: 3 },
  cnps: { fontSize: 12, fontWeight: '600' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  statusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  infoGrid: { flexDirection: 'row', gap: 20, marginBottom: 16 },
  infoItem: { flex: 1 },
  infoLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', marginBottom: 6 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  typeText: { fontSize: 12, fontWeight: '800' },
  effectifRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  effectifValue: { fontSize: 14, fontWeight: '700' },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, paddingTop: 14 },
  bottomItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bottomText: { fontSize: 12, fontWeight: '600' },
  montant: { fontSize: 14, fontWeight: '900' },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { marginTop: 15, fontSize: 16, fontWeight: '600' },
});
