import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import api from '@/services/api-service';

const LEAVE_TYPES = [
  'Congé Annuel',
  'Permission Maladie',
  'Urgence Personnelle',
  'Congé Maternité/Paternité',
  'Formation',
  'Autre'
];

export default function CreatePermissionScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const [form, setForm] = useState({ type: '', startDate: '', endDate: '', reason: '' });
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Custom Calendar state
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [activeDateField, setActiveDateField] = useState<'start' | 'end' | null>(null);

  const getLeaveTypeDetails = (type: string) => {
    switch (type) {
      case 'Congé Annuel': return { icon: 'calendar-outline', color: '#3498db' };
      case 'Permission Maladie': return { icon: 'medical-outline', color: '#e74c3c' };
      case 'Urgence Personnelle': return { icon: 'alert-circle-outline', color: '#e67e22' };
      case 'Congé Maternité/Paternité': return { icon: 'people-outline', color: '#9b59b6' };
      case 'Formation': return { icon: 'school-outline', color: '#2ecc71' };
      default: return { icon: 'help-circle-outline', color: '#95a5a6' };
    }
  };

  const generateDaysOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday, 1 = Monday
    const totalDays = new Date(year, month + 1, 0).getDate();
    const totalDaysPrevMonth = new Date(year, month, 0).getDate();

    const days = [];
    const startDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1; // Align to Monday start
    
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({
        day: totalDaysPrevMonth - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, totalDaysPrevMonth - i)
      });
    }

    for (let i = 1; i <= totalDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i)
      });
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i)
      });
    }

    return days;
  };

  const changeMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + (direction === 'next' ? 1 : -1), 1);
    setCalendarDate(newDate);
  };

  const handleSelectDay = (dayDate: Date) => {
    const d = String(dayDate.getDate()).padStart(2, '0');
    const m = String(dayDate.getMonth() + 1).padStart(2, '0');
    const y = dayDate.getFullYear();
    const dateStr = `${d}/${m}/${y}`;
    
    if (activeDateField === 'start') {
      setForm(prev => ({ ...prev, startDate: dateStr }));
    } else if (activeDateField === 'end') {
      setForm(prev => ({ ...prev, endDate: dateStr }));
    }
    setShowCalendar(false);
    setActiveDateField(null);
  };

  const handleSubmit = async () => {
    if (!form.type || !form.startDate || !form.endDate) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires (*)');
      return;
    }

    setLoading(true);
    try {
      await api.post('/rh/permissions', {
        type: form.type,
        start_date: form.startDate,
        end_date: form.endDate,
        reason: form.reason,
      });

      Alert.alert(
        'Succès',
        'Votre demande de permission a été soumise avec succès.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      console.error('Erreur lors de la soumission:', error.response?.data || error.message);
      Alert.alert('Erreur', 'Impossible de soumettre la demande. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const selectType = (type: string) => {
    setForm({ ...form, type });
    setShowTypeModal(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={[styles.header, { backgroundColor: '#181818' }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFCC00" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Demander un Congé</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: themeColors.textSecondary }]}>
            Type d'absence <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity 
            style={[styles.selectBox, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}
            onPress={() => setShowTypeModal(true)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              {form.type ? (
                <View style={[styles.typeIconBg, { backgroundColor: getLeaveTypeDetails(form.type).color + '15', width: 28, height: 28, borderRadius: 8 }]}>
                  <Ionicons name={getLeaveTypeDetails(form.type).icon as any} size={16} color={getLeaveTypeDetails(form.type).color} />
                </View>
              ) : (
                <Ionicons name="alert-circle-outline" size={20} color="#888" />
              )}
              <Text style={[styles.selectText, { color: form.type ? themeColors.text : '#aaa', fontWeight: form.type ? '700' : '500' }]}>
                {form.type || 'Sélectionner (Maladie, Annuel...)'}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={20} color={themeColors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={[styles.label, { color: themeColors.textSecondary }]}>Début <Text style={styles.required}>*</Text></Text>
            <TouchableOpacity 
              style={[styles.selectBox, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}
              onPress={() => {
                setActiveDateField('start');
                setCalendarDate(form.startDate ? (() => {
                  const parts = form.startDate.split('/');
                  if (parts.length === 3) {
                    const parsed = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                    if (!isNaN(parsed.getTime())) return parsed;
                  }
                  return new Date();
                })() : new Date());
                setShowCalendar(true);
              }}
            >
              <Text style={[styles.selectText, { color: form.startDate ? themeColors.text : '#666', fontWeight: form.startDate ? '700' : '500' }]}>
                {form.startDate || 'JJ/MM/AAAA'}
              </Text>
              <Ionicons name="calendar-outline" size={18} color={themeColors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: themeColors.textSecondary }]}>Fin <Text style={styles.required}>*</Text></Text>
            <TouchableOpacity 
              style={[styles.selectBox, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}
              onPress={() => {
                setActiveDateField('end');
                setCalendarDate(form.endDate ? (() => {
                  const parts = form.endDate.split('/');
                  if (parts.length === 3) {
                    const parsed = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                    if (!isNaN(parsed.getTime())) return parsed;
                  }
                  return new Date();
                })() : new Date());
                setShowCalendar(true);
              }}
            >
              <Text style={[styles.selectText, { color: form.endDate ? themeColors.text : '#666', fontWeight: form.endDate ? '700' : '500' }]}>
                {form.endDate || 'JJ/MM/AAAA'}
              </Text>
              <Ionicons name="calendar-outline" size={18} color={themeColors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: themeColors.textSecondary }]}>
            Motif / Détails
          </Text>
          <TextInput 
            style={[styles.inputArea, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground, color: themeColors.text }]}
            placeholder="Précisez la raison de votre demande..."
            placeholderTextColor="#666"
            multiline
            numberOfLines={4}
            value={form.reason}
            onChangeText={(t) => setForm({...form, reason: t})}
          />
        </View>

        <TouchableOpacity 
          style={[styles.submitBtn, { opacity: loading ? 0.7 : 1 }]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.submitBtnText}>Soumettre la demande</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Modal pour le type de congé */}
      <Modal visible={showTypeModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors.text }]}>Type d'absence</Text>
              <TouchableOpacity onPress={() => setShowTypeModal(false)}>
                <Ionicons name="close" size={24} color={themeColors.text} />
              </TouchableOpacity>
            </View>
            {LEAVE_TYPES.map((item, index) => {
              const typeInfo = getLeaveTypeDetails(item);
              return (
                <TouchableOpacity 
                  key={index} 
                  style={[styles.typeOption, index !== LEAVE_TYPES.length - 1 && { borderBottomWidth: 1, borderBottomColor: themeColors.border }]}
                  onPress={() => selectType(item)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={[styles.typeIconBg, { backgroundColor: typeInfo.color + '15', width: 34, height: 34, borderRadius: 10 }]}>
                      <Ionicons name={typeInfo.icon as any} size={18} color={typeInfo.color} />
                    </View>
                    <Text style={[styles.typeOptionText, { color: themeColors.text }]}>{item}</Text>
                  </View>
                  {form.type === item && <Ionicons name="checkmark" size={20} color="#FFCC00" />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>

      {/* Modal Calendrier Personnalisé */}
      <Modal visible={showCalendar} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.calendarContent, { backgroundColor: themeColors.cardBackground }]}>
            {/* Header */}
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={() => changeMonth('prev')} style={styles.calNavBtn}>
                <Ionicons name="chevron-back" size={20} color={themeColors.text} />
              </TouchableOpacity>
              <Text style={[styles.calendarTitle, { color: themeColors.text }]}>
                {calendarDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
              </Text>
              <TouchableOpacity onPress={() => changeMonth('next')} style={styles.calNavBtn}>
                <Ionicons name="chevron-forward" size={20} color={themeColors.text} />
              </TouchableOpacity>
            </View>

            {/* Weekdays */}
            <View style={styles.weekdaysRow}>
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((w, idx) => (
                <Text key={idx} style={styles.weekdayText}>{w}</Text>
              ))}
            </View>

            {/* Days Grid */}
            <View style={styles.daysGrid}>
              {generateDaysOfMonth(calendarDate).map((dayObj, idx) => {
                const targetStr = activeDateField === 'start' ? form.startDate : form.endDate;
                const isSelected = targetStr && (() => {
                  const parts = targetStr.split('/');
                  if (parts.length === 3) {
                    return dayObj.date.getDate() === parseInt(parts[0]) &&
                           dayObj.date.getMonth() === parseInt(parts[1]) - 1 &&
                           dayObj.date.getFullYear() === parseInt(parts[2]);
                  }
                  return false;
                })();

                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.dayCell,
                      !dayObj.isCurrentMonth && { opacity: 0.3 },
                      isSelected && { backgroundColor: '#FFCC00', borderRadius: 12 }
                    ]}
                    onPress={() => dayObj.isCurrentMonth && handleSelectDay(dayObj.date)}
                    disabled={!dayObj.isCurrentMonth}
                  >
                    <Text 
                      style={[
                        styles.dayText, 
                        { color: isSelected ? '#000' : themeColors.text },
                        isSelected && { fontWeight: '800' }
                      ]}
                    >
                      {dayObj.day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity 
              style={[styles.calCloseBtn, { borderColor: themeColors.border }]} 
              onPress={() => { setShowCalendar(false); setActiveDateField(null); }}
            >
              <Text style={[styles.calCloseBtnText, { color: themeColors.text }]}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  required: { color: '#e74c3c' },
  selectBox: { height: 55, borderWidth: 1, borderRadius: 15, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectText: { fontSize: 15, fontWeight: '500' },
  inputArea: { height: 120, borderWidth: 1, borderRadius: 15, paddingHorizontal: 15, paddingTop: 15, fontSize: 15, fontWeight: '500', textAlignVertical: 'top' },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  submitBtn: { backgroundColor: '#FFCC00', height: 60, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 10, elevation: 3 },
  submitBtnText: { color: '#000', fontSize: 16, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800' },
  typeOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18 },
  typeOptionText: { fontSize: 16, fontWeight: '500' },
  typeIconBg: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Custom calendar styles
  calendarContent: {
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    padding: 25,
    paddingBottom: 40,
    alignItems: 'center',
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  calNavBtn: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  weekdaysRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  weekdayText: {
    width: 40,
    textAlign: 'center',
    fontSize: 12,
    color: '#888',
    fontWeight: '700',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    justifyContent: 'space-around',
    marginBottom: 25,
  },
  dayCell: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
  },
  calCloseBtn: {
    borderWidth: 1,
    height: 55,
    borderRadius: 15,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calCloseBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
});

