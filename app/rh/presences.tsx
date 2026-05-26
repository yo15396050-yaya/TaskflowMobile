import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Animated, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect, useCallback } from 'react';
import api from '@/services/api-service';
import * as SecureStore from 'expo-secure-store';

export default function AttendanceScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState<string>('Utilisateur');

  // Mise a jour de l'horloge chaque seconde
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Recuperer le nom de l'utilisateur depuis SecureStore
  useEffect(() => {
    const loadUserName = async () => {
      try {
        const userData = await SecureStore.getItemAsync('user_data');
        if (userData) {
          const user = JSON.parse(userData);
          setUserName(user.name || 'Utilisateur');
        }
      } catch (error) {
        console.error('Erreur chargement userName:', error);
      }
    };
    loadUserName();
  }, []);

  const formatTimeString = (value?: string | null) => {
    if (!value) {
      return '';
    }

    let raw = String(value).trim();
    raw = raw.replace(/h/i, ':').replace(/\s+/g, '');

    const timeMatch = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
    if (timeMatch) {
      const hour = timeMatch[1].padStart(2, '0');
      const minute = timeMatch[2];
      return `${hour}:${minute}`;
    }

    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }

    return raw;
  };

  const computeDuration = (start?: string, end?: string) => {
    if (!start || !end) {
      return null;
    }

    const toMinutes = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      if (Number.isNaN(hours) || Number.isNaN(minutes)) {
        return null;
      }
      return hours * 60 + minutes;
    };

    const startMinutes = toMinutes(formatTimeString(start));
    const endMinutes = toMinutes(formatTimeString(end));
    if (startMinutes === null || endMinutes === null || endMinutes < startMinutes) {
      return null;
    }

    const diff = endMinutes - startMinutes;
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    return `${hours}h${minutes.toString().padStart(2, '0')}`;
  };

  const fetchAttendanceData = async () => {
    try {
      const response = await api.get('/attendances');
      const attendanceData = response.data || {};
      const rawHistory = Array.isArray(attendanceData.history) ? attendanceData.history : [];
      const formattedHistory = rawHistory.map((item: any) => {
        const inTime = formatTimeString(item.in || item.check_in || item.start_time);
        const outTime = formatTimeString(item.out || item.check_out || item.end_time);
        return {
          ...item,
          userName: item.userName || item.name || item.nom || '',
          in: inTime || '--:--',
          out: outTime || '--:--',
          total: item.total && item.total !== 'N/A' ? item.total : computeDuration(inTime, outTime) || 'En cours',
        };
      });

      setHistory(formattedHistory);
      setIsClockedIn(attendanceData.active || false);
    } catch (error) {
      console.error('Erreur presences:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAttendanceData();
  }, []);

  const handleClockAction = async () => {
    setSubmitting(true);
    const wasClocked = isClockedIn;
    try {
      await api.post('/clock-in-out');
      const time = currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

      // Attendre que le backend ait le temps de traiter
      await new Promise(resolve => setTimeout(resolve, 800));

      // Rafraichir l'historique AVANT d'afficher le message
      await fetchAttendanceData();

      const successMessage = wasClocked
        ? `Votre depart a ete enregistre a ${time}. Bonne fin de journee !`
        : `Votre arrivee a ete enregistree a ${time}. Bonne journee !`;
      Alert.alert(
        wasClocked ? 'Depart confirme' : 'Arrivee confirmee',
        successMessage
      );
    } catch (error) {
      console.error('Erreur pointage:', error);
      Alert.alert('Erreur', 'Impossible de valider le pointage. Veuillez reessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header avec horloge */}
      <View style={[styles.header, { backgroundColor: '#181818' }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={themeColors.accent} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Presence & Pointage</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.clockContainer}>
          <Text style={styles.currentTime}>
            {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </Text>
          <Text style={styles.currentDate}>
            {currentTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </Text>
        </View>
      </View>

      <ScrollView 
        style={{ zIndex: 10, marginTop: -40 }} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeColors.accent} />}
      >
        {/* BOUTON DE POINTAGE CENTRAL */}
        <View style={styles.clockSection}>
          <TouchableOpacity 
            style={[
              styles.clockBtn, 
              { backgroundColor: isClockedIn ? '#e74c3c' : themeColors.accent },
              submitting && { opacity: 0.7 }
            ]}
            onPress={handleClockAction}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={isClockedIn ? '#fff' : '#000'} />
            ) : (
              <>
                <Ionicons 
                  name={isClockedIn ? "exit-outline" : "enter-outline"} 
                  size={42} 
                  color={isClockedIn ? '#fff' : '#000'} 
                />
                <Text style={[styles.clockBtnText, { color: isClockedIn ? '#fff' : '#000' }]}>
                  {isClockedIn ? 'Depart' : 'Arrivee'}
                </Text>
              </>
            )}
          </TouchableOpacity>
          
          <View style={styles.locationInfo}>
            <Ionicons name="location-outline" size={16} color={isClockedIn ? '#2ecc71' : themeColors.textSecondary} />
            <Text style={[styles.locationText, { color: themeColors.textSecondary }]}>
              {isClockedIn ? 'En service actuellement' : 'Hors service'}
            </Text>
          </View>
        </View>

        {/* Historique */}
        <View style={styles.historySection}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Historique de pointage</Text>
          
          {loading ? (
            <ActivityIndicator size="small" color={themeColors.accent} />
          ) : history.length > 0 ? (
            history.map(log => (
              <View key={log.id} style={[styles.logItem, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
                {/* En-tete: Nom utilisateur et date */}
                <View style={styles.logHeader}>
                  <View style={styles.userInfo}>
                    <Ionicons name="person-circle" size={24} color={themeColors.accent} />
                    <View style={styles.userDetails}>
                      <Text style={[styles.userName, { color: themeColors.text }]}>{log.userName || userName}</Text>
                      <Text style={[styles.logDate, { color: themeColors.secondaryText }]}>{log.date}</Text>
                    </View>
                  </View>
                  <View style={styles.totalDuration}>
                    <Text style={styles.durationLabel}>Duree</Text>
                    <Text style={[styles.logTotal, { color: themeColors.text }]}>{log.total || 'En cours'}</Text>
                  </View>
                </View>
                
                {/* Heures d'entree et sortie */}
                <View style={styles.logTimeRow}>
                  <View style={[styles.timeCard, { backgroundColor: themeColors.background }]}>
                    <View style={styles.timeTagRow}>
                      <Ionicons name="log-in" size={18} color="#2ecc71" />
                      <Text style={[styles.timeLabel, { color: themeColors.secondaryText }]}>Entree</Text>
                    </View>
                    <Text style={[styles.timeValue, { color: themeColors.text }]}>{log.in}</Text>
                  </View>
                  
                  <View style={[styles.timeCard, { backgroundColor: themeColors.background }]}>
                    <View style={styles.timeTagRow}>
                      <Ionicons name="log-out" size={18} color="#e74c3c" />
                      <Text style={[styles.timeLabel, { color: themeColors.secondaryText }]}>Sortie</Text>
                    </View>
                    <Text style={[styles.timeValue, { color: themeColors.text }]}>{log.out || '--:--'}</Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <Text style={{ textAlign: 'center', color: themeColors.textSecondary, marginTop: 20 }}>
              Aucun historique trouve.
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 55,
    paddingBottom: 60,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    alignItems: 'center',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 25,
    marginBottom: 30,
  },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  clockContainer: { alignItems: 'center' },
  currentTime: { color: '#FFF', fontSize: 44, fontWeight: '900', letterSpacing: 2 },
  currentDate: { color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: '600', marginTop: 5, textTransform: 'capitalize' },
  scrollContent: { paddingBottom: 50 },
  clockSection: {
    alignItems: 'center',
    zIndex: 20,
    marginBottom: 20
  },
  clockBtn: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  clockBtnText: { fontSize: 13, fontWeight: '800', marginTop: 8, textTransform: 'uppercase' },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    gap: 6,
  },
  locationText: { fontSize: 13, fontWeight: '700' },
  historySection: { padding: 25 },
  sectionTitle: { fontSize: 18, fontWeight: '900', marginBottom: 20 },
  logItem: {
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 16,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  userDetails: {
    justifyContent: 'center',
  },
  userName: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  logDate: {
    fontSize: 12,
    fontWeight: '600',
  },
  totalDuration: {
    alignItems: 'flex-end',
  },
  durationLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '600',
    marginBottom: 4,
  },
  logTotal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFCC00',
  },
  logTimeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timeCard: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  timeTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '800',
  },
});
