import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Switch, Modal, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

const DEPARTMENTS = ['RH', 'FINANCE', 'AUDIT & COMPTABILITÉ', 'JURIDIQUE', 'CONSEIL'];
const CATEGORIES = ['Audit Fiscal', 'Déclaration Sociale', 'Constitution Société', 'Conseil Juridique', 'Gestion Paie'];
const CLIENTS = ['2N IMMOBILIER', '5 PAINS 2 POISSONS', 'A & I VENTURE', 'AFRICA MOOV', 'AIG SA'];

export default function CreateDiligenceScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const [form, setForm] = useState({
    code: 'DLG#075',
    name: '',
    startDate: '',
    deadline: '',
    withoutDeadline: false,
    department: '',
    category: '',
    client: ''
  });

  const [modalType, setModalType] = useState<null | 'department' | 'category' | 'client'>(null);

  const handleSubmit = () => {
    if (!form.name || !form.department || (!form.deadline && !form.withoutDeadline)) {
      Alert.alert('Erreur', 'Veuillez remplir les champs obligatoires (*)');
      return;
    }

    Alert.alert('Succès', 'Diligence enregistrée avec succès !', [
      { text: 'OK', onPress: () => router.push('/(tabs)/diligences') }
    ]);
  };

  const renderModalContent = () => {
    let options: string[] = [];
    let field: keyof typeof form = 'department';

    if (modalType === 'department') { options = DEPARTMENTS; field = 'department'; }
    if (modalType === 'category') { options = CATEGORIES; field = 'category'; }
    if (modalType === 'client') { options = CLIENTS; field = 'client'; }

    return options.map((opt, i) => (
      <TouchableOpacity 
        key={i} 
        style={styles.optionItem} 
        onPress={() => { setForm({...form, [field]: opt}); setModalType(null); }}
      >
        <Text style={[styles.optionText, { color: themeColors.text }]}>{opt}</Text>
        {form[field] === opt && <Ionicons name="checkmark" size={20} color="#FFCC00" />}
      </TouchableOpacity>
    ));
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: '#181818' }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFCC00" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ajouter une diligence</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Détails de la diligence</Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: themeColors.textSecondary }]}>Département <Text style={styles.required}>*</Text></Text>
          <TouchableOpacity 
            style={[styles.selectBox, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}
            onPress={() => setModalType('department')}
          >
            <Text style={[styles.selectText, { color: form.department ? themeColors.text : '#666' }]}>
              {form.department || 'Sélectionner un département'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={themeColors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: themeColors.textSecondary }]}>#Code</Text>
          <TextInput 
            style={[styles.input, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground, color: themeColors.textSecondary, opacity: 0.7 }]}
            value={form.code}
            editable={false}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: themeColors.textSecondary }]}>
            Nom de la diligence <Text style={styles.required}>*</Text>
          </Text>
          <TextInput 
            style={[styles.input, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground, color: themeColors.text }]}
            placeholder="Ex: Audit Fiscal 2023"
            placeholderTextColor="#666"
            value={form.name}
            onChangeText={(t) => setForm({...form, name: t})}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={[styles.label, { color: themeColors.textSecondary }]}>
              Date de début <Text style={styles.required}>*</Text>
            </Text>
            <View style={[styles.selectBox, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}>
              <TextInput 
                style={[styles.selectText, { color: themeColors.text, flex: 1 }]}
                placeholder="JJ/MM/AAAA"
                placeholderTextColor="#666"
                value={form.startDate}
                onChangeText={(t) => setForm({...form, startDate: t})}
              />
              <Ionicons name="calendar-outline" size={18} color={themeColors.textSecondary} />
            </View>
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: themeColors.textSecondary }]}>
              Date limite {!form.withoutDeadline && <Text style={styles.required}>*</Text>}
            </Text>
            <View 
                style={[styles.selectBox, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground, opacity: form.withoutDeadline ? 0.5 : 1 }]}
            >
              <TextInput 
                style={[styles.selectText, { color: themeColors.text, flex: 1 }]}
                placeholder="JJ/MM/AAAA"
                placeholderTextColor="#666"
                value={form.deadline}
                onChangeText={(t) => setForm({...form, deadline: t})}
                disabled={form.withoutDeadline}
              />
              <Ionicons name="calendar-outline" size={18} color={themeColors.textSecondary} />
            </View>
          </View>
        </View>

        <View style={styles.switchRow}>
          <Switch 
            value={form.withoutDeadline}
            onValueChange={(v) => setForm({...form, withoutDeadline: v})}
            trackColor={{ false: '#767577', true: 'rgba(255, 204, 0, 0.5)' }}
            thumbColor={form.withoutDeadline ? '#FFCC00' : '#f4f3f4'}
          />
          <Text style={[styles.switchLabel, { color: themeColors.textSecondary }]}>
            Il n'y a pas de date limite
          </Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: themeColors.textSecondary }]}>Catégorie de diligence</Text>
          <TouchableOpacity 
            style={[styles.selectBox, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}
            onPress={() => setModalType('category')}
          >
            <Text style={[styles.selectText, { color: form.category ? themeColors.text : '#666' }]}>
              {form.category || 'Sélectionner une catégorie'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={themeColors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: themeColors.textSecondary }]}>Client</Text>
          <TouchableOpacity 
            style={[styles.selectBox, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}
            onPress={() => setModalType('client')}
          >
            <Text style={[styles.selectText, { color: form.client ? themeColors.text : '#666' }]}>
              {form.client || 'Sélectionner un client'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={themeColors.textSecondary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>Enregistrer la diligence</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Modal Universelle */}
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
  switchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 25, marginTop: -5 },
  switchLabel: { marginLeft: 10, fontSize: 14, flex: 1, fontWeight: '500' },
  submitBtn: { backgroundColor: '#FFCC00', height: 60, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 10, elevation: 3 },
  submitBtnText: { color: '#000', fontSize: 16, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800' },
  optionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  optionText: { fontSize: 16, fontWeight: '500' }
});

