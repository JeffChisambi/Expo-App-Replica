import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';
import { useColors } from '@/hooks/useColors';

type DashboardTab = 'home' | 'calendar' | 'clients' | 'notifications';
type ModalType = 'appointment' | 'profile' | 'privacy' | null;

const profileImage = require('../../assets/images/alexander-profile.png');

export default function MorningDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<DashboardTab>('home');
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [savedAppointment, setSavedAppointment] = useState(false);
  const topInset =
    Platform.OS === 'web' ? Math.max(67, insets.top) : insets.top;
  const bottomInset =
    Platform.OS === 'web' ? Math.max(34, insets.bottom) : insets.bottom;

  const openCalendar = () => setActiveTab('calendar');

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: topInset + 8, paddingBottom: 112 + bottomInset },
        ]}
      >
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Privacy and app menu"
            testID="open-menu"
            onPress={() => setActiveModal('privacy')}
            style={({ pressed }) => [
              styles.menuButton,
              { borderColor: colors.line },
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="grid-outline" size={18} color={colors.ink} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open Alexander's profile"
            testID="open-profile"
            onPress={() => setActiveModal('profile')}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <Image
              source={profileImage}
              style={[styles.avatar, { backgroundColor: colors.profilePlaceholder }]}
              contentFit="cover"
            />
            <View
              style={[
                styles.onlineDot,
                { borderColor: colors.background, backgroundColor: colors.online },
              ]}
            />
          </Pressable>
        </View>

        {activeTab === 'home' ? (
          <HomeContent
            colors={colors}
            onAppointmentPress={() => setActiveModal('appointment')}
            onBookmarkPress={() => setSavedAppointment((saved) => !saved)}
            savedAppointment={savedAppointment}
            onViewAll={openCalendar}
          />
        ) : (
          <TabContent
            tab={activeTab}
            colors={colors}
            onAppointmentPress={() => setActiveModal('appointment')}
          />
        )}
      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: colors.bottomBar,
            borderTopColor: colors.line,
            paddingBottom: bottomInset,
          },
        ]}
      >
        <NavigationButton
          label="Home"
          name="home"
          active={activeTab === 'home'}
          colors={colors}
          onPress={() => setActiveTab('home')}
        />
        <NavigationButton
          label="Calendar"
          name="calendar"
          active={activeTab === 'calendar'}
          colors={colors}
          onPress={() => setActiveTab('calendar')}
        />
        <NavigationButton
          label="Clients"
          name="users"
          active={activeTab === 'clients'}
          colors={colors}
          onPress={() => setActiveTab('clients')}
        />
        <NavigationButton
          label="Notifications"
          name="bell"
          active={activeTab === 'notifications'}
          colors={colors}
          onPress={() => setActiveTab('notifications')}
        />
      </View>

      <InfoModal
        type={activeModal}
        colors={colors}
        savedAppointment={savedAppointment}
        onClose={() => setActiveModal(null)}
        onSave={() => setSavedAppointment((saved) => !saved)}
      />
    </View>
  );
}

function HomeContent({
  colors,
  onAppointmentPress,
  onBookmarkPress,
  savedAppointment,
  onViewAll,
}: {
  colors: ReturnType<typeof useColors>;
  onAppointmentPress: () => void;
  onBookmarkPress: () => void;
  savedAppointment: boolean;
  onViewAll: () => void;
}) {
  return (
    <>
      <View style={styles.greeting}>
        <Text style={[styles.greetingTitle, { color: colors.ink }]}>Morning</Text>
        <Text style={[styles.greetingName, { color: colors.ink }]}>Alexander</Text>
        <Text style={[styles.privacyCaption, { color: colors.softInk }]}>
          Remains private and protected.
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.metricsRow}
        snapToInterval={178}
        decelerationRate="fast"
      >
        <MetricCard
          title="Success"
          value="56%"
          variant="success"
          colors={colors}
          accessibilityLabel="Success rate, 56 percent"
        />
        <MetricCard
          title="Clients"
          value="286"
          variant="clients"
          colors={colors}
          accessibilityLabel="286 clients"
        />
      </ScrollView>

      <View style={styles.sectionHeading}>
        <Text style={[styles.sectionTitle, { color: colors.ink }]}>Appointment</Text>
        <Pressable
          accessibilityRole="button"
          testID="view-all-appointments"
          onPress={onViewAll}
          hitSlop={8}
        >
          <Text style={[styles.viewAll, { color: colors.quiet }]}>View all</Text>
        </Pressable>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Family Therapy tomorrow, 5:30 PM to 6:30 PM"
        testID="appointment-card"
        onPress={onAppointmentPress}
        style={({ pressed }) => [
          styles.appointmentCard,
          { borderColor: colors.line, backgroundColor: colors.background },
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.appointmentTop}>
          <View style={[styles.appointmentIcon, { backgroundColor: colors.paleBlue }]}>
            <Ionicons name="document-text" size={19} color={colors.aquaDeep} />
          </View>
          <View style={styles.appointmentText}>
            <Text style={[styles.appointmentName, { color: colors.ink }]}>
              Family Therapy
            </Text>
            <Text style={[styles.appointmentDate, { color: colors.quiet }]}>
              Tomorrow
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={savedAppointment ? 'Remove saved appointment' : 'Save appointment'}
            testID="save-appointment"
            onPress={(event) => {
              event.stopPropagation();
              onBookmarkPress();
            }}
            hitSlop={10}
            style={styles.bookmarkButton}
          >
            <Ionicons
              name={savedAppointment ? 'bookmark' : 'bookmark-outline'}
              size={18}
              color={savedAppointment ? colors.primary : colors.quiet}
            />
          </Pressable>
        </View>
        <View style={styles.appointmentTags}>
          <View style={[styles.tag, { backgroundColor: colors.palePink }]}>
            <Text style={[styles.tagText, { color: colors.softInk }]}>
              5:30pm to 6:30pm
            </Text>
          </View>
          <View style={[styles.tag, { backgroundColor: colors.palePink }]}>
            <Text style={[styles.tagText, { color: colors.softInk }]}>
              $100 / dollar
            </Text>
          </View>
        </View>
      </Pressable>
    </>
  );
}

function MetricCard({
  title,
  value,
  variant,
  colors,
  accessibilityLabel,
}: {
  title: string;
  value: string;
  variant: 'success' | 'clients';
  colors: ReturnType<typeof useColors>;
  accessibilityLabel: string;
}) {
  const gradient =
    variant === 'success'
      ? ([colors.lavenderStart, colors.lavenderEnd] as const)
      : ([colors.coralStart, colors.coralEnd] as const);

  return (
    <LinearGradient
      accessible
      accessibilityLabel={accessibilityLabel}
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.metricCard}
    >
      <View style={styles.metricHeading}>
        <Text style={[styles.metricLabel, { color: colors.primaryForeground }]}>
          {title}
        </Text>
        <Feather name="more-horizontal" size={17} color={colors.softWhite} />
      </View>
      <Text style={[styles.metricValue, { color: colors.primaryForeground }]}>
        {value}
      </Text>
      <MetricArtwork variant={variant} colors={colors} />
    </LinearGradient>
  );
}

function MetricArtwork({
  variant,
  colors,
}: {
  variant: 'success' | 'clients';
  colors: ReturnType<typeof useColors>;
}) {
  if (variant === 'success') {
    return (
      <Svg width={124} height={68} viewBox="0 0 124 68" style={styles.artwork}>
        <Path
          d="M6 67C19 49 28 30 46 17c7-5 14-7 21-5-11 15-15 31-15 55H6Z"
          fill={colors.aqua}
        />
        <Path
          d="M20 67c10-17 23-31 41-42 8-5 17-8 28-8-11 12-18 29-21 50H20Z"
          fill={colors.aquaDeep}
        />
        <Path
          d="M48 67c9-22 23-37 45-48 7-3 14-5 22-5-13 14-21 31-23 53H48Z"
          fill={colors.peach}
          opacity={0.84}
        />
        <Circle cx={91} cy={13} r={5} fill={colors.whiteGlow} />
      </Svg>
    );
  }

  return (
    <Svg width={128} height={72} viewBox="0 0 128 72" style={styles.artwork}>
      {variant === 'clients' ? (
        <>
          <Rect
            x={15}
            y={29}
            width={31}
            height={54}
            rx={15}
            fill={colors.yellow}
            transform="rotate(-24 15 29)"
          />
          <Rect
            x={47}
            y={17}
            width={28}
            height={57}
            rx={14}
            fill={colors.peach}
            transform="rotate(-8 47 17)"
          />
          <Ellipse
            cx={92}
            cy={49}
            rx={20}
            ry={12}
            fill={colors.yellow}
            transform="rotate(-25 92 49)"
          />
          <Ellipse
            cx={110}
            cy={62}
            rx={19}
            ry={11}
            fill={colors.peach}
            transform="rotate(-34 110 62)"
          />
        </>
      ) : (
        <>
          <Circle cx={86} cy={52} r={32} fill={colors.whiteGlow} />
          <Circle cx={104} cy={34} r={19} fill={colors.softWhite} />
          <Path
            d="M49 68c9-16 22-25 39-28 10-2 20-1 30 4"
            fill="none"
            stroke={colors.primaryForeground}
            strokeWidth={3}
            strokeLinecap="round"
          />
        </>
      )}
    </Svg>
  );
}

function TabContent({
  tab,
  colors,
  onAppointmentPress,
}: {
  tab: Exclude<DashboardTab, 'home'>;
  colors: ReturnType<typeof useColors>;
  onAppointmentPress: () => void;
}) {
  if (tab === 'calendar') {
    return (
      <View style={styles.secondaryContent}>
        <Text style={[styles.pageTitle, { color: colors.ink }]}>Appointments</Text>
        <Text style={[styles.pageSubtitle, { color: colors.softInk }]}>
          Your upcoming session
        </Text>
        <Pressable
          onPress={onAppointmentPress}
          accessibilityRole="button"
          testID="calendar-appointment"
          style={({ pressed }) => [
            styles.appointmentCard,
            { borderColor: colors.line, backgroundColor: colors.background },
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.appointmentTop}>
            <View style={[styles.appointmentIcon, { backgroundColor: colors.paleBlue }]}>
              <Ionicons name="document-text" size={19} color={colors.aquaDeep} />
            </View>
            <View style={styles.appointmentText}>
              <Text style={[styles.appointmentName, { color: colors.ink }]}>
                Family Therapy
              </Text>
              <Text style={[styles.appointmentDate, { color: colors.quiet }]}>
                Tomorrow
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.quiet} />
          </View>
          <View style={styles.appointmentTags}>
            <View style={[styles.tag, { backgroundColor: colors.palePink }]}>
              <Text style={[styles.tagText, { color: colors.softInk }]}>
                5:30pm to 6:30pm
              </Text>
            </View>
            <View style={[styles.tag, { backgroundColor: colors.palePink }]}>
              <Text style={[styles.tagText, { color: colors.softInk }]}>
                $100 / dollar
              </Text>
            </View>
          </View>
        </Pressable>
      </View>
    );
  }

  if (tab === 'clients') {
    return (
      <View style={styles.secondaryContent}>
        <Text style={[styles.pageTitle, { color: colors.ink }]}>Clients</Text>
        <Text style={[styles.pageSubtitle, { color: colors.softInk }]}>
          A clear view of your practice
        </Text>
        <LinearGradient
          colors={[colors.lavenderStart, colors.lavenderEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.clientSummary}
        >
          <Feather name="users" size={20} color={colors.softWhite} />
          <Text style={[styles.clientCount, { color: colors.primaryForeground }]}>
            286
          </Text>
          <Text style={[styles.clientLabel, { color: colors.softWhite }]}>
            Clients
          </Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.secondaryContent}>
      <Text style={[styles.pageTitle, { color: colors.ink }]}>Notifications</Text>
      <View
        style={[
          styles.emptyNotice,
          { backgroundColor: colors.card, borderColor: colors.line },
        ]}
      >
        <View style={[styles.emptyIcon, { backgroundColor: colors.paleLavender }]}>
          <Feather name="bell" size={19} color={colors.lavenderEnd} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.ink }]}>
          You’re all caught up
        </Text>
        <Text style={[styles.emptyCopy, { color: colors.softInk }]}>
          New updates will appear here.
        </Text>
      </View>
    </View>
  );
}

function NavigationButton({
  label,
  name,
  active,
  colors,
  onPress,
}: {
  label: string;
  name: 'home' | 'calendar' | 'users' | 'bell';
  active: boolean;
  colors: ReturnType<typeof useColors>;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      testID={`tab-${name}`}
      onPress={onPress}
      style={({ pressed }) => [styles.navButton, pressed && styles.pressed]}
    >
      <Feather
        name={name}
        size={19}
        color={active ? colors.lavenderEnd : colors.quiet}
      />
      {active ? (
        <View style={[styles.activeDot, { backgroundColor: colors.lavenderEnd }]} />
      ) : null}
    </Pressable>
  );
}

function InfoModal({
  type,
  colors,
  savedAppointment,
  onClose,
  onSave,
}: {
  type: ModalType;
  colors: ReturnType<typeof useColors>;
  savedAppointment: boolean;
  onClose: () => void;
  onSave: () => void;
}) {
  if (!type) return null;

  const isAppointment = type === 'appointment';
  const isProfile = type === 'profile';

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable
        style={[styles.modalScrim, { backgroundColor: colors.modalScrim }]}
        onPress={onClose}
      >
        <Pressable
          onPress={(event) => event.stopPropagation()}
          style={[
            styles.modalCard,
            { backgroundColor: colors.background, borderColor: colors.line },
          ]}
        >
          <View style={styles.modalTop}>
            <View style={{ flex: 1 }} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              testID="close-modal"
              onPress={onClose}
              style={({ pressed }) => [
                styles.closeButton,
                { backgroundColor: colors.card },
                pressed && styles.pressed,
              ]}
            >
              <Feather name="x" size={18} color={colors.ink} />
            </Pressable>
          </View>

          {isAppointment ? (
            <>
              <View style={[styles.modalHeroIcon, { backgroundColor: colors.paleBlue }]}>
                <Ionicons name="document-text" size={23} color={colors.aquaDeep} />
              </View>
              <Text style={[styles.modalTitle, { color: colors.ink }]}>
                Family Therapy
              </Text>
              <Text style={[styles.modalCopy, { color: colors.softInk }]}>
                Tomorrow · 5:30pm to 6:30pm
              </Text>
              <Text style={[styles.modalPrice, { color: colors.ink }]}>
                $100 / dollar
              </Text>
              <Pressable
                accessibilityRole="button"
                testID="modal-save-appointment"
                onPress={onSave}
                style={({ pressed }) => [
                  styles.primaryAction,
                  { backgroundColor: colors.lavenderEnd },
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name={savedAppointment ? 'bookmark' : 'bookmark-outline'}
                  size={16}
                  color={colors.primaryForeground}
                />
                <Text style={styles.primaryActionText}>
                  {savedAppointment ? 'Saved' : 'Save appointment'}
                </Text>
              </Pressable>
            </>
          ) : isProfile ? (
            <>
              <Image
                source={profileImage}
                style={[
                  styles.modalAvatar,
                  { backgroundColor: colors.profilePlaceholder },
                ]}
                contentFit="cover"
              />
              <Text style={[styles.modalTitle, { color: colors.ink }]}>Alexander</Text>
              <Text style={[styles.modalCopy, { color: colors.softInk }]}>
                Your profile and practice details
              </Text>
              <View style={[styles.modalNote, { backgroundColor: colors.paleBlue }]}>
                <Feather name="shield" size={16} color={colors.aquaDeep} />
                <Text style={[styles.modalNoteText, { color: colors.ink }]}>
                  Your information remains private.
                </Text>
              </View>
            </>
          ) : (
            <>
              <View style={[styles.modalHeroIcon, { backgroundColor: colors.paleBlue }]}>
                <Feather name="shield" size={22} color={colors.aquaDeep} />
              </View>
              <Text style={[styles.modalTitle, { color: colors.ink }]}>
                Private and protected
              </Text>
              <Text style={[styles.modalCopy, { color: colors.softInk }]}>
                Your practice information stays confidential.
              </Text>
              <View style={[styles.modalNote, { backgroundColor: colors.paleLavender }]}>
                <Feather name="lock" size={16} color={colors.lavenderEnd} />
                <Text style={[styles.modalNoteText, { color: colors.ink }]}>
                  Only you can access this dashboard.
                </Text>
              </View>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 23,
  },
  topBar: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuButton: {
    width: 42,
    height: 42,
    borderWidth: 1,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 39,
    height: 39,
    borderRadius: 20,
  },
  onlineDot: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
  },
  greeting: {
    marginTop: 18,
  },
  greetingTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 25,
    lineHeight: 30,
    letterSpacing: -0.7,
  },
  greetingName: {
    fontFamily: 'Inter_500Medium',
    fontSize: 21,
    lineHeight: 27,
    letterSpacing: -0.4,
  },
  privacyCaption: {
    marginTop: 4,
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    lineHeight: 16,
  },
  metricsRow: {
    gap: 12,
    paddingTop: 21,
    paddingBottom: 2,
    paddingRight: 4,
  },
  metricCard: {
    width: 166,
    height: 145,
    borderRadius: 21,
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingTop: 13,
  },
  metricHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    lineHeight: 16,
  },
  metricValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 26,
    lineHeight: 32,
    marginTop: 1,
    letterSpacing: -0.7,
  },
  artwork: {
    position: 'absolute',
    right: -2,
    bottom: -2,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 21,
    marginBottom: 13,
  },
  sectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  viewAll: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    lineHeight: 16,
  },
  appointmentCard: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 13,
    paddingTop: 14,
    paddingBottom: 12,
  },
  appointmentTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appointmentIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appointmentText: {
    flex: 1,
    marginLeft: 10,
  },
  appointmentName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    lineHeight: 17,
  },
  appointmentDate: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 1,
  },
  bookmarkButton: {
    width: 31,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appointmentTags: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 11,
    paddingLeft: 3,
  },
  tag: {
    minHeight: 25,
    borderRadius: 13,
    paddingHorizontal: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 9,
    lineHeight: 13,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 64,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    paddingTop: 12,
  },
  navButton: {
    width: 54,
    height: 37,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    bottom: 1,
  },
  pressed: {
    opacity: 0.76,
  },
  secondaryContent: {
    paddingTop: 34,
  },
  pageTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 26,
    lineHeight: 34,
    letterSpacing: -0.7,
  },
  pageSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
    marginBottom: 22,
  },
  clientSummary: {
    minHeight: 178,
    borderRadius: 22,
    overflow: 'hidden',
    padding: 18,
  },
  clientCount: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 38,
    lineHeight: 48,
    marginTop: 12,
  },
  clientLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
  emptyNotice: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 31,
    paddingHorizontal: 22,
    alignItems: 'center',
    marginTop: 18,
  },
  emptyIcon: {
    width: 47,
    height: 47,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    lineHeight: 21,
    marginTop: 13,
  },
  emptyCopy: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 3,
  },
  modalScrim: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    paddingHorizontal: 13,
    paddingBottom: 14,
  },
  modalCard: {
    borderWidth: 1,
    borderRadius: 26,
    padding: 20,
    paddingBottom: 24,
    alignItems: 'center',
  },
  modalTop: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeroIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },
  modalAvatar: {
    width: 66,
    height: 66,
    borderRadius: 33,
    marginBottom: 12,
  },
  modalTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 19,
    lineHeight: 26,
    textAlign: 'center',
  },
  modalCopy: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 5,
  },
  modalPrice: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 16,
  },
  primaryAction: {
    minHeight: 46,
    width: '100%',
    borderRadius: 15,
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryActionText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
  modalNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderRadius: 13,
    paddingVertical: 11,
    paddingHorizontal: 13,
    marginTop: 19,
    width: '100%',
  },
  modalNoteText: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    lineHeight: 16,
  },
});
