import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ApiError, ResponseParseError, customFetch, setAuthToken } from '@stem-smartstudy/api-client-react';

function extractApiMessage(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const record = data as Record<string, unknown>;
  for (const key of ['message', 'detail', 'error']) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

function formatAuthError(caught: unknown, isRegister: boolean): string {
  if (caught instanceof ApiError) {
    if (caught.status >= 500) {
      return 'The study service is unavailable right now. Please try again shortly.';
    }
    const serverMessage = extractApiMessage(caught.data);
    if (serverMessage) return serverMessage;
    if (caught.status === 401) return 'Email or password is incorrect.';
    if (caught.status === 409) return 'An account already exists for this email.';
    if (caught.status === 429) return 'Too many attempts. Please wait a moment and try again.';
    if (caught.status === 400 || caught.status === 422) {
      return isRegister
        ? 'Please check your details and try again.'
        : 'Please check your email and password and try again.';
    }
    return isRegister
      ? 'We could not create your profile right now. Please try again.'
      : 'We could not sign you in right now. Please try again.';
  }

  if (caught instanceof ResponseParseError) {
    return 'We could not reach the study service. Please try again.';
  }

  if (caught instanceof Error) {
    const trimmed = caught.message.trim();
    const httpMatch = /^HTTP\s+(\d{3})\b[^:]*(?::\s*(.*))?$/i.exec(trimmed);
    if (httpMatch) {
      const status = Number(httpMatch[1]);
      const detail = httpMatch[2]?.trim();
      if (status >= 500) {
        return 'The study service is unavailable right now. Please try again shortly.';
      }
      if (detail) return detail;
      if (status === 401) return 'Email or password is incorrect.';
      if (status === 409) return 'An account already exists for this email.';
      return 'Please check your details and try again.';
    }

    if (
      !trimmed ||
      /network request failed|failed to fetch|load failed|networkerror|aborted/i.test(trimmed)
    ) {
      return 'We could not reach the study service. Please try again.';
    }
    return trimmed;
  }

  return 'We could not reach the study service. Please try again.';
}

export default function AuthScreen() {
  const router = useRouter();
  const [register, setRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (submitting) return;
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (register && !trimmedName) {
      setError('Please enter your name.');
      return;
    }
    const emailMatch = /^cen-\d{2}-\d{2}-(\d{2})@unilia\.ac\.mw$/i.exec(trimmedEmail);
    const currentAcademicYear = new Date().getFullYear() % 100;
    if (!emailMatch || Number(emailMatch[1]) > currentAcademicYear) {
      setError('Use your university email with a current or past academic year, for example cen-01-28-22@unilia.ac.mw.');
      return;
    }
    if (password.length < 8) {
      setError('Your password must be at least 8 characters.');
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      const result = await customFetch<{ token: string }>(register ? '/api/auth/register' : '/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(register ? { displayName: trimmedName, email: trimmedEmail, password } : { email: trimmedEmail, password }),
        responseType: 'json',
      });
      await AsyncStorage.setItem('session-token', result.token);
      setAuthToken(result.token);
      router.replace('/(tabs)');
    } catch (caught) {
      setError(formatAuthError(caught, register));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.page}>
      <Text style={styles.title}>{register ? 'Create your study profile' : 'Welcome back'}</Text>
      <Text style={styles.copy}>Your profile keeps your diagnostic history separate while improving topic insights for everyone.</Text>
      {register ? <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} /> : null}
      <TextInput style={styles.input} placeholder="University email (cen-01-28-22@unilia.ac.mw)" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Password (8+ characters)" secureTextEntry value={password} onChangeText={setPassword} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable style={[styles.button, submitting && styles.buttonDisabled]} disabled={submitting} onPress={() => void submit()}>
        <Text style={styles.buttonText}>{submitting ? (register ? 'Creating profile…' : 'Signing in…') : (register ? 'Create profile' : 'Sign in')}</Text>
      </Pressable>
      <Pressable onPress={() => { setRegister(!register); setError(''); }}>
        <Text style={styles.link}>{register ? 'Already have an account? Sign in' : 'New here? Create a profile'}</Text>
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({ page:{flex:1,justifyContent:'center',padding:28,backgroundColor:'#F7F9FC',gap:14},title:{fontSize:28,fontWeight:'700',color:'#14213D'},copy:{color:'#52627A',lineHeight:20,marginBottom:10},input:{backgroundColor:'#fff',borderWidth:1,borderColor:'#D9E1EC',borderRadius:12,padding:14},button:{backgroundColor:'#1E4E8C',borderRadius:12,padding:15,alignItems:'center'},buttonDisabled:{opacity:0.65},buttonText:{color:'#fff',fontWeight:'700'},link:{textAlign:'center',color:'#1E4E8C',marginTop:8},error:{color:'#B42318'} });
