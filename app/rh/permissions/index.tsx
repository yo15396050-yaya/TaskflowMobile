import { StyleSheet, Text, View, FlatList, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import api from '@/services/api-service';

export default function LeavesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/permissions');
      setLeaves(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeaves = leaves.filter(item => 
    item.type.toLowerCase().includes(search.toLowerCase()) || 
    (item.reason && item.reason.toLowerCase().includes(search.toLowerCase()))
  );

  const stats = [
    { label: 'Approuvés', value: leaves.filter(l => l.status === 'approved').length.toString(), color: '#2ecc71', icon: 'checkmark-circle' },
    { label: 'En attente', value: leaves.filter(l => l.status === 'pending').length.toString(), color: '#f1c40f', icon: 'time' },
    { label: 'Refusés', value: leaves.filter(l => l.status === 'rejected').length.toString(), color: '#e74c3c', icon: 'close-circle' },
  ];

  const renderLeaveItem = ({ item }: { item: any }) => {
    const statusLabel = item.status === 'approved' ? 'Approuvé' : item.status === 'rejected' ? 'Rejeté' : 'En attente';
    
    return (
      <View style={[styles.leaveCard, { backgroundColor: themeColors.cardBackground, borderLeftColor: item.color }]}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.leaveType, { color: themeColors.text }]}>{item.type}</Text>
            <Text style={styles.leaveReason}>{item.reason || 'Aucun motif précisé'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: item.color + '20' }]}>
            <Text style={[styles.statusText, { color: item.color }]}>{statusLabel}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.footerInfo}>
              <Ionicons name="calendar-outline" size={14} color="#888" />
              <Text style={styles.dateText}>{item.date}</Text>
          </View>
          <View style={[styles.daysBadge, { backgroundColor: 'rgba(0,0,0,0.03)' }]}>
              <Text style={[styles.daysText, { color: themeColors.textSecondary }]}>{item.duration}</Text>
          </View>
        </View>
      </View>
    );
  };


  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header Profile */}
      <View style={[styles.header, { backgroundColor: '#181818' }]}>
         <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="#FFCC00" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Permissions</Text>
            <TouchableOpacity>
                <Ionicons name="funnel-outline" size={20} color="#FFCC00" />
            </TouchableOpacity>
         </View>

         <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="rgba(255,255,255,0.4)" />
            <TextInput 
              placeholder="Rechercher une permission..."
              placeholderTextColor="rgba(255,255,255,0.3)"
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
            />
         </View>

         <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll}>
            {stats.map((stat, index) => (
                <View key={index} style={styles.statBox}>
                    <View style={[styles.iconCircle, { backgroundColor: stat.color + '20' }]}>
                        <Ionicons name={stat.icon as any} size={20} color={stat.color} />
                    </View>
                    <View>
                        <Text style={styles.statValue}>{stat.value}</Text>
                        <Text style={styles.statLabel}>{stat.label}</Text>
                    </View>
                </View>
            ))}
         </ScrollView>
      </View>

      <FlatList
        data={filteredLeaves}
        renderItem={renderLeaveItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<Text style={[styles.listTitle, { color: themeColors.text }]}>Historique récent</Text>}
        refreshing={loading}
        onRefresh={fetchPermissions}
        ListEmptyComponent={
          !loading ? (
            <View style={{ alignItems: 'center', marginTop: 50 }}>
              <Text style={{ color: themeColors.textSecondary }}>Aucune permission trouvée</Text>
            </View>
          ) : null
        }
      />


      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/rh/permissions/create')}>
        <Ionicons name="add" size={30} color="#000" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 55,
    paddingBottom: 25,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 25,
    marginBottom: 25,
  },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 48,
    marginHorizontal: 25,
    marginBottom: 20,
  },
  searchInput: { flex: 1, color: '#FFF', marginLeft: 10, fontSize: 15 },
  statsScroll: { paddingLeft: 25 },
  statBox: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: 15,
    marginRight: 15,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 140,
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  statLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '600' },
  listContent: { padding: 25, paddingBottom: 100 },
  listTitle: { fontSize: 17, fontWeight: '800', marginBottom: 20 },
  leaveCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  leaveType: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  leaveReason: { fontSize: 13, color: '#888', fontWeight: '500' },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.03)',
  },
  footerInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateText: { fontSize: 12, color: '#888', fontWeight: '600' },
  daysBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  daysText: { fontSize: 11, fontWeight: '800' },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 65,
    height: 65,
    borderRadius: 22,
    backgroundColor: '#FFCC00',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFCC00',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
});
