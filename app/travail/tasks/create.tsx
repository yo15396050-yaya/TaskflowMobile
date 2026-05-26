import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface TaskFormData {
  heading: string;
  task_category_id: string;
  project_id: string;
  start_date: string;
  due_date: string;
  without_duedate: boolean;
  user_id: string[];
  description: string;
  task_labels: string[];
  milestone_id: string;
  board_column_id: string;
  priority: 'high' | 'medium' | 'low';
  inform_collaborator: boolean;
  all_employees: string[];
  inform_client: boolean;
  all_clients: string[];
  is_private: boolean;
  billable: boolean;
  set_time_estimate: boolean;
  estimate_hours: number;
  estimate_minutes: number;
  repeat: boolean;
  repeat_count: number;
  repeat_type: 'day' | 'week' | 'month' | 'year';
  repeat_cycles: number;
  dependent: boolean;
  dependent_task_id: string;
}

const PRIORITIES = [
  { label: 'Haute', value: 'high' },
  { label: 'Normale', value: 'medium' },
  { label: 'Basse', value: 'low' }
];

const BOARD_COLUMNS = [
  { label: 'Incomplète', value: '1' },
  { label: 'À faire', value: '2' },
  { label: 'En cours', value: '3' },
  { label: 'Terminée', value: '4' },
  { label: 'En attente d\'approbation', value: '5' }
];

const REPEAT_TYPES = [
  { label: 'Jours', value: 'day' },
  { label: 'Semaines', value: 'week' },
  { label: 'Mois', value: 'month' },
  { label: 'Année', value: 'year' }
];

// Données statiques - remplacer avec API calls en production
const PROJECTS = [
  { id: 1, project_code: 'AF-2023', project_name: 'Audit Fiscal 2023' },
  { id: 2, project_code: 'DS-2024', project_name: 'Déclaration Sociale' },
  { id: 3, project_code: 'CS-2024', project_name: 'Constitution de Société' },
  { id: 4, project_code: 'AIG', project_name: 'AIG SA' }
];

const CATEGORIES = [
  { id: 1, name: 'Urgente' },
  { id: 2, name: 'Standard' },
  { id: 3, name: 'Planification' }
];

const COLLABORATORS = [
  { id: 1, name: 'William G.', initial: 'WG' },
  { id: 2, name: 'John Doe', initial: 'JD' },
  { id: 3, name: 'Marie L.', initial: 'ML' }
];


export default function CreateTaskScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    dates: true,
    options: false
  });

  const [formData, setFormData] = useState<TaskFormData>({
    heading: '',
    task_category_id: '',
    project_id: '',
    start_date: new Date().toISOString().split('T')[0],
    due_date: new Date().toISOString().split('T')[0],
    without_duedate: false,
    user_id: [],
    description: '',
    task_labels: [],
    milestone_id: '',
    board_column_id: '2',
    priority: 'medium',
    inform_collaborator: false,
    all_employees: [],
    inform_client: false,
    all_clients: [],
    is_private: false,
    billable: false,
    set_time_estimate: false,
    estimate_hours: 0,
    estimate_minutes: 0,
    repeat: false,
    repeat_count: 1,
    repeat_type: 'day',
    repeat_cycles: 1,
    dependent: false,
    dependent_task_id: '',
  });

  const [modalType, setModalType] = useState<string | null>(null);

  const handleInputChange = (field: keyof TaskFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddAssignee = (collaborator: any) => {
    if (!formData.user_id.includes(collaborator.id.toString())) {
      setFormData(prev => ({
        ...prev,
        user_id: [...prev.user_id, collaborator.id.toString()]
      }));
    }
    setModalType(null);
  };

  const handleRemoveAssignee = (id: string) => {
    setFormData(prev => ({
      ...prev,
      user_id: prev.user_id.filter(uid => uid !== id)
    }));
  };

  const handleCreate = () => {
    if (!formData.heading.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un titre pour la tâche');
      return;
    }

    if (!formData.project_id) {
      Alert.alert('Erreur', 'Veuillez sélectionner une diligence');
      return;
    }

    // Ici faire un API call
    Alert.alert('Succès', 'Tâche créée avec succès !', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderModalContent = () => {
    if (modalType === 'project') {
      return PROJECTS.map((p) => (
        <TouchableOpacity 
          key={p.id} 
          style={styles.optionItem} 
          onPress={() => { 
            handleInputChange('project_id', p.id.toString());
            setModalType(null); 
          }}
        >
          <View>
            <Text style={[styles.optionText, { color: themeColors.text }]}>{p.project_name}</Text>
            <Text style={[styles.optionSubtext, { color: themeColors.textSecondary }]}>{p.project_code}</Text>
          </View>
          {formData.project_id === p.id.toString() && <Ionicons name="checkmark" size={20} color="#FFCC00" />}
        </TouchableOpacity>
      ));
    }
    if (modalType === 'category') {
      return CATEGORIES.map((c) => (
        <TouchableOpacity 
          key={c.id} 
          style={styles.optionItem} 
          onPress={() => { 
            handleInputChange('task_category_id', c.id.toString());
            setModalType(null); 
          }}
        >
          <Text style={[styles.optionText, { color: themeColors.text }]}>{c.name}</Text>
          {formData.task_category_id === c.id.toString() && <Ionicons name="checkmark" size={20} color="#FFCC00" />}
        </TouchableOpacity>
      ));
    }
    if (modalType === 'assignee') {
      return COLLABORATORS.map((c) => (
        <TouchableOpacity 
          key={c.id} 
          style={styles.optionItem} 
          onPress={() => handleAddAssignee(c)}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={styles.miniAvatar}>
              <Text style={styles.miniAvatarText}>{c.initial}</Text>
            </View>
            <Text style={[styles.optionText, { color: themeColors.text }]}>{c.name}</Text>
          </View>
          {formData.user_id.includes(c.id.toString()) && <Ionicons name="checkmark" size={20} color="#FFCC00" />}
        </TouchableOpacity>
      ));
    }
    if (modalType === 'priority') {
      return PRIORITIES.map((p) => (
        <TouchableOpacity 
          key={p.value} 
          style={styles.optionItem} 
          onPress={() => { 
            handleInputChange('priority', p.value);
            setModalType(null); 
          }}
        >
          <Text style={[styles.optionText, { color: themeColors.text }]}>{p.label}</Text>
          {formData.priority === p.value && <Ionicons name="checkmark" size={20} color="#FFCC00" />}
        </TouchableOpacity>
      ));
    }
    if (modalType === 'status') {
      return BOARD_COLUMNS.map((col) => (
        <TouchableOpacity 
          key={col.value} 
          style={styles.optionItem} 
          onPress={() => { 
            handleInputChange('board_column_id', col.value);
            setModalType(null); 
          }}
        >
          <Text style={[styles.optionText, { color: themeColors.text }]}>{col.label}</Text>
          {formData.board_column_id === col.value && <Ionicons name="checkmark" size={20} color="#FFCC00" />}
        </TouchableOpacity>
      ));
    }
    if (modalType === 'repeatType') {
      return REPEAT_TYPES.map((rt) => (
        <TouchableOpacity 
          key={rt.value} 
          style={styles.optionItem} 
          onPress={() => { 
            handleInputChange('repeat_type', rt.value);
            setModalType(null); 
          }}
        >
          <Text style={[styles.optionText, { color: themeColors.text }]}>{rt.label}</Text>
          {formData.repeat_type === rt.value && <Ionicons name="checkmark" size={20} color="#FFCC00" />}
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
        {/* Section Informations de base */}
        <CollapsibleSection 
          title="Informations de base"
          isExpanded={expandedSections.basic}
          onToggle={() => toggleSection('basic')}
          themeColors={themeColors}
        >
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: themeColors.textSecondary }]}>
              Titre de la tâche <Text style={styles.required}>*</Text>
            </Text>
            <TextInput 
              style={[styles.input, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground, color: themeColors.text }]}
              placeholder="Ex: Réviser les statuts"
              placeholderTextColor="#666"
              value={formData.heading}
              onChangeText={(t) => handleInputChange('heading', t)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: themeColors.textSecondary }]}>Catégorie de tâche</Text>
            <TouchableOpacity 
              style={[styles.selectBox, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}
              onPress={() => setModalType('category')}
            >
              <Text style={[styles.selectText, { color: formData.task_category_id ? themeColors.text : '#666' }]}>
                {CATEGORIES.find(c => c.id.toString() === formData.task_category_id)?.name || 'Sélectionner'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={themeColors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: themeColors.textSecondary }]}>Diligence / Projet <Text style={styles.required}>*</Text></Text>
            <TouchableOpacity 
              style={[styles.selectBox, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}
              onPress={() => setModalType('project')}
            >
              <Text style={[styles.selectText, { color: formData.project_id ? themeColors.text : '#666' }]}>
                {PROJECTS.find(p => p.id.toString() === formData.project_id)?.project_name || 'Sélectionner'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={themeColors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: themeColors.textSecondary }]}>Description</Text>
            <TextInput 
              style={[styles.input, styles.textArea, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground, color: themeColors.text }]}
              placeholder="Entrez la description de la tâche"
              placeholderTextColor="#666"
              value={formData.description}
              onChangeText={(t) => handleInputChange('description', t)}
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: themeColors.textSecondary }]}>Statut</Text>
            <TouchableOpacity 
              style={[styles.selectBox, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}
              onPress={() => setModalType('status')}
            >
              <Text style={[styles.selectText, { color: themeColors.text }]}>
                {BOARD_COLUMNS.find(c => c.value === formData.board_column_id)?.label}
              </Text>
              <Ionicons name="chevron-down" size={20} color={themeColors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={[styles.label, { color: themeColors.textSecondary }]}>Priorité</Text>
              <TouchableOpacity 
                style={[styles.selectBox, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}
                onPress={() => setModalType('priority')}
              >
                <Text style={[styles.selectText, { color: themeColors.text }]}>
                  {PRIORITIES.find(p => p.value === formData.priority)?.label}
                </Text>
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
              <Text style={[styles.selectText, { color: '#666' }]}>
                + Ajouter un collaborateur
              </Text>
              <Ionicons name="person-add" size={20} color={themeColors.textSecondary} />
            </TouchableOpacity>
          </View>

          {formData.user_id.length > 0 && (
            <View style={styles.assigneesList}>
              {formData.user_id.map(id => {
                const collaborator = COLLABORATORS.find(c => c.id.toString() === id);
                return collaborator ? (
                  <View key={id} style={[styles.assigneeTag, { backgroundColor: '#FFCC00' }]}>
                    <Text style={styles.assigneeTagText}>{collaborator.name}</Text>
                    <TouchableOpacity onPress={() => handleRemoveAssignee(id)}>
                      <Ionicons name="close" size={16} color="#000" />
                    </TouchableOpacity>
                  </View>
                ) : null;
              })}
            </View>
          )}
        </CollapsibleSection>

        {/* Section Dates */}
        <CollapsibleSection 
          title="Dates et échéance"
          isExpanded={expandedSections.dates}
          onToggle={() => toggleSection('dates')}
          themeColors={themeColors}
        >
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={[styles.label, { color: themeColors.textSecondary }]}>Date de début</Text>
              <View style={[styles.selectBox, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}>
                <TextInput
                  style={[styles.selectText, { color: themeColors.text, flex: 1 }]}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#999"
                  value={formData.start_date}
                  onChangeText={(text) => handleInputChange('start_date', text)}
                />
                <Ionicons name="calendar-outline" size={20} color={themeColors.textSecondary} />
              </View>
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.label, { color: themeColors.textSecondary }]}>Date d'échéance</Text>
              <View style={[styles.selectBox, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground, opacity: formData.without_duedate ? 0.5 : 1 }]}>
                <TextInput
                  style={[styles.selectText, { color: formData.without_duedate ? '#999' : themeColors.text, flex: 1 }]}
                  placeholder={formData.without_duedate ? 'Sans date' : 'YYYY-MM-DD'}
                  placeholderTextColor="#999"
                  value={formData.without_duedate ? '' : formData.due_date}
                  onChangeText={(text) => handleInputChange('due_date', text)}
                  editable={!formData.without_duedate}
                />
                <Ionicons name="calendar-outline" size={20} color={themeColors.textSecondary} />
              </View>
            </View>
          </View>

          <View style={styles.switchRow}>
            <Switch
              value={formData.without_duedate}
              onValueChange={(value) => handleInputChange('without_duedate', value)}
              trackColor={{ false: '#ccc', true: '#FFCC00' }}
              thumbColor={formData.without_duedate ? '#FFF' : '#fff'}
            />
            <Text style={[styles.switchLabel, { color: themeColors.text }]}>Sans date d'échéance</Text>
          </View>
        </CollapsibleSection>

        {/* Section Options */}
        <CollapsibleSection 
          title="Options avancées"
          isExpanded={expandedSections.options}
          onToggle={() => toggleSection('options')}
          themeColors={themeColors}
        >
          <View style={styles.optionGroup}>
            <View style={styles.switchRow}>
              <Switch
                value={formData.is_private}
                onValueChange={(value) => handleInputChange('is_private', value)}
                trackColor={{ false: '#ccc', true: '#FFCC00' }}
                thumbColor={formData.is_private ? '#FFF' : '#fff'}
              />
              <Text style={[styles.switchLabel, { color: themeColors.text }]}>Tâche privée</Text>
            </View>

            <View style={styles.switchRow}>
              <Switch
                value={formData.billable}
                onValueChange={(value) => handleInputChange('billable', value)}
                trackColor={{ false: '#ccc', true: '#FFCC00' }}
                thumbColor={formData.billable ? '#FFF' : '#fff'}
              />
              <Text style={[styles.switchLabel, { color: themeColors.text }]}>Facturable</Text>
            </View>

            <View style={styles.switchRow}>
              <Switch
                value={formData.set_time_estimate}
                onValueChange={(value) => handleInputChange('set_time_estimate', value)}
                trackColor={{ false: '#ccc', true: '#FFCC00' }}
                thumbColor={formData.set_time_estimate ? '#FFF' : '#fff'}
              />
              <Text style={[styles.switchLabel, { color: themeColors.text }]}>Estimation du temps</Text>
            </View>

            {formData.set_time_estimate && (
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 0.5, marginRight: 8 }]}>
                  <TextInput
                    style={[styles.input, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground, color: themeColors.text }]}
                    placeholder="Heures"
                    value={formData.estimate_hours.toString()}
                    onChangeText={(text) => handleInputChange('estimate_hours', parseInt(text) || 0)}
                    keyboardType="number-pad"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 0.5 }]}>
                  <TextInput
                    style={[styles.input, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground, color: themeColors.text }]}
                    placeholder="Minutes"
                    value={formData.estimate_minutes.toString()}
                    onChangeText={(text) => handleInputChange('estimate_minutes', parseInt(text) || 0)}
                    keyboardType="number-pad"
                  />
                </View>
              </View>
            )}

            <View style={styles.switchRow}>
              <Switch
                value={formData.repeat}
                onValueChange={(value) => handleInputChange('repeat', value)}
                trackColor={{ false: '#ccc', true: '#FFCC00' }}
                thumbColor={formData.repeat ? '#FFF' : '#fff'}
              />
              <Text style={[styles.switchLabel, { color: themeColors.text }]}>Répéter</Text>
            </View>

            {formData.repeat && (
              <View>
                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 0.3, marginRight: 8 }]}>
                    <Text style={[styles.label, { color: themeColors.textSecondary }]}>Tous les</Text>
                    <TextInput
                      style={[styles.input, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground, color: themeColors.text }]}
                      placeholder="1"
                      value={formData.repeat_count.toString()}
                      onChangeText={(text) => handleInputChange('repeat_count', parseInt(text) || 1)}
                      keyboardType="number-pad"
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 0.7 }]}>
                    <Text style={[styles.label, { color: themeColors.textSecondary }]}>Unité</Text>
                    <TouchableOpacity 
                      style={[styles.selectBox, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}
                      onPress={() => setModalType('repeatType')}
                    >
                      <Text style={[styles.selectText, { color: themeColors.text }]}>
                        {REPEAT_TYPES.find(rt => rt.value === formData.repeat_type)?.label}
                      </Text>
                      <Ionicons name="chevron-down" size={20} color={themeColors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: themeColors.textSecondary }]}>Nombre de cycles</Text>
                  <TextInput
                    style={[styles.input, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground, color: themeColors.text }]}
                    placeholder="Nombre de fois à répéter"
                    value={formData.repeat_cycles.toString()}
                    onChangeText={(text) => handleInputChange('repeat_cycles', parseInt(text) || 1)}
                    keyboardType="number-pad"
                  />
                </View>
              </View>
            )}
          </View>
        </CollapsibleSection>

        <TouchableOpacity 
          style={styles.submitBtn} 
          onPress={handleCreate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.submitBtnText}>Créer la tâche</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.submitBtn, { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#FFCC00', marginTop: 10 }]}
          onPress={() => router.back()}
          disabled={loading}
        >
          <Text style={[styles.submitBtnText, { color: '#FFCC00' }]}>Annuler</Text>
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

interface CollapsibleSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  themeColors: any;
  children: React.ReactNode;
}

function CollapsibleSection({ title, isExpanded, onToggle, themeColors, children }: CollapsibleSectionProps) {
  return (
    <View style={styles.collapsibleSection}>
      <TouchableOpacity 
        style={styles.sectionHeader}
        onPress={onToggle}
      >
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{title}</Text>
        <Ionicons 
          name={isExpanded ? "chevron-up" : "chevron-down"} 
          size={24} 
          color="#FFCC00" 
        />
      </TouchableOpacity>
      {isExpanded && <View style={styles.sectionContent}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 55, paddingHorizontal: 20, paddingBottom: 25, borderBottomLeftRadius: 35, borderBottomRightRadius: 35, elevation: 5, zIndex: 10 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { padding: 5, marginLeft: -5 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  content: { padding: 16, paddingBottom: 100 },
  
  // Sections
  collapsibleSection: { marginBottom: 16, borderRadius: 15, overflow: 'hidden' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16, backgroundColor: 'rgba(255, 204, 0, 0.1)', borderWidth: 1, borderColor: 'rgba(255, 204, 0, 0.3)' },
  sectionTitle: { fontSize: 16, fontWeight: '800' },
  sectionContent: { padding: 16, backgroundColor: 'rgba(255, 204, 0, 0.05)' },
  
  // Form Elements
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  required: { color: '#e74c3c' },
  input: { height: 50, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, fontSize: 14, fontWeight: '500' },
  textArea: { minHeight: 100, paddingTop: 12, paddingBottom: 12 },
  selectBox: { height: 50, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectText: { fontSize: 14, fontWeight: '500', flex: 1 },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  
  // Switches
  switchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingVertical: 8 },
  switchLabel: { marginLeft: 12, fontSize: 14, fontWeight: '500' },
  optionGroup: { marginVertical: 8 },
  
  // Assignees
  assigneesList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  assigneeTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 8 },
  assigneeTagText: { fontSize: 12, fontWeight: '600', color: '#000' },
  
  // Buttons
  submitBtn: { backgroundColor: '#FFCC00', height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 20, elevation: 3 },
  submitBtnText: { color: '#000', fontSize: 16, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, paddingBottom: 40, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800' },
  optionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  optionText: { fontSize: 15, fontWeight: '500' },
  optionSubtext: { fontSize: 12, marginTop: 4 },
  miniAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFCC00', justifyContent: 'center', alignItems: 'center' },
  miniAvatarText: { fontSize: 11, fontWeight: '800', color: '#000' }
});

