import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Alert, Linking, Modal, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import api from '@/services/api-service';

export default function ExpensesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const [searchQuery, setSearchQuery] = useState('');
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchExpenses = async () => {
    try {
      const response = await api.get('/finance/expenses');
      setExpenses(response.data.data || response.data);
      if (response.data.total_amount) {
          setTotal(response.data.total_amount);
      } else {
          // Calculer le total manuellement si non fourni
          const sum = (response.data.data || response.data).reduce((acc: number, curr: any) => acc + (parseFloat(curr.amount) || 0), 0);
          setTotal(sum);
      }
    } catch (error) {
      console.error('Erreur dépenses:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchExpenses();
  };

  const filteredExpenses = expenses.filter(item => 
    (item.title || item.reason || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.category || item.category_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [selectedExpense, setSelectedExpense] = useState<any>(null);

  const getStatusDetails = (status: string) => {
    switch (status) {
      case 'Payé':
      case 'Approuvé':
        return { color: '#2ecc71', bg: 'rgba(46, 204, 113, 0.1)', icon: 'checkmark-circle' };
      case 'Rejeté':
        return { color: '#e74c3c', bg: 'rgba(231, 76, 60, 0.1)', icon: 'close-circle' };
      default:
        return { color: '#f39c12', bg: 'rgba(243, 156, 18, 0.1)', icon: 'time' };
    }
  };

  const renderExpense = ({ item }: { item: any }) => {
    const statusInfo = getStatusDetails(item.status);
    
    return (
      <TouchableOpacity 
        style={[styles.expenseCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}
        onPress={() => setSelectedExpense(item)}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: (item.color || '#3498db') + '15' }]}>
              <Ionicons name={(item.icon || 'receipt-outline') as any} size={22} color={item.color || '#3498db'} />
          </View>
          <View style={styles.mainInfo}>
              <Text style={[styles.expenseTitle, { color: themeColors.text }]}>{item.title || item.reason}</Text>
              <Text style={styles.expenseSub}>{item.category || item.category_name} • {item.date}</Text>
          </View>
          <View style={styles.amountContainer}>
              <Text style={[styles.amountText, { color: themeColors.text }]}>{item.amount} {item.currency || 'FCFA'}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                <Text style={[styles.statusText, { color: statusInfo.color }]}>{item.status}</Text>
              </View>
          </View>
        </View>
        
        <View style={styles.cardFooter}>
           <TouchableOpacity 
             style={styles.receiptBtn}
             onPress={() => {
               if (item.receipt_url) {
                 Linking.openURL(item.receipt_url).catch(err => console.error("Erreur ouverture URL", err));
               } else {
                 Alert.alert('Aucun justificatif', 'Aucun justificatif numérique n\'est rattaché à cette fiche de frais. Veuillez contacter le service comptabilité.', [{ text: 'Compris', style: 'default' }]);
               }
             }}
           >
              <Ionicons name="document-attach-outline" size={16} color="#888" />
              <Text style={styles.receiptLink}>Voir le reçu</Text>
           </TouchableOpacity>
           <Ionicons name="chevron-forward" size={16} color="#CCC" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header with Summary */}
      <View style={[styles.header, { backgroundColor: '#181818' }]}>
        <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="#FFCC00" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Notes de Frais</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/finance/depenses/create')}>
                <Ionicons name="add" size={24} color="#000" />
            </TouchableOpacity>
        </View>

        <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Total Dépenses</Text>
            <Text style={styles.totalAmount}>{total.toLocaleString()} <Text style={styles.currency}>FCFA</Text></Text>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="rgba(255,255,255,0.5)" />
          <TextInput
            placeholder="Rechercher une dépense..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={filteredExpenses}
        renderItem={renderExpense}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFCC00" />
        }
        ListHeaderComponent={<Text style={[styles.listTitle, { color: themeColors.text }]}>Dernières dépenses</Text>}
        ListEmptyComponent={
            loading ? (
                <ActivityIndicator color="#FFCC00" size="large" style={{ marginTop: 50 }} />
            ) : (
                <View style={{ alignItems: 'center', marginTop: 50 }}>
                    <Text style={{ color: themeColors.textSecondary }}>Aucune dépense trouvée</Text>
                </View>
            )
        }
      />

      {/* MODAL DES DETAILS DE LA DEPENSE */}
      <Modal
        visible={selectedExpense !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedExpense(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.cardBackground }]}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors.text }]}>Détails de la Dépense</Text>
              <TouchableOpacity onPress={() => setSelectedExpense(null)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={themeColors.text} />
              </TouchableOpacity>
            </View>

            {selectedExpense && (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
                {/* Catégorie & Date Header */}
                <View style={styles.detailCategoryHeader}>
                  <View style={[styles.detailIconContainer, { backgroundColor: (selectedExpense.color || '#3498db') + '15' }]}>
                    <Ionicons name={(selectedExpense.icon || 'receipt-outline') as any} size={28} color={selectedExpense.color || '#3498db'} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.detailCategoryName, { color: themeColors.text }]}>
                      {selectedExpense.category || selectedExpense.category_name || 'Autre'}
                    </Text>
                    <Text style={{ fontSize: 13, color: '#888', fontWeight: '500', marginTop: 2 }}>
                      Enregistré le {selectedExpense.date}
                    </Text>
                  </View>
                  <View style={[styles.detailStatusBadge, { backgroundColor: getStatusDetails(selectedExpense.status).bg }]}>
                    <Text style={[styles.detailStatusText, { color: getStatusDetails(selectedExpense.status).color }]}>
                      {selectedExpense.status || 'En attente'}
                    </Text>
                  </View>
                </View>

                {/* Titre / Raison */}
                <Text style={[styles.detailTitleText, { color: themeColors.text }]}>
                  {selectedExpense.title || selectedExpense.reason}
                </Text>

                {/* Montant Highlighted Box */}
                <View style={[styles.detailAmountBox, { backgroundColor: themeColors.background, borderColor: themeColors.border }]}>
                  <Text style={styles.detailAmountLabel}>MONTANT PAYÉ</Text>
                  <Text style={[styles.detailAmountVal, { color: themeColors.accent }]}>
                    {parseFloat(selectedExpense.amount || '0').toLocaleString()} <Text style={styles.detailAmountCurrency}>FCFA</Text>
                  </Text>
                </View>

                {/* Métadonnées Grid */}
                <View style={styles.metaGrid}>
                  <View style={[styles.metaCard, { backgroundColor: themeColors.background, borderColor: themeColors.border }]}>
                    <Ionicons name="card-outline" size={20} color="#FFCC00" style={{ marginBottom: 6 }} />
                    <Text style={styles.metaCardLabel}>Mode de Paiement</Text>
                    <Text style={[styles.metaCardVal, { color: themeColors.text }]} numberOfLines={1}>
                      {selectedExpense.paymentMode || selectedExpense.payment_method || 'Espèces'}
                    </Text>
                  </View>

                  <View style={[styles.metaCard, { backgroundColor: themeColors.background, borderColor: themeColors.border }]}>
                    <Ionicons name="briefcase-outline" size={20} color="#FFCC00" style={{ marginBottom: 6 }} />
                    <Text style={styles.metaCardLabel}>Projet / Diligence</Text>
                    <Text style={[styles.metaCardVal, { color: themeColors.text }]} numberOfLines={1}>
                      {selectedExpense.project || selectedExpense.project_name || 'Non spécifié'}
                    </Text>
                  </View>
                </View>

                {/* Description */}
                <View style={styles.descSection}>
                  <Text style={styles.sectionLabel}>Description / Notes</Text>
                  <View style={[styles.descBox, { backgroundColor: themeColors.background, borderColor: themeColors.border }]}>
                    <Text style={[styles.descText, { color: themeColors.text }]}>
                      {selectedExpense.description || 'Aucune note ou description additionnelle rattachée à cette note de frais.'}
                    </Text>
                  </View>
                </View>

                {/* Justificatif */}
                <View style={styles.receiptSection}>
                  <Text style={styles.sectionLabel}>Justificatif de Dépense</Text>
                  {selectedExpense.receipt_url ? (
                    <TouchableOpacity 
                      style={[styles.receiptAttachmentCard, { backgroundColor: themeColors.background, borderColor: themeColors.border }]}
                      onPress={() => {
                        Linking.openURL(selectedExpense.receipt_url).catch(err => console.error("Erreur ouverture URL", err));
                      }}
                    >
                      <View style={styles.receiptAttachIconBg}>
                        <Ionicons name="document-text" size={24} color="#000" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.receiptAttachName, { color: themeColors.text }]} numberOfLines={1}>
                          {selectedExpense.receipt_name || 'facture_' + selectedExpense.id + '.pdf'}
                        </Text>
                        <Text style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                          Cliquez pour ouvrir le document justificatif
                        </Text>
                      </View>
                      <Ionicons name="cloud-download-outline" size={20} color={themeColors.textSecondary} />
                    </TouchableOpacity>
                  ) : (
                    <View style={[styles.noReceiptBox, { backgroundColor: themeColors.background, borderColor: themeColors.border }]}>
                      <Ionicons name="warning-outline" size={24} color="#888" />
                      <Text style={styles.noReceiptText}>Aucun reçu ou facture rattaché</Text>
                    </View>
                  )}
                </View>

                {/* Action button */}
                <TouchableOpacity 
                  style={styles.modalCloseBtn}
                  onPress={() => setSelectedExpense(null)}
                >
                  <Text style={styles.modalCloseBtnText}>Fermer les détails</Text>
                </TouchableOpacity>

              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 55,
    paddingHorizontal: 25,
    paddingBottom: 35,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  addBtn: {
    backgroundColor: '#FFCC00',
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryBox: {
    alignItems: 'center',
  },
  summaryLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  totalAmount: { color: '#FFF', fontSize: 32, fontWeight: '900', marginTop: 5 },
  currency: { fontSize: 16, color: '#FFCC00', fontWeight: '700' },
  listContent: { padding: 25, paddingBottom: 100 },
  listTitle: { fontSize: 18, fontWeight: '900', marginBottom: 20 },
  expenseCard: {
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainInfo: { flex: 1, marginLeft: 15 },
  expenseTitle: { fontSize: 15, fontWeight: '800', marginBottom: 2 },
  expenseSub: { fontSize: 12, color: '#888', fontWeight: '600' },
  amountContainer: { alignItems: 'flex-end' },
  amountText: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  searchInput: { flex: 1, color: '#FFF', marginLeft: 10, fontSize: 15 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 48,
    marginTop: 25,
  },
  statusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  cardFooter: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.03)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  receiptLink: { fontSize: 12, color: '#888', fontWeight: '700' },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  
  // Modal details styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    maxHeight: '90%',
    padding: 25,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  closeBtn: {
    padding: 5,
  },
  detailCategoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 25,
  },
  detailIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailCategoryName: {
    fontSize: 20,
    fontWeight: '800',
  },
  detailStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  detailStatusText: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  detailTitleText: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
    lineHeight: 25,
  },
  detailAmountBox: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 25,
  },
  detailAmountLabel: {
    fontSize: 11,
    color: '#888',
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  detailAmountVal: {
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  detailAmountCurrency: {
    fontSize: 16,
    color: '#888',
    fontWeight: '700',
  },
  metaGrid: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 25,
  },
  metaCard: {
    flex: 1,
    padding: 15,
    borderRadius: 18,
    borderWidth: 1,
  },
  metaCardLabel: {
    fontSize: 10,
    color: '#888',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metaCardVal: {
    fontSize: 13,
    fontWeight: '700',
  },
  descSection: {
    marginBottom: 25,
  },
  sectionLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 5,
  },
  descBox: {
    padding: 15,
    borderRadius: 18,
    borderWidth: 1,
  },
  descText: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
  },
  receiptSection: {
    marginBottom: 30,
  },
  receiptAttachmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 18,
    borderWidth: 1,
    gap: 15,
  },
  receiptAttachIconBg: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#FFCC00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  receiptAttachName: {
    fontSize: 14,
    fontWeight: '700',
  },
  noReceiptBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    gap: 10,
  },
  noReceiptText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '600',
  },
  modalCloseBtn: {
    backgroundColor: '#FFCC00',
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  modalCloseBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
