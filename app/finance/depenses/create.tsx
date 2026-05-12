import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Switch, Modal, FlatList, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

const MOCK_PROJECTS = [
  { id: '1', name: 'Audit Fiscal 2023', client: '2N IMMOBILIER' },
  { id: '2', name: 'Déclaration Sociale', client: '5 PAINS 2 POISSONS' },
  { id: '3', name: 'Constitution de Société', client: 'A & I VENTURE' },
  { id: '4', name: 'Conseil Juridique', client: 'AFRICA MOOV' },
];

const CATEGORIES = ['Achats', 'Transport', 'Restauration', 'Hébergement', 'Services', 'Communication', 'Autres'];
const PAYMENT_MODES = ['Espèces', 'Mobile Money', 'Virement', 'Chèque', 'Carte Bancaire'];

export default function CreateExpenseScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const [form, setForm] = useState({ 
    title: '', 
    amount: '', 
    date: '', 
    project: '', 
    category: '', 
    paymentMode: 'Espèces',
    hasVat: false,
    vatAmount: ''
  });

  const [modalType, setModalType] = useState<null | 'project' | 'category' | 'payment'>(null);
  const [projectSearch, setProjectSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const filteredProjects = MOCK_PROJECTS.filter(p => 
    p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
    p.client.toLowerCase().includes(projectSearch.toLowerCase())
  );

  const handleSaveExpense = () => {
    if (!form.title || !form.amount || !form.date || !form.category) {
      Alert.alert('Erreur', 'Veuillez remplir les champs obligatoires (*)');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Succès', 'Dépense enregistrée avec succès !', [
        { text: 'OK', onPress: () => router.push('/finance/depenses') }
      ]);
    }, 1500);
  };

  const renderModalContent = () => {
    if (modalType === 'project') {
       return (
         <View style={{ flex: 1 }}>
            <View style={[styles.modalSearch, { backgroundColor: themeColors.background }]}>
              <Ionicons name="search" size={18} color="#888" />
              <TextInput 
                placeholder="Rechercher une diligence..."
                placeholderTextColor="#888"
                style={[styles.modalSearchInput, { color: themeColors.text }]}
                value={projectSearch}
                onChangeText={setProjectSearch}
              />
            </View>
            <FlatList
              data={filteredProjects}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.optionItem, { borderBottomColor: themeColors.border }]}
                  onPress={() => { setForm({ ...form, project: item.name }); setModalType(null); setProjectSearch(''); }}
                >
                  <View>
                    <Text style={[styles.optionText, { color: themeColors.text }]}>{item.name}</Text>
                    <Text style={{ fontSize: 11, color: themeColors.textSecondary }}>{item.client}</Text>
                  </View>
                  {form.project === item.name && <Ionicons name="checkmark-circle" size={20} color="#FFCC00" />}
                </TouchableOpacity>
              )}
            />
         </View>
       );
    }

    const options = modalType === 'category' ? CATEGORIES : PAYMENT_MODES;
    const field = modalType === 'category' ? 'category' : 'paymentMode';

    return options.map((opt, i) => (
      <TouchableOpacity 
        key={opt}
        style={[styles.optionItem, { borderBottomColor: themeColors.border }]}
        onPress={() => { setForm({ ...form, [field as any]: opt }); setModalType(null); }}
      >
        <Text style={[styles.optionText, { color: themeColors.text }]}>{opt}</Text>
        {form[field as 'category' | 'paymentMode'] === opt && <Ionicons name="checkmark-circle" size={20} color="#FFCC00" />}
      </TouchableOpacity>
    ));
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={[styles.header, { backgroundColor: '#181818' }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFCC00" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nouvelle Dépense</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: themeColors.textSecondary }]}>Titre de la dépense <Text style={styles.required}>*</Text></Text>
          <TextInput 
            style={[styles.input, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground, color: themeColors.text }]}
            placeholder="Ex: Achat de fournitures"
            placeholderTextColor="#666"
            value={form.title}
            onChangeText={(t) => setForm({...form, title: t})}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={[styles.label, { color: themeColors.textSecondary }]}>Montant <Text style={styles.required}>*</Text></Text>
            <View style={[styles.amountBox, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}>
              <TextInput 
                style={[styles.amountInput, { color: themeColors.text }]}
                placeholder="0"
                placeholderTextColor="#666"
                keyboardType="numeric"
                value={form.amount}
                onChangeText={(t) => setForm({...form, amount: t})}
              />
              <Text style={[styles.currency, { color: themeColors.textSecondary }]}>XOF</Text>
            </View>
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: themeColors.textSecondary }]}>Date <Text style={styles.required}>*</Text></Text>
            <View style={[styles.selectBox, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}>
              <TextInput 
                style={[styles.selectText, { color: themeColors.text, flex: 1 }]}
                placeholder="JJ/MM/AAAA"
                placeholderTextColor="#666"
                value={form.date}
                onChangeText={(t) => setForm({...form, date: t})}
              />
              <Ionicons name="calendar-outline" size={18} color={themeColors.textSecondary} />
            </View>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: themeColors.textSecondary }]}>Catégorie <Text style={styles.required}>*</Text></Text>
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
          <Text style={[styles.label, { color: themeColors.textSecondary }]}>Mode de paiement</Text>
          <TouchableOpacity 
            style={[styles.selectBox, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}
            onPress={() => setModalType('payment')}
          >
            <Text style={[styles.selectText, { color: themeColors.text }]}>{form.paymentMode}</Text>
            <Ionicons name="card-outline" size={20} color={themeColors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: themeColors.textSecondary }]}>Assigner à un projet</Text>
          <TouchableOpacity 
            style={[styles.selectBox, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}
            onPress={() => setModalType('project')}
          >
            <Text style={[styles.selectText, { color: form.project ? themeColors.text : '#666' }]}>
              {form.project || 'Sélectionner un projet'}
            </Text>
            <Ionicons name="briefcase-outline" size={20} color={themeColors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.switchRow}>
           <View style={{ flex: 1 }}>
              <Text style={[styles.switchTitle, { color: themeColors.text }]}>Inclure la TVA ?</Text>
           </View>
           <Switch 
              value={form.hasVat}
              onValueChange={(v) => setForm({...form, hasVat: v})}
              trackColor={{ false: '#767577', true: 'rgba(255, 204, 0, 0.5)' }}
              thumbColor={form.hasVat ? '#FFCC00' : '#f4f3f4'}
           />
        </View>

        {form.hasVat && (
           <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: themeColors.textSecondary }]}>Montant TVA</Text>
              <TextInput 
                style={[styles.input, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground, color: themeColors.text }]}
                placeholder="Montant TVA"
                placeholderTextColor="#666"
                keyboardType="numeric"
                value={form.vatAmount}
                onChangeText={(t) => setForm({...form, vatAmount: t})}
              />
           </View>
        )}

        <View style={styles.uploadSection}>
           <Text style={[styles.label, { color: themeColors.textSecondary }]}>Justificatif (Reçu/Facture)</Text>
           <TouchableOpacity style={[styles.uploadBox, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}>
              <Ionicons name="camera-outline" size={32} color="#888" />
              <Text style={styles.uploadText}>Prendre une photo ou choisir un fichier</Text>
           </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.submitBtn, { opacity: loading ? 0.7 : 1 }]}
          onPress={handleSaveExpense}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.submitBtnText}>Enregistrer la dépense</Text>}
        </TouchableOpacity>
      </ScrollView>

      {/* Modal Universelle */}
      <Modal visible={modalType !== null} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors.text }]}>Sélectionner</Text>
              <TouchableOpacity onPress={() => setModalType(null)}>
                <Ionicons name="close" size={24} color={themeColors.text} />
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }}>
               {renderModalContent()}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 55, paddingHorizontal: 20, paddingBottom: 25, borderBottomLeftRadius: 35, borderBottomRightRadius: 35, elevation: 8, zIndex: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { padding: 5, marginLeft: -5 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  content: { padding: 24, paddingBottom: 100 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  required: { color: '#e74c3c' },
  input: { height: 55, borderWidth: 1, borderRadius: 15, paddingHorizontal: 15, fontSize: 15, fontWeight: '500' },
  amountBox: { height: 55, borderWidth: 1, borderRadius: 15, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center' },
  amountInput: { flex: 1, fontSize: 18, fontWeight: '800' },
  currency: { fontSize: 16, fontWeight: '700', marginLeft: 10 },
  selectBox: { height: 55, borderWidth: 1, borderRadius: 15, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectText: { fontSize: 15, fontWeight: '500' },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  switchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, paddingHorizontal: 5 },
  switchTitle: { fontSize: 15, fontWeight: '700' },
  uploadSection: { marginBottom: 30 },
  uploadBox: { height: 120, borderStyle: 'dashed', borderWidth: 2, borderRadius: 20, alignItems: 'center', justifyContent: 'center', gap: 10 },
  uploadText: { fontSize: 12, color: '#888', fontWeight: '600' },
  submitBtn: { backgroundColor: '#FFCC00', height: 65, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginTop: 10, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  submitBtnText: { color: '#000', fontSize: 16, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 35, borderTopRightRadius: 35, maxHeight: '70%', padding: 25 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800' },
  modalSearch: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, borderRadius: 12, height: 45, marginBottom: 15 },
  modalSearchInput: { flex: 1, marginLeft: 10, fontSize: 14 },
  optionItem: { paddingVertical: 18, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  optionText: { fontSize: 16, fontWeight: '600' },
});
