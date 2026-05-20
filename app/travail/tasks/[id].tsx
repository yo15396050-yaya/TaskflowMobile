import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, RefreshControl } from 'react-native';
import api from '@/services/api-service';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTaskDetail = async () => {
    try {
      const response = await api.get(`/tasks/${id}`);
      setTask(response.data);
    } catch (error) {
      console.error('Erreur detail tâche:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTaskDetail();
  }, [id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTaskDetail();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: themeColors.background }]}>
        <ActivityIndicator size="large" color={themeColors.accent} />
      </View>
    );
  }

  if (!task) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: themeColors.background }]}>
        <Text style={{ color: themeColors.text }}>Tâche introuvable</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: themeColors.accent }}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return '#e74c3c';
      case 'medium': return '#f39c12';
      case 'low': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  // Fonction pour enlever les balises HTML du texte
  const stripHtml = (html: string) => {
    if (!html) return "Aucune description détaillée.";
    return html.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').trim();
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFCC00" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>{task.heading}</Text>
          <Text style={styles.headerSub}>{task.project_name} • ID: {id}</Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeColors.accent} />}
      >
        {/* Status & Priority Card */}
        <View style={[styles.mainCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
          <View style={styles.cardRow}>
            <View>
              <Text style={[styles.label, { color: themeColors.textSecondary }]}>Statut</Text>
              <View style={styles.statusBadge}>
                <View style={[styles.statusDot, { backgroundColor: task.status === 'completed' ? '#2ecc71' : '#f1c40f' }]} />
                <Text style={styles.statusText}>{task.status?.toUpperCase()}</Text>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.label, { color: themeColors.textSecondary }]}>Priorité</Text>
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) + '20' }]}>
                <Text style={[styles.priorityText, { color: getPriorityColor(task.priority) }]}>{task.priority?.toUpperCase()}</Text>
              </View>
            </View>
          </View>

          <View style={styles.dateRow}>
            <View style={styles.dateBox}>
              <Ionicons name="calendar-outline" size={16} color={themeColors.textSecondary} />
              <View>
                <Text style={styles.dateLabel}>Date Limite</Text>
                <Text style={[styles.dateValue, { color: themeColors.text }]}>{task.due_date}</Text>
              </View>
            </View>
            <View style={styles.dateBox}>
              <Ionicons name="person-outline" size={16} color={themeColors.textSecondary} />
              <View>
                <Text style={styles.dateLabel}>Créé par</Text>
                <Text style={[styles.dateValue, { color: themeColors.text }]}>{task.created_by}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Description</Text>
        </View>
        <View style={[styles.descCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
          <Text style={[styles.description, { color: themeColors.text }]}>
            {stripHtml(task.description)}
          </Text>
        </View>

        {/* Assignees */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Assigné à</Text>
        </View>
        <View style={styles.assigneesList}>
          {task.assignees?.map((person: any) => (
            <View key={person.id} style={[styles.assigneeCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
              <View style={styles.avatarSmall}>
                <Text style={styles.avatarText}>{person.name?.substring(0, 2).toUpperCase()}</Text>
              </View>
              <Text style={[styles.assigneeName, { color: themeColors.text }]}>{person.name}</Text>
            </View>
          ))}
          {(!task.assignees || task.assignees.length === 0) && (
            <Text style={{ color: themeColors.textSecondary, marginLeft: 5 }}>Personne d'assigné</Text>
          )}
        </View>

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
  content: { padding: 20, paddingBottom: 40 },
  mainCard: { borderRadius: 24, padding: 20, borderWidth: 1, marginBottom: 10 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  label: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 5 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 10, fontWeight: '900', color: '#888' },
  priorityBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  priorityText: { fontSize: 10, fontWeight: '900' },
  dateRow: { flexDirection: 'row', gap: 20, paddingTop: 15, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  dateBox: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  dateLabel: { fontSize: 11, color: '#888', fontWeight: '600' },
  dateValue: { fontSize: 13, fontWeight: '700' },
  sectionHeader: { marginTop: 20, marginBottom: 15, marginLeft: 5 },
  sectionTitle: { fontSize: 16, fontWeight: '800' },
  descCard: { borderRadius: 24, padding: 20, borderWidth: 1, marginBottom: 10 },
  description: { fontSize: 15, lineHeight: 22 },
  assigneesList: { gap: 10 },
  assigneeCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, borderWidth: 1, gap: 12 },
  avatarSmall: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFCC00', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 12, fontWeight: '900', color: '#000' },
  assigneeName: { fontSize: 14, fontWeight: '700' },
});
