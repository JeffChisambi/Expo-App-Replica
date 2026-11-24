import { useSignIn, useSignUp } from '@clerk/expo';
import { useSSO } from '@clerk/expo/experimental';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { officialLogoXml } from '@/constants/officialLogo';
import { useColors } from '@/hooks/useColors';

WebBrowser.maybeCompleteAuthSession();

type AuthMode = 'sign-in' | 'sign-up' | 'verify-email';
type VerificationFlow = 'sign-in' | 'sign-up';

export default function StudentAuthScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signIn, errors: signInErrors, fetchStatus: signInFetchStatus } =
    useSignIn();
  const { signUp, errors: signUpErrors, fetchStatus: signUpFetchStatus } =
    useSignUp();
  const { startSSOFlow } = useSSO();
  const [mode, setMode] = useState<AuthMode>('sign-up');
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationFlow, setVerificationFlow] =
    useState<VerificationFlow>('sign-up');
  const [notice, setNotice] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const isBusy =
    isGoogleLoading ||
    signInFetchStatus === 'fetching' ||
    signUpFetchStatus === 'fetching';
  const topInset =
    Platform.OS === 'web' ? Math.max(67, insets.top) : insets.top;
  const bottomInset =
    Platform.OS === 'web' ? Math.max(34, insets.bottom) : insets.bottom;

  const goToDashboard = () => router.replace('/(tabs)');

  const handleEmailSubmit = async () => {
    setNotice('');
    try {
      if (mode === 'sign-up') {
        const { error } = await signUp.password({
          emailAddress: emailAddress.trim(),
          password,
        });
        if (error) {
          setNotice('We could not create your account. Check the details and try again.');
          return;
        }

        const { error: emailCodeError } =
          await signUp.verifications.sendEmailCode();
        if (emailCodeError) {
          setNotice(
            'Your account was created, but we could not send the verification code. Please try again.',
          );
          return;
        }
        setVerificationFlow('sign-up');
        setMode('verify-email');
        return;
      }

      const { error } = await signIn.password({
        emailAddress: emailAddress.trim(),
        password,
      });
      if (error) {
        setNotice('Those sign-in details were not accepted. Check them and try again.');
        return;
      }

      if (signIn.status === 'complete') {
        await signIn.finalize({ navigate: goToDashboard });
      } else if (signIn.status === 'needs_client_trust') {
        const emailFactor = signIn.supportedSecondFactors.find(
          (factor) => factor.strategy === 'email_code',
        );
        if (emailFactor) {
          await signIn.mfa.sendEmailCode();
          setVerificationFlow('sign-in');
          setMode('verify-email');
        } else {
          setNotice('Your account needs another verification method. Contact your school administrator.');
        }
      } else if (signIn.status === 'needs_second_factor') {
        setNotice('This account needs an additional sign-in step that is not enabled in this app yet.');
      } else {
        setNotice('One more sign-in step is required. Please try again or contact support.');
      }
    } catch {
      setNotice('We could not complete that request. Please try again.');
    }
  };

  const handleVerifyCode = async () => {
    setNotice('');
    try {
      if (verificationFlow === 'sign-up') {
        const { error } = await signUp.verifications.verifyEmailCode({
          code: verificationCode.trim(),
        });
        if (error) {
          setNotice('That verification code is not valid. Try again or request a new one.');
          return;
        }
        if (signUp.status === 'complete') {
          await signUp.finalize({ navigate: goToDashboard });
        } else {
          setNotice(
            'Your account needs another setup step. Please try signing in again.',
          );
        }
        return;
      }

      await signIn.mfa.verifyEmailCode({ code: verificationCode.trim() });
      if (signIn.status === 'complete') {
        await signIn.finalize({ navigate: goToDashboard });
      } else {
        setNotice('We could not verify that code. Check it and try again.');
      }
    } catch {
      setNotice('We could not verify that code. Check it and try again.');
    }
  };

  const handleGoogleSignIn = async () => {
    setNotice('');
    setIsGoogleLoading(true);
    try {
      const result = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl: AuthSession.makeRedirectUri(),
      });
      if (result.createdSessionId) {
        goToDashboard();
      } else {
        setNotice('Google sign-in needs an additional account detail. Continue with email instead.');
      }
    } catch {
      setNotice('Google sign-in is unavailable right now. You can continue with email.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const switchMode = (nextMode: 'sign-in' | 'sign-up') => {
    setMode(nextMode);
    setNotice('');
    setVerificationCode('');
    setVerificationFlow(nextMode);
    signIn.reset();
    signUp.reset();
  };

  const errorText =
    mode === 'verify-email'
      ? signUpErrors.fields.code?.message ?? signInErrors.fields.code?.message
      : mode === 'sign-in'
        ? signInErrors.fields.identifier?.message ??
          signInErrors.fields.password?.message
        : signUpErrors.fields.emailAddress?.message ??
          signUpErrors.fields.password?.message;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: topInset + 28,
            paddingBottom: bottomInset + 24,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brand}>
          <View
            accessible
            accessibilityRole="image"
            accessibilityLabel="STEM SmartStudy"
          >
            <SvgXml xml={officialLogoXml} width={160} height={50} />
          </View>
        </View>

        <View style={styles.intro}>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>
            STUDENT ACCOUNT
          </Text>
          <Text style={[styles.title, { color: colors.ink }]}>
            {mode === 'verify-email'
              ? 'Check your email'
              : mode === 'sign-up'
                ? 'Start studying with a plan.'
                : 'Welcome back.'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.softInk }]}>
            {mode === 'verify-email'
              ? `Enter the verification code sent to ${emailAddress}.`
              : mode === 'sign-up'
                ? 'Create your student account to save your progress and study recommendations.'
                : 'Sign in to return to your courses and study progress.'}
          </Text>
        </View>

        <View
          style={[
            styles.formCard,
            { backgroundColor: colors.card, borderColor: colors.line },
          ]}
        >
          {mode === 'verify-email' ? (
            <>
              <Text style={[styles.label, { color: colors.ink }]}>
                Email verification code
              </Text>
              <TextInput
                accessibilityLabel="Email verification code"
                testID="student-verification-code"
                autoComplete="one-time-code"
                autoCapitalize="none"
                keyboardType="number-pad"
                value={verificationCode}
                onChangeText={setVerificationCode}
                placeholder="Enter the code"
                placeholderTextColor={colors.quiet}
                style={[
                  styles.input,
                  { backgroundColor: colors.background, borderColor: colors.line, color: colors.ink },
                ]}
              />
              {errorText ? (
                <Text style={[styles.fieldError, { color: colors.coral }]}>
                  {errorText}
                </Text>
              ) : null}
              <Pressable
                accessibilityRole="button"
                testID="verify-student-email"
                onPress={handleVerifyCode}
                disabled={!verificationCode.trim() || isBusy}
                style={({ pressed }) => [
                  styles.primaryButton,
                  { backgroundColor: colors.primary },
                  (!verificationCode.trim() || isBusy) && styles.disabled,
                  pressed && styles.pressed,
                ]}
              >
                {isBusy ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={[styles.primaryButtonText, { color: colors.white }]}>
                    Verify and continue
                  </Text>
                )}
              </Pressable>
              <Pressable
                accessibilityRole="button"
                testID="resend-verification-code"
                onPress={async () => {
                  setNotice('');
                  try {
                    const { error } =
                      verificationFlow === 'sign-up'
                        ? await signUp.verifications.sendEmailCode()
                        : await signIn.mfa.sendEmailCode();
                    if (error) {
                      setNotice('We could not send another code. Please try again.');
                    }
                  } catch {
                    setNotice('We could not send another code. Please try again.');
                  }
                }}
                disabled={isBusy}
                style={styles.textButton}
              >
                <Text style={[styles.textButtonLabel, { color: colors.primary }]}>
                  Send a new code
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={[styles.label, { color: colors.ink }]}>
                School or personal email
              </Text>
              <TextInput
                accessibilityLabel="Student email address"
                testID="student-email"
                autoComplete="email"
                autoCapitalize="none"
                keyboardType="email-address"
                textContentType="emailAddress"
                value={emailAddress}
                onChangeText={setEmailAddress}
                placeholder="you@example.com"
                placeholderTextColor={colors.quiet}
                style={[
                  styles.input,
                  { backgroundColor: colors.background, borderColor: colors.line, color: colors.ink },
                ]}
              />
              <Text style={[styles.label, { color: colors.ink }]}>Password</Text>
              <TextInput
                accessibilityLabel="Student password"
                testID="student-password"
                autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
                autoCapitalize="none"
                secureTextEntry
                textContentType={mode === 'sign-up' ? 'newPassword' : 'password'}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor={colors.quiet}
                style={[
                  styles.input,
                  { backgroundColor: colors.background, borderColor: colors.line, color: colors.ink },
                ]}
                onSubmitEditing={handleEmailSubmit}
                returnKeyType="go"
              />
              {errorText ? (
                <Text style={[styles.fieldError, { color: colors.coral }]}>
                  {errorText}
                </Text>
              ) : null}
              <Pressable
                accessibilityRole="button"
                testID="student-email-submit"
                onPress={handleEmailSubmit}
                disabled={!emailAddress.trim() || !password || isBusy}
                style={({ pressed }) => [
                  styles.primaryButton,
                  { backgroundColor: colors.primary },
                  (!emailAddress.trim() || !password || isBusy) && styles.disabled,
                  pressed && styles.pressed,
                ]}
              >
                {isBusy ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={[styles.primaryButtonText, { color: colors.white }]}>
                    {mode === 'sign-up' ? 'Create student account' : 'Sign in'}
                  </Text>
                )}
              </Pressable>

              {mode === 'sign-up' ? <View nativeID="clerk-captcha" /> : null}

              <View style={styles.separator}>
                <View style={[styles.separatorLine, { backgroundColor: colors.line }]} />
                <Text style={[styles.separatorText, { color: colors.quiet }]}>OR</Text>
                <View style={[styles.separatorLine, { backgroundColor: colors.line }]} />
              </View>

              <Pressable
                accessibilityRole="button"
                testID="student-google-sign-in"
                onPress={handleGoogleSignIn}
                disabled={isBusy}
                style={({ pressed }) => [
                  styles.googleButton,
                  { borderColor: colors.line, backgroundColor: colors.card },
                  pressed && styles.pressed,
                ]}
              >
                <GoogleMark />
                <Text style={[styles.googleButtonText, { color: colors.ink }]}>
                  Continue with Google
                </Text>
              </Pressable>
            </>
          )}

          {notice ? (
            <Text accessibilityRole="alert" style={[styles.notice, { color: colors.coral }]}>
              {notice}
            </Text>
          ) : null}
        </View>

        {mode !== 'verify-email' ? (
          <View style={styles.modeToggle}>
            <Text style={[styles.modeCopy, { color: colors.softInk }]}>
              {mode === 'sign-up' ? 'Already have an account?' : 'New to STEM SmartStudy?'}
            </Text>
            <Pressable
              accessibilityRole="button"
              testID="student-auth-mode-toggle"
              onPress={() => switchMode(mode === 'sign-up' ? 'sign-in' : 'sign-up')}
              hitSlop={8}
            >
              <Text style={[styles.modeAction, { color: colors.primary }]}>
                {mode === 'sign-up' ? 'Sign in' : 'Create account'}
              </Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            testID="back-to-student-sign-in"
            onPress={() => switchMode('sign-in')}
            style={styles.textButton}
          >
            <Text style={[styles.textButtonLabel, { color: colors.primary }]}>
              Back to sign in
            </Text>
          </Pressable>
        )}

        <Text style={[styles.footerNote, { color: colors.quiet }]}>
          Your account keeps your study activity connected to you.
        </Text>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

function GoogleMark() {
  return (
    <SvgXml
      xml={`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.74 7.18l7.73 6C44.44 37.97 46.98 31.8 46.98 24.55z"/><path fill="#FBBC05" d="M10.53 28.59a14.4 14.4 0 0 1-.76-4.59c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.53 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.91 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>`}
      width={19}
      height={19}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 22,
  },
  brand: { width: '100%', maxWidth: 440, marginBottom: 33 },
  intro: { width: '100%', maxWidth: 440, marginBottom: 21 },
  eyebrow: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 1.2,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 30,
    lineHeight: 38,
    letterSpacing: -0.8,
    marginTop: 9,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  formCard: {
    width: '100%',
    maxWidth: 440,
    padding: 20,
    borderWidth: 1,
    borderRadius: 22,
    gap: 11,
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    marginTop: 4,
  },
  input: {
    minHeight: 51,
    borderWidth: 1,
    borderRadius: 13,
    paddingHorizontal: 15,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
  },
  fieldError: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 17,
  },
  primaryButton: {
    minHeight: 52,
    marginTop: 5,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
  },
  disabled: { opacity: 0.52 },
  pressed: { opacity: 0.78 },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 1,
  },
  separatorLine: { flex: 1, height: 1 },
  separatorText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    letterSpacing: 0.8,
  },
  googleButton: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  googleButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  notice: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  textButton: { alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 12 },
  textButtonLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
  },
  modeToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    marginTop: 16,
  },
  modeCopy: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
  },
  modeAction: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
  },
  footerNote: {
    maxWidth: 360,
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 27,
  },
});
