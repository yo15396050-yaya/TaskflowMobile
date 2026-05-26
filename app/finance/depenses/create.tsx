import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Switch, Modal, FlatList, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

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
    vatAmount: '',
    receiptUri: '',
    receiptName: ''
  });

  const [modalType, setModalType] = useState<null | 'project' | 'category' | 'payment'>(null);
  const [projectSearch, setProjectSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Custom Calendar state
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());

  const getCategoryDetails = (cat: string) => {
    switch (cat) {
      case 'Achats': return { icon: 'cart-outline', color: '#3498db' };
      case 'Transport': return { icon: 'car-outline', color: '#e67e22' };
      case 'Restauration': return { icon: 'fast-food-outline', color: '#e74c3c' };
      case 'Hébergement': return { icon: 'bed-outline', color: '#9b59b6' };
      case 'Services': return { icon: 'construct-outline', color: '#1abc9c' };
      case 'Communication': return { icon: 'chatbubble-ellipses-outline', color: '#2ecc71' };
      default: return { icon: 'help-circle-outline', color: '#95a5a6' };
    }
  };

  const getPaymentModeDetails = (mode: string) => {
    switch (mode) {
      case 'Espèces': return { icon: 'cash-outline', color: '#2ecc71' };
      case 'Mobile Money': return { icon: 'phone-portrait-outline', color: '#e74c3c' };
      case 'Virement': return { icon: 'business-outline', color: '#3498db' };
      case 'Chèque': return { icon: 'document-text-outline', color: '#f39c12' };
      case 'Carte Bancaire': return { icon: 'card-outline', color: '#9b59b6' };
      default: return { icon: 'card-outline', color: '#95a5a6' };
    }
  };

  const pickReceipt = async () => {
    Alert.alert(
      'Justificatif',
      'Choisissez le mode d\'importation de votre reçu/facture',
      [
        {
          text: 'Prendre une photo',
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission requise', 'Nous avons besoin d\'accéder à votre appareil photo.');
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 0.8,
            });
            if (!result.canceled && result.assets && result.assets.length > 0) {
              const asset = result.assets[0];
              setForm(prev => ({
                ...prev,
                receiptUri: asset.uri,
                receiptName: asset.fileName || 'photo_recu.jpg'
              }));
            }
          }
        },
        {
          text: 'Choisir une image',
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission requise', 'Nous avons besoin d\'accéder à votre galerie.');
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 0.8,
            });
            if (!result.canceled && result.assets && result.assets.length > 0) {
              const asset = result.assets[0];
              setForm(prev => ({
                ...prev,
                receiptUri: asset.uri,
                receiptName: asset.fileName || 'galerie_recu.jpg'
              }));
            }
          }
        },
        {
          text: 'Choisir un document (PDF)',
          onPress: async () => {
            try {
              const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/*'],
                copyToCacheDirectory: true,
              });
              if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                setForm(prev => ({
                  ...prev,
                  receiptUri: asset.uri,
                  receiptName: asset.name
                }));
              }
            } catch (err) {
              console.error('Erreur document picker', err);
            }
          }
        },
        { text: 'Annuler', style: 'cancel' }
      ]
    );
  };

  const generateDaysOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday, 1 = Monday
    const totalDays = new Date(year, month + 1, 0).getDate();
    const totalDaysPrevMonth = new Date(year, month, 0).getDate();

    const days = [];
    const startDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1; // Align to start with Monday
    
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({
        day: totalDaysPrevMonth - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, totalDaysPrevMonth - i)
      });
    }

    for (let i = 1; i <= totalDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i)
      });
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i)
      });
    }

    return days;
  };

  const changeMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + (direction === 'next' ? 1 : -1), 1);
    setCalendarDate(newDate);
  };

  const handleSelectDay = (dayDate: Date) => {
    const d = String(dayDate.getDate()).padStart(2, '0');
    const m = String(dayDate.getMonth() + 1).padStart(2, '0');
    const y = dayDate.getFullYear();
    setForm(prev => ({ ...prev, date: `${d}/${m}/${y}` }));
    setShowCalendar(false);
  };

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

    return options.map((opt, i) => {
      let iconName = 'receipt-outline';
      let iconColor = '#888';
      if (modalType === 'category') {
        const catInfo = getCategoryDetails(opt);
        iconName = catInfo.icon;
        iconColor = catInfo.color;
      } else {
        const payInfo = getPaymentModeDetails(opt);
        iconName = payInfo.icon;
        iconColor = payInfo.color;
      }

      return (
        <TouchableOpacity 
          key={opt}
          style={[styles.optionItem, { borderBottomColor: themeColors.border }]}
          onPress={() => { setForm({ ...form, [field as any]: opt }); setModalType(null); }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={[styles.optionIconBg, { backgroundColor: iconColor + '15' }]}>
              <Ionicons name={iconName as any} size={18} color={iconColor} />
            </View>
            <Text style={[styles.optionText, { color: themeColors.text }]}>{opt}</Text>
          </View>
          {form[field as 'category' | 'paymentMode'] === opt && <Ionicons name="checkmark-circle" size={20} color="#FFCC00" />}
        </TouchableOpacity>
      );
    });
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
            <TouchableOpacity 
              style={[styles.selectBox, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}
              onPress={() => {
                setCalendarDate(form.date ? (() => {
                  const parts = form.date.split('/');
                  if (parts.length === 3) {
                    const parsed = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                    if (!isNaN(parsed.getTime())) return parsed;
                  }
                  return new Date();
                })() : new Date());
                setShowCalendar(true);
              }}
            >
              <Text style={[styles.selectText, { color: form.date ? themeColors.text : '#666', fontWeight: form.date ? '700' : '500' }]}>
                {form.date || 'JJ/MM/AAAA'}
              </Text>
              <Ionicons name="calendar-outline" size={18} color={themeColors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: themeColors.textSecondary }]}>Catégorie <Text style={styles.required}>*</Text></Text>
          <TouchableOpacity 
            style={[styles.selectBox, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}
            onPress={() => setModalType('category')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              {form.category ? (
                <View style={[styles.optionIconBg, { backgroundColor: getCategoryDetails(form.category).color + '15', width: 28, height: 28, borderRadius: 8 }]}>
                  <Ionicons name={getCategoryDetails(form.category).icon as any} size={16} color={getCategoryDetails(form.category).color} />
                </View>
              ) : (
                <Ionicons name="folder-open-outline" size={20} color="#888" />
              )}
              <Text style={[styles.selectText, { color: form.category ? themeColors.text : '#666', fontWeight: form.category ? '700' : '500' }]}>
                {form.category || 'Sélectionner une catégorie'}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={20} color={themeColors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: themeColors.textSecondary }]}>Mode de paiement</Text>
          <TouchableOpacity 
            style={[styles.selectBox, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}
            onPress={() => setModalType('payment')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={[styles.optionIconBg, { backgroundColor: getPaymentModeDetails(form.paymentMode).color + '15', width: 28, height: 28, borderRadius: 8 }]}>
                <Ionicons name={getPaymentModeDetails(form.paymentMode).icon as any} size={16} color={getPaymentModeDetails(form.paymentMode).color} />
              </View>
              <Text style={[styles.selectText, { color: themeColors.text, fontWeight: '700' }]}>
                {form.paymentMode}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={20} color={themeColors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: themeColors.textSecondary }]}>Assigner à un projet</Text>
          <TouchableOpacity 
            style={[styles.selectBox, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground, height: form.project ? 70 : 55 }]}
            onPress={() => setModalType('project')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
              <View style={[styles.optionIconBg, { backgroundColor: 'rgba(255, 204, 0, 0.1)', width: 34, height: 34, borderRadius: 10 }]}>
                <Ionicons name="briefcase" size={18} color="#FFCC00" />
              </View>
              {form.project ? (
                <View style={{ flex: 1 }}>
                  <Text style={[styles.selectText, { color: themeColors.text, fontWeight: '800' }]} numberOfLines={1}>
                    {form.project}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                    {MOCK_PROJECTS.find(p => p.name === form.project)?.client || 'Client Rattaché'}
                  </Text>
                </View>
              ) : (
                <Text style={[styles.selectText, { color: '#666' }]}>
                  Sélectionner un projet
                </Text>
              )}
            </View>
            <Ionicons name="chevron-down" size={20} color={themeColors.textSecondary} />
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
           {form.receiptUri ? (
             <View style={[styles.receiptCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
               <View style={styles.receiptIconContainer}>
                 <Ionicons name={form.receiptName.endsWith('.pdf') ? "document-text" : "image"} size={26} color="#000" />
               </View>
               <View style={{ flex: 1 }}>
                 <Text style={[styles.receiptFileName, { color: themeColors.text }]} numberOfLines={1}>
                   {form.receiptName}
                 </Text>
                 <Text style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                   Justificatif rattaché avec succès
                 </Text>
               </View>
               <TouchableOpacity 
                 style={styles.deleteReceiptBtn} 
                 onPress={() => setForm(prev => ({ ...prev, receiptUri: '', receiptName: '' }))}
               >
                 <Ionicons name="trash-outline" size={20} color="#e74c3c" />
               </TouchableOpacity>
             </View>
           ) : (
             <TouchableOpacity 
               style={[styles.uploadBox, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}
               onPress={pickReceipt}
             >
               <Ionicons name="cloud-upload-outline" size={32} color="#FFCC00" style={{ marginBottom: 6 }} />
               <Text style={[styles.uploadText, { color: themeColors.text }]}>Prendre une photo ou choisir un reçu</Text>
               <Text style={{ fontSize: 11, color: '#888', marginTop: -5 }}>Format PDF, PNG, JPG supportés</Text>
             </TouchableOpacity>
           )}
        </View>

        <TouchableOpacity 
          style={[styles.submitBtn, { opacity: loading ? 0.7 : 1 }]}
          onPress={handleSaveExpense}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.submitBtnText}>Enregistrer la dépense</Text>}
        </TouchableOpacity>
      </ScrollView>

      {/* Modal Universelle pour options */}
      <Modal visible={modalType !== null} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors.text }]}>
                {modalType === 'project' ? 'Assigner à un projet' : modalType === 'category' ? 'Sélectionner une catégorie' : 'Mode de paiement'}
              </Text>
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

      {/* Modal Calendrier Personnalisé */}
      <Modal visible={showCalendar} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.calendarContent, { backgroundColor: themeColors.cardBackground }]}>
            {/* Header */}
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={() => changeMonth('prev')} style={styles.calNavBtn}>
                <Ionicons name="chevron-back" size={20} color={themeColors.text} />
              </TouchableOpacity>
              <Text style={[styles.calendarTitle, { color: themeColors.text }]}>
                {calendarDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
              </Text>
              <TouchableOpacity onPress={() => changeMonth('next')} style={styles.calNavBtn}>
                <Ionicons name="chevron-forward" size={20} color={themeColors.text} />
              </TouchableOpacity>
            </View>

            {/* Weekdays */}
            <View style={styles.weekdaysRow}>
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((w, idx) => (
                <Text key={idx} style={styles.weekdayText}>{w}</Text>
              ))}
            </View>

            {/* Days Grid */}
            <View style={styles.daysGrid}>
              {generateDaysOfMonth(calendarDate).map((dayObj, idx) => {
                const isSelected = form.date && (() => {
                  const parts = form.date.split('/');
                  if (parts.length === 3) {
                    return dayObj.date.getDate() === parseInt(parts[0]) &&
                           dayObj.date.getMonth() === parseInt(parts[1]) - 1 &&
                           dayObj.date.getFullYear() === parseInt(parts[2]);
                  }
                  return false;
                })();

                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.dayCell,
                      !dayObj.isCurrentMonth && { opacity: 0.3 },
                      isSelected && { backgroundColor: '#FFCC00', borderRadius: 12 }
                    ]}
                    onPress={() => dayObj.isCurrentMonth && handleSelectDay(dayObj.date)}
                    disabled={!dayObj.isCurrentMonth}
                  >
                    <Text 
                      style={[
                        styles.dayText, 
                        { color: isSelected ? '#000' : themeColors.text },
                        isSelected && { fontWeight: '800' }
                      ]}
                    >
                      {dayObj.day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity 
              style={[styles.calCloseBtn, { borderColor: themeColors.border }]} 
              onPress={() => setShowCalendar(false)}
            >
              <Text style={[styles.calCloseBtnText, { color: themeColors.text }]}>Annuler</Text>
            </TouchableOpacity>
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
  optionIconBg: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Receipt attachment styles
  receiptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 18,
    borderWidth: 1,
    gap: 15,
    marginTop: 5,
  },
  receiptIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#FFCC00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  receiptFileName: {
    fontSize: 14,
    fontWeight: '700',
  },
  deleteReceiptBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(231, 76, 60, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Custom calendar styles
  calendarContent: {
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    padding: 25,
    paddingBottom: 40,
    alignItems: 'center',
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  calNavBtn: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  weekdaysRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  weekdayText: {
    width: 40,
    textAlign: 'center',
    fontSize: 12,
    color: '#888',
    fontWeight: '700',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    justifyContent: 'space-around',
    marginBottom: 25,
  },
  dayCell: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
  },
  calCloseBtn: {
    borderWidth: 1,
    height: 55,
    borderRadius: 15,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calCloseBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
