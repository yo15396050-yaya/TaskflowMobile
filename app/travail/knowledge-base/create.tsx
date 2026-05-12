import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

export default function CreateKnowledgeArticleScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const [toType, setToType] = useState<'employee' | 'client'>('employee');
  const [heading, setHeading] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = () => {
    // Logic to save
    router.back();
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <View style={[styles.header, { backgroundColor: '#181818' }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="close" size={26} color="#FFCC00" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nouvel Article</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>Enregistrer</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>Visibilité</Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity 
              style={[styles.radioButton, toType === 'employee' && styles.radioActive]} 
              onPress={() => setToType('employee')}
            >
              <Ionicons 
                name={toType === 'employee' ? "radio-button-on" : "radio-button-off"} 
                size={20} 
                color={toType === 'employee' ? "#FFCC00" : "#888"} 
              />
              <Text style={[styles.radioLabel, { color: themeColors.text }]}>Pour les employés</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.radioButton, toType === 'client' && styles.radioActive]} 
              onPress={() => setToType('client')}
            >
              <Ionicons 
                name={toType === 'client' ? "radio-button-on" : "radio-button-off"} 
                size={20} 
                color={toType === 'client' ? "#FFCC00" : "#888"} 
              />
              <Text style={[styles.radioLabel, { color: themeColors.text }]}>Pour les clients</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputSection}>
          <Text style={[styles.label, { color: themeColors.textSecondary }]}>Intitulé de l'article *</Text>
          <TextInput
            style={[styles.input, { color: themeColors.text, borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}
            placeholder="Ex: Procédure de validation"
            placeholderTextColor="#666"
            value={heading}
            onChangeText={setHeading}
          />
        </View>

        <View style={styles.inputSection}>
          <Text style={[styles.label, { color: themeColors.textSecondary }]}>Catégorie d'article *</Text>
          <TouchableOpacity style={[styles.selectBox, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}>
            <Text style={{ color: category ? themeColors.text : '#666' }}>
              {category || 'Sélectionner une catégorie'}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#888" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputSection}>
          <Text style={[styles.label, { color: themeColors.textSecondary }]}>Description</Text>
          <TextInput
            style={[styles.textArea, { color: themeColors.text, borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}
            placeholder="Écrivez le contenu de l'article ici..."
            placeholderTextColor="#666"
            multiline
            numberOfLines={10}
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <TouchableOpacity style={[styles.uploadBox, { borderColor: themeColors.border, borderStyle: 'dashed' }]}>
          <Ionicons name="cloud-upload-outline" size={32} color="#888" />
          <Text style={styles.uploadText}>Téléverser un fichier</Text>
          <Text style={styles.uploadSubtext}>JPG, PNG, PDF (Max 100MB)</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 20,
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
  },
  backBtn: { padding: 5 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  saveBtn: { 
    backgroundColor: '#FFCC00', 
    paddingHorizontal: 15, 
    paddingVertical: 8, 
    borderRadius: 12 
  },
  saveBtnText: { color: '#181818', fontWeight: '800', fontSize: 13 },
  formContainer: { flex: 1, padding: 20 },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 15 },
  radioGroup: { gap: 12 },
  radioButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 10, 
    padding: 12, 
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'transparent'
  },
  radioActive: {
    backgroundColor: 'rgba(255,204,0,0.05)',
    borderColor: 'rgba(255,204,0,0.2)'
  },
  radioLabel: { fontSize: 14, fontWeight: '600' },
  inputSection: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 10, marginLeft: 5 },
  input: {
    height: 50,
    borderRadius: 15,
    borderWidth: 1,
    paddingHorizontal: 15,
    fontSize: 15,
    fontWeight: '500',
  },
  selectBox: {
    height: 50,
    borderRadius: 15,
    borderWidth: 1,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textArea: {
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    fontSize: 15,
    fontWeight: '500',
    minHeight: 150,
  },
  uploadBox: {
    marginTop: 10,
    height: 150,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  uploadText: { color: '#555', fontSize: 15, fontWeight: '700', marginTop: 10 },
  uploadSubtext: { color: '#888', fontSize: 11, marginTop: 4 },
});
