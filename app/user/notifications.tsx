import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';

const NOTIFICATIONS = [
  { id: '1', title: 'Nouvelle Tâche Assignée', desc: 'Vous avez été assigné à la tâche "Clôture fiscale SIB".', time: 'Il y a 10 min', type: 'task', isRead: false },
  { id: '2', title: 'Avis DC-KNOWING', desc: 'N\'oubliez pas la réunion hebdomadaire à 15h00.', time: 'Il y a 1h', type: 'info', isRead: false },
  { id: '3', title: 'Diligence en Retard', desc: 'La diligence pour le client TOTAL a dépassé son échéance.', time: 'Hier', type: 'warning', isRead: true },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const getIcon = (type: string) => {
    switch(type) {
      case 'task': return { name: 'checkmark-done-circle', color: '#2ecc71' };
      case 'warning': return { name: 'warning', color: '#e74c3c' };
      default: return { name: 'information-circle', color: '#3498db' };
    }
  };

  const renderItem = ({ item }: { item: typeof NOTIFICATIONS[0] }) => {
    const icon = getIcon(item.type);
    return (
      <TouchableOpacity style={[styles.card, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border, opacity: item.isRead ? 0.6 : 1, shadowColor: colorScheme === 'dark' ? '#000' : '#888' }]}>
        <View style={[styles.iconBox, { backgroundColor: icon.color + '15' }]}>
          <Ionicons name={icon.name as any} size={24} color={icon.color} />
        </View>
        <View style={styles.content}>
          <View style={styles.topRow}>
            <Text style={[styles.title, { color: themeColors.text }]}>{item.title}</Text>
            {!item.isRead && <View style={styles.unreadDot} />}
          </View>
          <Text style={[styles.desc, { color: themeColors.textSecondary }]}>{item.desc}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={[styles.header, { backgroundColor: '#181818' }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFCC00" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <TouchableOpacity>
            <Ionicons name="checkmark-done" size={24} color="rgba(255,204,0,0.5)" />
          </TouchableOpacity>
        </View>
      </View>
      
      <FlatList
        data={NOTIFICATIONS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 25,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  list: { padding: 24, paddingBottom: 50 },
  card: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  content: { flex: 1 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { flex: 1, fontSize: 15, fontWeight: '800', marginBottom: 4, paddingRight: 10 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D32F2F', marginTop: 2 },
  desc: { fontSize: 13, lineHeight: 18, marginBottom: 8 },
  time: { fontSize: 11, color: '#AAA', fontWeight: '700' }
});
