import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Switch, Modal, FlatList, Alert, Image, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import api from '@/services/api-service';

// Réutilisation des composants extraits (FormSection et InputLabel)
const InputLabel = ({ label, required = false, themeColors }: { label: string, required?: boolean, themeColors: any }) => (
  <Text style={[styles.label, { color: themeColors.text }]}>
    {label} {required && <Text style={{ color: '#e74c3c' }}>*</Text>}
  </Text>
);

const FormSection = ({ title, children, themeColors }: { title: string, children: React.ReactNode, themeColors: any }) => (
  <View style={styles.section}>
    <Text style={[styles.sectionTitle, { color: themeColors.accent }]}>{title}</Text>
    <View style={[styles.sectionCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
      {children}
    </View>
  </View>
);

export default function EditClientScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const [form, setForm] = useState({
    legalForm: 'Individuel',
    category: 'Client Standard',
    email: '',
    password: '',
    allowLogin: true,
    receiveNotifications: true,
    companyName: '',
    tradeName: '',
    gender: 'Homme',
    salutation: 'Mr.',
    leaderName: '',
    country: 'Côte d\'Ivoire',
    mobile: '',
    whatsapp: '',
    website: '',
    rccm: '',
    taxAccount: '',
    idu: '',
    taxRegime: 'Entreprenant',
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

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchClientData();
  }, [id]);

  const fetchClientData = async () => {
    try {
      const response = await api.get(`/clients/${id}`);
      const data = response.data;
      
      setForm({
        ...form,
        companyName: data.company_name || '',
        leaderName: data.name || '',
        email: data.email || '',
        mobile: data.mobile || '',
        address: data.address || '',
        shippingAddress: data.shipping_address || '',
        website: data.website || '',
        officePhone: data.office_phone || data.office || '',
        city: data.city || '',
        postalCode: data.postal_code || '',
        tradeName: data.company_name_com || '',
        whatsapp: data.skype || '',
        note: data.note || '',
        avatar: data.avatar || null,
        logo: data.logo || null,
        // Tu peux mapper d'autres champs ici si ton API les renvoie
      });
    } catch (error) {
      console.error('Erreur fetch client:', error);
      Alert.alert('Erreur', 'Impossible de récupérer les données du client.');
    } finally {
      setFetching(false);
    }
  };

  const handleUpdate = async () => {
    if (!form.companyName || !form.leaderName || !form.mobile) {
      Alert.alert('Champs obligatoires', 'Veuillez remplir au moins le nom de l\'entreprise, le dirigeant et le mobile.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('_method', 'PUT'); // Simulation de PUT pour Laravel
      
      Object.keys(form).forEach(key => {
        if (key !== 'avatar' && key !== 'logo' && (form as any)[key] !== null) {
          formData.append(key, (form as any)[key].toString());
        }
      });

      if (form.avatar && form.avatar.startsWith('file://')) {
        const uriParts = form.avatar.split('.');
        const fileType = uriParts[uriParts.length - 1];
        formData.append('avatar', {
          uri: form.avatar,
          name: `avatar.${fileType}`,
          type: `image/${fileType}`,
        } as any);
      }

      if (form.logo && form.logo.startsWith('file://')) {
        const uriParts = form.logo.split('.');
        const fileType = uriParts[uriParts.length - 1];
        formData.append('logo', {
          uri: form.logo,
          name: `logo.${fileType}`,
          type: `image/${fileType}`,
        } as any);
      }

      await api.post(`/clients/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      Alert.alert('Succès', 'Le client a été mis à jour avec succès.', [
        { text: 'OK', onPress: () => router.push('/clients') }
      ]);
    } catch (error: any) {
      console.error('Erreur maj client:', error.response?.data || error.message);
      Alert.alert('Erreur', 'Impossible de mettre à jour le client.');
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

  if (fetching) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={themeColors.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={[styles.header, { backgroundColor: '#181818' }]}>
        <View style={styles.titleRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFCC00" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Modifier Client</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <FormSection title="INFOS GÉNÉRALES" themeColors={themeColors}>
          <View style={styles.photoUploadRow}>
             <View style={styles.uploadBox}>
                <InputLabel label="Image Profil" themeColors={themeColors} />
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
                <InputLabel label="Logo Entreprise" themeColors={themeColors} />
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

          <View style={styles.inputGroup}>
            <InputLabel label="Nom de l'entreprise" required themeColors={themeColors} />
            <TextInput
              style={[styles.input, { color: themeColors.text, borderColor: themeColors.border }]}
              value={form.companyName}
              onChangeText={(val) => setForm({ ...form, companyName: val })}
            />
          </View>

          <View style={styles.inputGroup}>
            <InputLabel label="Nom du dirigeant" required themeColors={themeColors} />
            <TextInput
              style={[styles.input, { color: themeColors.text, borderColor: themeColors.border }]}
              value={form.leaderName}
              onChangeText={(val) => setForm({ ...form, leaderName: val })}
            />
          </View>

          <View style={styles.inputGroup}>
            <InputLabel label="E-mail" required themeColors={themeColors} />
            <TextInput
              style={[styles.input, { color: themeColors.text, borderColor: themeColors.border }]}
              value={form.email}
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={(val) => setForm({ ...form, email: val })}
            />
          </View>

          <View style={styles.inputGroup}>
            <InputLabel label="Mobile" required themeColors={themeColors} />
            <TextInput
              style={[styles.input, { color: themeColors.text, borderColor: themeColors.border }]}
              value={form.mobile}
              keyboardType="phone-pad"
              onChangeText={(val) => setForm({ ...form, mobile: val })}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <InputLabel label="Mot de passe (Laisser vide pour ne pas changer)" themeColors={themeColors} />
            <TextInput
              style={[styles.input, { color: themeColors.text, borderColor: themeColors.border }]}
              value={form.password}
              secureTextEntry
              onChangeText={(val) => setForm({ ...form, password: val })}
            />
          </View>
        </FormSection>

        <TouchableOpacity 
          style={[styles.submitButton, { opacity: loading ? 0.7 : 1 }]} 
          onPress={handleUpdate}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.submitButtonText}>METTRE À JOUR</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
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
  headerTitle: { color: '#FFCC00', fontSize: 20, fontWeight: '900' },
  backBtn: { padding: 5 },
  scrollContainer: { padding: 20, paddingBottom: 60 },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 14, fontWeight: '900', marginBottom: 12, marginLeft: 5, letterSpacing: 1 },
  sectionCard: { borderRadius: 24, padding: 20, borderWidth: 1 },
  inputGroup: { marginBottom: 18 },
  label: { fontSize: 12, fontWeight: '800', marginBottom: 8, opacity: 0.6, textTransform: 'uppercase' },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    height: 50,
    paddingHorizontal: 15,
    fontSize: 15,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  photoUploadRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  uploadBox: { width: '47%' },
  photoFrame: {
    height: 110,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginTop: 8,
  },
  previewImage: { width: '100%', height: '100%' },
  photoHint: { fontSize: 10, color: '#888', marginTop: 5, fontWeight: '700' },
  submitButton: {
    backgroundColor: '#FFCC00',
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#FFCC00',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  submitButtonText: { color: '#000', fontSize: 16, fontWeight: '900' },
});
