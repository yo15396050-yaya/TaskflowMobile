import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Switch, Modal, FlatList, Alert, Image, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import api from '@/services/api-service';

// Options pour les sélections
const FORME_JURIDIQUE = ['SARL', 'SA', 'SNC', 'EURL', 'SAS', 'ONG', 'AUTRE'];
const CATEGORIES = ['Grand Compte', 'PME', 'TPE', 'Individuel', 'Étatique'];
const REGIMES_FISCAUX = ['RSI', 'RNI', 'Entreprenant', 'Régime Simplifié'];
const GENDERS = ['Masculin', 'Féminin'];
const SALUTATIONS = ['M.', 'Mme', 'Mlle', 'Dr', 'Prof'];
const PAYS = ['Côte d\'Ivoire', 'France', 'Sénégal', 'Mali', 'Burkina Faso', 'Bénin', 'Togo'];

const FormSection = ({ title, children, themeColors }: { title: string, children: React.ReactNode, themeColors: any }) => (
  <View style={styles.section}>
    <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{title}</Text>
    <View style={styles.sectionDivider} />
    {children}
  </View>
);

const InputLabel = ({ label, required = false, themeColors }: { label: string, required?: boolean, themeColors: any }) => (
  <Text style={[styles.label, { color: themeColors.textSecondary }]}>
    {label} {required && <Text style={styles.required}>*</Text>}
  </Text>
);


export default function CreateClientScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const [form, setForm] = useState({
    legalForm: '',
    category: '',
    email: '',
    password: '',
    allowLogin: true,
    receiveNotifications: true,
    companyName: '',
    tradeName: '',
    gender: 'Masculin',
    salutation: 'M.',
    leaderName: '',
    country: 'Côte d\'Ivoire',
    mobile: '',
    whatsapp: '',
    website: '',
    rccm: '',
    taxAccount: '',
    idu: '',
    taxRegime: '',
    taxCenter: '',
    mainActivities: '',
    section: '',
    parcelle: '',
    activityCode: '',
    capital: '',
    officePhone: '',
    city: '',
    sigle: '',
    postalCode: '',
    addedBy: 'Admin',
    address: '',
    shippingAddress: '',
    note: '',
    avatar: null as string | null,
    logo: null as string | null,
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [activeSelect, setActiveSelect] = useState<null | { key: keyof typeof form, title: string, options: string[] }>(null);
  const [loading, setLoading] = useState(false);

  const openSelect = (key: keyof typeof form, title: string, options: string[]) => {
    setActiveSelect({ key, title, options });
    setModalVisible(true);
  };

  const handleSave = async (type: 'save' | 'save_more') => {
    if (!form.companyName || !form.leaderName || !form.mobile) {
      Alert.alert('Champs obligatoires', 'Veuillez remplir au moins le nom de l\'entreprise, le dirigeant et le mobile.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      
      // Ajout des champs texte
      Object.keys(form).forEach(key => {
        if (key !== 'avatar' && key !== 'logo' && (form as any)[key] !== null) {
          formData.append(key, (form as any)[key].toString());
        }
      });

      // Ajout des images
      if (form.avatar) {
        const uriParts = form.avatar.split('.');
        const fileType = uriParts[uriParts.length - 1];
        formData.append('avatar', {
          uri: form.avatar,
          name: `avatar.${fileType}`,
          type: `image/${fileType}`,
        } as any);
      }

      if (form.logo) {
        const uriParts = form.logo.split('.');
        const fileType = uriParts[uriParts.length - 1];
        formData.append('logo', {
          uri: form.logo,
          name: `logo.${fileType}`,
          type: `image/${fileType}`,
        } as any);
      }

      const response = await api.post('/clients', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      Alert.alert('Succès', 'Le client a été enregistré avec succès.');
      
      if (type === 'save') {
        router.push('/clients');
      } else {

        setForm({ ...form, companyName: '', leaderName: '', mobile: '', email: '', password: '', avatar: null, logo: null });
      }
    } catch (error: any) {
      console.error('Erreur creation client:', error.response?.data || error.message);
      Alert.alert('Erreur', 'Impossible d\'enregistrer le client. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  };


  const pickImage = async (field: 'avatar' | 'logo') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Nous avons besoin de votre permission pour accéder à la galerie.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: field === 'avatar' ? [1, 1] : [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setForm({ ...form, [field]: result.assets[0].uri });
    }
  };




  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: '#181818' }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFCC00" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ajouter un Client</Text>
          <TouchableOpacity onPress={() => handleSave('save')}>
             <Ionicons name="checkmark-circle" size={28} color="#FFCC00" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* SECTION 1: DÉTAILS DU COMPTE */}
        <FormSection title="Détails du compte" themeColors={themeColors}>
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <InputLabel label="Forme juridique" themeColors={themeColors} />

              <TouchableOpacity 
                style={[styles.selectBox, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}
                onPress={() => openSelect('legalForm', 'Forme Juridique', FORME_JURIDIQUE)}
              >
                <Text style={[styles.selectText, { color: form.legalForm ? themeColors.text : '#888' }]}>
                  {form.legalForm || 'Sélectionner'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={themeColors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
               <InputLabel label="Catégorie" themeColors={themeColors} />

               <TouchableOpacity 
                style={[styles.selectBox, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}
                onPress={() => openSelect('category', 'Catégorie de client', CATEGORIES)}
              >
                <Text style={[styles.selectText, { color: form.category ? themeColors.text : '#888' }]}>
                  {form.category || 'Sélectionner'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={themeColors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <InputLabel label="E-mail" themeColors={themeColors} />

            <TextInput 
              style={[styles.input, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground, color: themeColors.text }]}
              placeholder="johndoe@example.com"
              placeholderTextColor="#888"
              keyboardType="email-address"
              value={form.email}
              onChangeText={(t) => setForm({...form, email: t})}
            />
          </View>

          <View style={styles.inputGroup}>
            <InputLabel label="Mot de passe" themeColors={themeColors} />

            <View style={[styles.inputContainer, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}>
                 <TextInput 
                    style={[styles.flexInput, { color: themeColors.text }]}
                    placeholder="Au moins 8 caractères"
                    placeholderTextColor="#888"
                    secureTextEntry
                    value={form.password}
                    onChangeText={(t) => setForm({...form, password: t})}
                />
                <Ionicons name="eye-off-outline" size={20} color="#888" style={{ marginRight: 15 }} />
            </View>
          </View>

          <View style={styles.switchContainer}>
             <View style={{ flex: 1 }}>
                <Text style={[styles.switchTitle, { color: themeColors.text }]}>Connexion autorisée ?</Text>
                <Text style={styles.switchSub}>Permettre au client de se connecter à l'espace client</Text>
             </View>
             <Switch 
                value={form.allowLogin}
                onValueChange={(v) => setForm({...form, allowLogin: v})}
                trackColor={{ false: '#767577', true: 'rgba(255, 204, 0, 0.5)' }}
                thumbColor={form.allowLogin ? '#FFCC00' : '#f4f3f4'}
             />
          </View>

          <View style={styles.switchContainer}>
             <View style={{ flex: 1 }}>
                <Text style={[styles.switchTitle, { color: themeColors.text }]}>Notifications par e-mail ?</Text>
                <Text style={styles.switchSub}>Envoyer des notifications automatiques par mail</Text>
             </View>
             <Switch 
                value={form.receiveNotifications}
                onValueChange={(v) => setForm({...form, receiveNotifications: v})}
                trackColor={{ false: '#767577', true: 'rgba(255, 204, 0, 0.5)' }}
                thumbColor={form.receiveNotifications ? '#FFCC00' : '#f4f3f4'}
             />
          </View>
        </FormSection>

        {/* SECTION 2: INFORMATIONS DE BASE */}
        <FormSection title="Détails de l'entreprise" themeColors={themeColors}>
          <View style={styles.inputGroup}>
            <InputLabel label="Nom de l'entreprise" required themeColors={themeColors} />

            <TextInput 
              style={[styles.input, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground, color: themeColors.text }]}
              placeholder="Ex: Acmé Corporation"
              placeholderTextColor="#888"
              value={form.companyName}
              onChangeText={(t) => setForm({...form, companyName: t})}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <InputLabel label="Nom commercial" themeColors={themeColors} />

                <TextInput 
                    style={[styles.input, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground, color: themeColors.text }]}
                    placeholder="Nom commercial"
                    placeholderTextColor="#888"
                    value={form.tradeName}
                    onChangeText={(t) => setForm({...form, tradeName: t})}
                />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
                <InputLabel label="Sigle" themeColors={themeColors} />

                <TextInput 
                    style={[styles.input, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground, color: themeColors.text }]}
                    placeholder="Sigle"
                    placeholderTextColor="#888"
                    value={form.sigle}
                    onChangeText={(t) => setForm({...form, sigle: t})}
                />
            </View>
          </View>

          <View style={styles.photoUploadRow}>
             <View style={styles.uploadBox}>
                <Text style={styles.uploadLabel}>Image Profil</Text>
                <TouchableOpacity 
                  style={[styles.photoFrame, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}
                  onPress={() => pickImage('avatar')}
                >
                   {form.avatar ? (
                     <Image source={{ uri: form.avatar }} style={styles.previewImage} />
                   ) : (
                     <>
                       <Ionicons name="camera-outline" size={30} color="#888" />
                       <Text style={styles.photoHint}>Cliquez</Text>
                     </>
                   )}
                </TouchableOpacity>
             </View>
             <View style={styles.uploadBox}>
                <Text style={styles.uploadLabel}>Logo Entreprise</Text>
                <TouchableOpacity 
                  style={[styles.photoFrame, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}
                  onPress={() => pickImage('logo')}
                >
                   {form.logo ? (
                     <Image source={{ uri: form.logo }} style={styles.previewImage} />
                   ) : (
                     <>
                       <Ionicons name="business-outline" size={30} color="#888" />
                       <Text style={styles.photoHint}>Cliquez</Text>
                     </>
                   )}
                </TouchableOpacity>
             </View>
          </View>

        </FormSection>

        {/* SECTION 3: DIRIGEANT */}
        <FormSection title="Coordonnées du dirigeant" themeColors={themeColors}>
           <View style={styles.row}>
             <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <InputLabel label="Genre" themeColors={themeColors} />

                <TouchableOpacity 
                    style={[styles.selectBox, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}
                    onPress={() => openSelect('gender', 'Sexe', GENDERS)}
                >
                    <Text style={[styles.selectText, { color: themeColors.text }]}>{form.gender}</Text>
                    <Ionicons name="chevron-down" size={18} color={themeColors.textSecondary} />
                </TouchableOpacity>
             </View>
             <View style={[styles.inputGroup, { flex: 1 }]}>
                <InputLabel label="Salutation" themeColors={themeColors} />

                <TouchableOpacity 
                    style={[styles.selectBox, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}
                    onPress={() => openSelect('salutation', 'Appellation', SALUTATIONS)}
                >
                    <Text style={[styles.selectText, { color: themeColors.text }]}>{form.salutation}</Text>
                    <Ionicons name="chevron-down" size={18} color={themeColors.textSecondary} />
                </TouchableOpacity>
             </View>
           </View>

           <View style={styles.inputGroup}>
             <InputLabel label="Nom du dirigeant" required themeColors={themeColors} />

             <TextInput 
                style={[styles.input, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground, color: themeColors.text }]}
                placeholder="Nom complet"
                placeholderTextColor="#888"
                value={form.leaderName}
                onChangeText={(t) => setForm({...form, leaderName: t})}
             />
           </View>

           <View style={styles.row}>
             <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <InputLabel label="Mobile" required themeColors={themeColors} />

                <TextInput 
                    style={[styles.input, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground, color: themeColors.text }]}
                    placeholder="0123456789"
                    placeholderTextColor="#888"
                    keyboardType="phone-pad"
                    value={form.mobile}
                    onChangeText={(t) => setForm({...form, mobile: t})}
                />
             </View>
             <View style={[styles.inputGroup, { flex: 1 }]}>
                <InputLabel label="WhatsApp" themeColors={themeColors} />

                <TextInput 
                    style={[styles.input, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground, color: themeColors.text }]}
                    placeholder="WhatsApp"
                    placeholderTextColor="#888"
                    keyboardType="phone-pad"
                    value={form.whatsapp}
                    onChangeText={(t) => setForm({...form, whatsapp: t})}
                />
             </View>
           </View>
        </FormSection>

        {/* SECTION 4: INFOS FISCALES & LÉGALES */}
        <FormSection title="Détails fiscaux et légaux" themeColors={themeColors}>
           <View style={styles.inputGroup}>
             <InputLabel label="Régime fiscal" themeColors={themeColors} />

             <TouchableOpacity 
                style={[styles.selectBox, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}
                onPress={() => openSelect('taxRegime', 'Régime Fiscal', REGIMES_FISCAUX)}
             >
                <Text style={[styles.selectText, { color: form.taxRegime ? themeColors.text : '#888' }]}>
                  {form.taxRegime || 'Sélectionner'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={themeColors.textSecondary} />
             </TouchableOpacity>
           </View>

           <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <InputLabel label="Numéro RCCM" themeColors={themeColors} />

                <TextInput 
                    style={[styles.input, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground, color: themeColors.text }]}
                    placeholder="RCCM"
                    placeholderTextColor="#888"
                    value={form.rccm}
                    onChangeText={(t) => setForm({...form, rccm: t})}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <InputLabel label="Compte Contribuable" themeColors={themeColors} />

                <TextInput 
                    style={[styles.input, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground, color: themeColors.text }]}
                    placeholder="N° CC"
                    placeholderTextColor="#888"
                    value={form.taxAccount}
                    onChangeText={(t) => setForm({...form, taxAccount: t})}
                />
              </View>
           </View>

           <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <InputLabel label="Numéro IDU" themeColors={themeColors} />

                <TextInput 
                    style={[styles.input, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground, color: themeColors.text }]}
                    placeholder="IDU"
                    placeholderTextColor="#888"
                    value={form.idu}
                    onChangeText={(t) => setForm({...form, idu: t})}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <InputLabel label="Capital (XOF)" themeColors={themeColors} />

                <TextInput 
                    style={[styles.input, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground, color: themeColors.text }]}
                    placeholder="Montant du capital"
                    placeholderTextColor="#888"
                    keyboardType="numeric"
                    value={form.capital}
                    onChangeText={(t) => setForm({...form, capital: t})}
                />
              </View>
           </View>

           <View style={styles.inputGroup}>
             <InputLabel label="Activités principales" themeColors={themeColors} />

             <TextInput 
                style={[styles.textArea, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground, color: themeColors.text }]}
                placeholder="Décrivez les activités..."
                placeholderTextColor="#888"
                multiline
                numberOfLines={3}
                value={form.mainActivities}
                onChangeText={(t) => setForm({...form, mainActivities: t})}
             />
           </View>
        </FormSection>

        {/* SECTION 5: LOCALISATION */}
        <FormSection title="Localisation et Adresse" themeColors={themeColors}>
           <View style={styles.row}>
             <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <InputLabel label="Pays" themeColors={themeColors} />

                <TouchableOpacity 
                    style={[styles.selectBox, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}
                    onPress={() => openSelect('country', 'Pays', PAYS)}
                >
                    <Text style={[styles.selectText, { color: themeColors.text }]}>{form.country}</Text>
                    <Ionicons name="chevron-down" size={18} color={themeColors.textSecondary} />
                </TouchableOpacity>
             </View>
             <View style={[styles.inputGroup, { flex: 1 }]}>
                <InputLabel label="Ville" themeColors={themeColors} />

                <TextInput 
                    style={[styles.input, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground, color: themeColors.text }]}
                    placeholder="Ex: Abidjan"
                    placeholderTextColor="#888"
                    value={form.city}
                    onChangeText={(t) => setForm({...form, city: t})}
                />
             </View>
           </View>

           <View style={styles.inputGroup}>
             <InputLabel label="Adresse (Localisation)" themeColors={themeColors} />

             <TextInput 
                style={[styles.textArea, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground, color: themeColors.text }]}
                placeholder="132 My Street, Kingston..."
                placeholderTextColor="#888"
                multiline
                numberOfLines={2}
                value={form.address}
                onChangeText={(t) => setForm({...form, address: t})}
             />
           </View>

           <View style={styles.inputGroup}>
             <InputLabel label="Adresse de livraison" themeColors={themeColors} />

             <TextInput 
                style={[styles.textArea, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground, color: themeColors.text }]}
                placeholder="Même que localisation..."
                placeholderTextColor="#888"
                multiline
                numberOfLines={2}
                value={form.shippingAddress}
                onChangeText={(t) => setForm({...form, shippingAddress: t})}
             />
           </View>
        </FormSection>

        <View style={styles.footerActions}>
           <TouchableOpacity 
             style={[styles.submitBtn, { backgroundColor: '#FFCC00', opacity: loading ? 0.7 : 1 }]} 
             onPress={() => handleSave('save')}
             disabled={loading}
           >
             {loading ? <ActivityIndicator color="#000" /> : <Text style={[styles.submitBtnText, { color: '#000' }]}>SAUVEGARDER</Text>}
           </TouchableOpacity>

           <TouchableOpacity 
            style={[styles.secondaryBtn, { borderColor: themeColors.border, opacity: loading ? 0.7 : 1 }]} 
            onPress={() => handleSave('save_more')}
            disabled={loading}
           >
             {loading ? <ActivityIndicator color={themeColors.text} /> : <Text style={[styles.secondaryBtnText, { color: themeColors.text }]}>Enregistrer et ajouter plus</Text>}
           </TouchableOpacity>

           <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
             <Text style={styles.cancelBtnText}>Annuler</Text>
           </TouchableOpacity>
        </View>

      </ScrollView>

      {/* MODAL POUR LES SÉLECTIONS */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors.text }]}>{activeSelect?.title}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
                <Ionicons name="close" size={24} color={themeColors.text} />
              </TouchableOpacity>
            </View>
            <FlatList 
              data={activeSelect?.options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.optionItem, { borderBottomColor: themeColors.border }]}
                  onPress={() => {
                    if (activeSelect) setForm({...form, [activeSelect.key]: item});
                    setModalVisible(false);
                  }}
                >
                  <Text style={[styles.optionLabel, { color: themeColors.text }]}>{item}</Text>
                  {activeSelect && form[activeSelect.key] === item && (
                    <Ionicons name="checkmark-circle" size={22} color="#FFCC00" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 55, paddingHorizontal: 25, paddingBottom: 25, borderBottomLeftRadius: 35, borderBottomRightRadius: 35, elevation: 8, zIndex: 10, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { padding: 5, marginLeft: -5 },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: '900' },
  content: { padding: 20, paddingBottom: 50 },
  section: { marginBottom: 35 },
  sectionTitle: { fontSize: 17, fontWeight: '900', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionDivider: { height: 2, backgroundColor: '#FFCC00', width: 40, marginBottom: 20, borderRadius: 1 },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 8, marginLeft: 4 },
  required: { color: '#e74c3c' },
  input: { height: 55, borderWidth: 1, borderRadius: 18, paddingHorizontal: 20, fontSize: 15, fontWeight: '500' },
  inputContainer: { height: 55, borderWidth: 1, borderRadius: 18, flexDirection: 'row', alignItems: 'center' },
  flexInput: { flex: 1, height: 55, paddingHorizontal: 20, fontSize: 15, fontWeight: '500' },
  textArea: { minHeight: 100, borderWidth: 1, borderRadius: 18, paddingHorizontal: 20, paddingTop: 15, fontSize: 15, fontWeight: '500', textAlignVertical: 'top' },
  selectBox: { height: 55, borderWidth: 1, borderRadius: 18, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectText: { fontSize: 15, fontWeight: '500' },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  switchContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, paddingHorizontal: 5 },
  switchTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  switchSub: { fontSize: 11, color: '#888', fontWeight: '500' },
  photoUploadRow: { flexDirection: 'row', gap: 20, marginTop: 10 },
  uploadBox: { flex: 1 },
  uploadLabel: { fontSize: 12, fontWeight: '700', color: '#888', marginBottom: 10, textAlign: 'center' },
  photoFrame: { height: 100, borderStyle: 'dashed', borderWidth: 2, borderRadius: 22, alignItems: 'center', justifyContent: 'center', gap: 5 },
  photoHint: { fontSize: 11, fontWeight: '800', color: '#888' },
  footerActions: { marginTop: 10, gap: 12 },
  submitBtn: { height: 65, borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  submitBtnText: { fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  secondaryBtn: { height: 60, borderRadius: 20, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
  secondaryBtnText: { fontSize: 14, fontWeight: '800' },
  cancelBtn: { height: 50, justifyContent: 'center', alignItems: 'center' },
  cancelBtnText: { color: '#888', fontSize: 14, fontWeight: '700' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 30, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  modalTitle: { fontSize: 20, fontWeight: '900' },
  optionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 20, borderBottomWidth: 1 },
  optionLabel: { fontSize: 16, fontWeight: '600' },
  previewImage: { width: '100%', height: '100%', borderRadius: 20 },
});

