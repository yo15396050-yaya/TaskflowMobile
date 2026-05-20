import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, Linking, Image, ActivityIndicator, RefreshControl, Modal, Alert } from 'react-native';

import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import api from '@/services/api-service';

interface Client {
  id: string;
  name: string;
  company_name?: string;
  email?: string;
  mobile?: string;
  country?: string;
}

export default function ClientsListScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);


  const fetchClients = async () => {
    try {
      const response = await api.get('/clients');
      // On s'attend à ce que Laravel renvoie { data: [...] }
      setClients(response.data.data || response.data);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.response?.data?.error?.message || error.message;
      console.error('❌ Erreur de récupération des clients:', errorMsg);
      if (error.response?.data) {
        console.log('Détails de l\'erreur serveur:', JSON.stringify(error.response.data).substring(0, 500));
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchClients();
  };

  const filteredClients = clients.filter(client => 
    client.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (client.company_name && client.company_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCall = (phone: string) => Linking.openURL(`tel:${phone}`);
  const handleWhatsApp = (phone: string) => Linking.openURL(`whatsapp://send?phone=${phone}`);
  const handleEmail = (email: string) => Linking.openURL(`mailto:${email}`);

  const openMenu = (client: Client) => {
    setSelectedClient(client);
    setMenuVisible(true);
  };

  const handleDelete = async () => {
    if (!selectedClient) return;

    Alert.alert(
      'Suppression',
      `Êtes-vous sûr de vouloir supprimer le client "${selectedClient.name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/clients/${selectedClient.id}`);
              setClients(clients.filter(c => c.id !== selectedClient.id));
              setMenuVisible(false);
              Alert.alert('Succès', 'Client supprimé avec succès.');
            } catch (error: any) {
              Alert.alert('Erreur', 'Impossible de supprimer le client.');
            }
          }
        }
      ]
    );
  };


  const renderClientItem = ({ item }: { item: Client }) => {
    const initial = item.name ? item.name.substring(0, 2).toUpperCase() : '??';

    return (
      <TouchableOpacity 
        style={[styles.clientCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}
        onPress={() => router.push(`/clients/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.avatar, { backgroundColor: themeColors.accent + '20' }]}>
            <Text style={[styles.avatarText, { color: themeColors.accent }]}>{initial}</Text>
          </View>
          <View style={styles.clientMainInfo}>
            <Text style={[styles.clientName, { color: themeColors.text }]} numberOfLines={1}>{item.name}</Text>
            <Text style={[styles.clientCompany, { color: themeColors.textSecondary }]} numberOfLines={1}>{item.company_name || 'Entreprise non spécifiée'}</Text>
          </View>
          <TouchableOpacity style={styles.moreBtn} onPress={() => openMenu(item)}>
            <Ionicons name="ellipsis-vertical" size={20} color={themeColors.textSecondary} />
          </TouchableOpacity>

        </View>

        <View style={[styles.cardFooter, { borderTopColor: themeColors.border }]}>
          <View style={styles.contactButtons}>
            {item.mobile && (
              <TouchableOpacity onPress={() => handleCall(item.mobile!)} style={styles.actionIcon}>
                <Ionicons name="call-outline" size={18} color={themeColors.textSecondary} />
              </TouchableOpacity>
            )}
            {item.mobile && (
              <TouchableOpacity onPress={() => handleWhatsApp(item.mobile!)} style={styles.actionIcon}>
                <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
              </TouchableOpacity>
            )}
            {item.email && (
              <TouchableOpacity onPress={() => handleEmail(item.email!)} style={styles.actionIcon}>
                <Ionicons name="mail-outline" size={18} color={themeColors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.locationTag}>
            <Ionicons name="location-outline" size={12} color={themeColors.textSecondary} />
            <Text style={[styles.locationText, { color: themeColors.textSecondary }]}>{item.country || 'N/A'}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header with Search */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFCC00" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Clientèle</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/clients/create')}>
            <Ionicons name="person-add-outline" size={22} color="#FFCC00" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un client..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={themeColors.accent} />
          <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>Chargement des clients...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredClients}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderClientItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeColors.accent} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color={themeColors.border} />
              <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>Aucun client trouvé</Text>
            </View>
          }
        />
      )}


      {/* Action Menu Modal */}
      <Modal visible={menuVisible} transparent animationType="fade">
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setMenuVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: themeColors.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>{selectedClient?.name}</Text>
            
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => {
                setMenuVisible(false);
                router.push(`/clients/${selectedClient?.id}`);
              }}
            >
              <Ionicons name="eye-outline" size={22} color={themeColors.accent} />
              <Text style={[styles.menuItemText, { color: themeColors.text }]}>Voir les détails</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => {
                setMenuVisible(false);
                router.push(`/clients/edit/${selectedClient?.id}`);
              }}

            >
              <Ionicons name="create-outline" size={22} color="#3498db" />
              <Text style={[styles.menuItemText, { color: themeColors.text }]}>Modifier le client</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.menuItem, { borderBottomWidth: 0 }]} 
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={22} color="#e74c3c" />
              <Text style={[styles.menuItemText, { color: '#e74c3c' }]}>Supprimer définitivement</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 60,
    backgroundColor: '#181818',
    paddingHorizontal: 20,
    paddingBottom: 25,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { color: '#FFCC00', fontSize: 22, fontWeight: '900' },
  addBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-end' },
  searchBar: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 48,
  },
  searchInput: { flex: 1, color: '#FFF', marginLeft: 10, fontSize: 16 },
  listContent: { padding: 20, paddingBottom: 100 },
  clientCard: {
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  avatar: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 18, fontWeight: '800' },
  clientMainInfo: { flex: 1, marginLeft: 15 },
  clientName: { fontSize: 16, fontWeight: '800', marginBottom: 2 },
  clientCompany: { fontSize: 13, fontWeight: '600', opacity: 0.7 },
  moreBtn: { padding: 5 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 12,
  },
  contactButtons: { flexDirection: 'row', gap: 15 },
  actionIcon: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  locationTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 11, fontWeight: '700' },
  emptyText: { marginTop: 15, fontSize: 16, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  modalContent: {
    width: '100%',
    borderRadius: 25,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 20,
    textAlign: 'center',
    opacity: 0.8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 15,
  },
});

