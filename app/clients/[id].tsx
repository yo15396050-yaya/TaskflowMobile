import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Linking, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import api from '@/services/api-service';

const TABS = ['Infos', 'Diligences', 'Factures'];

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const [activeTab, setActiveTab] = useState('Infos');
  const [loading, setLoading] = useState(true);
  const [clientData, setClientData] = useState<any>(null);

  useEffect(() => {
    const fetchClientDetails = async () => {
      try {
        const response = await api.get(`/clients/${id}`);
        setClientData(response.data);
      } catch (error) {
        console.error('Erreur chargement détails client:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientDetails();
  }, [id]);

  const handleAction = (type: 'tel' | 'mailto' | 'whatsapp') => {
    if (!clientData) return;
    let url = '';
    if (type === 'tel') url = `tel:${clientData.mobile}`;
    if (type === 'mailto') url = `mailto:${clientData.email}`;
    if (type === 'whatsapp') url = `whatsapp://send?phone=${clientData.mobile}`;
    Linking.openURL(url);
  };

  const renderContent = () => {
    if (loading) return (
      <View style={styles.emptyState}>
        <ActivityIndicator size="large" color="#FFCC00" />
      </View>
    );

    if (!clientData) return (
      <View style={styles.emptyState}>
        <Text style={{ color: themeColors.textSecondary }}>Client introuvable</Text>
      </View>
    );

    if (activeTab === 'Infos') {
      return (
        <View style={styles.tabContent}>
          <View style={[styles.infoCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
            <View style={styles.infoRow}>
              <Ionicons name="business-outline" size={20} color={themeColors.accent} />
              <View>
                <Text style={styles.infoLabel}>Entreprise</Text>
                <Text style={[styles.infoText, { color: themeColors.text }]}>{clientData.company_name}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color={themeColors.accent} />
              <View>
                <Text style={styles.infoLabel}>Adresse</Text>
                <Text style={[styles.infoText, { color: themeColors.text }]}>{clientData.address}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="globe-outline" size={20} color={themeColors.accent} />
              <View>
                <Text style={styles.infoLabel}>Site Web</Text>
                <Text style={[styles.infoText, { color: themeColors.accent }]}>{clientData.website}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={20} color={themeColors.accent} />
              <View>
                <Text style={styles.infoLabel}>Bureau</Text>
                <Text style={[styles.infoText, { color: themeColors.text }]}>{clientData.office_phone}</Text>
              </View>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Ionicons name="hourglass-outline" size={48} color={themeColors.textSecondary} />
        <Text style={{ color: themeColors.textSecondary, marginTop: 10 }}>Bientôt disponible...</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Mini Header / Back */}
      <View style={styles.topNav}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFCC00" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.editBtn}>
          <Ionicons name="create-outline" size={22} color="#FFCC00" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Card Header */}
        <View style={[styles.profileHeader, { backgroundColor: '#181818' }]}>
          <View style={styles.avatarLarge}>
            {clientData?.avatar ? (
              <Image source={{ uri: clientData.avatar }} style={{ width: 90, height: 90, borderRadius: 30 }} />
            ) : (
              <Text style={styles.avatarText}>{clientData?.name?.substring(0, 2).toUpperCase() || '??'}</Text>
            )}
          </View>
          <Text style={styles.clientName}>{clientData?.name || 'Chargement...'}</Text>
          <Text style={styles.clientIndustry}>{clientData?.company_name} • {clientData?.country}</Text>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity onPress={() => handleAction('tel')} style={styles.actionBtn}>
              <Ionicons name="call" size={20} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleAction('whatsapp')} style={[styles.actionBtn, { backgroundColor: '#25D366' }]}>
              <Ionicons name="logo-whatsapp" size={20} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleAction('mailto')} style={styles.actionBtn}>
              <Ionicons name="mail" size={20} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Custom Tabs */}
        <View style={styles.tabsContainer}>
          {TABS.map((tab) => (
            <TouchableOpacity 
              key={tab} 
              onPress={() => setActiveTab(tab)}
              style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
            >
              <Text style={[styles.tabButtonText, { color: activeTab === tab ? '#FFCC00' : '#888' }]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {renderContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topNav: {
    paddingTop: 55,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#181818',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  editBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-end' },
  profileHeader: {
    paddingTop: 110,
    paddingBottom: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  avatarLarge: {
    width: 90,
    height: 90,
    borderRadius: 30,
    backgroundColor: '#FFCC00',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#FFCC00',
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  avatarText: { fontSize: 32, fontWeight: '900', color: '#000' },
  clientName: { color: '#FFF', fontSize: 24, fontWeight: '800', textAlign: 'center', marginHorizontal: 30 },
  clientIndustry: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '600', marginTop: 5 },
  quickActions: { flexDirection: 'row', gap: 20, marginTop: 25 },
  actionBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFCC00', justifyContent: 'center', alignItems: 'center' },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 20,
    gap: 15,
  },
  tabButton: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, backgroundColor: 'transparent' },
  tabButtonActive: { backgroundColor: 'rgba(255,204,0,0.1)' },
  tabButtonText: { fontSize: 14, fontWeight: '700' },
  tabContent: { paddingHorizontal: 20 },
  infoCard: { borderRadius: 24, padding: 20, borderWidth: 1, gap: 25 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  infoLabel: { fontSize: 11, color: '#888', fontWeight: '700', textTransform: 'uppercase', marginBottom: 2 },
  infoText: { fontSize: 15, fontWeight: '700' },
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 50 },
});
