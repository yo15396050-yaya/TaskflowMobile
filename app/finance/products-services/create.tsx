import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Switch,
  Alert,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function CreateProductScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  // État du formulaire
  const [formData, setFormData] = useState({
    name: '',
    price: '0',
    category: '',
    subCategory: '',
    tax: '',
    hsnSac: '',
    unitType: '1',
    canPurchase: false,
    isDownloadable: false,
    sku: '',
    description: '',
  });

  const handleSave = () => {
    if (!formData.name || !formData.price) {
      Alert.alert('Erreur', 'Veuillez remplir les champs obligatoires (*)');
      return;
    }
    
    Alert.alert('Succès', 'Produit enregistré avec succès', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: '#181818' }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ajouter des produits</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView 
        style={styles.formContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: themeColors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Informations Générales</Text>
          
          {/* Nom */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: themeColors.textSecondary }]}>Nom <Text style={{ color: '#e74c3c' }}>*</Text></Text>
            <TextInput
              style={[styles.input, { borderColor: themeColors.border, color: themeColors.text }]}
              placeholder="ex: Hébergement Web, Ordinateur..."
              placeholderTextColor="#999"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
          </View>

          {/* Prix */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: themeColors.textSecondary }]}>Prix <Text style={{ color: '#e74c3c' }}>*</Text></Text>
            <TextInput
              style={[styles.input, { borderColor: themeColors.border, color: themeColors.text }]}
              placeholder="0"
              keyboardType="numeric"
              value={formData.price}
              onChangeText={(text) => setFormData({ ...formData, price: text })}
            />
          </View>

          <View style={styles.row}>
            {/* Catégorie */}
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={[styles.label, { color: themeColors.textSecondary }]}>Catégorie</Text>
              <TouchableOpacity style={[styles.selectBtn, { borderColor: themeColors.border }]}>
                <Text style={{ color: formData.category ? themeColors.text : '#999' }}>
                  {formData.category || 'Choisir...'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={themeColors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Sous-catégorie */}
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.label, { color: themeColors.textSecondary }]}>Sous-catégorie</Text>
              <TouchableOpacity style={[styles.selectBtn, { borderColor: themeColors.border }]}>
                <Text style={{ color: formData.subCategory ? themeColors.text : '#999' }}>
                  {formData.subCategory || 'Choisir...'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={themeColors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: themeColors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Détails Techniques</Text>

          {/* HSN/SAC */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: themeColors.textSecondary }]}>HSN/SAC</Text>
            <TextInput
              style={[styles.input, { borderColor: themeColors.border, color: themeColors.text }]}
              placeholder="ex: 995431"
              value={formData.hsnSac}
              onChangeText={(text) => setFormData({ ...formData, hsnSac: text })}
            />
          </View>

          {/* SKU */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: themeColors.textSecondary }]}>UGS (SKU)</Text>
            <TextInput
              style={[styles.input, { borderColor: themeColors.border, color: themeColors.text }]}
              placeholder="SKU du produit"
              value={formData.sku}
              onChangeText={(text) => setFormData({ ...formData, sku: text })}
            />
          </View>

          {/* Unit Type */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: themeColors.textSecondary }]}>Type d'unité</Text>
            <TouchableOpacity style={[styles.selectBtn, { borderColor: themeColors.border }]}>
              <Text style={{ color: themeColors.text }}>Unité par défaut</Text>
              <Ionicons name="chevron-down" size={20} color={themeColors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: themeColors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Options</Text>

          {/* Switches */}
          <View style={styles.switchGroup}>
            <View style={styles.switchLabel}>
              <Text style={[styles.labelBold, { color: themeColors.text }]}>Le client peut acheter</Text>
              <Text style={[styles.subLabel, { color: themeColors.textSecondary }]}>Permettre l'achat direct via le portail</Text>
            </View>
            <Switch
              value={formData.canPurchase}
              onValueChange={(val) => setFormData({ ...formData, canPurchase: val })}
              trackColor={{ false: '#767577', true: '#FFCC00' }}
              thumbColor={Platform.OS === 'ios' ? '#FFF' : formData.canPurchase ? '#FFF' : '#f4f3f4'}
            />
          </View>

          <View style={[styles.switchGroup, { marginTop: 20 }]}>
            <View style={styles.switchLabel}>
              <Text style={[styles.labelBold, { color: themeColors.text }]}>Téléchargeable</Text>
              <Text style={[styles.subLabel, { color: themeColors.textSecondary }]}>Donne accès à un fichier après achat</Text>
            </View>
            <Switch
              value={formData.isDownloadable}
              onValueChange={(val) => setFormData({ ...formData, isDownloadable: val })}
              trackColor={{ false: '#767577', true: '#FFCC00' }}
              thumbColor={Platform.OS === 'ios' ? '#FFF' : formData.isDownloadable ? '#FFF' : '#f4f3f4'}
            />
          </View>

          {formData.isDownloadable && (
            <TouchableOpacity style={styles.uploadBox}>
              <Ionicons name="cloud-upload-outline" size={32} color="#FFCC00" />
              <Text style={styles.uploadText}>Choisir le fichier téléchargeable</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={[styles.card, { backgroundColor: themeColors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Description</Text>
          <TextInput
            style={[styles.textArea, { borderColor: themeColors.border, color: themeColors.text }]}
            placeholder="Décrivez votre produit ou service ici..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
          />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Sauvegarder</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 25,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: '800' },
  formContainer: { flex: 1, padding: 20 },
  scrollContent: { paddingBottom: 20 },
  card: {
    borderRadius: 25,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 20, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginLeft: 5 },
  labelBold: { fontSize: 15, fontWeight: '700' },
  subLabel: { fontSize: 11, marginTop: 2 },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 15,
    fontSize: 14,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  textArea: {
    minHeight: 100,
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  row: { flexDirection: 'row' },
  selectBtn: {
    height: 50,
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  switchGroup: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  switchLabel: { flex: 1 },
  uploadBox: {
    marginTop: 20,
    height: 100,
    borderWidth: 2,
    borderColor: '#FFCC00',
    borderStyle: 'dashed',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 204, 0, 0.05)',
  },
  uploadText: { color: '#FFCC00', fontSize: 13, fontWeight: '700', marginTop: 8 },
  saveBtn: {
    backgroundColor: '#FFCC00',
    height: 55,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFCC00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    marginTop: 10,
  },
  saveBtnText: { color: '#000', fontSize: 16, fontWeight: '800' },
});
