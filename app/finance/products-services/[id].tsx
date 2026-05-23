import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import api from '@/services/api-service';

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/services/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des détails du produit:', error);
      Alert.alert('Erreur', 'Impossible de récupérer les informations de ce produit.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  const handleDelete = () => {
    Alert.alert(
      "Es-tu sûr ?",
      "Vous ne pourrez pas récupérer l'enregistrement supprimé !",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Oui, supprimez-le !", 
          style: "destructive", 
          onPress: async () => {
            try {
              await api.delete(`/services/${id}`);
              Alert.alert("Supprimé", "Le produit a été supprimé.");
              router.back();
            } catch (e) {
              Alert.alert('Erreur', 'Impossible de supprimer.');
            }
          } 
        }
      ]
    );
  };

  const InfoRow = ({ label, value, isBadge = false }: { label: string, value: string | boolean, isBadge?: boolean }) => (
    <View style={[styles.infoRow, { borderBottomColor: themeColors.border }]}>
      <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>{label}</Text>
      {isBadge ? (
        <View style={[styles.badge, { backgroundColor: value ? '#2ecc71' : '#e74c3c' }]}>
          <Text style={styles.badgeText}>{value ? 'Oui' : 'Non'}</Text>
        </View>
      ) : (
        <Text style={[styles.infoValue, { color: themeColors.text }]}>{value as string}</Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FFCC00" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Ionicons name="basket-outline" size={60} color="#888" />
        <Text style={{ color: themeColors.textSecondary, marginTop: 15, fontSize: 16 }}>Produit introuvable</Text>
        <TouchableOpacity style={[styles.editBtn, { paddingHorizontal: 20, marginTop: 20 }]} onPress={() => router.back()}>
          <Text style={styles.editBtnText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: '#181818' }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Détails des produits</Text>
          <TouchableOpacity 
            style={styles.moreBtn}
            onPress={() => {
              Alert.alert('Actions', 'Choisissez une action', [
                { text: 'Modifier', onPress: () => router.push(`/finance/products-services/create?id=${id}`) },
                { text: 'Supprimer', style: 'destructive', onPress: handleDelete },
                { text: 'Annuler', style: 'cancel' }
              ]);
            }}
          >
            <Ionicons name="ellipsis-vertical" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: themeColors.cardBackground }]}>
          <View style={styles.imagePlaceholder}>
            {product.image ? (
              <Image source={{ uri: product.image }} style={styles.productImg} />
            ) : (
              <Ionicons name="image-outline" size={60} color="#DDD" />
            )}
          </View>

          <Text style={[styles.productTitle, { color: themeColors.text }]}>{product.name}</Text>
          <Text style={styles.productPrice}>{product.price}</Text>

          <View style={styles.divider} />

          <InfoRow label="Catégorie" value={product.category} />
          <InfoRow label="Sous-catégorie" value={product.subCategory} />
          <InfoRow label="Type d'unité" value={product.unitType} />
          <InfoRow label="Impôt" value={product.tax} />
          <InfoRow label="HSN/SAC" value={product.hsnSac} />
          <InfoRow label="UGS (SKU)" value={product.sku} />
          <InfoRow label="Achat autorisé" value={product.canPurchase} isBadge />
          <InfoRow label="Téléchargeable" value={product.isDownloadable} isBadge />
        </View>

        <View style={[styles.card, { backgroundColor: themeColors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Description</Text>
          <Text style={[styles.description, { color: themeColors.textSecondary }]}>
            {product.description === '--' || !product.description ? 'Aucune description fournie.' : product.description}
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Action Footer */}
      <View style={[styles.footer, { backgroundColor: themeColors.cardBackground, borderTopColor: themeColors.border }]}>
        <TouchableOpacity style={styles.editBtn} onPress={() => router.push(`/finance/products-services/create?id=${id}`)}>
          <Ionicons name="pencil" size={20} color="#000" />
          <Text style={styles.editBtnText}>Modifier</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 25,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    zIndex: 10,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  moreBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, padding: 20 },
  card: {
    borderRadius: 30,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  productImg: { width: '100%', height: '100%', borderRadius: 20 },
  productTitle: { fontSize: 22, fontWeight: '800', marginBottom: 5 },
  productPrice: { fontSize: 18, fontWeight: '900', color: '#FFCC00', marginBottom: 20 },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 15 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  infoLabel: { fontSize: 14, fontWeight: '600' },
  infoValue: { fontSize: 14, fontWeight: '700' },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  badgeText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 15, textTransform: 'uppercase' },
  description: { fontSize: 14, lineHeight: 22, fontStyle: 'italic' },
  footer: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    gap: 15,
    borderTopWidth: 1,
  },
  editBtn: {
    flex: 1,
    height: 55,
    backgroundColor: '#FFCC00',
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  editBtnText: { color: '#000', fontSize: 16, fontWeight: '800' },
  deleteBtn: {
    width: 60,
    height: 55,
    backgroundColor: '#ff4d4d',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
