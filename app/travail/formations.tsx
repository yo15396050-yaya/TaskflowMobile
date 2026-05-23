import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, ScrollView, Modal, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';

const PAYMENTS_DATA = [
  {
    id: '1',
    date: '10/12/2025 03:55',
    participant: 'ZALLE MAHAMOUD',
    email: 'mahamoudzalle92@gmail.com',
    phone: '+2250505938989',
    tickets: 1,
    amount: 10000,
    method: null,
    reference: null,
    status: 'en_attente',
    formation: 'BTP - Réussir la planification d\'un chantier',
    dateFormation: 'Jeudi 18 décembre | 9h - 12h',
    transactionId: 'TRANSACTION-4628C716',
  },
  {
    id: '2',
    date: '08/12/2025 07:41',
    participant: 'SASTPREVENT',
    email: 'sastprevent@gmail.com',
    phone: '+2250779755086',
    tickets: 1,
    amount: 10000,
    method: null,
    reference: null,
    status: 'en_attente',
    formation: 'Gestion - FNE pratique et conseils fiscaux',
    dateFormation: 'Jeudi 11 décembre | 9h - 12h',
    transactionId: 'TRANSACTION-8D700B19',
  },
  {
    id: '3',
    date: '07/12/2025 21:51',
    participant: 'Bamba Lamine',
    email: 'limabravoci1@gmail.com',
    phone: '+2250709315209',
    tickets: 5,
    amount: 50000,
    method: null,
    reference: null,
    status: 'en_attente',
    formation: 'Multi-formations (5 modules)',
    dateFormation: 'Décembre 2025',
    transactionId: 'TRANSACTION-DDA03373',
  },
  {
    id: '4',
    date: '07/12/2025 20:42',
    participant: 'KEYMAN Constant',
    email: 'constant.keyman@gmail.com',
    phone: '+2250778041955',
    tickets: 6,
    amount: 60000,
    method: 'orange_money',
    reference: 'OM-REF-2025-001',
    status: 'validé',
    formation: 'Multi-formations (6 modules)',
    dateFormation: 'Décembre 2025',
    transactionId: 'TRANSACTION-8FB28FE4',
  },
  {
    id: '5',
    date: '05/12/2025 14:20',
    participant: 'Jean Gabin ORI',
    email: 'jean.daly07@gmail.com',
    phone: '+2250747534875',
    tickets: 2,
    amount: 20000,
    method: 'mtn_money',
    reference: 'MTN-REF-2025-002',
    status: 'validé',
    formation: 'Informatique/IA - L\'IA au service de la performance',
    dateFormation: 'Mardi 16 décembre | 9h - 12h',
    transactionId: 'TRANSACTION-5F5742D2',
  },
  {
    id: '6',
    date: '03/12/2025 10:10',
    participant: 'COFFI Marie Colette',
    email: 'nadiasahue99@gmail.com',
    phone: '+2250758386388',
    tickets: 1,
    amount: 10000,
    method: null,
    reference: null,
    status: 'rejeté',
    formation: 'RH - Digitalisation des processus RH',
    dateFormation: 'Jeudi 11 décembre | 15h - 18h',
    transactionId: 'TRANSACTION-A1B2C3D4',
  },
];

const formatAmount = (amount: number) => amount.toLocaleString('fr-FR') + ' FCFA';

export default function FormationScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [payments, setPayments] = useState(PAYMENTS_DATA);
  const [detailModal, setDetailModal] = useState<typeof PAYMENTS_DATA[0] | null>(null);

  const filters = [
    { id: 'all', label: 'Tous' },
    { id: 'pending', label: 'En attente' },
    { id: 'validated', label: 'Validé' },
    { id: 'rejected', label: 'Rejeté' },
  ];

  const filteredData = payments.filter(item => {
    const matchSearch =
      item.participant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.formation.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedFilter === 'all') return matchSearch;
    if (selectedFilter === 'pending') return matchSearch && item.status === 'en_attente';
    if (selectedFilter === 'validated') return matchSearch && item.status === 'validé';
    if (selectedFilter === 'rejected') return matchSearch && item.status === 'rejeté';
    return matchSearch;
  });

  // Summary
  const pendingCount = payments.filter(p => p.status === 'en_attente').length;
  const validatedCount = payments.filter(p => p.status === 'validé').length;
  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalTickets = payments.reduce((sum, p) => sum + p.tickets, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'validé': return '#2ecc71';
      case 'en_attente': return '#f39c12';
      case 'rejeté': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'validé': return 'Validé';
      case 'en_attente': return 'En attente';
      case 'rejeté': return 'Rejeté';
      default: return status;
    }
  };

  const getMethodLabel = (method: string | null) => {
    if (!method) return 'Non spécifié';
    switch (method) {
      case 'orange_money': return 'Orange Money';
      case 'mtn_money': return 'MTN Money';
      case 'moov_money': return 'Moov Money';
      case 'gtbank': return 'GTBank CI';
      default: return method;
    }
  };

  const renderPayment = ({ item }: { item: typeof PAYMENTS_DATA[0] }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}
      onPress={() => setDetailModal(item)}
    >
      {/* Top Row */}
      <View style={styles.cardTop}>
        <View style={styles.participantArea}>
          <View style={[styles.avatar, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.avatarText, { color: getStatusColor(item.status) }]}>
              {item.participant.charAt(0)}
            </Text>
          </View>
          <View style={styles.participantInfo}>
            <Text style={[styles.participantName, { color: themeColors.text }]} numberOfLines={1}>
              {item.participant}
            </Text>
            <Text style={styles.dateText}>{item.date}</Text>
          </View>
        </View>
        <View style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) + '18' }]}>
          <Text style={[styles.statusLabel, { color: getStatusColor(item.status) }]}>
            {getStatusLabel(item.status)}
          </Text>
        </View>
      </View>

      {/* Formation Info */}
      <View style={[styles.formationBox, { backgroundColor: themeColors.background }]}>
        <Ionicons name="school-outline" size={14} color="#FFCC00" />
        <Text style={[styles.formationText, { color: themeColors.text }]} numberOfLines={1}>
          {item.formation}
        </Text>
      </View>

      {/* Bottom Row */}
      <View style={styles.cardBottom}>
        <View style={styles.infoChip}>
          <Ionicons name="ticket-outline" size={14} color="#888" />
          <Text style={styles.infoChipText}>{item.tickets} ticket{item.tickets > 1 ? 's' : ''}</Text>
        </View>
        <View style={styles.infoChip}>
          <Ionicons name="card-outline" size={14} color="#888" />
          <Text style={styles.infoChipText}>{getMethodLabel(item.method)}</Text>
        </View>
        <Text style={[styles.amountText, { color: themeColors.text }]}>{formatAmount(item.amount)}</Text>
      </View>
    </TouchableOpacity>
  );

  const ListHeader = () => (
    <View>
      {/* Stats Grid */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll} contentContainerStyle={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: '#f39c1215' }]}>
          <View style={[styles.statIcon, { backgroundColor: '#f39c1225' }]}>
            <Ionicons name="hourglass-outline" size={18} color="#f39c12" />
          </View>
          <Text style={[styles.statNumber, { color: '#f39c12' }]}>{pendingCount}</Text>
          <Text style={styles.statLabel}>En attente</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#2ecc7115' }]}>
          <View style={[styles.statIcon, { backgroundColor: '#2ecc7125' }]}>
            <Ionicons name="checkmark-circle-outline" size={18} color="#2ecc71" />
          </View>
          <Text style={[styles.statNumber, { color: '#2ecc71' }]}>{validatedCount}</Text>
          <Text style={styles.statLabel}>Validés</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#3498db15' }]}>
          <View style={[styles.statIcon, { backgroundColor: '#3498db25' }]}>
            <Ionicons name="cash-outline" size={18} color="#3498db" />
          </View>
          <Text style={[styles.statNumber, { color: '#3498db' }]}>{formatAmount(totalAmount)}</Text>
          <Text style={styles.statLabel}>Montant total</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#9b59b615' }]}>
          <View style={[styles.statIcon, { backgroundColor: '#9b59b625' }]}>
            <Ionicons name="ticket-outline" size={18} color="#9b59b6" />
          </View>
          <Text style={[styles.statNumber, { color: '#9b59b6' }]}>{totalTickets}</Text>
          <Text style={styles.statLabel}>Total tickets</Text>
        </View>
      </ScrollView>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow}>
        {filters.map(f => (
          <TouchableOpacity
            key={f.id}
            onPress={() => setSelectedFilter(f.id)}
            style={[
              styles.filterChip,
              selectedFilter === f.id
                ? { backgroundColor: '#FFCC00' }
                : { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border, borderWidth: 1 }
            ]}
          >
            <Text style={[styles.filterLabel, { color: selectedFilter === f.id ? '#000' : themeColors.textSecondary }]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={[styles.listTitle, { color: themeColors.text }]}>
        {filteredData.length} paiement{filteredData.length > 1 ? 's' : ''}
      </Text>
    </View>
  );

  const handleValidate = (id: string) => {
    setTimeout(() => {
      setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'validé' } : p));
      setDetailModal(null);
      Alert.alert('Succès', 'Le paiement a été validé avec succès.');
    }, 500);
  };

  const handleReject = (id: string) => {
    setTimeout(() => {
      setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'rejeté' } : p));
      setDetailModal(null);
      Alert.alert('Succès', 'Le paiement a été rejeté.');
    }, 500);
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: '#181818' }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFCC00" />
          </TouchableOpacity>
          <View style={styles.headerTitleArea}>
            <Text style={styles.headerTitle}>Formation</Text>
            <Text style={styles.headerSubtitle}>Validation des paiements</Text>
          </View>
          <TouchableOpacity onPress={() => Alert.alert('Exportation', 'Démarrage de la génération et du téléchargement du grand livre des paiements au format CSV.')}>
            <Ionicons name="download-outline" size={24} color="#FFCC00" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#888" />
          <TextInput
            placeholder="Nom, email, formation..."
            placeholderTextColor="#888"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={filteredData}
        renderItem={renderPayment}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<ListHeader />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="school-outline" size={60} color={themeColors.textSecondary} />
            <Text style={{ color: themeColors.textSecondary, marginTop: 10, fontSize: 14, fontWeight: '600' }}>
              Aucun paiement trouvé
            </Text>
          </View>
        }
      />

      {/* Detail Modal */}
      <Modal visible={!!detailModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors.text }]}>📋 Détails du paiement</Text>
              <TouchableOpacity onPress={() => setDetailModal(null)}>
                <Ionicons name="close-circle" size={28} color={themeColors.textSecondary} />
              </TouchableOpacity>
            </View>

            {detailModal && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* General Info */}
                <View style={[styles.detailSection, { backgroundColor: themeColors.background }]}>
                  <Text style={[styles.detailSectionTitle, { color: themeColors.text }]}>🎫 Informations générales</Text>
                  <DetailRow label="Nom complet" value={detailModal.participant} color={themeColors} />
                  <DetailRow label="Email" value={detailModal.email} color={themeColors} />
                  <DetailRow label="Téléphone" value={detailModal.phone} color={themeColors} />
                  <DetailRow label="Tickets" value={`${detailModal.tickets}`} color={themeColors} />
                  <DetailRow label="Montant" value={formatAmount(detailModal.amount)} color={themeColors} />
                </View>

                {/* Payment Info */}
                <View style={[styles.detailSection, { backgroundColor: themeColors.background }]}>
                  <Text style={[styles.detailSectionTitle, { color: themeColors.text }]}>💳 Paiement</Text>
                  <DetailRow label="Transaction ID" value={detailModal.transactionId} color={themeColors} />
                  <DetailRow label="Référence" value={detailModal.reference || 'Non fournie'} color={themeColors} />
                  <DetailRow label="Méthode" value={getMethodLabel(detailModal.method)} color={themeColors} />
                  <DetailRow label="Date" value={detailModal.date} color={themeColors} />
                </View>

                {/* Formation Info */}
                <View style={[styles.detailSection, { backgroundColor: themeColors.background }]}>
                  <Text style={[styles.detailSectionTitle, { color: themeColors.text }]}>📚 Formation</Text>
                  <DetailRow label="Formation" value={detailModal.formation} color={themeColors} />
                  <DetailRow label="Date formation" value={detailModal.dateFormation} color={themeColors} />
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: themeColors.textSecondary }]}>Statut</Text>
                    <View style={[styles.statusChip, { backgroundColor: getStatusColor(detailModal.status) + '18' }]}>
                      <Text style={[styles.statusLabel, { color: getStatusColor(detailModal.status) }]}>
                        {getStatusLabel(detailModal.status)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Action Buttons */}
                {detailModal.status === 'en_attente' && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#2ecc71' }]} onPress={() => handleValidate(detailModal.id)}>
                      <Ionicons name="checkmark-circle" size={18} color="#FFF" />
                      <Text style={styles.actionBtnText}>Valider</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#e74c3c' }]} onPress={() => handleReject(detailModal.id)}>
                      <Ionicons name="close-circle" size={18} color="#FFF" />
                      <Text style={styles.actionBtnText}>Rejeter</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function DetailRow({ label, value, color }: { label: string; value: string; color: any }) {
  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: color.textSecondary }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: color.text }]} numberOfLines={2}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 55,
    paddingHorizontal: 25,
    paddingBottom: 25,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    elevation: 5,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backBtn: { padding: 5, marginLeft: -5 },
  headerTitleArea: { alignItems: 'center' },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  headerSubtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '600', marginTop: 2 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 18,
    paddingHorizontal: 15,
    height: 50,
  },
  searchInput: { flex: 1, color: '#FFF', fontSize: 14, marginLeft: 10, fontWeight: '500' },
  listContent: { paddingBottom: 100 },

  // Stats
  statsScroll: { marginTop: 20 },
  statsContainer: { paddingHorizontal: 25, gap: 12 },
  statCard: { width: 140, borderRadius: 20, padding: 15 },
  statIcon: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statNumber: { fontSize: 16, fontWeight: '900' },
  statLabel: { color: '#888', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },

  // Filters
  filtersRow: { paddingHorizontal: 25, gap: 8, marginTop: 20, marginBottom: 5 },
  filterChip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 25 },
  filterLabel: { fontSize: 13, fontWeight: '700' },

  listTitle: { fontSize: 14, fontWeight: '800', marginTop: 20, marginBottom: 10, marginLeft: 25 },

  // Card
  card: {
    marginHorizontal: 25,
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  participantArea: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 },
  avatar: { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 18, fontWeight: '900' },
  participantInfo: { flex: 1 },
  participantName: { fontSize: 15, fontWeight: '800' },
  dateText: { color: '#888', fontSize: 11, fontWeight: '600', marginTop: 2 },
  statusChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  statusLabel: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  formationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  formationText: { fontSize: 12, fontWeight: '700', flex: 1 },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.04)',
    paddingTop: 12,
  },
  infoChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoChipText: { color: '#888', fontSize: 11, fontWeight: '600' },
  amountText: { fontSize: 14, fontWeight: '900' },

  emptyState: { alignItems: 'center', marginTop: 100 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800' },
  detailSection: { borderRadius: 16, padding: 15, marginBottom: 12 },
  detailSectionTitle: { fontSize: 14, fontWeight: '800', marginBottom: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  detailLabel: { fontSize: 12, fontWeight: '600' },
  detailValue: { fontSize: 13, fontWeight: '700', textAlign: 'right', maxWidth: '60%' },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 5, marginBottom: 20 },
  actionBtn: {
    flex: 1,
    height: 50,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  actionBtnText: { color: '#FFF', fontSize: 14, fontWeight: '800' },
});
