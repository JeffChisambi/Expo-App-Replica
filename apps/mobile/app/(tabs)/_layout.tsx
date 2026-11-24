import React from 'react';
import { Redirect, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/expo';
import { setAuthTokenGetter } from '@stem-smartstudy/api-client-react';
import { useGetStudentProfile } from '@stem-smartstudy/api-client-react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

export default function HomeLayout() {
  const colors = useColors();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [apiReady, setApiReady] = useState(false);

  useEffect(() => {
    if (!isSignedIn) {
      setAuthTokenGetter(null);
      setApiReady(false);
      return;
    }

    setAuthTokenGetter(() => getToken());
    setApiReady(true);
    return () => setAuthTokenGetter(null);
  }, [getToken, isSignedIn]);

  const profileQuery = useGetStudentProfile({
    query: { enabled: isSignedIn === true && apiReady, retry: 1 },
  });

  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect href="/(auth)" />;

  if (!apiReady || profileQuery.isPending) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.background,
          gap: 12,
        }}
      >
        <ActivityIndicator color={colors.primary} />
        <Text style={{ color: colors.softInk, fontFamily: 'Inter_400Regular' }}>
          Connecting your student account…
        </Text>
      </View>
    );
  }

  if (profileQuery.isError) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          backgroundColor: colors.background,
          gap: 12,
        }}
      >
        <Text
          style={{
            color: colors.ink,
            fontFamily: 'Inter_600SemiBold',
            fontSize: 18,
            textAlign: 'center',
          }}
        >
          We could not reach your student account.
        </Text>
        <Text
          style={{
            color: colors.softInk,
            fontFamily: 'Inter_400Regular',
            textAlign: 'center',
          }}
        >
          Check your connection and try again.
        </Text>
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
