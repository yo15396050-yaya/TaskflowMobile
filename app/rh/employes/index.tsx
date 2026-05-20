import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, RefreshControl } from 'react-native';
import api from '@/services/api-service';

export default function EmployeesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  
  const [searchQuery, setSearchQuery] = useState('');
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data.data || response.data);
    } catch (error) {
      console.error('Erreur employés:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEmployees();
  };

  const filteredEmployees = employees.filter(emp =>
    (emp.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (emp.dept || emp.department?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'En ligne': return '#2ecc71';
      case 'Absent': return '#95a5a6';
      case 'Occupé': return '#e67e22';
      default: return '#bdc3c7';
    }
  };

  const renderEmployee = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.employeeCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}
      onPress={() => router.push(`/rh/employes/${item.id}`)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <Image 
            source={{ uri: item.avatar || item.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random` }} 
            style={styles.avatar} 
          />
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status || 'Hors ligne') }]} />
        </View>
        <View style={styles.infoContainer}>
          <Text style={[styles.empName, { color: themeColors.text }]}>{item.name}</Text>
          <Text style={styles.empRole}>{item.role || item.designation || 'Employé'}</Text>
          <View style={[styles.deptBadge, { backgroundColor: 'rgba(255, 204, 0, 0.1)' }]}>
            <Text style={styles.deptText}>{item.dept || item.department?.name || 'N/A'}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#CCC" />
      </View>

      <View style={styles.cardFooter}>
        <TouchableOpacity style={styles.actionIcon}>
          <Ionicons name="call-outline" size={18} color={themeColors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionIcon}>
          <Ionicons name="mail-outline" size={18} color={themeColors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionIcon, { marginLeft: 'auto' }]}>
          <Ionicons name="chatbubble-ellipses-outline" size={18} color="#FFCC00" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Search Header */}
      <View style={[styles.header, { backgroundColor: '#181818' }]}>
        <View style={styles.titleRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFCC00" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Annuaire Employés</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/rh/employes/create')}>
            <Ionicons name="person-add-outline" size={22} color="#FFCC00" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#888" />
          <TextInput
            placeholder="Rechercher un collègue..."
            placeholderTextColor="#888"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={filteredEmployees}
        renderItem={renderEmployee}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFCC00" />
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color="#FFCC00" style={{ marginTop: 50 }} />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={60} color="#DDD" />
              <Text style={styles.emptyText}>Aucun employé trouvé</Text>
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
    paddingHorizontal: 20,
    paddingBottom: 25,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: '800' },
  addBtn: { padding: 5 },
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
    fontSize: 15,
    marginLeft: 10,
  },
  listContent: { padding: 20, paddingBottom: 100 },
  employeeCard: {
    borderRadius: 24,
    padding: 16,
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
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 65,
    height: 65,
    borderRadius: 22,
  },
  statusDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  infoContainer: { flex: 1 },
  empName: { fontSize: 16, fontWeight: '800', marginBottom: 2 },
  empRole: { fontSize: 13, color: '#888', fontWeight: '600', marginBottom: 8 },
  deptBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  deptText: { color: '#FFCC00', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  cardFooter: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.03)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  actionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.02)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: '#AAA',
    fontWeight: '600',
  },
});
