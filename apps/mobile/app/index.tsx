import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { setAuthToken } from '@stem-smartstudy/api-client-react';

export default function IndexRoute() {
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => { void AsyncStorage.getItem('session-token').then((token) => { setAuthToken(token); setSignedIn(Boolean(token)); setReady(true); }); }, []);
  if (!ready) return null;
  return <Redirect href={signedIn ? '/(tabs)' : '/(auth)'} />;
}
