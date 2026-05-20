import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, RefreshControl } from 'react-native';
import api from '@/services/api-service';

const TABS = ['Aperçu', 'Membres'];

export default function DiligenceDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const [project, setProject] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('Aperçu');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProjectDetail = async () => {
    try {
      const response = await api.get(`/projects/${id}`);
      setProject(response.data);
    } catch (error) {
      console.error('Erreur detail projet:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProjectDetail();
  }, [id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProjectDetail();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: themeColors.background }]}>
        <ActivityIndicator size="large" color={themeColors.accent} />
      </View>
    );
  }

  if (!project) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: themeColors.background }]}>
        <Text style={{ color: themeColors.text }}>Projet introuvable</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: themeColors.accent }}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderContent = () => {
    if (activeTab === 'Aperçu') {
      return (
        <>
          <View style={[styles.mainCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
            <View style={styles.cardRow}>
              <View>
                <Text style={[styles.label, { color: themeColors.textSecondary }]}>Statut</Text>
                <View style={styles.statusBadge}>
                  <View style={[styles.statusDot, { backgroundColor: project.status === 'finished' ? '#2ecc71' : '#3498db' }]} />
                  <Text style={styles.statusText}>{project.status?.toUpperCase()}</Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.label, { color: themeColors.textSecondary }]}>Catégorie</Text>
                <Text style={[styles.progressVal, { color: themeColors.text, fontSize: 14 }]}>{project.category_name}</Text>
              </View>
            </View>

            <View style={styles.dateRow}>
              <View style={styles.dateBox}>
                <Ionicons name="calendar-outline" size={16} color={themeColors.textSecondary} />
                <View>
                  <Text style={styles.dateLabel}>Début</Text>
                  <Text style={[styles.dateText, { color: themeColors.text }]}>{project.start_date}</Text>
                </View>
              </View>
              <View style={styles.dateBox}>
                <Ionicons name="flag-outline" size={16} color="#e74c3c" />
                <View>
                  <Text style={styles.dateLabel}>Limite</Text>
                  <Text style={[styles.dateText, { color: themeColors.text }]}>{project.deadline}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Client</Text>
          </View>
          <View style={[styles.clientCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
            <View style={styles.clientInfo}>
              <View style={styles.avatarLarge}>
                <Text style={styles.avatarText}>{project.client?.name?.substring(0, 2).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.clientName, { color: themeColors.text }]}>{project.client?.name}</Text>
                <Text style={[styles.clientCompany, { color: themeColors.textSecondary }]}>{project.client?.company_name}</Text>
              </View>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Résumé</Text>
          </View>
          <View style={[styles.clientCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
            <Text style={{ color: themeColors.text, lineHeight: 20 }}>
              {project.project_summary || "Aucun résumé disponible."}
            </Text>
          </View>
        </>
      );
    }

    if (activeTab === 'Membres') {
      return (
        <View style={{ gap: 12 }}>
          {project.members?.map((member: any) => (
            <View key={member.id} style={[styles.memberCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
              <View style={styles.avatarSmall}>
                <Text style={styles.avatarTextSmall}>{member.name?.substring(0, 2).toUpperCase()}</Text>
              </View>
              <Text style={[styles.memberName, { color: themeColors.text }]}>{member.name}</Text>
            </View>
          ))}
        </View>
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFCC00" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>{project.project_name}</Text>
          <Text style={styles.headerSub}>Diligences • ID: {id}</Text>
        </View>
      </View>

      <View style={styles.tabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
            >
              <Text style={[styles.tabText, { color: activeTab === tab ? '#FFCC00' : '#888' }]}>{tab}</Text>
              {activeTab === tab && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeColors.accent} />}
      >
        {renderContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#181818',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '600' },
  tabsWrapper: { backgroundColor: '#181818' },
  tabsScroll: { paddingHorizontal: 20 },
  tabItem: { paddingVertical: 15, paddingHorizontal: 15, marginRight: 10, position: 'relative' },
  tabItemActive: {},
  tabText: { fontSize: 14, fontWeight: '700' },
  tabIndicator: { position: 'absolute', bottom: 0, left: 15, right: 15, height: 3, backgroundColor: '#FFCC00', borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  content: { padding: 20, paddingBottom: 40 },
  mainCard: { borderRadius: 24, padding: 20, borderWidth: 1, marginBottom: 10 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  label: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 5 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 10, fontWeight: '900', color: '#888' },
  progressVal: { fontWeight: '800' },
  dateRow: { flexDirection: 'row', gap: 20, paddingTop: 15, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  dateBox: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  dateLabel: { fontSize: 11, color: '#888', fontWeight: '600' },
  dateText: { fontSize: 13, fontWeight: '700' },
  sectionHeader: { marginTop: 20, marginBottom: 15, marginLeft: 5 },
  sectionTitle: { fontSize: 16, fontWeight: '800' },
  clientCard: { borderRadius: 24, padding: 20, borderWidth: 1, marginBottom: 10 },
  clientInfo: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  avatarLarge: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FFCC00', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 18, fontWeight: '900', color: '#000' },
  clientName: { fontSize: 17, fontWeight: '800' },
  clientCompany: { fontSize: 13, fontWeight: '600' },
  memberCard: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 20, borderWidth: 1, gap: 15 },
  avatarSmall: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFCC00', justifyContent: 'center', alignItems: 'center' },
  avatarTextSmall: { fontSize: 14, fontWeight: '900', color: '#000' },
  memberName: { fontSize: 15, fontWeight: '700' }
});
