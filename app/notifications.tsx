import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import api from '@/services/api-service';

export default function NotificationsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications/indexNotification');
      setNotifications(response.data.data || response.data || []);
    } catch (error) {
      console.error('Erreur notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const markAsRead = async (id: string) => {
    try {
      await api.post('/notifications/mark-as-read', { id });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date() } : n));
    } catch (err) {
      console.log(err);
    }
  };

  const renderNotification = ({ item }: { item: any }) => {
    const isUnread = !item.read_at;
    
    return (
      <TouchableOpacity 
        style={[
          styles.notifCard, 
          { backgroundColor: themeColors.cardBackground, borderColor: isUnread ? themeColors.accent : themeColors.border }
        ]}
        onPress={() => markAsRead(item.id)}
      >
        <View style={[styles.iconContainer, { backgroundColor: isUnread ? themeColors.accent + '20' : themeColors.border + '20' }]}>
          <Ionicons 
            name={item.type?.includes('task') ? 'list' : 'notifications'} 
            size={20} 
            color={isUnread ? themeColors.accent : themeColors.textSecondary} 
          />
        </View>
        <View style={styles.notifContent}>
          <Text style={[styles.notifTitle, { color: themeColors.text, fontWeight: isUnread ? '800' : '500' }]}>
            {item.data?.message || item.message || 'Nouvelle notification'}
          </Text>
          <Text style={[styles.notifTime, { color: themeColors.textSecondary }]}>
            {item.created_at_human || 'Il y a un instant'}
          </Text>
        </View>
        {isUnread && <View style={[styles.unreadDot, { backgroundColor: themeColors.accent }]} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>Notifications</Text>
        <TouchableOpacity onPress={() => api.post('/notifications/mark-all-as-read').then(fetchNotifications)}>
          <Text style={[styles.markAllText, { color: themeColors.accent }]}>Tout lire</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeColors.accent} />}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={themeColors.accent} style={{ marginTop: 50 }} />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={60} color={themeColors.border} />
              <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>Aucune notification</Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20, justifyContent: 'space-between' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '800' },
  markAllText: { fontSize: 14, fontWeight: '700' },
  listContainer: { paddingHorizontal: 20, paddingBottom: 50 },
  notifCard: { flexDirection: 'row', padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 12, alignItems: 'center' },
  iconContainer: { width: 45, height: 45, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 14, marginBottom: 4 },
  notifTime: { fontSize: 12, fontWeight: '500' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, marginLeft: 10 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 15, fontSize: 16, fontWeight: '600' }
});
