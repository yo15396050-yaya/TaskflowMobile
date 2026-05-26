import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import api from '@/services/api-service';

export default function AdminScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const [userData, setUserData] = useState<any>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTasks: 0,
    totalProjects: 0,
    activeProjects: 0,
    unreadNotifs: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const storedUserData = await SecureStore.getItemAsync('user_data');
      if (storedUserData) {
        setUserData(JSON.parse(storedUserData));
      }

      // Récupérer les statistiques du backend
      const getSafe = async (url: string, defaultValue: any = { data: [] }) => {
        try {
          return await api.get(url);
        } catch (e) {
          return defaultValue;
        }
      };

      const [usersResponse, tasksResponse, projectsResponse, notifsResponse] = await Promise.all([
        getSafe('/employees'),
        getSafe('/tasks'),
        getSafe('/getAlldiligences'),
        getSafe('/notifications/unread-count', { data: { count: 0 } })
      ]);

      const userCount = Array.isArray(usersResponse.data) ? usersResponse.data.length : 0;
      const taskCount = Array.isArray(tasksResponse.data) ? tasksResponse.data.length : 0;
      const projectCount = Array.isArray(projectsResponse.data) ? projectsResponse.data.length : 0;

      setStats({
        totalUsers: userCount,
        totalTasks: taskCount,
        totalProjects: projectCount,
        activeProjects: projectCount,
        unreadNotifs: notifsResponse.data?.count || 0
      });
    } catch (error) {
      console.error('Erreur chargement admin:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('user_token');
    await SecureStore.deleteItemAsync('user_data');
    router.replace('/login');
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}> 
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadAdminData(); }} tintColor={themeColors.accent} />}
      >
        {/* HEADER */}
        <View style={[styles.header, { backgroundColor: themeColors.accent }]}> 
          <Text style={styles.headerTitle}>Espace Administrateur</Text>
          <Text style={styles.headerSubtitle}>Dashboard • Gestion • Rapports</Text>
        </View>

        {/* WELCOME CARD */}
        <View style={[styles.welcomeCard, { backgroundColor: themeColors.cardBackground }]}> 
          <Text style={[styles.cardTitle, { color: themeColors.text }]}>Bienvenue{userData?.name ? ` ${userData.name}` : ''}</Text>
          <View style={styles.infoRow}>
            <Ionicons name="person-circle" size={20} color={themeColors.accent} />
            <Text style={[styles.infoText, { color: themeColors.text }]}>{userData?.email || 'email inconnu'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark" size={20} color={themeColors.accent} />
            <Text style={[styles.infoText, { color: themeColors.text }]}>{userData?.roles?.join(', ') || 'admin'}</Text>
          </View>
        </View>

        {/* STATISTIQUES */}
        {!loading ? (
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: themeColors.cardBackground }]}>
              <Ionicons name="people" size={32} color="#3498db" />
              <Text style={[styles.statValue, { color: themeColors.text }]}>{stats.totalUsers}</Text>
              <Text style={[styles.statLabel, { color: themeColors.secondaryText }]}>Utilisateurs</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: themeColors.cardBackground }]}>
              <Ionicons name="checkmark-circle" size={32} color="#2ecc71" />
              <Text style={[styles.statValue, { color: themeColors.text }]}>{stats.totalTasks}</Text>
              <Text style={[styles.statLabel, { color: themeColors.secondaryText }]}>Tâches</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: themeColors.cardBackground }]}>
              <Ionicons name="folder" size={32} color="#f39c12" />
              <Text style={[styles.statValue, { color: themeColors.text }]}>{stats.totalProjects}</Text>
              <Text style={[styles.statLabel, { color: themeColors.secondaryText }]}>Projets</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: themeColors.cardBackground }]}>
              <Ionicons name="notifications" size={32} color="#e74c3c" />
              <Text style={[styles.statValue, { color: themeColors.text }]}>{stats.unreadNotifs}</Text>
              <Text style={[styles.statLabel, { color: themeColors.secondaryText }]}>Notifications</Text>
            </View>
          </View>
        ) : (
          <ActivityIndicator size="large" color={themeColors.accent} style={styles.loader} />
        )}

        {/* MENU PRINCIPAL */}
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Gestion</Text>

        <TouchableOpacity style={[styles.menuButton, { backgroundColor: themeColors.cardBackground, borderLeftColor: '#3498db', borderLeftWidth: 4 }]} onPress={() => router.push('/user/all-users')}>
          <View style={styles.menuIcon}>
            <Ionicons name="people" size={24} color="#3498db" />
          </View>
          <View style={styles.menuContent}>
            <Text style={[styles.menuTitle, { color: themeColors.text }]}>Tous les utilisateurs</Text>
            <Text style={[styles.menuSubtitle, { color: themeColors.secondaryText }]}>Gérer employés et clients</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={themeColors.secondaryText} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuButton, { backgroundColor: themeColors.cardBackground, borderLeftColor: '#2ecc71', borderLeftWidth: 4 }]} onPress={() => router.push('/(tabs)/tasks')}>
          <View style={styles.menuIcon}>
            <Ionicons name="checkmark-circle" size={24} color="#2ecc71" />
          </View>
          <View style={styles.menuContent}>
            <Text style={[styles.menuTitle, { color: themeColors.text }]}>Tâches</Text>
            <Text style={[styles.menuSubtitle, { color: themeColors.secondaryText }]}>Suivi et gestion des tâches</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={themeColors.secondaryText} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuButton, { backgroundColor: themeColors.cardBackground, borderLeftColor: '#f39c12', borderLeftWidth: 4 }]} onPress={() => router.push('/(tabs)/diligences')}>
          <View style={styles.menuIcon}>
            <Ionicons name="folder" size={24} color="#f39c12" />
          </View>
          <View style={styles.menuContent}>
            <Text style={[styles.menuTitle, { color: themeColors.text }]}>Projets / Diligences</Text>
            <Text style={[styles.menuSubtitle, { color: themeColors.secondaryText }]}>Tous les projets en cours</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={themeColors.secondaryText} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuButton, { backgroundColor: themeColors.cardBackground, borderLeftColor: '#9b59b6', borderLeftWidth: 4 }]} onPress={() => router.push('/rh/presences')}>
          <View style={styles.menuIcon}>
            <Ionicons name="calendar" size={24} color="#9b59b6" />
          </View>
          <View style={styles.menuContent}>
            <Text style={[styles.menuTitle, { color: themeColors.text }]}>RH & Paie</Text>
            <Text style={[styles.menuSubtitle, { color: themeColors.secondaryText }]}>Présences et permissions</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={themeColors.secondaryText} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuButton, { backgroundColor: themeColors.cardBackground, borderLeftColor: '#1abc9c', borderLeftWidth: 4 }]} onPress={() => router.push('/finance/depenses')}>
          <View style={styles.menuIcon}>
            <Ionicons name="pie-chart" size={24} color="#1abc9c" />
          </View>
          <View style={styles.menuContent}>
            <Text style={[styles.menuTitle, { color: themeColors.text }]}>Finance</Text>
            <Text style={[styles.menuSubtitle, { color: themeColors.secondaryText }]}>Dépenses et factures</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={themeColors.secondaryText} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuButton, { backgroundColor: themeColors.cardBackground, borderLeftColor: '#34495e', borderLeftWidth: 4 }]} onPress={() => router.push('/messages')}>
          <View style={styles.menuIcon}>
            <Ionicons name="chatbubbles" size={24} color="#34495e" />
          </View>
          <View style={styles.menuContent}>
            <Text style={[styles.menuTitle, { color: themeColors.text }]}>Messagerie</Text>
            <Text style={[styles.menuSubtitle, { color: themeColors.secondaryText }]}>Conversations avec l'équipe</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={themeColors.secondaryText} />
        </TouchableOpacity>

        {/* ACTION BUTTONS */}
        <Text style={[styles.sectionTitle, { color: themeColors.text, marginTop: 28 }]}>Actions</Text>

        <TouchableOpacity style={[styles.actionButton, { backgroundColor: themeColors.accent }]} onPress={() => router.push('/(tabs)')}>
          <Ionicons name="people-circle" size={18} color="#000" />
          <Text style={styles.actionButtonText}>Accéder à l'espace employés</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: '#F44336' }]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color="#fff" />
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 8,
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#222',
  },
  welcomeCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  loader: {
    marginVertical: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
    marginTop: 12,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  menuIcon: {
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    marginLeft: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    marginTop: 12,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 8,
  },
});