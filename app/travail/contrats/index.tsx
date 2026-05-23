import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import api from '@/services/api-service';

export default function ContractsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const [searchQuery, setSearchQuery] = useState('');
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchContracts = async () => {
    try {
      const response = await api.get('/contracts');
      setContracts(response.data);
    } catch (error) {
      console.error('Erreur contrats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchContracts();
  };

  const filteredData = contracts.filter(item => 
    (item.subject || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Actif': return '#2ecc71';
      case 'Expiré': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const renderContract = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.contractCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}
      onPress={() => Alert.alert('Détails du Contrat', `Client / Entité : ${item.type}\nObjet : ${item.subject}\nType : ${item.type}\nMontant facturé : ${item.amount}\nDate d'effet : ${item.start_date}\nStatut actuel : ${item.status}`, [{text: 'Fermer', style: 'cancel'}])}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.typeBadge, { backgroundColor: 'rgba(52, 152, 219, 0.1)' }]}>
            <Text style={styles.typeText}>{item.type}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
        </View>
      </View>

      <Text style={[styles.contractTitle, { color: themeColors.text }]}>{item.subject}</Text>
      <Text style={styles.clientName}>{item.type}</Text>

      <View style={styles.cardFooter}>
         <View style={styles.infoRow}>
            <Ionicons name="cash-outline" size={14} color="#888" />
            <Text style={styles.infoText}>{item.amount}</Text>
         </View>
         <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={14} color="#888" />
            <Text style={styles.infoText}>{item.start_date}</Text>
         </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: '#181818' }]}>
        <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="#FFCC00" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Gestion des Contrats</Text>
            <TouchableOpacity onPress={() => router.push('/travail/contrats/create')}>
                <Ionicons name="add-circle-outline" size={26} color="#FFCC00" />
            </TouchableOpacity>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#888" />
          <TextInput
            placeholder="Rechercher un contrat..."
            placeholderTextColor="#888"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={filteredData}
        renderItem={renderContract}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
    marginBottom: 25,
  },
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
    fontSize: 15,
    marginLeft: 10,
  },
  listContent: { padding: 25, paddingBottom: 100 },
  contractCard: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: { color: '#3498db', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  contractTitle: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  clientName: { fontSize: 13, color: '#888', fontWeight: '600', marginBottom: 15 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.03)',
    paddingTop: 15,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText: { fontSize: 12, color: '#888', fontWeight: '600' },
});
