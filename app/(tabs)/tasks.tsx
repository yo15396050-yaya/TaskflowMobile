import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import api from '@/services/api-service';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function TasksScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks'); // CHANGEMENT ICI
      setTasks(response.data); // Supprimé le .data.data car Laravel renvoie directement le tableau
    } catch (error) {
      console.error('Erreur tâches:', error);
      // Optionnel : Alert.alert('Erreur', 'Impossible de charger les tâches.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  const handleAddTask = async () => {
    if (!newTitle.trim()) {
      Alert.alert('Erreur', 'Le sujet est obligatoire.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/customer-requests/storeRequest', {
        name: newTitle,
        type_request: 'demande',
        request_text: newDescription || newTitle,
      });

      setModalVisible(false);
      setNewTitle('');
      setNewDescription('');
      fetchTasks(); // Recharger la liste
      Alert.alert('Succès', 'Votre demande a été enregistrée.');
    } catch (error) {
      console.error('Erreur creation tâche:', error);
      Alert.alert('Erreur', 'Impossible de créer la tâche.');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTasks();
  };

  const filteredTasks = tasks.filter(item =>
    (item.heading || '').toLowerCase().includes(search.toLowerCase()) ||
    (item.project_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'terminé': return '#2ecc71';
      case 'en cours': return '#3498db';
      case 'en attente': return '#f1c40f';
      default: return '#95a5a6';
    }
  };

  const renderTaskItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.taskCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}
      onPress={() => router.push(`/travail/tasks/${item.id}`)}
      activeOpacity={0.7}
    >
      <TouchableOpacity style={styles.checkCircle}>
        <Ionicons
          name={item.status === 'terminé' ? "checkbox" : "square-outline"}
          size={24}
          color={item.status === 'terminé' ? themeColors.accent : themeColors.border}
        />
      </TouchableOpacity>

      <View style={styles.taskInfo}>
        <Text style={[styles.taskTitle, { color: themeColors.text }]}>{item.heading || 'Sans titre'}</Text>
        <Text style={styles.projectName}>{item.project_name || 'Général'}</Text>

        <View style={styles.taskMeta}>
          <View style={[styles.priorityBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.priorityText, { color: getStatusColor(item.status) }]}>{item.status || 'N/A'}</Text>
          </View>
          <View style={styles.dateInfo}>
            <Ionicons name="calendar-outline" size={14} color={themeColors.textSecondary} />
            <Text style={[styles.dateText, { color: themeColors.textSecondary }]}>{item.due_date || item.created_at || 'Pas de date'}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>Tâches & Demandes</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchSection}>
        <View style={[styles.searchBar, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
          <Ionicons name="search-outline" size={20} color={themeColors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: themeColors.text }]}
            placeholder="Rechercher une tâche..."
            placeholderTextColor={themeColors.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <FlatList
        data={filteredTasks}
        renderItem={renderTaskItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.taskList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeColors.accent} />
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={themeColors.accent} style={{ marginTop: 50 }} />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="clipboard-outline" size={64} color={themeColors.border} />
              <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>Aucune tâche trouvée</Text>
            </View>
          )
        }
      />

      {/* Modal de création */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors.text }]}>Nouvelle Demande</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={themeColors.text} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, { color: themeColors.textSecondary }]}>Sujet *</Text>
            <TextInput
              style={[styles.input, { color: themeColors.text, borderColor: themeColors.border }]}
              placeholder="De quoi s'agit-il ?"
              placeholderTextColor="#999"
              value={newTitle}
              onChangeText={setNewTitle}
            />

            <Text style={[styles.label, { color: themeColors.textSecondary }]}>Description</Text>
            <TextInput
              style={[styles.textArea, { color: themeColors.text, borderColor: themeColors.border }]}
              placeholder="Détaillez votre demande ici..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              value={newDescription}
              onChangeText={setNewDescription}
            />

            <TouchableOpacity
              style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
              onPress={handleAddTask}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.submitBtnText}>Créer la demande</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: { fontSize: 24, fontWeight: '800' },
  addBtn: {
    backgroundColor: '#FFCC00',
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchSection: { paddingHorizontal: 20, marginBottom: 20 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 50,
    borderRadius: 15,
    borderWidth: 1,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },
  taskList: { paddingHorizontal: 20, paddingBottom: 100 },
  taskCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
    alignItems: 'center',
  },
  checkCircle: { marginRight: 15 },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  projectName: { fontSize: 13, color: '#888', fontWeight: '600', marginBottom: 10 },
  taskMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priorityBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  priorityText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  dateInfo: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dateText: { fontSize: 12, fontWeight: '600' },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { marginTop: 15, fontSize: 16, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, height: '70%', elevation: 10 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 8, marginTop: 15, textTransform: 'uppercase' },
  input: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 16 },
  textArea: { borderWidth: 1, borderRadius: 12, padding: 12, height: 120, textAlignVertical: 'top', fontSize: 16 },
  submitBtn: { backgroundColor: '#FFCC00', borderRadius: 15, height: 55, justifyContent: 'center', alignItems: 'center', marginTop: 30 },
  submitBtnText: { color: '#000', fontWeight: '800', fontSize: 16 },
});
