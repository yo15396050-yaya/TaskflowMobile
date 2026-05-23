import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, RefreshControl, Dimensions, FlatList, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import api from '@/services/api-service';
import * as SecureStore from 'expo-secure-store';
import { ExpoImage } from 'expo-image';

const { width } = Dimensions.get('window');

const MISSIONS_MOCK = [
  { id: 1, title: 'Bilan Annuel 2023', category: 'Fiscalité', progress: 85, color: '#FF7675' },
  { id: 2, title: 'Déclarations TVA', category: 'Juridique', progress: 40, color: '#74B9FF' },
  { id: 3, title: 'Contrats Travail', category: 'RH', progress: 100, color: '#55E6C1' },
];

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const [stats, setStats] = useState({
    activeDiligences: 0,
    totalTasks: 0,
    userName: 'Chargement...',
    honoraires: '0',
    unreadNotifs: 0
  });
  
  const [userData, setUserData] = useState<any>(null);
  const [diligences, setDiligences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const storedUserData = await SecureStore.getItemAsync('user_data');
      const user = storedUserData ? JSON.parse(storedUserData) : null;
      setUserData(user);

      // Wrapper sécurisé pour éviter que l'app ne crashe si une route manque (404)
      const getSafe = async (url: string, defaultValue: any = []) => {
        try {
          return await api.get(url);
        } catch (e) {
          console.warn(`[API] Route introuvable ou erreur: ${url}`);
          return { data: defaultValue };
        }
      };

      const [dilisResponse, tasksResponse, notifResponse, honorairesResponse] = await Promise.all([
        getSafe('/getAlldiligences'),
        getSafe('/tasks'),
        getSafe('/notifications/unread-count', { count: 0 }),
        user ? getSafe(`/dashboard/honoraires/${user.id}`, { sum: '0' }) : Promise.resolve({ data: { sum: '0' } })
      ]);

      const dilisData = dilisResponse.data?.data || dilisResponse.data || [];
      const tasksData = tasksResponse.data?.data || tasksResponse.data || [];

      setStats({
        activeDiligences: Array.isArray(dilisData) ? dilisData.length : 0,
        totalTasks: Array.isArray(tasksData) ? tasksData.length : 0,
        userName: user?.name || 'Williams Guy',
        honoraires: honorairesResponse.data?.sum || '0',
        unreadNotifs: notifResponse.data?.count || 0
      });

      if (Array.isArray(dilisData)) {
        setDiligences(dilisData.slice(0, 5));
      }
    } catch (error) {
      console.error('Erreur critique Dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const renderMissionCard = ({ item, index }: { item: any, index: number }) => (
    <TouchableOpacity 
      key={item.id}
      style={[styles.missionCard, { backgroundColor: themeColors.cardBackground }]}
      onPress={() => router.push('/(tabs)/diligences')}
    >
      <View style={[styles.missionTag, { backgroundColor: (item.color || themeColors.accent) + '20' }]}>
        <Text style={[styles.missionTagText, { color: item.color || themeColors.accent }]}>{item.project_name ? 'Audit' : 'Diligence'}</Text>
      </View>
      <Text style={[styles.missionTitle, { color: themeColors.text }]} numberOfLines={2}>
        {item.project_name || item.title}
      </Text>
      <View style={styles.missionFooter}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: (item.progress || 50) + '%', backgroundColor: item.color || themeColors.accent }]} />
          </View>
          <Text style={[styles.progressText, { color: themeColors.textSecondary }]}>{item.progress || 50}%</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchDashboardData(); }} tintColor={themeColors.accent} />}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER SECTION */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={[styles.welcomeText, { color: themeColors.textSecondary }]}>Tableau de bord</Text>
              <Text style={[styles.userName, { color: themeColors.text }]}>{stats.userName}</Text>
            </View>
            <TouchableOpacity 
              onPress={() => router.push('/notifications')}
              style={[styles.notifCircle, { backgroundColor: themeColors.cardBackground }]}
            >
              <Ionicons name="notifications" size={24} color={themeColors.text} />
              {stats.unreadNotifs > 0 && <View style={styles.notifDot} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* HERO CARD - FINANCIAL */}
        <View style={[styles.heroCard, { backgroundColor: themeColors.accent }]}>
          <View style={styles.heroContent}>
            <Text style={styles.heroLabel}>SOLDE DES HONORAIRES</Text>
            <Text style={styles.heroAmount}>{stats.honoraires} <Text style={styles.currency}>FCFA</Text></Text>
            <TouchableOpacity style={styles.heroBtn} onPress={() => router.push('/finance/factures')}>
              <Text style={styles.heroBtnText}>Consulter les factures</Text>
              <Ionicons name="arrow-forward" size={16} color="#000" />
            </TouchableOpacity>
          </View>
          <Ionicons name="card" size={120} color="rgba(0,0,0,0.05)" style={styles.heroBgIcon} />
        </View>

        {/* MISSIONS CAROUSEL */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Missions en cours</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/diligences')}>
            <Text style={{ color: themeColors.accent, fontWeight: '700' }}>Voir tout</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          horizontal
          data={diligences.length > 0 ? diligences : MISSIONS_MOCK}
          renderItem={renderMissionCard}
          keyExtractor={(item) => item.id.toString()}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContainer}
          snapToInterval={width * 0.7 + 20}
          decelerationRate="fast"
        />

        {/* QUICK ACCESS GRID */}
        <Text style={[styles.sectionTitle, { color: themeColors.text, marginLeft: 20, marginBottom: 15 }]}>Accès Rapide</Text>
        <View style={styles.grid}>
          <TouchableOpacity style={[styles.gridItem, { backgroundColor: themeColors.cardBackground }]} onPress={() => router.push('/travail/documents')}>
            <View style={[styles.gridIcon, { backgroundColor: '#E1F5FE' }]}><Ionicons name="document-attach" size={24} color="#03A9F4" /></View>
            <Text style={[styles.gridLabel, { color: themeColors.text }]}>Documents</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.gridItem, { backgroundColor: themeColors.cardBackground }]} onPress={() => router.push('/finance/depenses')}>
            <View style={[styles.gridIcon, { backgroundColor: '#FFF3E0' }]}><Ionicons name="pie-chart" size={24} color="#FF9800" /></View>
            <Text style={[styles.gridLabel, { color: themeColors.text }]}>Finance</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.gridItem, { backgroundColor: themeColors.cardBackground }]} onPress={() => router.push('/rh/presences')}>
            <View style={[styles.gridIcon, { backgroundColor: '#E8F5E9' }]}><Ionicons name="calendar-outline" size={24} color="#4CAF50" /></View>
            <Text style={[styles.gridLabel, { color: themeColors.text }]}>RH & Paie</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.gridItem, { backgroundColor: themeColors.cardBackground }]} 
            onPress={() => {
              Alert.alert(
                'Support & Assistance',
                'Pour toute demande de support ou assistance technique, veuillez soumettre votre requête via notre portail Web ou contacter directement votre administrateur.',
                [{ text: 'Compris', style: 'default' }]
              );
            }}
          >
            <View style={[styles.gridIcon, { backgroundColor: '#F3E5F5' }]}><Ionicons name="megaphone" size={24} color="#9C27B0" /></View>
            <Text style={[styles.gridLabel, { color: themeColors.text }]}>Support</Text>
          </TouchableOpacity>
        </View>

        {/* FOOTER TASK STATUS */}
        <View style={[styles.taskStatusCard, { backgroundColor: themeColors.cardBackground }]}>
          <View style={styles.taskStatusLeft}>
            <View style={styles.taskIcon}><Ionicons name="list" size={24} color={themeColors.accent} /></View>
            <View>
              <Text style={[styles.taskStatusTitle, { color: themeColors.text }]}>Vos Tâches</Text>
              <Text style={[styles.taskStatusSub, { color: themeColors.textSecondary }]}>{stats.totalTasks} tâches enregistrées</Text>
            </View>
          </View>
          <TouchableOpacity style={[styles.plusBtn, { backgroundColor: themeColors.accent }]} onPress={() => router.push('/(tabs)/tasks')}>
            <Ionicons name="chevron-forward" size={20} color="#000" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingTop: 60, paddingBottom: 100 },
  header: { paddingHorizontal: 20, marginBottom: 25 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  welcomeText: { fontSize: 14, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  userName: { fontSize: 26, fontWeight: '900', marginTop: 4 },
  notifCircle: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  notifDot: { position: 'absolute', top: 12, right: 12, width: 10, height: 10, borderRadius: 5, backgroundColor: '#FF4757', borderWidth: 2, borderColor: '#fff' },
  
  heroCard: { marginHorizontal: 20, borderRadius: 30, padding: 25, marginBottom: 30, overflow: 'hidden', elevation: 10, shadowColor: '#FFCC00', shadowOpacity: 0.3, shadowRadius: 20 },
  heroContent: { zIndex: 1 },
  heroLabel: { fontSize: 12, fontWeight: '800', color: 'rgba(0,0,0,0.5)', letterSpacing: 1 },
  heroAmount: { fontSize: 34, fontWeight: '900', color: '#000', marginVertical: 10 },
  currency: { fontSize: 18, fontWeight: '700' },
  heroBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', alignSelf: 'flex-start', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12, marginTop: 5, gap: 5 },
  heroBtnText: { fontSize: 13, fontWeight: '800' },
  heroBgIcon: { position: 'absolute', right: -20, bottom: -20 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
  sectionTitle: { fontSize: 20, fontWeight: '800' },
  carouselContainer: { paddingLeft: 20, paddingRight: 20, paddingBottom: 30 },
  missionCard: { width: width * 0.7, padding: 20, borderRadius: 28, marginRight: 15, elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15 },
  missionTag: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10, marginBottom: 15 },
  missionTagText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  missionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 15, height: 44 },
  missionFooter: { borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', paddingTop: 15 },
  progressContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressBar: { flex: 1, height: 6, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressText: { fontSize: 12, fontWeight: '800' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 15, gap: 12, marginBottom: 30 },
  gridItem: { width: (width - 42) / 2, padding: 20, borderRadius: 25, alignItems: 'center', gap: 10, elevation: 2 },
  gridIcon: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  gridLabel: { fontSize: 14, fontWeight: '700' },

  taskStatusCard: { marginHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderRadius: 25, elevation: 3 },
  taskStatusLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  taskIcon: { width: 45, height: 45, borderRadius: 15, backgroundColor: 'rgba(255,204,0,0.1)', justifyContent: 'center', alignItems: 'center' },
  taskStatusTitle: { fontSize: 16, fontWeight: '800' },
  taskStatusSub: { fontSize: 12, fontWeight: '500' },
  plusBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
});
