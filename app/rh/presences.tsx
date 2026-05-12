import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Animated, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect, useCallback } from 'react';
import api from '@/services/api-service';

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

  // Mise à jour de l'horloge chaque seconde
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchAttendanceData = async () => {
    try {
      const response = await api.get('/attendances');
      setHistory(response.data.history || []);
      setIsClockedIn(response.data.active || false);
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
    try {
      const response = await api.post('/clock-in-out');
      Alert.alert('Succès', response.data.message);
      fetchAttendanceData(); // Rafraîchir après action
    } catch (error) {
      console.error('Erreur pointage:', error);
      Alert.alert('Erreur', 'Impossible de valider le pointage.');
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
          <Text style={styles.headerTitle}>Présence & Pointage</Text>
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
                  {isClockedIn ? 'Départ' : 'Arrivée'}
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
                <View style={styles.logDateBox}>
                  <Text style={[styles.logDate, { color: themeColors.text }]}>{log.date}</Text>
                  <Text style={styles.logTotal}>{log.total}</Text>
                </View>
                <View style={styles.logTimeRow}>
                  <View style={styles.timeTag}>
                    <Text style={styles.timeLabel}>IN</Text>
                    <Text style={[styles.timeValue, { color: themeColors.text }]}>{log.in}</Text>
                  </View>
                  <View style={styles.timeTag}>
                    <Text style={styles.timeLabel}>OUT</Text>
                    <Text style={[styles.timeValue, { color: themeColors.text }]}>{log.out}</Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <Text style={{ textAlign: 'center', color: themeColors.textSecondary, marginTop: 20 }}>
              Aucun historique trouvé.
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 12,
  },
  logDateBox: { gap: 2 },
  logDate: { fontSize: 14, fontWeight: '700' },
  logTotal: { fontSize: 12, color: '#FFCC00', fontWeight: '800' },
  logTimeRow: { flexDirection: 'row', gap: 15 },
  timeTag: { alignItems: 'center' },
  timeLabel: { fontSize: 10, color: '#AAA', fontWeight: '800', marginBottom: 2 },
  timeValue: { fontSize: 14, fontWeight: '800' },
});
