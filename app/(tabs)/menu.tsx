import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

const MENU_SECTIONS = [
  {
    title: 'Clientèle',
    items: [
      { id: 'clients', label: 'Liste clients', icon: 'business-outline', color: '#3498db' },
      { id: 'tax', label: 'Situations fiscales', icon: 'document-text-outline', color: '#e67e22' },
      { id: 'social', label: 'Situations sociales', icon: 'people-circle-outline', color: '#9b59b6' },
    ]
  },
  {
    title: 'RH & Personnel',
    items: [
      { id: 'employees', label: 'Employés', icon: 'people-outline', color: '#2ecc71' },
      { id: 'attendance', label: 'Présence', icon: 'time-outline', color: '#1abc9c' },
      { id: 'leaves', label: 'Permissions', icon: 'briefcase-outline', color: '#e74c3c' },
    ]
  },
  {
    title: 'Travail',
    items: [
      { id: 'documents', label: 'Documents & Fichiers', icon: 'document-attach-outline', color: '#3498db' },
      { id: 'financial', label: 'États Financiers', icon: 'bar-chart-outline', color: '#27ae60' },
      { id: 'formation', label: 'Formation', icon: 'school-outline', color: '#e67e22' },
      { id: 'knowledge', label: 'Base de connaissances', icon: 'book-outline', color: '#9b59b6' },
    ]
  },
  {
    title: 'Finance',
    items: [
      { id: 'invoices', label: 'Factures', icon: 'calendar-outline', color: '#f1c40f' },
      { id: 'expenses', label: 'Dépenses', icon: 'wallet-outline', color: '#e74c3c' },
      { id: 'treasury', label: 'Trésorerie', icon: 'card-outline', color: '#2ecc71' },
      { id: 'products', label: 'Produits & Service', icon: 'basket-outline', color: '#3498db' },
    ]
  },
  {
    title: 'Communication',
    items: [
      { id: 'messages', label: 'Messages', icon: 'chatbubbles-outline', color: '#e74c3c' },
    ]
  },
  {
    title: 'Préférences',
    items: [
      { id: 'settings', label: 'Paramètres', icon: 'settings-outline', color: '#95a5a6' },
      { id: 'logout', label: 'Se déconnecter', icon: 'power-outline', color: '#c0392b' },
    ]
  }
];

export default function MenuScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const loadUserData = async () => {
      const data = await SecureStore.getItemAsync('user_data');
      if (data) setUserData(JSON.parse(data));
    };
    loadUserData();
  }, []);

  const handleMenuPress = (id: string) => {
    switch (id) {
      case 'messages':
        router.push('/messages');
        break;
      case 'clients':
        router.push('/clients');
        break;
      case 'tax':
        router.push('/clients/situations-fiscales');
        break;
      case 'social':
        router.push('/clients/situations-sociales');
        break;
      case 'invoices':
        router.push('/finance/factures');
        break;
      case 'employees':
        router.push('/rh/employes');
        break;
      case 'attendance':
        router.push('/rh/presences');
        break;
      case 'leaves':
        router.push('/rh/permissions');
        break;
      case 'documents':
        router.push('/travail/documents');
        break;
      case 'financial':
        router.push('/finance/etats-financiers');
        break;
      case 'formation':
        router.push('/travail/formations');
        break;
      case 'knowledge':
        router.push('/travail/knowledge-base');
        break;
      case 'expenses':
        router.push('/finance/depenses');
        break;
      case 'treasury':
        router.push('/finance/tresorerie');
        break;
      case 'products':
        router.push('/finance/products-services');
        break;
      case 'settings':
        router.push('/user/profile-settings');
        break;
      case 'logout':
        Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Déconnexion', style: 'destructive', onPress: () => router.replace('/login') }
        ]);
        break;
      default:
        Alert.alert('Info', 'Cette section sera disponible dans la prochaine mise à jour.');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Profil Header */}
      <View style={[styles.profileCard, { backgroundColor: '#181818' }]}>
        <View style={styles.profileInfo}>
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={() => router.push('/user/profile-settings')}
          >
            {userData?.avatar ? (
              <Image source={{ uri: userData.avatar }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{userData?.name?.substring(0, 2).toUpperCase() || 'WG'}</Text>
            )}
          </TouchableOpacity>
          <View>
            <Text style={styles.userName}>{userData?.name || 'Williams Guy'}</Text>
            <Text style={styles.userRole}>{userData?.role || 'Responsable'}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => router.push('/user/profile-settings')}
        >
          <Ionicons name="pencil" size={16} color="#FFCC00" />
        </TouchableOpacity>
      </View>

      {/* Sections de Menu */}
      <View style={styles.menuContent}>
        {MENU_SECTIONS.map((section, idx) => (
          <View key={idx} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>{section.title}</Text>
            <View style={[styles.sectionCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
              {section.items.map((item, itemIdx) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handleMenuPress(item.id)}
                  style={[
                    styles.menuItem,
                    itemIdx < section.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: themeColors.border }
                  ]}
                >
                  <View style={[styles.iconBg, { backgroundColor: item.color + '15' }]}>
                    <Ionicons name={item.icon as any} size={20} color={item.color} />
                  </View>
                  <Text style={[styles.menuLabel, { color: themeColors.text }]}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={16} color={themeColors.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.versionText}>Version 5.4.7</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileCard: {
    paddingTop: 60,
    paddingHorizontal: 25,
    paddingBottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },
  profileInfo: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  avatarContainer: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFCC00', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  avatarText: { fontSize: 20, fontWeight: '900', color: '#000' },
  userName: { color: '#FFF', fontSize: 20, fontWeight: '800' },
  userRole: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '600' },
  editBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  menuContent: { padding: 25 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginLeft: 5 },
  sectionCard: { borderRadius: 24, borderWidth: 1, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 15 },
  iconBg: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '600' },
  versionText: { textAlign: 'center', color: '#999', fontSize: 11, marginBottom: 40, fontWeight: '600' }
});
