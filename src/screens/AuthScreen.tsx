import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { signInDemoUser, signInWithEmail, signUpWithEmail } from '../services/supabase/authService';
import { UserProfile } from '../types/user';
import { COLORS } from '../constants/theme';

interface AuthScreenProps {
  onAuthenticated: (user: UserProfile) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated }) => {
  const [email, setEmail] = useState('alex@focus-edition.app');
  const [password, setPassword] = useState('demo1234');
  const [name, setName] = useState('Alex Avery');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDemoLogin = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const user = await signInDemoUser();
      onAuthenticated(user);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      if (isSignUp) {
        const user = await signUpWithEmail(email.trim(), password, name.trim());
        onAuthenticated(user);
      } else {
        const user = await signInWithEmail(email.trim(), password);
        onAuthenticated(user);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentPadding}>
      <View style={styles.brandHeader}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoText}>F</Text>
        </View>
        <Text style={styles.brandTitle}>Focus Edition</Text>
        <Text style={styles.brandTagline}>Turn overwhelming documents into 4-min missions</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{isSignUp ? 'Create your account' : 'Welcome back'}</Text>
        <Text style={styles.cardSub}>
          Designed for ADHD, AuDHD, and anyone struggling with dense text.
        </Text>

        {errorMsg && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        {isSignUp && (
          <View style={styles.field}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={COLORS.muted}
              style={styles.input}
            />
          </View>
        )}

        <View style={styles.field}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="you@domain.com"
            placeholderTextColor={COLORS.muted}
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor={COLORS.muted}
            style={styles.input}
          />
        </View>

        <TouchableOpacity
          disabled={loading}
          onPress={handleSubmit}
          style={styles.primaryBtn}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryBtnText}>
              {isSignUp ? 'Create Account' : 'Continue with Email'}
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          disabled={loading}
          onPress={handleDemoLogin}
          style={styles.demoBtn}
        >
          <Text style={styles.demoBtnText}>⚡ Use Demo Account (1 click)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setIsSignUp(!isSignUp)}
          style={styles.switchAuthBtn}
        >
          <Text style={styles.switchAuthText}>
            {isSignUp ? 'Already have an account? Sign In' : 'New to Focus Edition? Create an Account'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F9'
  },
  contentPadding: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center'
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 28
  },
  logoBadge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.brand,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900'
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.ink
  },
  brandTagline: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 4,
    textAlign: 'center'
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.ink,
    marginBottom: 4
  },
  cardSub: {
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 18,
    marginBottom: 20
  },
  errorBox: {
    backgroundColor: '#FFF0F0',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: '600'
  },
  field: {
    marginBottom: 14
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.muted,
    marginBottom: 6
  },
  input: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.line,
    paddingHorizontal: 14,
    fontSize: 14,
    color: COLORS.ink,
    backgroundColor: '#FAFAFB'
  },
  primaryBtn: {
    backgroundColor: COLORS.brand,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.line
  },
  dividerText: {
    paddingHorizontal: 10,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.muted
  },
  demoBtn: {
    backgroundColor: COLORS.ink,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  demoBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14
  },
  switchAuthBtn: {
    marginTop: 18,
    alignItems: 'center'
  },
  switchAuthText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.brand
  }
});
