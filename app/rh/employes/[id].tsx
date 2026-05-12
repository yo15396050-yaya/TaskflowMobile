import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';

export default function EmployeeDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  // Données fictives basées sur l'ID (Simulation)
  const employee = {
    id,
    name: 'AGNIMEL MELEDJE ABRAHAM',
    role: 'Comptable Senior',
    dept: 'Assistance Comptable',
    email: 'abraham.agnimel@dc-knowing.com',
    phone: '+225 0777183932',
    avatar: 'https://www.gravatar.com/avatar/aef99e65807ba7884bf13a747762fdba.png?s=400&d=mp',
    joiningDate: '12 Janvier 2022',
    reportingTo: 'Diallo Tidiane',
    location: 'Abidjan, Côte d\'Ivoire',
    projectsCount: 12,
    tasksCount: 45,
  };

  const handleCall = () => Linking.openURL(`tel:${employee.phone}`);
  const handleWhatsApp = () => Linking.openURL(`whatsapp://send?phone=${employee.phone}`);
  const handleEmail = () => Linking.openURL(`mailto:${employee.email}`);

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Image 
            source={{ uri: employee.avatar }} 
            style={styles.headerBg}
            blurRadius={10}
          />
          <View style={styles.headerOverlay}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: employee.avatar }} style={styles.mainAvatar} />
              <View style={styles.statusOnline} />
            </View>
            
            <Text style={styles.nameText}>{employee.name}</Text>
            <Text style={styles.roleText}>{employee.role} • {employee.dept}</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: themeColors.text }]}>{employee.projectsCount}</Text>
            <Text style={styles.statLabel}>Projets</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: themeColors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: themeColors.text }]}>{employee.tasksCount}</Text>
            <Text style={styles.statLabel}>Tâches</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: themeColors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: themeColors.text }]}>Active</Text>
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
                <Text style={[styles.infoValue, { color: themeColors.text }]}>{employee.email}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="phone-portrait-outline" size={20} color="#FFCC00" />
              <View style={styles.infoTextWrapper}>
                <Text style={styles.infoLabel}>Téléphone</Text>
                <Text style={[styles.infoValue, { color: themeColors.text }]}>{employee.phone}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={20} color="#FFCC00" />
              <View style={styles.infoTextWrapper}>
                <Text style={styles.infoLabel}>Localisation</Text>
                <Text style={[styles.infoValue, { color: themeColors.text }]}>{employee.location}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.infoCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border, marginTop: 20 }]}>
            <Text style={styles.sectionTitle}>Détails Professionnels</Text>
            
            <View style={styles.infoItem}>
              <Ionicons name="briefcase-outline" size={20} color="#FFCC00" />
              <View style={styles.infoTextWrapper}>
                <Text style={styles.infoLabel}>Date d'intégration</Text>
                <Text style={[styles.infoValue, { color: themeColors.text }]}>{employee.joiningDate}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="people-outline" size={20} color="#FFCC00" />
              <View style={styles.infoTextWrapper}>
                <Text style={styles.infoLabel}>Responsable hiérarchique</Text>
                <Text style={[styles.infoValue, { color: themeColors.text }]}>{employee.reportingTo}</Text>
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
  statusOnline: {
    position: 'absolute',
    bottom: 5,
    right: 15,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2ecc71',
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
