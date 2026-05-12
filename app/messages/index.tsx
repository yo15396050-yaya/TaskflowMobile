import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, Image, Modal, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import api from '@/services/api-service';

export default function MessagesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [contacts, setContacts] = useState<{employee: any[], client: any[]}>({employee: [], client: []});
  const [search, setSearch] = useState('');

  // New conversation modal state
  const [isNewVisible, setIsNewVisible] = useState(false);
  const [userType, setUserType] = useState<'employee' | 'client'>('employee');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [initialMsg, setInitialMsg] = useState('');

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/conversations');
      setConversations(response.data);
    } catch (error) {
      console.error('Erreur chargement conversations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await api.get('/chat-contacts');
      setContacts(response.data);
    } catch (error) {
      console.error('Erreur chargement contacts:', error);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (isNewVisible) fetchContacts();
  }, [isNewVisible]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchConversations();
  };

  const handleStartConversation = () => {
    if (selectedUserId) {
      const userList = userType === 'employee' ? contacts.employee : contacts.client;
      const user = userList.find(u => u.id === selectedUserId);
      setIsNewVisible(false);
      router.push({
        pathname: '/messages/[id]',
        params: { id: selectedUserId, name: user?.name || 'Inconnu' }
      });
      // Reset state for next time
      setSelectedUserId(null);
      setInitialMsg('');
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.convItem, { backgroundColor: themeColors.cardBackground, borderBottomColor: themeColors.border }]}
      onPress={() => router.push({ pathname: '/messages/[id]', params: { id: item.id, name: item.name } })}
    >
      <View style={styles.avatarWrapper}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        {item.online && <View style={styles.onlineStatus} />}
      </View>
      <View style={styles.convDetails}>
        <View style={styles.convHeader}>
          <Text style={[styles.userName, { color: themeColors.text }]} numberOfLines={1}>{item.name}</Text>
          <Text style={[styles.time, { color: themeColors.textSecondary }]}>{item.time}</Text>
        </View>
        <View style={styles.msgRow}>
          <Text style={[styles.lastMsg, { color: themeColors.textSecondary }]} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          {item.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={[styles.header, { backgroundColor: '#181818' }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFCC00" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Messages</Text>
          <TouchableOpacity
            style={styles.newChatBtn}
            onPress={() => setIsNewVisible(true)}
          >
            <Ionicons name="add-circle" size={28} color="#FFCC00" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="rgba(255,255,255,0.5)" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un contact..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <FlatList
        data={conversations.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))}
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
              <Ionicons name="chatbubbles-outline" size={60} color="#888" />
              <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>Aucune conversation trouvée</Text>
            </View>
          )
        }
      />

      {/* Modal Nouvelle Conversation */}
      <Modal
        visible={isNewVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsNewVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.cardBackground }]}>
            <View style={styles.modalHeaderModal}>
              <Text style={[styles.modalTitle, { color: themeColors.text }]}>Nouvelle conversation</Text>
              <TouchableOpacity onPress={() => setIsNewVisible(false)}>
                <Ionicons name="close" size={24} color={themeColors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Toggle Collaborateur / Client */}
              <View style={styles.typeToggle}>
                <TouchableOpacity
                  style={[styles.typeBtn, userType === 'employee' && styles.typeBtnActive]}
                  onPress={() => { setUserType('employee'); setSelectedUserId(null); }}
                >
                  <Text style={[styles.typeBtnText, userType === 'employee' && styles.typeBtnTextActive]}>Collaborateur</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeBtn, userType === 'client' && styles.typeBtnActive]}
                  onPress={() => { setUserType('client'); setSelectedUserId(null); }}
                >
                  <Text style={[styles.typeBtnText, userType === 'client' && styles.typeBtnTextActive]}>Client</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.inputLabel, { color: themeColors.textSecondary }]}>
                {userType === 'employee' ? 'Choisir un collaborateur' : 'Choisir un client'} *
              </Text>

              <View style={styles.usersGrid}>
                {contacts[userType].map((user: any) => (
                  <TouchableOpacity
                    key={user.id}
                    style={[
                      styles.selectableUser,
                      selectedUserId === user.id && { borderColor: '#FFCC00', backgroundColor: 'rgba(255,204,0,0.1)' }
                    ]}
                    onPress={() => setSelectedUserId(user.id)}
                  >
                    <Image source={{ uri: user.avatar }} style={styles.userAvatarSmall} />
                    <Text style={[styles.selectableUserName, { color: themeColors.text }]} numberOfLines={1}>{user.name}</Text>
                    {selectedUserId === user.id && (
                      <View style={styles.checkBadge}>
                        <Ionicons name="checkmark" size={12} color="#181818" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.inputLabel, { color: themeColors.textSecondary, marginTop: 20 }]}>Message</Text>
              <TextInput
                style={[styles.modalTextArea, { color: themeColors.text, borderColor: themeColors.border, backgroundColor: themeColors.background }]}
                placeholder="Écrivez votre message..."
                placeholderTextColor="#666"
                multiline
                numberOfLines={4}
                value={initialMsg}
                onChangeText={setInitialMsg}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { borderColor: themeColors.border }]}
                onPress={() => setIsNewVisible(false)}
              >
                <Text style={[styles.modalCancelText, { color: themeColors.text }]}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSubmitBtn, (!selectedUserId || !initialMsg.trim()) && { opacity: 0.5 }]}
                onPress={handleStartConversation}
                disabled={!selectedUserId || !initialMsg.trim()}
              >
                <Text style={styles.modalSubmitText}>Démarrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backBtn: { padding: 5, marginLeft: -5 },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: '800' },
  newChatBtn: { padding: 5 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    height: 45,
    paddingHorizontal: 15,
  },
  searchIcon: { marginRight: 10 },
  searchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: { paddingVertical: 20 },
  convItem: {
    flexDirection: 'row',
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: '#eee',
  },
  onlineStatus: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  convDetails: { flex: 1, gap: 4 },
  convHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: { fontSize: 15, fontWeight: '700' },
  time: { fontSize: 11, fontWeight: '500' },
  msgRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMsg: { fontSize: 13, flex: 1, marginRight: 10 },
  unreadBadge: {
    backgroundColor: '#FFCC00',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: { color: '#181818', fontSize: 10, fontWeight: '800' },
  emptyContainer: {
    paddingTop: 100,
    alignItems: 'center',
    gap: 15,
  },
  emptyText: { fontSize: 15, fontWeight: '600' },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 35, borderTopRightRadius: 35, height: '90%', padding: 25 },
  modalHeaderModal: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalTitle: { fontSize: 22, fontWeight: '800' },
  typeToggle: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 16, padding: 5, marginBottom: 25 },
  typeBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
  typeBtnActive: { backgroundColor: '#FFCC00' },
  typeBtnText: { fontWeight: '700', fontSize: 14, color: '#888' },
  typeBtnTextActive: { color: '#181818' },
  inputLabel: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 15, marginLeft: 5 },
  usersGrid: { gap: 10 },
  selectableUser: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 18, borderWidth: 1, borderColor: 'transparent', gap: 15 },
  userAvatarSmall: { width: 44, height: 44, borderRadius: 22 },
  selectableUserName: { flex: 1, fontSize: 15, fontWeight: '600' },
  checkBadge: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#FFCC00', justifyContent: 'center', alignItems: 'center' },
  modalTextArea: { borderWidth: 1, borderRadius: 20, padding: 18, height: 120, textAlignVertical: 'top', fontSize: 15, fontWeight: '500' },
  modalActions: { flexDirection: 'row', gap: 15, marginTop: 25, paddingBottom: 10 },
  modalCancelBtn: { flex: 1, paddingVertical: 16, alignItems: 'center', borderRadius: 18, borderWidth: 1 },
  modalCancelText: { fontWeight: '700', fontSize: 16 },
  modalSubmitBtn: { flex: 2, backgroundColor: '#FFCC00', paddingVertical: 16, alignItems: 'center', borderRadius: 18, elevation: 4 },
  modalSubmitText: { color: '#181818', fontWeight: '800', fontSize: 16 },
});
