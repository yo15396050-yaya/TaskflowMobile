import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import api from '@/services/api-service';

export default function DocumentsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDocuments = async () => {
    try {
      const response = await api.get('/documents');
      setDocuments(response.data.data || response.data || []);
    } catch (error) {
      console.error('Erreur documents:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const downloadDocument = async (id: string, name: string) => {
    const url = `https://dc-knowing.com/tache/public/api/documents/${id}/download`;
    // On ouvre dans le navigateur car le téléchargement direct sur mobile peut nécessiter des permissions complexes
    Linking.openURL(url);
  };

  const renderDocument = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.docCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}
      onPress={() => downloadDocument(item.id, item.name)}
    >
      <View style={[styles.iconContainer, { backgroundColor: '#3498db20' }]}>
        <Ionicons name="document-text" size={24} color="#3498db" />
      </View>
      <View style={styles.docInfo}>
        <Text style={[styles.docName, { color: themeColors.text }]}>{item.name || item.filename}</Text>
        <Text style={[styles.docMeta, { color: themeColors.textSecondary }]}>
          {item.size || 'Unknow size'} • {item.created_at || 'Récemment'}
        </Text>
      </View>
      <Ionicons name="download-outline" size={20} color={themeColors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>Documents</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={documents}
        renderItem={renderDocument}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeColors.accent} />}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={themeColors.accent} style={{ marginTop: 50 }} />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="folder-open-outline" size={60} color={themeColors.border} />
              <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>Aucun document</Text>
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
  listContainer: { paddingHorizontal: 20, paddingBottom: 50 },
  docCard: { flexDirection: 'row', padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 12, alignItems: 'center' },
  iconContainer: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  docInfo: { flex: 1 },
  docName: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  docMeta: { fontSize: 12 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 15, fontSize: 16, fontWeight: '600' }
});
