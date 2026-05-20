import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import api from '@/services/api-service';

// --- COMPOSANTS EXTRAITS POUR ÉVITER LES RE-RENDUS (Fix Focus Clavier) ---

const InputLabel = ({ label, required, themeColors }: any) => (
  <Text style={[styles.label, { color: themeColors.text }]}>
    {label} {required && <Text style={{ color: '#e74c3c' }}>*</Text>}
  </Text>
);

const FormInput = ({ label, icon, placeholder, value, onChangeText, secureTextEntry, keyboardType, required, themeColors }: any) => (
  <View style={styles.inputGroup}>
    <InputLabel label={label} required={required} themeColors={themeColors} />
    <View style={[styles.inputWrapper, { borderColor: themeColors.border }]}>
      <Ionicons name={icon} size={20} color="#888" style={styles.inputIcon} />
      <TextInput
        style={[styles.input, { color: themeColors.text }]}
        placeholder={placeholder}
        placeholderTextColor="#888"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
      />
    </View>
  </View>
);

const PickerTrigger = ({ label, icon, value, onPress, required, themeColors }: any) => (
  <View style={styles.inputGroup}>
    <InputLabel label={label} required={required} themeColors={themeColors} />
    <TouchableOpacity style={[styles.inputWrapper, { borderColor: themeColors.border }]} onPress={onPress}>
      <Ionicons name={icon} size={20} color="#888" style={styles.inputIcon} />
      <Text style={[styles.input, { color: value ? themeColors.text : '#888', paddingTop: 15 }]}>
        {value || 'Choisir...'}
      </Text>
      <Ionicons name="chevron-down" size={20} color="#888" />
    </TouchableOpacity>
  </View>
);

const PickerItem = ({ item, themeColors, isSelected, onSelect }: any) => (
  <TouchableOpacity 
    style={[styles.pickerItem, { borderBottomColor: themeColors.border }]} 
    onPress={() => onSelect(item)}
  >
    <Text style={[styles.pickerItemText, { color: themeColors.text }]}>{item.name || item.heading}</Text>
    {isSelected && (
      <Ionicons name="checkmark" size={20} color="#FFCC00" />
    )}
  </TouchableOpacity>
);

// --- ÉCRAN PRINCIPAL ---

export default function CreateEmployeeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const [form, setForm] = useState({
    employee_id: '',
    name: '',
    email: '',
    password: '',
    mobile: '',
    address: '',
    gender: 'male',
    marital_status: 'single',
    joining_date: new Date().toISOString().split('T')[0],
    designation_id: '',
    department_id: '',
    parent_id: '', // Responsable hiérarchique
  });

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    departments: [], 
    designations: [],
    employees: [] // Pour la liste des responsables
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [activePicker, setActivePicker] = useState<any>(null);

  useEffect(() => {
    fetchFormData();
  }, []);

  const fetchFormData = async () => {
    try {
      const response = await api.get('/employee-form-data');
      setFormData(response.data);
      
      // Tentative de trouver Constant Keyman par défaut
      const constant = response.data.employees?.find((e: any) => e.name.includes('Constant'));
      if (constant) {
        setForm(prev => ({ ...prev, parent_id: constant.id.toString() }));
      }
    } catch (error) {
      console.error('Erreur data form:', error);
    }
  };

  const updateForm = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.employee_id || !form.password) {
      Alert.alert('Erreur', 'Veuillez remplir les champs obligatoires (*)');
      return;
    }

    setLoading(true);
    try {
      await api.post('/employees', form);
      Alert.alert('Succès', 'Employé créé avec succès', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Erreur creation employé:', error.response?.data || error.message);
      Alert.alert('Échec', error.response?.data?.error || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const openPicker = (type: string, title: string, data: any[]) => {
    setActivePicker({ type, title, data });
    setModalVisible(true);
  };

  const getSelectedName = (type: string, id: string) => {
    if (!id) return 'Choisir...';
    let list = [];
    if (type === 'department_id') list = formData.departments;
    else if (type === 'designation_id') list = formData.designations;
    else if (type === 'parent_id') list = formData.employees;
    
    const found = (list as any[]).find(item => item.id.toString() === id);
    return found ? (found.name || found.heading) : 'Choisir...';
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <View style={[styles.header, { backgroundColor: '#181818' }]}>
        <View style={styles.titleRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFCC00" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nouvel Employé</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.formContainer}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Identifiants & Profil</Text>
          
          <FormInput
            label="ID d'employé"
            icon="id-card-outline"
            placeholder="Ex: EMP-28"
            value={form.employee_id}
            onChangeText={(val: string) => updateForm('employee_id', val)}
            required
            themeColors={themeColors}
          />

          <FormInput
            label="Nom complet"
            icon="person-outline"
            placeholder="Ex: Ouattara Zanga"
            value={form.name}
            onChangeText={(val: string) => updateForm('name', val)}
            required
            themeColors={themeColors}
          />

          <FormInput
            label="Email"
            icon="mail-outline"
            placeholder="email@exemple.com"
            value={form.email}
            onChangeText={(val: string) => updateForm('email', val)}
            keyboardType="email-address"
            required
            themeColors={themeColors}
          />

          <FormInput
            label="Mot de passe"
            icon="lock-closed-outline"
            placeholder="Minimum 8 caractères"
            value={form.password}
            onChangeText={(val: string) => updateForm('password', val)}
            secureTextEntry
            required
            themeColors={themeColors}
          />

          <Text style={[styles.sectionTitle, { color: themeColors.text, marginTop: 20 }]}>Poste & Hiérarchie</Text>
          
          <PickerTrigger
            label="Département"
            icon="business-outline"
            value={getSelectedName('department_id', form.department_id)}
            onPress={() => openPicker('department_id', 'Sélectionner un département', formData.departments)}
            required
            themeColors={themeColors}
          />

          <PickerTrigger
            label="Désignation (Poste)"
            icon="briefcase-outline"
            value={getSelectedName('designation_id', form.designation_id)}
            onPress={() => openPicker('designation_id', 'Sélectionner une désignation', formData.designations)}
            required
            themeColors={themeColors}
          />

          <PickerTrigger
            label="Responsable Hiérarchique"
            icon="people-outline"
            value={getSelectedName('parent_id', form.parent_id)}
            onPress={() => openPicker('parent_id', 'Sélectionner un responsable', formData.employees)}
            themeColors={themeColors}
          />

          <TouchableOpacity 
            style={[styles.submitButton, { backgroundColor: '#FFCC00', opacity: loading ? 0.7 : 1 }]} 
            onPress={handleCreate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.submitButtonText}>ENREGISTRER L'EMPLOYÉ</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Picker Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors.text }]}>{activePicker?.title}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={themeColors.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={activePicker?.data}
              renderItem={({ item }) => (
                <PickerItem 
                  item={item} 
                  themeColors={themeColors} 
                  isSelected={form[activePicker.type as keyof typeof form] === item.id.toString()} 
                  onSelect={(selectedItem: any) => {
                    updateForm(activePicker.type, selectedItem.id.toString());
                    setModalVisible(false);
                  }} 
                />
              )}
              keyExtractor={item => item.id.toString()}
              contentContainerStyle={{ paddingBottom: 40 }}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
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
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: '800' },
  backBtn: { padding: 5 },
  scrollContainer: { padding: 20, paddingBottom: 60 },
  formContainer: { marginTop: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 20, opacity: 0.9 },
  inputGroup: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 8, opacity: 0.7, textTransform: 'uppercase' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 15,
    height: 54,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, height: '100%', fontSize: 15 },
  submitButton: {
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 35,
    shadowColor: '#FFCC00',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  submitButtonText: { color: '#000', fontSize: 16, fontWeight: '900' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: '60%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalTitle: { fontSize: 18, fontWeight: '800' },
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
  },
  pickerItemText: { fontSize: 16, fontWeight: '500' },
});
