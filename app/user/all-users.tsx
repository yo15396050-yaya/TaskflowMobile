import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import api from '@/services/api-service';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  image_url: string;
  status: string;
}

export default function AllUsersScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAllUsers();
  }, []);

  useEffect(() => {
    // Filtrer les utilisateurs en fonction de la recherche
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter(user => {
        const name = (user.name || '').toLowerCase();
        const email = (user.email || '').toLowerCase();
        return name.includes(query) || email.includes(query);
      });
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/all-users');
      // Nettoyer et valider les données reçues
      const cleanedUsers = (response.data || []).map((user: any) => ({
        id: user.id || '',
        name: user.name || 'Sans nom',
        email: user.email || '',
        phone: user.phone || '',
        image_url: user.image_url || 'https://www.gravatar.com/avatar/default.png?s=50&d=mp',
        status: user.status || 'unknown'
      }));
      setUsers(cleanedUsers);
      setFilteredUsers(cleanedUsers);
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
      Alert.alert('Erreur', 'Impossible de charger la liste des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchAllUsers();
  };

  const renderUserCard = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={[styles.userCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}
      onPress={() => {
        // On peut ajouter une action ici (détails utilisateur, contacter, etc.)
      }}
    >
      <Image
        source={{ uri: item.image_url }}
        style={styles.avatar}
      />
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: themeColors.text }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.userEmail, { color: themeColors.textSecondary }]} numberOfLines={1}>
          {item.email}
        </Text>
        {item.phone && (
          <Text style={[styles.userPhone, { color: themeColors.textSecondary }]} numberOfLines={1}>
            {item.phone}
          </Text>
        )}
      </View>
      <View style={styles.statusBadge}>
        <View style={[styles.statusDot, { backgroundColor: item.status === 'active' ? '#4CAF50' : '#999' }]} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: '#181818' }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFCC00" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tous les Utilisateurs</Text>
          <TouchableOpacity onPress={handleRefresh}>
            <Ionicons name="refresh" size={24} color="#FFCC00" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
        <Ionicons name="search" size={20} color={themeColors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: themeColors.text }]}
          placeholder="Rechercher un utilisateur..."
          placeholderTextColor={themeColors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close" size={20} color={themeColors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FFCC00" />
          <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>Chargement...</Text>
        </View>
      ) : filteredUsers.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="people" size={48} color={themeColors.textSecondary} />
          <Text style={[styles.emptyText, { color: themeColors.text }]}>
            {searchQuery !== '' ? 'Aucun utilisateur trouvé' : 'Pas d\'utilisateurs'}
          </Text>
          <Text style={[styles.emptySubText, { color: themeColors.textSecondary }]}>
            {searchQuery !== '' ? 'Essayez une autre recherche' : 'Revenez plus tard'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderUserCard}
          keyExtractor={(item) => item.id}
          scrollEnabled={true}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={handleRefresh}
        />
      )}

      {/* Footer Stats */}
      <View style={[styles.footer, { backgroundColor: themeColors.cardBackground, borderTopColor: themeColors.border }]}>
        <Text style={[styles.footerText, { color: themeColors.textSecondary }]}>
          Total: <Text style={[{ color: themeColors.text, fontWeight: 'bold' }]}>{filteredUsers.length}</Text> utilisateurs
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 55, paddingHorizontal: 20, paddingBottom: 20, borderBottomLeftRadius: 35, borderBottomRightRadius: 35, elevation: 5, zIndex: 10 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { padding: 5 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '800', flex: 1, textAlign: 'center' },

  searchContainer: { marginHorizontal: 16, marginTop: 16, marginBottom: 8, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', height: 48, gap: 8 },
  searchInput: { flex: 1, fontSize: 14 },

  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14 },
  emptyText: { marginTop: 16, fontSize: 18, fontWeight: '600', textAlign: 'center' },
  emptySubText: { marginTop: 8, fontSize: 14, textAlign: 'center' },

  listContainer: { paddingHorizontal: 16, paddingVertical: 12 },
  userCard: { marginBottom: 12, borderRadius: 12, borderWidth: 1, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12, elevation: 2 },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  userEmail: { fontSize: 13, marginBottom: 2 },
  userPhone: { fontSize: 12 },
  statusBadge: { justifyContent: 'center', alignItems: 'center' },
  statusDot: { width: 10, height: 10, borderRadius: 5 },

  footer: { paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { fontSize: 14 },
});
