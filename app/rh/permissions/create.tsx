import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import api from '@/services/api-service';

const LEAVE_TYPES = [
  'Congé Annuel',
  'Permission Maladie',
  'Urgence Personnelle',
  'Congé Maternité/Paternité',
  'Formation',
  'Autre'
];

export default function CreatePermissionScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const [form, setForm] = useState({ type: '', startDate: '', endDate: '', reason: '' });
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.type || !form.startDate || !form.endDate) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires (*)');
      return;
    }

    setLoading(true);
    try {
      await api.post('/rh/permissions', {
        type: form.type,
        start_date: form.startDate,
        end_date: form.endDate,
        reason: form.reason,
      });

      Alert.alert(
        'Succès',
        'Votre demande de permission a été soumise avec succès.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      console.error('Erreur lors de la soumission:', error.response?.data || error.message);
      Alert.alert('Erreur', 'Impossible de soumettre la demande. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };


  const selectType = (type: string) => {
    setForm({ ...form, type });
    setShowTypeModal(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={[styles.header, { backgroundColor: '#181818' }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFCC00" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Demander un Congé</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: themeColors.textSecondary }]}>
            Type d'absence <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity 
            style={[styles.selectBox, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}
            onPress={() => setShowTypeModal(true)}
          >
            <Text style={[styles.selectText, { color: form.type ? themeColors.text : '#aaa' }]}>
              {form.type || 'Sélectionner (Maladie, Annuel...)'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={themeColors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={[styles.label, { color: themeColors.textSecondary }]}>Début <Text style={styles.required}>*</Text></Text>
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
            <Text style={[styles.label, { color: themeColors.textSecondary }]}>Fin <Text style={styles.required}>*</Text></Text>
            <View style={[styles.selectBox, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}>
               <TextInput 
                style={[styles.selectText, { color: themeColors.text, flex: 1 }]}
                placeholder="JJ/MM/AAAA"
                placeholderTextColor="#666"
                value={form.endDate}
                onChangeText={(t) => setForm({...form, endDate: t})}
              />
              <Ionicons name="calendar-outline" size={18} color={themeColors.textSecondary} />
            </View>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: themeColors.textSecondary }]}>
            Motif / Détails
          </Text>
          <TextInput 
            style={[styles.inputArea, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground, color: themeColors.text }]}
            placeholder="Précisez la raison de votre demande..."
            placeholderTextColor="#666"
            multiline
            numberOfLines={4}
            value={form.reason}
            onChangeText={(t) => setForm({...form, reason: t})}
          />
        </View>

        <TouchableOpacity 
          style={[styles.submitBtn, { opacity: loading ? 0.7 : 1 }]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.submitBtnText}>Soumettre la demande</Text>
          )}
        </TouchableOpacity>


      </ScrollView>

      {/* Modal pour le type de congé */}
      <Modal visible={showTypeModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors.text }]}>Type d'absence</Text>
              <TouchableOpacity onPress={() => setShowTypeModal(false)}>
                <Ionicons name="close" size={24} color={themeColors.text} />
              </TouchableOpacity>
            </View>
            {LEAVE_TYPES.map((item, index) => (
              <TouchableOpacity 
                key={index} 
                style={[styles.typeOption, index !== LEAVE_TYPES.length - 1 && { borderBottomWidth: 1, borderBottomColor: themeColors.border }]}
                onPress={() => selectType(item)}
              >
                <Text style={[styles.typeOptionText, { color: themeColors.text }]}>{item}</Text>
                {form.type === item && <Ionicons name="checkmark" size={20} color="#FFCC00" />}
              </TouchableOpacity>
            ))}
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
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  required: { color: '#e74c3c' },
  selectBox: { height: 55, borderWidth: 1, borderRadius: 15, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectText: { fontSize: 15, fontWeight: '500' },
  inputArea: { height: 120, borderWidth: 1, borderRadius: 15, paddingHorizontal: 15, paddingTop: 15, fontSize: 15, fontWeight: '500', textAlignVertical: 'top' },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  submitBtn: { backgroundColor: '#FFCC00', height: 60, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 10, elevation: 3 },
  submitBtnText: { color: '#000', fontSize: 16, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800' },
  typeOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18 },
  typeOptionText: { fontSize: 16, fontWeight: '500' }
});

