import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';

export default function CreateContractScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const [form, setForm] = useState({
    contractNumber: '640',
    client: '',
    subject: '',
    amount: '',
    contractType: '',
    startDate: '',
    endDate: '',
    description: '',
  });

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: '#181818' }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFCC00" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ajouter un contrat</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Détails du contrat</Text>

        {/* Contract Number + Client */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 0.35, marginRight: 10 }]}>
            <Text style={[styles.label, { color: themeColors.textSecondary }]}>
              N° Contrat <Text style={styles.required}>*</Text>
            </Text>
            <View style={[styles.codeBox, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}>
              <Text style={[styles.codePrefix, { color: themeColors.textSecondary }]}>CONT#</Text>
              <TextInput
                style={[styles.codeInput, { color: themeColors.text }]}
                value={form.contractNumber}
                onChangeText={(t) => setForm({...form, contractNumber: t})}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={[styles.inputGroup, { flex: 0.65 }]}>
            <Text style={[styles.label, { color: themeColors.textSecondary }]}>
              Client <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity style={[styles.selectBox, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}>
              <Text style={[styles.selectText, { color: form.client ? themeColors.text : '#aaa' }]}>
                {form.client || 'Sélectionner'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={themeColors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Subject */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: themeColors.textSecondary }]}>
            Objet du contrat <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground, color: themeColors.text }]}
            placeholder="Ex: Audit Fiscal Annuel"
            placeholderTextColor="#aaa"
            value={form.subject}
            onChangeText={(t) => setForm({...form, subject: t})}
          />
        </View>

        {/* Type + Amount */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={[styles.label, { color: themeColors.textSecondary }]}>Type de contrat</Text>
            <TouchableOpacity style={[styles.selectBox, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}>
              <Text style={[styles.selectText, { color: form.contractType ? themeColors.text : '#aaa' }]}>
                {form.contractType || 'Sélectionner'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={themeColors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: themeColors.textSecondary }]}>Valeur du contrat</Text>
            <View style={[styles.amountBox, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}>
              <TextInput
                style={[styles.amountInput, { color: themeColors.text }]}
                placeholder="0"
                placeholderTextColor="#aaa"
                keyboardType="numeric"
                value={form.amount}
                onChangeText={(t) => setForm({...form, amount: t})}
              />
              <Text style={[styles.currency, { color: themeColors.textSecondary }]}>XOF</Text>
            </View>
          </View>
        </View>

        {/* Dates */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={[styles.label, { color: themeColors.textSecondary }]}>
              Date de début <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity style={[styles.selectBox, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}>
              <Text style={[styles.selectText, { color: '#ccc' }]}>Sélectionner</Text>
              <Ionicons name="calendar-outline" size={20} color={themeColors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: themeColors.textSecondary }]}>Date de fin</Text>
            <TouchableOpacity style={[styles.selectBox, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}>
              <Text style={[styles.selectText, { color: '#ccc' }]}>Sélectionner</Text>
              <Ionicons name="calendar-outline" size={20} color={themeColors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: themeColors.textSecondary }]}>Description / Notes</Text>
          <TextInput
            style={[styles.inputArea, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground, color: themeColors.text }]}
            placeholder="Détails supplémentaires du contrat..."
            placeholderTextColor="#aaa"
            multiline
            numberOfLines={4}
            value={form.description}
            onChangeText={(t) => setForm({...form, description: t})}
          />
        </View>

        <TouchableOpacity style={styles.submitBtn}>
          <Text style={styles.submitBtnText}>Enregistrer le contrat</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 55, paddingHorizontal: 20, paddingBottom: 25, borderBottomLeftRadius: 35, borderBottomRightRadius: 35, elevation: 5, zIndex: 10 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { padding: 5, marginLeft: -5 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  content: { padding: 24, paddingBottom: 100 },
  sectionTitle: { fontSize: 20, fontWeight: '800', marginBottom: 20 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  required: { color: '#e74c3c' },
  input: { height: 55, borderWidth: 1, borderRadius: 15, paddingHorizontal: 15, fontSize: 15, fontWeight: '500' },
  selectBox: { height: 55, borderWidth: 1, borderRadius: 15, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectText: { fontSize: 15, fontWeight: '500' },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  codeBox: { height: 55, borderWidth: 1, borderRadius: 15, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center' },
  codePrefix: { fontSize: 13, fontWeight: '800', marginRight: 4 },
  codeInput: { flex: 1, fontSize: 16, fontWeight: '700' },
  amountBox: { height: 55, borderWidth: 1, borderRadius: 15, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center' },
  amountInput: { flex: 1, fontSize: 16, fontWeight: '700' },
  currency: { fontSize: 14, fontWeight: '700', marginLeft: 8 },
  inputArea: { height: 120, borderWidth: 1, borderRadius: 15, paddingHorizontal: 15, paddingTop: 15, fontSize: 15, fontWeight: '500', textAlignVertical: 'top' },
  submitBtn: { backgroundColor: '#3498db', height: 60, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 10, elevation: 3 },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
});
