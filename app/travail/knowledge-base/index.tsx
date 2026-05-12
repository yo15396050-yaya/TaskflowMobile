import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

const MOCK_CATEGORIES = [
  { id: 'all', name: 'Tous' },
  { id: '1', name: 'Cours' },
  { id: '2', name: 'Procédures' },
  { id: '3', name: 'Modèles' },
];

const MOCK_ARTICLES = [
  {
    id: '1',
    title: 'Cours Excel Avancé',
    category: 'Cours',
    target: 'employee',
    date: '24/10/2024'
  },
  {
    id: '2',
    title: 'Police Aptos',
    category: 'Cours',
    target: 'employee',
    date: '24/10/2024'
  },
  {
    id: '3',
    title: 'Guide d\'onboarding',
    category: 'Procédures',
    target: 'all',
    date: '15/11/2024'
  }
];

export default function KnowledgeBaseScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await api.get('/knowledge-base');
        setArticles(response.data);
      } catch (error) {
        console.error('Erreur base connaissances:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const filteredArticles = articles.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderArticle = ({ item }: { item: typeof MOCK_ARTICLES[0] }) => (
    <TouchableOpacity 
      style={[styles.articleCard, { backgroundColor: themeColors.cardBackground, borderBottomColor: themeColors.border }]}
      onPress={() => {/* Voir l'article */}}
    >
      <View style={styles.articleInfo}>
        <View style={styles.articleHeader}>
          <Text style={[styles.articleTitle, { color: themeColors.text }]} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={[styles.categoryBadge, { backgroundColor: '#FFCC0020' }]}>
            <Text style={styles.categoryBadgeText}>{item.category}</Text>
          </View>
        </View>
        
        <View style={styles.articleFooter}>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={12} color={themeColors.textSecondary} />
            <Text style={[styles.articleMeta, { color: themeColors.textSecondary }]}>
              {item.target === 'employee' ? 'Employés' : 'Tous'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={12} color={themeColors.textSecondary} />
            <Text style={[styles.articleMeta, { color: themeColors.textSecondary }]}>
              {item.date}
            </Text>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.actionBtn}>
        <Ionicons name="chevron-forward" size={20} color={themeColors.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header Statique Noir */}
      <View style={[styles.header, { backgroundColor: '#181818' }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFCC00" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Base de connaissances</Text>
          <TouchableOpacity 
            style={styles.addBtn}
            onPress={() => router.push('/knowledge-base/create')}
          >
            <Ionicons name="add-circle" size={28} color="#FFCC00" />
          </TouchableOpacity>
        </View>

        {/* Barre de recherche */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="rgba(255,255,255,0.5)" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un article..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Filtres par Catégorie */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.categoryList}
          contentContainerStyle={styles.categoryScrollContent}
        >
          {['all', ...new Set(articles.map(a => a.category))].map(cat => (
            <TouchableOpacity 
              key={cat}
              style={[
                styles.categoryItem, 
                selectedCategory === cat && styles.categoryItemActive,
                { borderColor: 'rgba(255,255,255,0.1)' }
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[
                styles.categoryText, 
                selectedCategory === cat && styles.categoryTextActive
              ]}>
                {cat === 'all' ? 'Tous' : cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredArticles}
        renderItem={renderArticle}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={[styles.articleCount, { color: themeColors.textSecondary }]}>
              {filteredArticles.length} Article{filteredArticles.length > 1 ? 's' : ''} trouvé{filteredArticles.length > 1 ? 's' : ''}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={60} color="#888" />
            <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>Aucun article trouvé</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backBtn: { padding: 5, marginLeft: -5 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '800', flex: 1, textAlign: 'center' },
  addBtn: { padding: 5, marginRight: -5 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    height: 45,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  searchIcon: { marginRight: 10 },
  searchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryList: {
    marginHorizontal: -20,
  },
  categoryScrollContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  categoryItemActive: {
    backgroundColor: '#FFCC00',
    borderColor: '#FFCC00',
  },
  categoryText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontWeight: '700',
  },
  categoryTextActive: {
    color: '#181818',
  },
  listContent: { padding: 20 },
  listHeader: { marginBottom: 15 },
  articleCount: { fontSize: 13, fontWeight: '600', fontStyle: 'italic' },
  articleCard: {
    flexDirection: 'row',
    padding: 18,
    borderRadius: 22,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  articleInfo: { flex: 1 },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: 10,
    lineHeight: 22,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryBadgeText: {
    color: '#FFCC00',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  articleFooter: {
    flexDirection: 'row',
    gap: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  articleMeta: {
    fontSize: 11,
    fontWeight: '500',
  },
  actionBtn: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 12,
    marginLeft: 10,
  },
  emptyContainer: {
    paddingTop: 100,
    alignItems: 'center',
    gap: 15,
  },
  emptyText: { fontSize: 16, fontWeight: '600' },
});
