import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import api from '@/services/api-service';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

type TabType = 'profile' | 'emergency' | 'documents';

export default function ProfileSettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await SecureStore.getItemAsync('user_data');
      if (data) {
        const user = JSON.parse(data);
        setUserData(user);
        setName(user.name || '');
        setEmail(user.email || '');
        if (user.mobile) setMobile(user.mobile);
      }
    } catch (error) {
      console.error('Erreur profil:', error);
    }
  };

  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [googleCalendar, setGoogleCalendar] = useState(true);
  const [mobile, setMobile] = useState('');

  const handleUpdatePassword = async () => {
    if (!password) {
      alert('Veuillez saisir un nouveau mot de passe');
      return;
    }
    if (password !== confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/change-password', {
        current_password: currentPassword,
        new_password: password,
        new_password_confirmation: confirmPassword
      });
      alert(response.data.message);
      setCurrentPassword('');
      setPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Une erreur est survenue';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  // Emergency Contact States
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    mobile: '',
    relation: '',
    address: ''
  });

  const handleSaveContact = () => {
    // Logic to save contact could go here
    setShowAddContactModal(false);
    setNewContact({ name: '', email: '', mobile: '', relation: '', address: '' });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <View style={styles.formSection}>
            <View style={styles.avatarSection}>
              <View style={styles.avatarWrapper}>
                <Image
                  source={{ uri: userData?.avatar || 'https://www.gravatar.com/avatar/b8e84f064bc0bcfc29e102a823ae738b.png?s=200&d=mp' }}
                  style={styles.avatarLarge}
                />
                <TouchableOpacity style={styles.cameraBtn}>
                  <Ionicons name="camera" size={20} color="#181818" />
                </TouchableOpacity>
              </View>
              <Text style={[styles.avatarTip, { color: themeColors.textSecondary }]}>
                {userData?.name}
              </Text>
            </View>

            <View style={[styles.card, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border, padding: 20, borderRadius: 20, borderWidth: 1 }]}>
               <Text style={[styles.sectionTitle, { color: themeColors.text, marginBottom: 15 }]}>Changer le mot de passe</Text>
               
               <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: themeColors.textSecondary }]}>Mot de passe actuel</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: themeColors.background, color: themeColors.text, borderColor: themeColors.border }]}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry={true}
                  placeholder="Ancien mot de passe"
                  placeholderTextColor="#888"
                />
              </View>

              <View style={[styles.inputGroup, { marginTop: 15 }]}>
                <Text style={[styles.label, { color: themeColors.textSecondary }]}>Nouveau mot de passe</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: themeColors.background, color: themeColors.text, borderColor: themeColors.border }]}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholder="Minimum 6 caractères"
                  placeholderTextColor="#888"
                />
              </View>

              <View style={[styles.inputGroup, { marginTop: 15 }]}>
                <Text style={[styles.label, { color: themeColors.textSecondary }]}>Confirmer le mot de passe</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: themeColors.background, color: themeColors.text, borderColor: themeColors.border }]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                  placeholder="Répétez le mot de passe"
                  placeholderTextColor="#888"
                />
              </View>

              <TouchableOpacity 
                style={[styles.saveBtn, { marginTop: 25, opacity: loading ? 0.7 : 1 }]} 
                onPress={handleUpdatePassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#181818" />
                ) : (
                  <Text style={styles.saveBtnText}>Mettre à jour le mot de passe</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={[styles.toggleRow, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border, marginTop: 10 }]}>
              <View style={styles.toggleInfo}>
                <Text style={[styles.toggleLabel, { color: themeColors.text }]}>Notifications par e-mail</Text>
                <Text style={styles.toggleDesc}>Recevoir les mises à jour par mail</Text>
              </View>
              <Switch
                value={emailNotifs}
                onValueChange={setEmailNotifs}
                trackColor={{ false: '#767577', true: '#FFCC00' }}
                thumbColor={emailNotifs ? '#FFF' : '#f4f3f4'}
              />
            </View>

            <TouchableOpacity 
              style={[styles.userListBtn, { backgroundColor: '#FFCC00', marginTop: 20 }]}
              onPress={() => router.push('/user/all-users')}
            >
              <Ionicons name="people" size={20} color="#181818" />
              <Text style={styles.userListBtnText}>Voir tous les utilisateurs</Text>
              <Ionicons name="chevron-forward" size={20} color="#181818" />
            </TouchableOpacity>
          </View>
        );
      case 'emergency':
        return (
          <View style={styles.emptyContent}>
            <Ionicons name="call-outline" size={60} color="#888" />
            <Text style={[styles.emptyTitle, { color: themeColors.text }]}>Contacts d'urgence</Text>
            <Text style={styles.emptySubtitle}>Aucun contact d'urgence défini.</Text>
            <TouchableOpacity
              style={styles.addBtnSmall}
              onPress={() => setShowAddContactModal(true)}
            >
              <Ionicons name="plus" size={20} color="#181818" />
              <Text style={styles.addBtnSmallText}>Ajouter un contact</Text>
            </TouchableOpacity>
          </View>
        );
      case 'documents':
        return (
          <View style={styles.emptyContent}>
            <Ionicons name="document-attach-outline" size={60} color="#888" />
            <Text style={[styles.emptyTitle, { color: themeColors.text }]}>Mes Documents</Text>
            <Text style={styles.emptySubtitle}>Vos documents personnels apparaîtront ici.</Text>
            <TouchableOpacity style={styles.addBtnSmall}>
              <Ionicons name="cloud-upload-outline" size={20} color="#181818" />
              <Text style={styles.addBtnSmallText}>Télécharger</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={[styles.header, { backgroundColor: '#181818' }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFCC00" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Paramètres</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.tabsWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
            <TouchableOpacity
              onPress={() => setActiveTab('profile')}
              style={[styles.tabItem, activeTab === 'profile' && styles.activeTab]}
            >
              <Text style={[styles.tabLabel, activeTab === 'profile' ? styles.activeTabLabel : { color: 'rgba(255,255,255,0.6)' }]}>Profil</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('emergency')}
              style={[styles.tabItem, activeTab === 'emergency' && styles.activeTab]}
            >
              <Text style={[styles.tabLabel, activeTab === 'emergency' ? styles.activeTabLabel : { color: 'rgba(255,255,255,0.6)' }]}>Contacts</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('documents')}
              style={[styles.tabItem, activeTab === 'documents' && styles.activeTab]}
            >
              <Text style={[styles.tabLabel, activeTab === 'documents' ? styles.activeTabLabel : { color: 'rgba(255,255,255,0.6)' }]}>Documents</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
        {renderTabContent()}
      </ScrollView>

      {/* Modal Ajouter un contact d'urgence */}
      <Modal
        visible={showAddContactModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddContactModal(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContentWrapper}
          >
            <View style={[styles.modalCard, { backgroundColor: themeColors.cardBackground }]}>
              <View style={[styles.modalHeader, { borderBottomColor: themeColors.border }]}>
                <Text style={[styles.modalTitle, { color: themeColors.text }]}>Ajouter un nouveau contact d'urgence</Text>
                <TouchableOpacity onPress={() => setShowAddContactModal(false)}>
                  <Ionicons name="close" size={24} color={themeColors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.modalRow}>
                  <View style={styles.modalCol}>
                    <Text style={[styles.label, { color: themeColors.textSecondary }]}>Nom *</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: themeColors.background, color: themeColors.text, borderColor: themeColors.border }]}
                      placeholder="par exemple. John Doe"
                      placeholderTextColor="#888"
                      value={newContact.name}
                      onChangeText={(val) => setNewContact({ ...newContact, name: val })}
                    />
                  </View>
                  <View style={styles.modalCol}>
                    <Text style={[styles.label, { color: themeColors.textSecondary }]}>E-mail</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: themeColors.background, color: themeColors.text, borderColor: themeColors.border }]}
                      placeholder="par exemple. johndoe@example.com"
                      placeholderTextColor="#888"
                      value={newContact.email}
                      onChangeText={(val) => setNewContact({ ...newContact, email: val })}
                    />
                  </View>
                </View>

                <View style={styles.modalRow}>
                  <View style={styles.modalCol}>
                    <Text style={[styles.label, { color: themeColors.textSecondary }]}>Mobile *</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: themeColors.background, color: themeColors.text, borderColor: themeColors.border }]}
                      placeholder="par exemple. 1234567890"
                      placeholderTextColor="#888"
                      keyboardType="phone-pad"
                      value={newContact.mobile}
                      onChangeText={(val) => setNewContact({ ...newContact, mobile: val })}
                    />
                  </View>
                  <View style={styles.modalCol}>
                    <Text style={[styles.label, { color: themeColors.textSecondary }]}>Relation *</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: themeColors.background, color: themeColors.text, borderColor: themeColors.border }]}
                      placeholder="par exemple. père"
                      placeholderTextColor="#888"
                      value={newContact.relation}
                      onChangeText={(val) => setNewContact({ ...newContact, relation: val })}
                    />
                  </View>
                </View>

                <View style={[styles.inputGroup, { marginTop: 10 }]}>
                  <Text style={[styles.label, { color: themeColors.textSecondary }]}>Adresse</Text>
                  <TextInput
                    style={[styles.input, styles.textArea, { backgroundColor: themeColors.background, color: themeColors.text, borderColor: themeColors.border }]}
                    placeholder="par exemple. 132, My Street, Kingston..."
                    placeholderTextColor="#888"
                    multiline
                    numberOfLines={3}
                    value={newContact.address}
                    onChangeText={(val) => setNewContact({ ...newContact, address: val })}
                  />
                </View>
              </ScrollView>

              <View style={[styles.modalFooter, { borderTopColor: themeColors.border }]}>
                <TouchableOpacity onPress={() => setShowAddContactModal(false)} style={styles.cancelBtn}>
                  <Text style={[styles.cancelBtnText, { color: themeColors.textSecondary }]}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSaveContact} style={styles.modalSaveBtn}>
                  <Ionicons name="checkmark" size={18} color="#FFF" />
                  <Text style={styles.modalSaveBtnText}>Sauvegarder</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 55,
    paddingHorizontal: 25,
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
    marginBottom: 20,
  },
  backBtn: { padding: 5, marginLeft: -5 },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: '800' },
  tabsWrapper: { marginBottom: 15 },
  tabsScroll: { gap: 10 },
  tabItem: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 15,
  },
  activeTab: {
    backgroundColor: 'rgba(255,204,0,0.15)',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  activeTabLabel: {
    color: '#FFCC00',
  },
  content: { flex: 1 },
  formSection: { padding: 25, gap: 20 },
  avatarSection: { alignItems: 'center', marginBottom: 10 },
  avatarWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFCC00',
    padding: 3,
  },
  avatarLarge: {
    width: '100%',
    height: '100%',
    borderRadius: 45,
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFCC00',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#181818',
  },
  avatarTip: { fontSize: 11, marginTop: 10, fontWeight: '600' },
  inputGroup: { gap: 8 },
  label: { fontSize: 13, fontWeight: '700', marginLeft: 4, marginBottom: 2 },
  input: {
    height: 55,
    borderRadius: 15,
    borderWidth: 1,
    paddingHorizontal: 20,
    fontSize: 14,
    fontWeight: '500',
  },
  textArea: {
    height: 100,
    paddingTop: 15,
    textAlignVertical: 'top',
  },
  passwordContainer: { position: 'relative' },
  passwordInput: { paddingRight: 55 },
  eyeBtn: {
    position: 'absolute',
    right: 15,
    top: 15,
    padding: 5,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  toggleInfo: { flex: 1, gap: 2 },
  toggleLabel: { fontSize: 15, fontWeight: '700' },
  toggleDesc: { color: '#888', fontSize: 12, fontWeight: '500' },
  saveBtn: {
    backgroundColor: '#FFCC00',
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    elevation: 4,
    shadowColor: '#FFCC00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  saveBtnText: { color: '#181818', fontSize: 16, fontWeight: '800' },
  emptyContent: { padding: 60, alignItems: 'center', gap: 15 },
  emptyTitle: { fontSize: 18, fontWeight: '800', marginTop: 10 },
  emptySubtitle: { color: '#888', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  addBtnSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFCC00',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 10,
  },
  addBtnSmallText: { color: '#181818', fontSize: 14, fontWeight: '700' },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContentWrapper: {
    width: '100%',
  },
  modalCard: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 25,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 17, fontWeight: '800', flex: 1, marginRight: 15 },
  modalBody: { padding: 25 },
  modalRow: { flexDirection: 'row', gap: 15, marginBottom: 15 },
  modalCol: { flex: 1, gap: 8 },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 20,
    borderTopWidth: 1,
    gap: 15,
  },
  cancelBtn: { paddingHorizontal: 15 },
  cancelBtnText: { fontSize: 15, fontWeight: '600' },
  modalSaveBtn: {
    backgroundColor: '#181818',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  modalSaveBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '800' },
  card: { elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  userListBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#FFCC00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  userListBtnText: { color: '#181818', fontSize: 16, fontWeight: '800', flex: 1, textAlign: 'center' },
});
