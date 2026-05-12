import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const TABS = ['Aperçu', 'Tâches', 'Factures', 'Fichiers', 'Activité'];

export default function DiligenceDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const [activeTab, setActiveTab] = useState('Aperçu');

  const renderContent = () => {
    if (activeTab === 'Aperçu') {
      return (
        <>
          {/* Progress Card */}
          <View style={[styles.mainCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
            <View style={styles.cardRow}>
              <View>
                <Text style={[styles.label, { color: themeColors.textSecondary }]}>Statut</Text>
                <View style={styles.statusBadge}>
                  <View style={[styles.statusDot, { backgroundColor: '#679C0D' }]} />
                  <Text style={styles.statusText}>TERMINÉE</Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.label, { color: themeColors.textSecondary }]}>Progression</Text>
                <Text style={[styles.progressVal, { color: themeColors.text }]}>0%</Text>
              </View>
            </View>

            <View style={styles.dateRow}>
              <View style={styles.dateBox}>
                <Ionicons name="calendar-outline" size={16} color={themeColors.textSecondary} />
                <View>
                  <Text style={styles.dateLabel}>Début</Text>
                  <Text style={styles.dateText}>27/11/2024</Text>
                </View>
              </View>
              <View style={styles.dateBox}>
                <Ionicons name="flag-outline" size={16} color="#e74c3c" />
                <View>
                  <Text style={styles.dateLabel}>Limite</Text>
                  <Text style={styles.dateText}>06/01/2025</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Client Card */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Client</Text>
          </View>
          <View style={[styles.clientCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
            <View style={styles.clientInfo}>
              <View style={styles.avatarLarge}>
                <Text style={styles.avatarText}>MA</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.clientName, { color: themeColors.text }]}>Miss assemien</Text>
                <Text style={[styles.clientCompany, { color: themeColors.textSecondary }]}>SUBLIME START</Text>
                <View style={styles.countryRow}>
                  <Ionicons name="location-outline" size={12} color={themeColors.textSecondary} />
                  <Text style={styles.countryText}>Côte d'Ivoire</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.msgBtn}>
              <Ionicons name="logo-whatsapp" size={18} color="#FFF" />
              <Text style={styles.msgBtnText}>Message WhatsApp</Text>
            </TouchableOpacity>
          </View>

          {/* Stats Grid */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Statistiques</Text>
          </View>
          <View style={styles.statsGrid}>
            {[
              { label: 'Budget', value: '0 FCFA', icon: 'wallet-outline' },
              { label: 'Heures', value: '0.00', icon: 'time-outline' },
              { label: 'Gains', value: '0 FCFA', icon: 'trending-up-outline' },
              { label: 'Profit', value: '0 FCFA', icon: 'cash-outline' },
            ].map((stat, i) => (
              <View key={i} style={[styles.statCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
                <View style={styles.statIconBg}>
                  <Ionicons name={stat.icon as any} size={18} color="#FFCC00" />
                </View>
                <Text style={[styles.statValue, { color: themeColors.text }]}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </>
      );
    }

    if (activeTab === 'Tâches') {
      return (
        <View>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Tâches associées</Text>
          </View>
          {[1, 2, 3].map((i) => (
            <View key={i} style={[styles.taskMiniCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
              <TouchableOpacity style={styles.miniCheck}>
                <Ionicons name="square-outline" size={20} color={themeColors.textSecondary} />
              </TouchableOpacity>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.taskMiniTitle, { color: themeColors.text }]}>Étape de vérification #{i}</Text>
                <Text style={{ fontSize: 11, color: themeColors.textSecondary, marginTop: 2 }}>Responsable : Williams Guy</Text>
              </View>
              <View style={styles.priorityMiniBadge}>
                <Text style={styles.priorityMiniText}>HAUTE</Text>
              </View>
            </View>
          ))}
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Ionicons name="construct-outline" size={48} color={themeColors.textSecondary} />
        <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
          Cette section "{activeTab}" est bientôt disponible.
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header Dark */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFCC00" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>Congé de fin d'année DC-K</Text>
          <Text style={styles.headerSub}>Diligences • ID: {id}</Text>
        </View>
        <TouchableOpacity style={styles.pinBtn}>
          <Ionicons name="pin-outline" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Tabs Menu */}
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

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {renderContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  pinBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  tabsWrapper: { backgroundColor: '#181818', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  tabsScroll: { paddingHorizontal: 20 },
  tabItem: { paddingVertical: 15, paddingHorizontal: 15, marginRight: 10, position: 'relative' },
  tabItemActive: {},
  tabText: { fontSize: 14, fontWeight: '700' },
  tabIndicator: { position: 'absolute', bottom: 0, left: 15, right: 15, height: 3, backgroundColor: '#FFCC00', borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  content: { padding: 20, paddingBottom: 40 },
  mainCard: { borderRadius: 24, padding: 20, borderWidth: 1, marginBottom: 10 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  label: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 5 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0fdf4', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 10, fontWeight: '900', color: '#166534' },
  progressVal: { fontSize: 24, fontWeight: '900' },
  dateRow: { flexDirection: 'row', gap: 20, paddingTop: 15, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  dateBox: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  dateLabel: { fontSize: 11, color: '#888', fontWeight: '600' },
  dateText: { fontSize: 13, fontWeight: '700' },
  sectionHeader: { marginTop: 20, marginBottom: 15, marginLeft: 5 },
  sectionTitle: { fontSize: 16, fontWeight: '800' },
  clientCard: { borderRadius: 24, padding: 20, borderWidth: 1, marginBottom: 10 },
  clientInfo: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 20 },
  avatarLarge: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FFCC00', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 18, fontWeight: '900', color: '#000' },
  clientName: { fontSize: 17, fontWeight: '800' },
  clientCompany: { fontSize: 13, fontWeight: '600' },
  countryRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  countryText: { fontSize: 12, color: '#888', fontWeight: '600' },
  msgBtn: { backgroundColor: '#25D366', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 15, gap: 8 },
  msgBtnText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { width: '47%', borderRadius: 20, padding: 16, borderWidth: 1 },
  statIconBg: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(255,204,0,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statValue: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  statLabel: { fontSize: 11, color: '#888', fontWeight: '700', textTransform: 'uppercase' },
  taskMiniCard: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
  miniCheck: { padding: 2 },
  taskMiniTitle: { fontSize: 14, fontWeight: '700' },
  priorityMiniBadge: { backgroundColor: '#fee2e2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  priorityMiniText: { color: '#dc2626', fontSize: 9, fontWeight: '900' },
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 100, paddingHorizontal: 40 },
  emptyText: { textAlign: 'center', marginTop: 15, fontSize: 14, fontWeight: '600', opacity: 0.6 }
});
