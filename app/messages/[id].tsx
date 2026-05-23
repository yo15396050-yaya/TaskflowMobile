import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Image, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef, useEffect } from 'react';
import api from '@/services/api-service';

export default function ChatDetailScreen() {
  const { id, name, avatar } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/messages/${id}`);
      setMessages(response.data.data || response.data || []);
    } catch (error) {
      console.error('Erreur chargement messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // Polling pour les nouveaux messages toutes les 5 secondes
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const sendMessage = async () => {
    if (message.trim()) {
      const textToSend = message;
      setMessage(''); // Vider l'input immédiatement pour une sensation de vitesse

      try {
        const response = await api.post('/messages', {
          to: id,
          message: textToSend
        });
        
        const newMsg = response.data.data || response.data;
        setMessages(prev => [...prev, newMsg]);
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
      } catch (error) {
        console.error('Erreur envoi message:', error);
        setMessage(textToSend); // Remettre le texte si erreur
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: '#181818' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFCC00" />
        </TouchableOpacity>
        <Image
          source={{ uri: `https://ui-avatars.com/api/?name=${name}&background=FFCC00&color=181818` }}
          style={styles.avatar}
        />
        <View style={styles.headerInfo}>
          <Text style={styles.userName} numberOfLines={1}>{name}</Text>
          <Text style={styles.status}>En ligne</Text>
        </View>
        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="call" size={20} color="#FFCC00" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="ellipsis-vertical" size={20} color="#FFCC00" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#FFCC00" />
        </View>
      ) : (
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatArea}
          contentContainerStyle={styles.chatContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.bubbleWrapper,
                msg.isMine ? styles.myBubbleWrapper : styles.otherBubbleWrapper
              ]}
            >
              <View
                style={[
                  styles.bubble,
                  msg.isMine ?
                    { backgroundColor: '#FFCC00', borderBottomRightRadius: 5 } :
                    { backgroundColor: themeColors.cardBackground, borderBottomLeftRadius: 5, borderColor: themeColors.border, borderWidth: 1 }
                ]}
              >
                <Text style={[styles.bubbleText, { color: msg.isMine ? '#181818' : themeColors.text }]}>
                  {msg.text}
                </Text>
                <Text style={[styles.bubbleTime, { color: msg.isMine ? 'rgba(0,0,0,0.5)' : themeColors.textSecondary }]}>
                  {msg.time}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={[styles.inputWrapper, { backgroundColor: themeColors.cardBackground, borderTopColor: themeColors.border }]}>
          <TouchableOpacity style={styles.attachBtn}>
            <Ionicons name="add" size={24} color={themeColors.textSecondary} />
          </TouchableOpacity>
          <TextInput
            style={[styles.input, { color: themeColors.text, backgroundColor: themeColors.background }]}
            placeholder="Écrivez votre message..."
            placeholderTextColor="#888"
            multiline
            value={message}
            onChangeText={setMessage}
          />
          {message.trim().length > 0 ? (
            <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
              <Ionicons name="send" size={20} color="#181818" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.micBtn}>
              <Ionicons name="mic" size={22} color={themeColors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 55,
    paddingHorizontal: 15,
    paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    zIndex: 10,
  },
  backBtn: { padding: 8 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginHorizontal: 10 },
  headerInfo: { flex: 1 },
  userName: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  status: { color: '#4CAF50', fontSize: 11, fontWeight: '600' },
  headerAction: { padding: 8 },
  chatArea: { flex: 1 },
  chatContent: { padding: 20, gap: 15 },
  bubbleWrapper: { flexDirection: 'row', width: '100%' },
  myBubbleWrapper: { justifyContent: 'flex-end' },
  otherBubbleWrapper: { justifyContent: 'flex-start' },
  bubble: {
    maxWidth: '75%',
    padding: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 4,
  },
  bubbleText: { fontSize: 14, fontWeight: '500', lineHeight: 20 },
  bubbleTime: { fontSize: 10, alignSelf: 'flex-end', fontWeight: '500' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 15,
    borderTopWidth: 1,
    gap: 12,
  },
  attachBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  input: {
    flex: 1,
    minHeight: 45,
    maxHeight: 100,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  sendBtn: {
    backgroundColor: '#FFCC00',
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  micBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
