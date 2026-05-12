import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, FlatList, Alert, ActivityIndicator } from 'react-native';

const MOCK_CLIENTS_DATA = [
  { id: '122', name: '2N IMMOBILIER' },
  { id: '283', name: '2TK & ASSOCIES' },
  { id: '123', name: '5 PAINS 2 POISSONS' },
  { id: '330', name: 'A & I VENTURE' },
  { id: '305', name: 'ABE AHOUA Sopie Bernadette' },
  { id: '254', name: 'ABOTCHA EPSE GRANT YOBOU' },
  { id: '333', name: 'ABSOLUTE BUSINESS' },
];

export default function CreateInvoiceScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const [form, setForm] = useState({ invoiceNumber: '059', client: '', amount: '', dueDate: '', description: '' });
  const [showClients, setShowClients] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateInvoice = () => {
    if (!form.client || !form.amount) {
      Alert.alert('Erreur', 'Veuillez remplir les champs obligatoires (*)');
      return;
    }

    setLoading(true);

    // Simulation d'un appel API
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Succès', 
        `La facture INV#${form.invoiceNumber} pour ${form.client} a été créée.`,
        [{ text: 'OK', onPress: () => router.push('/finance/factures') }]
      );
    }, 1500);
  };

  const filteredClients = MOCK_CLIENTS_DATA.filter(c => 
    c.name.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const selectClient = (client: string) => {
    setForm({ ...form, client });
    setShowClients(false);
    setClientSearch('');
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={[styles.header, { backgroundColor: '#181818' }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFCC00" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nouvelle Facture</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 0.35, marginRight: 10 }]}>
            <Text style={[styles.label, { color: themeColors.textSecondary }]}>N° Facture</Text>
            <View style={[styles.codeBox, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}>
              <Text style={[styles.codePrefix, { color: themeColors.textSecondary }]}>INV#</Text>
              <TextInput style={[styles.codeInput, { color: themeColors.text }]} value={form.invoiceNumber} onChangeText={(t) => setForm({...form, invoiceNumber: t})} keyboardType="numeric" />
            </View>
          </View>
          <View style={[styles.inputGroup, { flex: 0.65 }]}>
            <Text style={[styles.label, { color: themeColors.textSecondary }]}>Client <Text style={styles.required}>*</Text></Text>
            <TouchableOpacity 
              style={[styles.selectBox, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}
              onPress={() => setShowClients(true)}
            >
              <Text style={[styles.selectText, { color: form.client ? themeColors.text : '#aaa' }]}>{form.client || 'Sélectionner'}</Text>
              <Ionicons name="chevron-down" size={20} color={themeColors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={[styles.label, { color: themeColors.textSecondary }]}>Montant <Text style={styles.required}>*</Text></Text>
            <View style={[styles.amountBox, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}>
              <TextInput style={[styles.amountInput, { color: themeColors.text }]} placeholder="0" placeholderTextColor="#aaa" keyboardType="numeric" value={form.amount} onChangeText={(t) => setForm({...form, amount: t})} />
              <Text style={[styles.currency, { color: themeColors.textSecondary }]}>XOF</Text>
            </View>
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: themeColors.textSecondary }]}>Échéance</Text>
            <View style={[styles.selectBox, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}>
              <TextInput 
                style={[styles.selectText, { color: themeColors.text, flex: 1 }]} 
                placeholder="DD/MM/YYYY"
                placeholderTextColor="#aaa"
                value={form.dueDate}
                onChangeText={(t) => setForm({...form, dueDate: t})}
              />
              <Ionicons name="calendar-outline" size={20} color={themeColors.textSecondary} />
            </View>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: themeColors.textSecondary }]}>Description</Text>
          <TextInput
            style={[styles.inputArea, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground, color: themeColors.text }]}
            placeholder="Détails de la facture..."
            placeholderTextColor="#aaa"
            multiline numberOfLines={4}
            value={form.description}
            onChangeText={(t) => setForm({...form, description: t})}
          />
        </View>

        <TouchableOpacity 
          style={[styles.submitBtn, { opacity: loading ? 0.7 : 1 }]} 
          onPress={handleCreateInvoice}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.submitBtnText}>Créer la facture</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Clients Selection Modal */}
      <Modal visible={showClients} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors.text }]}>Sélectionner un Client</Text>
              <TouchableOpacity onPress={() => setShowClients(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close-circle" size={28} color={themeColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={[styles.modalSearch, { backgroundColor: themeColors.background }]}>
              <Ionicons name="search" size={18} color="#888" />
              <TextInput 
                placeholder="Rechercher un client..."
                placeholderTextColor="#888"
                style={[styles.modalSearchInput, { color: themeColors.text }]}
                value={clientSearch}
                onChangeText={setClientSearch}
              />
            </View>

            <FlatList
              data={filteredClients}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.clientOption, { borderBottomColor: themeColors.border }]}
                  onPress={() => selectClient(item.name)}
                >
                  <Text style={[styles.clientOptionText, { color: themeColors.text }]}>{item.name}</Text>
                  {form.client === item.name && <Ionicons name="checkmark-circle" size={20} color={themeColors.accent} />}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={{ alignItems: 'center', marginTop: 30 }}>
                    <Text style={{ color: themeColors.textSecondary }}>Aucun client trouvé</Text>
                </View>
              }
            />
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
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  codeBox: { height: 55, borderWidth: 1, borderRadius: 15, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center' },
  codePrefix: { fontSize: 13, fontWeight: '800', marginRight: 4 },
  codeInput: { flex: 1, fontSize: 16, fontWeight: '700' },
  amountBox: { height: 55, borderWidth: 1, borderRadius: 15, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center' },
  amountInput: { flex: 1, fontSize: 16, fontWeight: '700' },
  currency: { fontSize: 14, fontWeight: '700', marginLeft: 8 },
  inputArea: { height: 120, borderWidth: 1, borderRadius: 15, paddingHorizontal: 15, paddingTop: 15, fontSize: 15, fontWeight: '500', textAlignVertical: 'top' },
  submitBtn: { backgroundColor: '#f1c40f', height: 60, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 10, elevation: 3 },
  submitBtnText: { color: '#000', fontSize: 16, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 35, borderTopRightRadius: 35, height: '60%', padding: 25 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800' },
  clientOption: { paddingVertical: 18, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  clientOptionText: { fontSize: 16, fontWeight: '500' },
  modalSearch: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 15, 
    borderRadius: 12, 
    height: 45, 
    marginBottom: 15 
  },
  modalSearchInput: { flex: 1, marginLeft: 10, fontSize: 14 },
});
