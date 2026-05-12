import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, FlatList, ActivityIndicator, RefreshControl, Modal, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import api from '@/services/api-service';

const STATUTES = ['Tous', 'En retard', 'En cours', 'terminée', 'en attente'];

export default function DiligencesScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const router = useRouter();
  const [activeStatus, setActiveStatus] = useState('Tous');
  const [search, setSearch] = useState('');
  const [diligences, setDiligences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDiligences = async () => {
    try {
      const response = await api.get('/getAlldiligences');
      setDiligences(response.data.data || response.data || []);
    } catch (error) {
      console.error('Erreur diligences:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAddDiligence = async () => {
    if (!newSubject.trim()) {
      Alert.alert('Erreur', 'Le sujet est obligatoire.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/customer-requests/storeRequest', {
        name: newSubject,
        type_request: 'diligence',
        request_text: 'Nouvelle diligence: ' + newSubject,
      });
      
      setModalVisible(false);
      setNewSubject('');
      fetchDiligences();
      Alert.alert('Succès', 'La diligence a été ajoutée.');
    } catch (error) {
      console.error('Erreur création diligence:', error);
      Alert.alert('Erreur', 'Impossible de créer la diligence.');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchDiligences();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDiligences();
  };

  const filteredDiligences = diligences.filter(item => {
    const matchesSearch = (item.project_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.category_name || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = activeStatus === 'Tous' || item.status === activeStatus;
    return matchesSearch && matchesStatus;
  });

  const renderDiligenceItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.card, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}
      onPress={() => router.push(`/travail/diligences/${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.clientName, { color: themeColors.accent }]}>{item.category_name || 'Diligence'}</Text>
          <Text style={[styles.diligenceName, { color: themeColors.text }]}>{item.project_name}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: (item.color || '#3498db') + '20' }]}>
          <Text style={[styles.statusText, { color: item.color || '#3498db' }]}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${item.progress || 0}%`, backgroundColor: item.color || '#3498db' }]} />
        </View>
        <Text style={[styles.progressText, { color: themeColors.textSecondary }]}>{item.progress || 0}%</Text>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.dateContainer}>
          <Ionicons name="calendar-outline" size={14} color={themeColors.textSecondary} />
          <Text style={[styles.dateText, { color: themeColors.textSecondary }]}>{item.deadline || 'Pas de date'}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={themeColors.border} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: themeColors.text }]}>Mes Diligences</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
          <Ionicons name="search-outline" size={20} color={themeColors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: themeColors.text }]}
            placeholder="Rechercher..."
            placeholderTextColor={themeColors.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {STATUTES.map(status => (
            <TouchableOpacity
              key={status}
              onPress={() => setActiveStatus(status)}
              style={[
                styles.filterTab,
                activeStatus === status && { backgroundColor: themeColors.accent, borderColor: themeColors.accent }
              ]}
            >
              <Text style={[
                styles.filterTabText,
                { color: activeStatus === status ? '#000' : themeColors.textSecondary }
              ]}>{status}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredDiligences}
        renderItem={renderDiligenceItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeColors.accent} />
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={themeColors.accent} style={{ marginTop: 50 }} />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="documents-outline" size={60} color={themeColors.border} />
              <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>Aucune diligence trouvée</Text>
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
              <Text style={[styles.modalTitle, { color: themeColors.text }]}>Nouvelle Diligence</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={themeColors.text} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, { color: themeColors.textSecondary }]}>Sujet de la diligence *</Text>
            <TextInput
              style={[styles.input, { color: themeColors.text, borderColor: themeColors.border }]}
              placeholder="Ex: Contrôle fiscal Mars"
              placeholderTextColor="#999"
              value={newSubject}
              onChangeText={setNewSubject}
            />

            <TouchableOpacity 
              style={[styles.submitBtn, submitting && { opacity: 0.7 }]} 
              onPress={handleAddDiligence}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.submitBtnText}>Enregistrer la diligence</Text>
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
  title: { fontSize: 24, fontWeight: '800' },
  addBtn: {
    backgroundColor: '#FFCC00',
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: { paddingHorizontal: 20, marginBottom: 15 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 50,
    borderRadius: 15,
    borderWidth: 1,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },
  filterSection: { marginBottom: 20 },
  filterScroll: { paddingHorizontal: 20, gap: 10 },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  filterTabText: { fontSize: 13, fontWeight: '700', textTransform: 'capitalize' },
  listContainer: { paddingHorizontal: 20, paddingBottom: 100 },
  card: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  clientName: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  diligenceName: { fontSize: 16, fontWeight: '800' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  progressContainer: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 15 },
  progressBarBg: { flex: 1, height: 6, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },
  progressText: { fontSize: 12, fontWeight: '700', width: 35 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateText: { fontSize: 12, fontWeight: '600' },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { marginTop: 10, fontSize: 15, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, height: '45%', elevation: 10 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase' },
  input: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 16 },
  submitBtn: { backgroundColor: '#FFCC00', borderRadius: 15, height: 55, justifyContent: 'center', alignItems: 'center', marginTop: 30 },
  submitBtnText: { color: '#000', fontWeight: '800', fontSize: 16 },
});

