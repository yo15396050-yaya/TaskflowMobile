import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Linking, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import api from '@/services/api-service';

export default function EmployeeDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/employees/${id}`);
      setEmployee(response.data);
    } catch (err: any) {
      console.error('Erreur détail employé:', err);
      setError('Impossible de charger les détails de cet employé.');
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (employee?.mobile) Linking.openURL(`tel:${employee.mobile}`);
  };
  const handleWhatsApp = () => {
    if (employee?.mobile) Linking.openURL(`whatsapp://send?phone=${employee.mobile}`);
  };
  const handleEmail = () => {
    if (employee?.email) Linking.openURL(`mailto:${employee.email}`);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FFCC00" />
        <Text style={{ color: themeColors.text, marginTop: 15, fontSize: 15, fontWeight: '600' }}>Chargement...</Text>
      </View>
    );
  }

  if (error || !employee) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Ionicons name="alert-circle-outline" size={60} color="#e74c3c" />
        <Text style={{ color: themeColors.text, marginTop: 15, fontSize: 16, fontWeight: '700', textAlign: 'center', paddingHorizontal: 40 }}>
          {error || 'Employé introuvable'}
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20, paddingVertical: 12, paddingHorizontal: 30, backgroundColor: '#FFCC00', borderRadius: 15 }}>
          <Text style={{ fontWeight: '800', color: '#000' }}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const avatarUrl = employee.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}&background=random&size=400`;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Image 
            source={{ uri: avatarUrl }} 
            style={styles.headerBg}
            blurRadius={10}
          />
          <View style={styles.headerOverlay}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: avatarUrl }} style={styles.mainAvatar} />
              <View style={[styles.statusDot, { backgroundColor: employee.status === 'active' ? '#2ecc71' : '#95a5a6' }]} />
            </View>
            
            <Text style={styles.nameText}>{employee.name}</Text>
            <Text style={styles.roleText}>{employee.role || 'Employé'} • {employee.dept || 'N/A'}</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: themeColors.text }]}>{employee.projects_count || 0}</Text>
            <Text style={styles.statLabel}>Projets</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: themeColors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: themeColors.text }]}>{employee.tasks_count || 0}</Text>
            <Text style={styles.statLabel}>Tâches</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: themeColors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: employee.status === 'active' ? '#2ecc71' : '#e74c3c' }]}>
              {employee.status === 'active' ? 'Actif' : 'Inactif'}
            </Text>
            <Text style={styles.statLabel}>Statut</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FFCC00' }]} onPress={handleCall}>
            <Ionicons name="call" size={22} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#2ecc71' }]} onPress={handleWhatsApp}>
            <Ionicons name="logo-whatsapp" size={22} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#3498db' }]} onPress={handleEmail}>
            <Ionicons name="mail" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Info Sections */}
        <View style={styles.infoWrapper}>
          <View style={[styles.infoCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
            <Text style={styles.sectionTitle}>Informations de contact</Text>
            
            <View style={styles.infoItem}>
              <Ionicons name="mail-outline" size={20} color="#FFCC00" />
              <View style={styles.infoTextWrapper}>
                <Text style={styles.infoLabel}>Email Professionnel</Text>
                <Text style={[styles.infoValue, { color: themeColors.text }]}>{employee.email || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="phone-portrait-outline" size={20} color="#FFCC00" />
              <View style={styles.infoTextWrapper}>
                <Text style={styles.infoLabel}>Téléphone</Text>
                <Text style={[styles.infoValue, { color: themeColors.text }]}>{employee.mobile || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={20} color="#FFCC00" />
              <View style={styles.infoTextWrapper}>
                <Text style={styles.infoLabel}>Adresse</Text>
                <Text style={[styles.infoValue, { color: themeColors.text }]}>{employee.address || 'N/A'}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.infoCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border, marginTop: 20 }]}>
            <Text style={styles.sectionTitle}>Détails Professionnels</Text>
            
            <View style={styles.infoItem}>
              <Ionicons name="id-card-outline" size={20} color="#FFCC00" />
              <View style={styles.infoTextWrapper}>
                <Text style={styles.infoLabel}>ID Employé</Text>
                <Text style={[styles.infoValue, { color: themeColors.text }]}>{employee.employee_id || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="briefcase-outline" size={20} color="#FFCC00" />
              <View style={styles.infoTextWrapper}>
                <Text style={styles.infoLabel}>Date d'intégration</Text>
                <Text style={[styles.infoValue, { color: themeColors.text }]}>{employee.joining_date || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="people-outline" size={20} color="#FFCC00" />
              <View style={styles.infoTextWrapper}>
                <Text style={styles.infoLabel}>Responsable hiérarchique</Text>
                <Text style={[styles.infoValue, { color: themeColors.text }]}>{employee.reporting_to || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="calendar-outline" size={20} color="#FFCC00" />
              <View style={styles.infoTextWrapper}>
                <Text style={styles.infoLabel}>Date de naissance</Text>
                <Text style={[styles.infoValue, { color: themeColors.text }]}>{employee.date_of_birth || 'N/A'}</Text>
              </View>
            </View>
          </View>
        </View>
        
        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileHeader: {
    height: 380,
    backgroundColor: '#000',
    position: 'relative',
  },
  headerBg: {
    width: '100%',
    height: '100%',
    opacity: 0.5,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingTop: 60,
  },
  backBtn: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 20,
  },
  mainAvatar: {
    width: 140,
    height: 140,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#FFCC00',
  },
  statusDot: {
    position: 'absolute',
    bottom: 5,
    right: 15,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 4,
    borderColor: '#000',
  },
  nameText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  roleText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: -40,
    marginHorizontal: 30,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  statItem: {
    backgroundColor: '#FFF',
    paddingVertical: 20,
    paddingHorizontal: 25,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    minWidth: 90,
  },
  statValue: { fontSize: 18, fontWeight: '900' },
  statLabel: { fontSize: 11, color: '#888', fontWeight: '700', marginTop: 4, textTransform: 'uppercase' },
  statDivider: { width: 2, height: 30, marginHorizontal: 0 },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 40,
    marginBottom: 30,
  },
  actionBtn: {
    width: 55,
    height: 55,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  infoWrapper: {
    paddingHorizontal: 25,
  },
  infoCard: {
    borderRadius: 25,
    padding: 20,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 20,
    color: '#888',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoTextWrapper: {
    marginLeft: 15,
  },
  infoLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '700',
  },
});
