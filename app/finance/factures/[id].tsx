import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  // Données fictives d'une facture
  const invoice = {
    id,
    number: 'INV#054',
    client: '2N IMMOBILIER',
    amount: '250 000',
    currency: 'FCFA',
    date: '12 Octobre 2023',
    dueDate: '20 Octobre 2023',
    status: 'Payé',
    statusColor: '#2ecc71',
    description: 'Prestation de service - Audit fiscal Q3',
    items: [
      { desc: 'Audit Fiscal', qty: 1, price: '200 000' },
      { desc: 'Frais de dossier', qty: 1, price: '50 000' },
    ]
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Facture ${invoice.number} - ${invoice.client} : ${invoice.amount} ${invoice.currency}`,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header Overlap */}
      <View style={[styles.header, { backgroundColor: '#181818' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFCC00" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détail Facture</Text>
        <TouchableOpacity onPress={handleShare}>
          <Ionicons name="share-social-outline" size={24} color="#FFCC00" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Receipt Card */}
        <View style={[styles.receiptCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
          <View style={[styles.statusBanner, { backgroundColor: invoice.statusColor }]}>
            <Text style={styles.statusLabel}>{invoice.status}</Text>
          </View>

          <View style={styles.mainInfo}>
            <Text style={styles.invoiceLabel}>Montant Total</Text>
            <Text style={[styles.amountText, { color: themeColors.text }]}>{invoice.amount} <Text style={styles.currency}>{invoice.currency}</Text></Text>
            <Text style={styles.invoiceID}>{invoice.number}</Text>
          </View>

          <View style={styles.divider} />

          {/* Table Details */}
          <View style={styles.detailsTable}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Client</Text>
              <Text style={[styles.detailValue, { color: themeColors.text }]}>{invoice.client}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Émise le</Text>
              <Text style={[styles.detailValue, { color: themeColors.text }]}>{invoice.date}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Échéance</Text>
              <Text style={[styles.detailValue, { color: themeColors.text }]}>{invoice.dueDate}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Items List */}
          <View style={styles.itemsSection}>
            <Text style={styles.sectionTitle}>Articles</Text>
            {invoice.items.map((item, idx) => (
              <View key={idx} style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.itemName, { color: themeColors.text }]}>{item.desc}</Text>
                  <Text style={styles.itemQty}>Qté: {item.qty}</Text>
                </View>
                <Text style={[styles.itemPrice, { color: themeColors.text }]}>{item.price} {invoice.currency}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Actions Group */}
        <View style={styles.actionGroup}>
            <Text style={[styles.sectionTitle, { marginBottom: 10 }]}>Actions rapides</Text>
            <TouchableOpacity style={[styles.primaryAction, { backgroundColor: '#FFCC00' }]}>
                <Ionicons name="download-outline" size={20} color="#000" />
                <Text style={styles.primaryActionText}>Télécharger PDF</Text>
            </TouchableOpacity>
        </View>

        {/* Global Actions List */}
        <View style={[styles.moreActionsContainer, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
            <Text style={styles.sectionTitle}>Gestion de la facture</Text>
            
            <TouchableOpacity style={styles.actionItem}>
                <Ionicons name="eye-outline" size={20} color={themeColors.textSecondary} />
                <Text style={[styles.actionLabel, { color: themeColors.text }]}>Afficher le PDF</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem}>
                <Ionicons name="send-outline" size={20} color={themeColors.textSecondary} />
                <Text style={[styles.actionLabel, { color: themeColors.text }]}>Envoyer par Email</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem}>
                <Ionicons name="add-outline" size={20} color={themeColors.textSecondary} />
                <Text style={[styles.actionLabel, { color: themeColors.text }]}>Ajouter une adresse de livraison</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem}>
                <Ionicons name="link-outline" size={20} color={themeColors.textSecondary} />
                <Text style={[styles.actionLabel, { color: themeColors.text }]}>Copier le lien de paiement</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem}>
                <Ionicons name="open-outline" size={20} color={themeColors.textSecondary} />
                <Text style={[styles.actionLabel, { color: themeColors.text }]}>Afficher la page de paiement</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem}>
                <Ionicons name="notifications-outline" size={20} color={themeColors.textSecondary} />
                <Text style={[styles.actionLabel, { color: themeColors.text }]}>Rappel de paiement</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem}>
                <Ionicons name="copy-outline" size={20} color={themeColors.textSecondary} />
                <Text style={[styles.actionLabel, { color: themeColors.text }]}>Créer / Dupliquer</Text>
            </TouchableOpacity>

            <View style={styles.actionDivider} />

            <TouchableOpacity style={styles.actionItem}>
                <Ionicons name="close-circle-outline" size={20} color="#e74c3c" />
                <Text style={[styles.actionLabel, { color: '#e74c3c' }]}>Annuler la facture</Text>
            </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    zIndex: 10,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  scrollContent: { padding: 20, paddingTop: 30, paddingBottom: 50 },
  receiptCard: {
    borderRadius: 30,
    borderWidth: 1,
    overflow: 'hidden',
    paddingBottom: 30,
    marginBottom: 25,
  },
  statusBanner: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  statusLabel: { color: '#FFF', fontSize: 13, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  mainInfo: { alignItems: 'center', paddingVertical: 35 },
  invoiceLabel: { fontSize: 12, color: '#888', fontWeight: '700', textTransform: 'uppercase', marginBottom: 5 },
  amountText: { fontSize: 36, fontWeight: '900' },
  currency: { fontSize: 18, fontWeight: '700', color: '#888' },
  invoiceID: { fontSize: 14, color: '#FFCC00', fontWeight: '800', marginTop: 10 },
  divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.05)', marginHorizontal: 25 },
  detailsTable: { padding: 25, gap: 15 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailLabel: { fontSize: 14, color: '#888', fontWeight: '600' },
  detailValue: { fontSize: 14, fontWeight: '700' },
  itemsSection: { padding: 25, paddingTop: 10 },
  sectionTitle: { fontSize: 13, fontWeight: '800', marginBottom: 15, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  itemName: { fontSize: 14, fontWeight: '700' },
  itemQty: { fontSize: 12, color: '#888', marginTop: 2 },
  itemPrice: { fontSize: 14, fontWeight: '800' },
  actionGroup: { marginBottom: 25 },
  primaryAction: {
    height: 55,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  primaryActionText: { color: '#000', fontSize: 15, fontWeight: '800' },
  moreActionsContainer: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 15,
  },
  actionLabel: { fontSize: 15, fontWeight: '600' },
  actionDivider: { height: 1, backgroundColor: 'rgba(0,0,0,0.05)', marginVertical: 5 },
});
