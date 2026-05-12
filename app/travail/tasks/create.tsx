import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Modal, FlatList, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

const PRIORITIES = ['Basse', 'Normale', 'Haute', 'Critique'];
const PROJECTS = ['Audit Fiscal 2023', 'Déclaration Sociale', 'Constitution de Société', 'AIG SA'];
const COLLABORATORS = [
  { name: 'William G.', initial: 'WG' },
  { name: 'John Doe', initial: 'JD' },
  { name: 'Marie L.', initial: 'ML' }
];

export default function CreateTaskScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const [form, setForm] = useState({
    title: '',
    project: '',
    deadline: '',
    priority: 'Normale',
    assignee: ''
  });

  const [modalType, setModalType] = useState<null | 'project' | 'priority' | 'assignee'>(null);

  const handleCreate = () => {
    if (!form.title || !form.project) {
       Alert.alert('Erreur', 'Veuillez remplir les champs obligatoires (*)');
       return;
    }

    Alert.alert('Succès', 'Tâche créée avec succès !', [
        { text: 'OK', onPress: () => router.back() }
    ]);
  };

  const renderModalContent = () => {
    if (modalType === 'project') {
      return PROJECTS.map((p, i) => (
        <TouchableOpacity key={i} style={styles.optionItem} onPress={() => { setForm({...form, project: p}); setModalType(null); }}>
          <Text style={[styles.optionText, { color: themeColors.text }]}>{p}</Text>
          {form.project === p && <Ionicons name="checkmark" size={20} color="#FFCC00" />}
        </TouchableOpacity>
      ));
    }
    if (modalType === 'priority') {
      return PRIORITIES.map((p, i) => (
        <TouchableOpacity key={i} style={styles.optionItem} onPress={() => { setForm({...form, priority: p}); setModalType(null); }}>
          <Text style={[styles.optionText, { color: themeColors.text }]}>{p}</Text>
          {form.priority === p && <Ionicons name="checkmark" size={20} color="#FFCC00" />}
        </TouchableOpacity>
      ));
    }
    if (modalType === 'assignee') {
      return COLLABORATORS.map((c, i) => (
        <TouchableOpacity key={i} style={styles.optionItem} onPress={() => { setForm({...form, assignee: c.name}); setModalType(null); }}>
           <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={styles.miniAvatar}><Text style={styles.miniAvatarText}>{c.initial}</Text></View>
              <Text style={[styles.optionText, { color: themeColors.text }]}>{c.name}</Text>
           </View>
          {form.assignee === c.name && <Ionicons name="checkmark" size={20} color="#FFCC00" />}
        </TouchableOpacity>
      ));
    }
    return null;
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={[styles.header, { backgroundColor: '#181818' }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFCC00" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nouvelle Tâche</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Informations</Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: themeColors.textSecondary }]}>
            Titre de la tâche <Text style={styles.required}>*</Text>
          </Text>
          <TextInput 
            style={[styles.input, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground, color: themeColors.text }]}
            placeholder="Ex: Réviser les statuts"
            placeholderTextColor="#666"
            value={form.title}
            onChangeText={(t) => setForm({...form, title: t})}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: themeColors.textSecondary }]}>Diligence / Projet <Text style={styles.required}>*</Text></Text>
          <TouchableOpacity 
            style={[styles.selectBox, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}
            onPress={() => setModalType('project')}
          >
            <Text style={[styles.selectText, { color: form.project ? themeColors.text : '#666' }]}>
              {form.project || 'Sélectionner une diligence'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={themeColors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={[styles.label, { color: themeColors.textSecondary }]}>Échéance</Text>
            <View style={[styles.selectBox, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}>
              <TextInput 
                style={[styles.selectText, { color: themeColors.text, flex: 1 }]}
                placeholder="JJ/MM"
                placeholderTextColor="#666"
                value={form.deadline}
                onChangeText={(t) => setForm({...form, deadline: t})}
              />
              <Ionicons name="calendar-outline" size={18} color={themeColors.textSecondary} />
            </View>
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: themeColors.textSecondary }]}>Priorité</Text>
            <TouchableOpacity 
                style={[styles.selectBox, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}
                onPress={() => setModalType('priority')}
            >
              <Text style={[styles.selectText, { color: themeColors.text }]}>{form.priority}</Text>
              <Ionicons name="chevron-down" size={20} color={themeColors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: themeColors.textSecondary }]}>Assigner à</Text>
          <TouchableOpacity 
            style={[styles.selectBox, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}
            onPress={() => setModalType('assignee')}
          >
            <Text style={[styles.selectText, { color: form.assignee ? themeColors.text : '#666' }]}>
              {form.assignee || 'Choisir un collaborateur'}
            </Text>
            <Ionicons name="people-outline" size={20} color={themeColors.textSecondary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleCreate}>
          <Text style={styles.submitBtnText}>Créer la tâche</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Modal Universelle pour les sélections */}
      <Modal visible={modalType !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors.text }]}>Sélectionner</Text>
              <TouchableOpacity onPress={() => setModalType(null)}>
                <Ionicons name="close" size={24} color={themeColors.text} />
              </TouchableOpacity>
            </View>
            {renderModalContent()}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 55, paddingHorizontal: 20, paddingBottom: 25, borderBottomLeftRadius: 35, borderBottomRightRadius: 35, elevation: 5, zIndex: 10 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { padding: 5, marginLeft: -5 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  content: { padding: 24, paddingBottom: 100 },
  sectionTitle: { fontSize: 20, fontWeight: '800', marginBottom: 20 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  required: { color: '#e74c3c' },
  input: { height: 55, borderWidth: 1, borderRadius: 15, paddingHorizontal: 15, fontSize: 15, fontWeight: '500' },
  selectBox: { height: 55, borderWidth: 1, borderRadius: 15, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectText: { fontSize: 15, fontWeight: '500' },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  submitBtn: { backgroundColor: '#FFCC00', height: 60, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 10, elevation: 3 },
  submitBtnText: { color: '#000', fontSize: 16, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800' },
  optionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  optionText: { fontSize: 16, fontWeight: '500' },
  miniAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },
  miniAvatarText: { fontSize: 10, fontWeight: '800', color: '#666' }
});

