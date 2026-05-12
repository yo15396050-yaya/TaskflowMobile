import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, Image, ScrollView, Platform, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import api from '@/services/api-service';

const CATEGORIES = ['Tous', 'Services', 'Produits', 'Applications'];

export default function ProductsServicesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showActionMenu, setShowActionMenu] = useState(false);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/services');
      setProducts(response.data.data || response.data || []);
    } catch (error) {
      console.error('Erreur produits:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const handleOpenMenu = (product: any) => {
    setSelectedProduct(product);
    setShowActionMenu(true);
  };

  const filteredData = products.filter(item => {
    const matchesSearch = (item.name || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'Tous' || (item.category || '').includes(activeCategory);
    return matchesSearch && matchesCategory;
  });

  const renderProduct = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.productCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}
      onPress={() => router.push(`/finance/products-services/${item.id}`)}
    >
      <Image source={{ uri: item.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || 'P')}&background=random` }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <View style={styles.productHeader}>
          <Text style={[styles.productName, { color: themeColors.text }]} numberOfLines={1}>{item.name}</Text>
        </View>
        <Text style={[styles.productCategory, { color: themeColors.textSecondary }]}>{item.category || 'Non catégorisé'}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.priceText}>{item.price || 'Sur devis'}</Text>
          <TouchableOpacity 
            style={styles.moreBtn}
            onPress={() => handleOpenMenu(item)}
          >
            <Ionicons name="ellipsis-horizontal" size={18} color={themeColors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={[styles.header, { backgroundColor: '#181818' }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFCC00" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Produits & Services</Text>
          <TouchableOpacity 
            style={styles.addBtn}
            onPress={() => router.push('/finance/products-services/create')}
          >
            <Ionicons name="add-circle" size={28} color="#FFCC00" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="rgba(255,255,255,0.5)" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catContainer}>
          {CATEGORIES.map((cat, index) => (
            <TouchableOpacity 
              key={index} 
              style={[
                styles.catBadge, 
                activeCategory === cat && styles.catBadgeActive,
                { borderColor: 'rgba(255,255,255,0.1)' }
              ]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.catText, activeCategory === cat && styles.catTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredData}
        renderItem={renderProduct}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.listContent}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFCC00" />}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color="#FFCC00" style={{ marginTop: 50 }} />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="basket-outline" size={60} color="#888" />
              <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>Aucun produit trouvé</Text>
            </View>
          )
        }
      />

      {showActionMenu && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBlur} 
            activeOpacity={1} 
            onPress={() => setShowActionMenu(false)} 
          />
          <View style={[styles.actionSheet, { backgroundColor: themeColors.cardBackground }]}>
            <View style={styles.sheetHandle} />
            <Text style={[styles.sheetTitle, { color: themeColors.text }]}>{selectedProduct?.name}</Text>
            
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => {
                setShowActionMenu(false);
                router.push({ pathname: '/finance/products-services/create', params: { id: selectedProduct.id } });
              }}
            >
              <View style={[styles.actionIconBg, { backgroundColor: '#FFCC0020' }]}>
                <Ionicons name="pencil" size={20} color="#FFCC00" />
              </View>
              <Text style={[styles.actionText, { color: themeColors.text }]}>Modifier le produit</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => {
                setShowActionMenu(false);
                Alert.alert('Supprimer', 'Voulez-vous vraiment supprimer ce produit ?', [
                  { text: 'Annuler', style: 'cancel' },
                  { text: 'Supprimer', style: 'destructive', onPress: async () => {
                    try {
                      await api.delete(`/services/${selectedProduct.id}`);
                      fetchProducts();
                    } catch (e) {
                      Alert.alert('Erreur', 'Impossible de supprimer.');
                    }
                  }}
                ]);
              }}
            >
              <View style={[styles.actionIconBg, { backgroundColor: '#ff4d4d20' }]}>
                <Ionicons name="trash-outline" size={20} color="#ff4d4d" />
              </View>
              <Text style={[styles.actionText, { color: themeColors.text }]}>Supprimer le produit</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.cancelBtn, { backgroundColor: themeColors.background }]}
              onPress={() => setShowActionMenu(false)}
            >
              <Text style={[styles.cancelBtnText, { color: themeColors.textSecondary }]}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  backBtn: { padding: 5, marginLeft: -5 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
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
  searchInput: { flex: 1, color: '#FFF', fontSize: 14, fontWeight: '500' },
  catContainer: { flexDirection: 'row', marginHorizontal: -20, paddingHorizontal: 20 },
  catBadge: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12, marginRight: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1 },
  catBadgeActive: { backgroundColor: '#FFCC00', borderColor: '#FFCC00' },
  catText: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '700' },
  catTextActive: { color: '#181818' },
  listContent: { padding: 15, paddingBottom: 50 },
  columnWrapper: { justifyContent: 'space-between' },
  productCard: {
    width: '48%',
    borderRadius: 25,
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 1,
    elevation: 2,
  },
  productImage: { width: '100%', height: 120, backgroundColor: '#eee' },
  productInfo: { padding: 12 },
  productHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  productName: { fontSize: 13, fontWeight: '800', flex: 1 },
  productCategory: { fontSize: 11, fontWeight: '600', marginBottom: 8 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceText: { fontSize: 12, fontWeight: '900', color: '#FFCC00' },
  moreBtn: { padding: 4 },
  emptyContainer: { paddingTop: 100, alignItems: 'center', gap: 15 },
  emptyText: { fontSize: 16, fontWeight: '600' },
  modalOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 1000, justifyContent: 'flex-end' },
  modalBlur: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  actionSheet: { padding: 25, borderTopLeftRadius: 35, borderTopRightRadius: 35, paddingBottom: Platform.OS === 'ios' ? 45 : 30 },
  sheetHandle: { width: 40, height: 5, backgroundColor: '#DDD', borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 18, fontWeight: '800', marginBottom: 25, textAlign: 'center' },
  actionItem: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 15, padding: 5 },
  actionIconBg: { width: 45, height: 45, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  actionText: { fontSize: 16, fontWeight: '700' },
  cancelBtn: { height: 55, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  cancelBtnText: { fontSize: 15, fontWeight: '800' },
});
