import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import api from '@/services/api-service';
import * as SecureStore from 'expo-secure-store';

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/login', {
        email: email,
        password: password,
        device_name: Platform.OS + '_' + (Platform.Version || 'unknown'),
      });

      const { token, user } = response.data;
      
      // On crée un objet utilisateur épuré pour éviter l'erreur de taille SecureStore (> 2048 octets)
      const minimalUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.image_url || user.avatar_url,
        role: user.roles?.[0]?.name || 'employé'
      };
      
      // Stockage sécurisé du token et des infos user épurées
      const cleanToken = token.trim();
      await SecureStore.setItemAsync('user_token', cleanToken);
      await SecureStore.setItemAsync('user_data', JSON.stringify(minimalUser));
      
      console.log('Login réussi', { user: minimalUser, token: cleanToken });

      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Erreur de connexion', error.response?.data || error.message);
      
      let errorMsg = 'Impossible de se connecter au serveur.';
      if (error.response?.status === 401) {
        errorMsg = 'Email ou mot de passe incorrect.';
      } else if (error.message === 'Network Error') {
        errorMsg = 'Erreur réseau : Vérifiez l\'URL de votre API dans services/api-service.ts';
      }

      Alert.alert('Échec de la connexion', errorMsg);
    } finally {
      setLoading(false);
    }
  };


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} bounces={false}>
        {/* Black Header (Premium Look) */}
        <View style={styles.header}>
          <Image 
            source={require('../assets/images/logo.jpg')} 
            style={styles.logo} 
            resizeMode="contain"
          />
          <Text style={styles.headerWelcome}>Projets • Diligences • Tâches</Text>
        </View>

        <View style={styles.formContent}>
          <Text style={[styles.title, { color: themeColors.text }]}>
            Bienvenue sur DCK FLOW TASK! 👋
          </Text>
          <Text style={[styles.subtitle, { color: themeColors.secondaryText }]}>
            Veuillez vous connecter à votre compte et commencer l'aventure
          </Text>

          {/* Social Logins */}
          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-google" size={24} color="#DB4437" />
              <Text style={styles.socialText}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-facebook" size={24} color="#4267B2" />
              <Text style={styles.socialText}>Facebook</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-linkedin" size={24} color="#0077B5" />
              <Text style={styles.socialText}>LinkedIn</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dividerContainer}>
            <View style={[styles.divider, { backgroundColor: themeColors.border }]} />
            <Text style={[styles.dividerText, { color: themeColors.secondaryText }]}>OU UTILISER EMAIL</Text>
            <View style={[styles.divider, { backgroundColor: themeColors.border }]} />
          </View>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: themeColors.text }]}>Email</Text>
            <View style={[styles.inputWrapper, { borderColor: themeColors.border }]}>
              <TextInput
                style={[styles.input, { color: themeColors.text }]}
                placeholder="Ex: contact@taskflow.com"
                placeholderTextColor={themeColors.secondaryText}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: themeColors.text }]}>Mot de passe</Text>
            <View style={[styles.inputWrapper, { borderColor: themeColors.border }]}>
              <TextInput
                style={[styles.input, { color: themeColors.text }]}
                placeholder=" Votre mot de passe"
                placeholderTextColor={themeColors.secondaryText}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={themeColors.secondaryText} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.extraControls}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <Ionicons
                name={rememberMe ? 'checkbox' : 'square-outline'}
                size={20}
                color={rememberMe ? themeColors.accent : themeColors.secondaryText}
              />
              <Text style={[styles.checkboxText, { color: themeColors.text }]}>Se souvenir de moi</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => console.log('Forgot password')}>
              <Text style={[styles.forgotPassword, { color: themeColors.secondaryText }]}>Mot de passe oublié ?</Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity 
            style={[styles.loginButton, { backgroundColor: themeColors.accent, opacity: loading ? 0.7 : 1 }]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <Text style={styles.loginButtonText}>SE CONNECTER</Text>
                <Ionicons name="arrow-forward" size={20} color="#000" style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.signupButton} onPress={() => console.log('Sign up')}>
            <Text style={[styles.signupText, { color: themeColors.secondaryText }]}>
              Nouveau sur la plateforme ? <Text style={{ color: themeColors.accent, fontWeight: '700' }}>S'inscrire</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    height: 220,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },
  logo: {
    width: 320,
    height: 140,
    marginTop: 10,
  },
  headerWelcome: {
    color: '#FFF',
    fontSize: 14,
    marginTop: 8,
    opacity: 0.8,
    textTransform: 'uppercase',
  },
  formContent: {
    padding: 24,
    marginTop: -20,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 32,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  socialButton: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  socialText: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 11,
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    height: 54,
    paddingHorizontal: 16,
    backgroundColor: '#FAFAFA',
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
  },
  eyeIcon: {
    padding: 8,
  },
  extraControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxText: {
    marginLeft: 8,
    fontSize: 14,
  },
  forgotPassword: {
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFCC00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '800',
  },
  signupButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  signupText: {
    fontSize: 14,
  },
});
