import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Path, SvgXml } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGetCourses, type Course as ApiCourse } from '@stem-smartstudy/api-client-react';
import { useColors } from '@/hooks/useColors';
import { officialLogoXml } from '@/constants/officialLogo';

type TabKey = 'home' | 'courses' | 'quiz' | 'insights';
type CourseName = string;
type Course = ApiCourse & { icon: IoniconName };
type Confidence = 'low' | 'medium' | 'high';
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const courseIcons: Record<string, IoniconName> = {
  'elementary-principles-of-electricity': 'flash-outline',
  programming: 'code-slash-outline',
  'operating-systems': 'hardware-chip-outline',
};

const sampleQuestion = {
  prompt: 'Course questions will appear here once content is available.',
  options: [] as { key: string; text: string }[],
};

export default function SmartStudyDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const coursesQuery = useGetCourses({ query: { retry: 1 } });
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [selectedCourse, setSelectedCourse] =
    useState<CourseName>('Elementary Principles of Electricity');
  const [questionCount, setQuestionCount] = useState(10);
  const [quizStage, setQuizStage] = useState<'setup' | 'question' | 'submitted'>(
    'setup',
  );
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<Confidence | null>(null);
  const [sampleNotice, setSampleNotice] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);

  const topInset =
    Platform.OS === 'web' ? Math.max(67, insets.top) : insets.top;
  const bottomInset =
    Platform.OS === 'web' ? Math.max(34, insets.bottom) : insets.bottom;

  const courses: Course[] = (coursesQuery.data?.courses ?? []).map((course) => ({
    ...course,
    icon: courseIcons[course.id] ?? 'book-outline',
  }));

  const startQuiz = () => {
    setSampleNotice(
      `${selectedCourse} is the active course. Diagnostic questions will be added after its training content is prepared.`,
    );
  };

  const openQuizSetup = () => {
    setQuizStage('setup');
    setSelectedOption(null);
    setConfidence(null);
    setSampleNotice('');
    setActiveTab('quiz');
  };

  if (coursesQuery.isPending) {
    return (
      <View
        style={[
          styles.screen,
          styles.catalogMessage,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator color={colors.primary} />
        <Text style={[styles.catalogMessageText, { color: colors.softInk }]}>
          Loading your course catalog…
        </Text>
      </View>
    );
  }

  if (coursesQuery.isError) {
    return (
      <View
        style={[
          styles.screen,
          styles.catalogMessage,
          { backgroundColor: colors.background },
        ]}
      >
        <Text style={[styles.catalogErrorTitle, { color: colors.ink }]}>
          The course catalog is unavailable.
        </Text>
        <Text style={[styles.catalogMessageText, { color: colors.softInk }]}>
          Check your connection and try again.
        </Text>
        <Pressable
          accessibilityRole="button"
          testID="retry-course-catalog"
          onPress={() => void coursesQuery.refetch()}
          style={({ pressed }) => [
            styles.retryButton,
            { backgroundColor: colors.primary },
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.primaryButtonText, { color: colors.white }]}>
            Try again
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: topInset + 8, paddingBottom: 96 + bottomInset },
        ]}
      >
        <View style={styles.header}>
          <View
            style={styles.brand}
            accessible
            accessibilityRole="image"
            accessibilityLabel="Official STEM SmartStudy logo"
          >
            <SvgXml xml={officialLogoXml} width={139} height={44} />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open student profile"
            testID="open-student-profile"
            onPress={() => setProfileOpen(true)}
            style={({ pressed }) => [
              styles.profileButton,
              { backgroundColor: colors.paleBlue },
              pressed && styles.pressed,
            ]}
          >
            <ProfileGlyph size={22} color={colors.primary} />
          </Pressable>
        </View>

        {activeTab === 'home' ? (
          <HomeScreen
            colors={colors}
            courses={courses}
            selectedCourse={selectedCourse}
            onSelectCourse={(course) => {
              if (courses.find((item) => item.name === course)?.isAvailable) {
                setSelectedCourse(course);
              }
            }}
            onOpenCourses={() => setActiveTab('courses')}
            onStartQuiz={openQuizSetup}
            onOpenInsights={() => setActiveTab('insights')}
          />
        ) : activeTab === 'courses' ? (
          <CoursesScreen
            colors={colors}
            courses={courses}
            selectedCourse={selectedCourse}
            onSelectCourse={(course) => {
              if (courses.find((item) => item.name === course)?.isAvailable) {
                setSelectedCourse(course);
              }
            }}
          />
        ) : activeTab === 'quiz' ? (
          <QuizScreen
            colors={colors}
            courses={courses.filter((course) => course.isAvailable)}
            selectedCourse={selectedCourse}
            onSelectCourse={(course) => {
              setSelectedCourse(course);
              setSampleNotice('');
            }}
            questionCount={questionCount}
            onQuestionCount={setQuestionCount}
            stage={quizStage}
            selectedOption={selectedOption}
            onSelectOption={setSelectedOption}
            confidence={confidence}
            onConfidence={setConfidence}
            sampleNotice={sampleNotice}
            onStart={startQuiz}
            onSubmit={() => setQuizStage('submitted')}
            onReset={() => {
              setQuizStage('setup');
              setSelectedOption(null);
              setConfidence(null);
            }}
          />
        ) : (
          <InsightsScreen
            colors={colors}
            courses={courses}
            selectedCourse={selectedCourse}
            onStartQuiz={openQuizSetup}
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
          icon="home-custom"
          active={activeTab === 'home'}
          colors={colors}
          onPress={() => setActiveTab('home')}
        />
        <NavigationButton
          label="Courses"
          icon="course-book-custom"
          active={activeTab === 'courses'}
          colors={colors}
          onPress={() => setActiveTab('courses')}
        />
        <NavigationButton
          label="Quiz"
          icon="quiz-custom"
          active={activeTab === 'quiz'}
          colors={colors}
          onPress={openQuizSetup}
        />
        <NavigationButton
          label="Insights"
          icon="insights-custom"
          active={activeTab === 'insights'}
          colors={colors}
          onPress={() => setActiveTab('insights')}
        />
      </View>

      <ProfileModal
        visible={profileOpen}
        colors={colors}
        onClose={() => setProfileOpen(false)}
      />
    </View>
  );
}

function HomeScreen({
  colors,
  courses,
  selectedCourse,
  onSelectCourse,
  onOpenCourses,
  onStartQuiz,
  onOpenInsights,
}: {
  colors: ReturnType<typeof useColors>;
  courses: Course[];
  selectedCourse: CourseName;
  onSelectCourse: (course: CourseName) => void;
  onOpenCourses: () => void;
  onStartQuiz: () => void;
  onOpenInsights: () => void;
}) {
  return (
    <View style={styles.page}>
      <View style={styles.welcome}>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>
          YOUR STUDY DASHBOARD
        </Text>
        <Text style={[styles.title, { color: colors.ink }]}>
          Find what to focus on.
        </Text>
        <Text style={[styles.subtitle, { color: colors.softInk }]}>
          Turn quiz responses into a clearer plan for your STEM studies.
        </Text>
      </View>

      <LinearGradient
        colors={[colors.heroStart, colors.heroEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <View
          style={[styles.heroOrbitOne, { backgroundColor: colors.heroOverlay }]}
        />
        <View
          style={[styles.heroOrbitTwo, { backgroundColor: colors.heroOverlaySoft }]}
        />
        <View
          style={[styles.heroIcon, { backgroundColor: colors.heroOverlay }]}
        >
          <Ionicons name="bulb-outline" size={35} color={colors.heroAccent} />
        </View>
        <Text style={[styles.heroEyebrow, { color: colors.heroSoft }]}>
          START WITH A DIAGNOSTIC
        </Text>
        <Text style={[styles.heroTitle, { color: colors.white }]}>
          Study with a plan.
        </Text>
        <Text style={[styles.heroCopy, { color: colors.heroSoft }]}>
          A short quiz helps identify topics that need more practice.
        </Text>
        <Pressable
          accessibilityRole="button"
          testID="home-start-diagnostic"
          onPress={onStartQuiz}
          style={({ pressed }) => [
            styles.heroAction,
            { backgroundColor: colors.white },
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.heroActionText, { color: colors.deep }]}>
            Start a diagnostic
          </Text>
          <Ionicons name="arrow-forward" size={17} color={colors.deep} />
        </Pressable>
      </LinearGradient>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={[styles.sectionTitle, { color: colors.ink }]}>
            Your courses
          </Text>
          <Text style={[styles.sectionSubtext, { color: colors.softInk }]}>
            Choose a subject for your next quiz
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          testID="home-view-courses"
          onPress={onOpenCourses}
          hitSlop={8}
        >
          <Text style={[styles.linkText, { color: colors.primary }]}>
            See all
          </Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.courseRail}
      >
        {courses.slice(0, 4).map((course) => (
          <CourseChip
            key={course.name}
            course={course}
            selected={course.name === selectedCourse}
            colors={colors}
            onPress={() => onSelectCourse(course.name)}
          />
        ))}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={[styles.sectionTitle, { color: colors.ink }]}>
            Topic difficulty
          </Text>
          <Text style={[styles.sectionSubtext, { color: colors.softInk }]}>
            Understand which topics need attention
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          testID="home-view-insights"
          onPress={onOpenInsights}
          hitSlop={8}
        >
          <Text style={[styles.linkText, { color: colors.primary }]}>
            Details
          </Text>
        </Pressable>
      </View>

      <DifficultyExample
        colors={colors}
        courses={courses}
        courseName={selectedCourse}
      />

      <View
        style={[
          styles.recommendationCard,
          { borderColor: colors.line, backgroundColor: colors.card },
        ]}
      >
        <View style={[styles.recommendationIcon, { backgroundColor: colors.paleTeal }]}>
          <Ionicons name="sparkles-outline" size={19} color={colors.teal} />
        </View>
        <View style={styles.recommendationBody}>
          <Text style={[styles.recommendationTitle, { color: colors.ink }]}>
            Personalized recommendations
          </Text>
          <Text style={[styles.recommendationText, { color: colors.softInk }]}>
            Take a diagnostic quiz to get study suggestions based on your answers.
          </Text>
          <Pressable
            accessibilityRole="button"
            testID="home-get-recommendations"
            onPress={onStartQuiz}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <Text style={[styles.linkText, styles.inlineAction, { color: colors.teal }]}>
              Find your next topic
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function CoursesScreen({
  colors,
  courses,
  selectedCourse,
  onSelectCourse,
}: {
  colors: ReturnType<typeof useColors>;
  courses: Course[];
  selectedCourse: CourseName;
  onSelectCourse: (course: CourseName) => void;
}) {
  return (
    <View style={styles.page}>
      <View style={styles.pageHeading}>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>
          COURSE CATALOG
        </Text>
        <Text style={[styles.title, { color: colors.ink }]}>Explore STEM</Text>
        <Text style={[styles.subtitle, { color: colors.softInk }]}>
          Select a course to focus your diagnostic and topic analysis.
        </Text>
      </View>

      <View style={[styles.previewNotice, { backgroundColor: colors.paleAmber }]}>
        <Ionicons name="information-circle-outline" size={17} color={colors.amberInk} />
        <Text style={[styles.previewNoticeText, { color: colors.amberInk }]}>
          Elementary Principles of Electricity is available. Other courses are coming soon.
        </Text>
      </View>

      <View style={styles.courseGrid}>
        {courses.map((course, index) => (
          <CourseCard
            key={course.name}
            course={course}
            selected={selectedCourse === course.name}
            colors={colors}
            accentIndex={index}
            onPress={() => onSelectCourse(course.name)}
          />
        ))}
      </View>

      <View
        style={[
          styles.topicsCard,
          { backgroundColor: colors.card, borderColor: colors.line },
        ]}
      >
        <View style={styles.topicsHeading}>
          <View style={[styles.smallIconBox, { backgroundColor: colors.paleBlue }]}>
            <Ionicons name="list-outline" size={17} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.topicsTitle, { color: colors.ink }]}>
              {selectedCourse} topics
            </Text>
            <Text style={[styles.sectionSubtext, { color: colors.softInk }]}>
              Topics are provided by each course
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.quiet} />
        </View>
        <Text style={[styles.topicPlaceholder, { color: colors.softInk }]}>
          Course topics will appear here when they are available.
        </Text>
      </View>
    </View>
  );
}

function QuizScreen({
  colors,
  courses,
  selectedCourse,
  onSelectCourse,
  questionCount,
  onQuestionCount,
  stage,
  selectedOption,
  onSelectOption,
  confidence,
  onConfidence,
  sampleNotice,
  onStart,
  onSubmit,
  onReset,
}: {
  colors: ReturnType<typeof useColors>;
  courses: Course[];
  selectedCourse: CourseName;
  onSelectCourse: (course: CourseName) => void;
  questionCount: number;
  onQuestionCount: (count: number) => void;
  stage: 'setup' | 'question' | 'submitted';
  selectedOption: string | null;
  onSelectOption: (key: string) => void;
  confidence: Confidence | null;
  onConfidence: (value: Confidence) => void;
  sampleNotice: string;
  onStart: () => void;
  onSubmit: () => void;
  onReset: () => void;
}) {
  return (
    <View style={styles.page}>
      <View style={styles.pageHeading}>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>
          QUIZ ATTEMPTS
        </Text>
        <Text style={[styles.title, { color: colors.ink }]}>
          {stage === 'setup'
            ? 'Check your understanding.'
            : stage === 'question'
              ? 'Question 1'
              : 'Response preview'}
        </Text>
        <Text style={[styles.subtitle, { color: colors.softInk }]}>
          {stage === 'setup'
            ? 'Your answers, time and confidence help surface difficult topics.'
            : stage === 'question'
              ? 'Choose one answer, then rate how confident you feel.'
              : 'This sample flow does not send or save an answer.'}
        </Text>
      </View>

      {stage === 'setup' ? (
        <View
          style={[
            styles.quizSetupCard,
            { backgroundColor: colors.card, borderColor: colors.line },
          ]}
        >
          <View style={styles.setupTitleRow}>
            <View style={[styles.largeIconBox, { backgroundColor: colors.paleBlue }]}>
              <Ionicons name="clipboard-outline" size={21} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.topicsTitle, { color: colors.ink }]}>
                Diagnostic setup
              </Text>
              <Text style={[styles.sectionSubtext, { color: colors.softInk }]}>
                Select a course and topics
              </Text>
            </View>
          </View>

          <Text style={[styles.formLabel, { color: colors.ink }]}>Course</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.courseRail}
          >
            {courses.map((course) => (
              <CourseChip
                key={course.name}
                course={course}
                selected={course.name === selectedCourse}
                colors={colors}
                onPress={() => onSelectCourse(course.name)}
              />
            ))}
          </ScrollView>

          <Text style={[styles.formLabel, { color: colors.ink }]}>Topics</Text>
          <View style={styles.topicTags}>
          <Text style={[styles.topicPlaceholder, { color: colors.softInk }]}>
            Topics will appear once course content is available.
          </Text>
          </View>

          <Text style={[styles.formLabel, { color: colors.ink }]}>
            Number of questions
          </Text>
          <View style={styles.countOptions}>
            {[5, 10, 20].map((count) => (
              <Pressable
                key={count}
                accessibilityRole="button"
                accessibilityState={{ selected: questionCount === count }}
                testID={`question-count-${count}`}
                onPress={() => onQuestionCount(count)}
                style={[
                  styles.countOption,
                  {
                    backgroundColor:
                      questionCount === count ? colors.deep : colors.secondary,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.countText,
                    {
                      color:
                        questionCount === count ? colors.white : colors.softInk,
                    },
                  ]}
                >
                  {count}
                </Text>
              </Pressable>
            ))}
          </View>

          {sampleNotice ? (
            <Text style={[styles.inlineNotice, { color: colors.amberInk }]}>
              {sampleNotice}
            </Text>
          ) : null}

          <Pressable
            accessibilityRole="button"
            testID="start-quiz-preview"
            onPress={onStart}
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: colors.primary },
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="play" size={16} color={colors.white} />
            <Text style={[styles.primaryButtonText, { color: colors.white }]}>
              Check question availability
            </Text>
          </Pressable>
          <Text style={[styles.previewFootnote, { color: colors.quiet }]}>
            Preview only · answers are not saved to a server
          </Text>
        </View>
      ) : stage === 'question' ? (
        <View
          style={[
            styles.questionCard,
            { backgroundColor: colors.card, borderColor: colors.line },
          ]}
        >
          <View style={styles.questionMeta}>
            <View style={[styles.questionNumber, { backgroundColor: colors.paleBlue }]}>
              <Text style={[styles.questionNumberText, { color: colors.primary }]}>
                01
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.questionCourse, { color: colors.ink }]}>
                {selectedCourse} · Question preview
              </Text>
              <Text style={[styles.sectionSubtext, { color: colors.softInk }]}>
                Course questions are not configured yet.
              </Text>
            </View>
            <View style={[styles.sampleBadge, { backgroundColor: colors.paleAmber }]}>
              <Text style={[styles.sampleBadgeText, { color: colors.amberInk }]}>
                SAMPLE
              </Text>
            </View>
          </View>

          <Text style={[styles.questionPrompt, { color: colors.ink }]}>
            {sampleQuestion.prompt}
          </Text>

          <View style={styles.answerList}>
            {sampleQuestion.options.map((option) => {
              const selected = selectedOption === option.key;
              return (
                <Pressable
                  key={option.key}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  testID={`answer-${option.key.toLowerCase()}`}
                  onPress={() => onSelectOption(option.key)}
                  style={[
                    styles.answerOption,
                    {
                      backgroundColor: selected ? colors.paleBlue : colors.background,
                      borderColor: selected ? colors.primary : colors.line,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.answerKey,
                      {
                        backgroundColor: selected ? colors.primary : colors.secondary,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.answerKeyText,
                        { color: selected ? colors.white : colors.softInk },
                      ]}
                    >
                      {option.key}
                    </Text>
                  </View>
                  <Text style={[styles.answerText, { color: colors.ink }]}>
                    {option.text}
                  </Text>
                  {selected ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={colors.primary}
                    />
                  ) : null}
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.formLabel, { color: colors.ink }]}>
            How confident are you?
          </Text>
          <View style={styles.confidenceRow}>
            {(['low', 'medium', 'high'] as Confidence[]).map((level) => {
              const selected = confidence === level;
              return (
                <Pressable
                  key={level}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  testID={`confidence-${level}`}
                  onPress={() => onConfidence(level)}
                  style={[
                    styles.confidenceOption,
                    {
                      backgroundColor: selected ? colors.deep : colors.secondary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.confidenceText,
                      { color: selected ? colors.white : colors.softInk },
                    ]}
                  >
                    {level[0].toUpperCase() + level.slice(1)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            accessibilityRole="button"
            testID="submit-answer-preview"
            onPress={onSubmit}
            disabled={!selectedOption || !confidence}
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: colors.primary },
              (!selectedOption || !confidence) && styles.disabledButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.primaryButtonText, { color: colors.white }]}>
              Preview response
            </Text>
            <Ionicons name="arrow-forward" size={16} color={colors.white} />
          </Pressable>
        </View>
      ) : (
        <View
          style={[
            styles.submittedCard,
            { backgroundColor: colors.card, borderColor: colors.line },
          ]}
        >
          <View style={[styles.successIcon, { backgroundColor: colors.paleTeal }]}>
            <Ionicons name="checkmark" size={24} color={colors.teal} />
          </View>
          <Text style={[styles.submittedTitle, { color: colors.ink }]}>
            Preview response ready
          </Text>
          <Text style={[styles.submittedCopy, { color: colors.softInk }]}>
            Choice {selectedOption} · Confidence {confidence}
          </Text>
          <View style={[styles.responseNote, { backgroundColor: colors.paleBlue }]}>
            <Ionicons name="cloud-outline" size={17} color={colors.primary} />
            <Text style={[styles.responseNoteText, { color: colors.ink }]}>
              A connected API will record the response and determine correctness after submission.
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            testID="reset-quiz-preview"
            onPress={onReset}
            style={({ pressed }) => [
              styles.secondaryButton,
              { borderColor: colors.line },
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="refresh-outline" size={17} color={colors.primary} />
            <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
              Start another preview
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function InsightsScreen({
  colors,
  courses,
  selectedCourse,
  onStartQuiz,
}: {
  colors: ReturnType<typeof useColors>;
  courses: Course[];
  selectedCourse: CourseName;
  onStartQuiz: () => void;
}) {
  return (
    <View style={styles.page}>
      <View style={styles.pageHeading}>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>
          PERFORMANCE
        </Text>
        <Text style={[styles.title, { color: colors.ink }]}>
          Make sense of the hard parts.
        </Text>
        <Text style={[styles.subtitle, { color: colors.softInk }]}>
          Topic difficulty uses accuracy, response time and confidence.
        </Text>
      </View>

      <View
        style={[
          styles.insightCard,
          { backgroundColor: colors.card, borderColor: colors.line },
        ]}
      >
        <View style={styles.insightHeader}>
          <View style={[styles.largeIconBox, { backgroundColor: colors.paleBlue }]}>
            <Ionicons name="analytics-outline" size={21} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.topicsTitle, { color: colors.ink }]}>
              Topic difficulty
            </Text>
            <Text style={[styles.sectionSubtext, { color: colors.softInk }]}>
              Scores range from 0.00 to 1.00
            </Text>
          </View>
        </View>

        <DifficultyScale colors={colors} />
        <DifficultyExample
          colors={colors}
          courses={courses}
          courseName={selectedCourse}
          compact
        />
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={[styles.sectionTitle, { color: colors.ink }]}>
            Most missed questions
          </Text>
          <Text style={[styles.sectionSubtext, { color: colors.softInk }]}>
            Ranked from course response data
          </Text>
        </View>
        <View style={[styles.smallIconBox, { backgroundColor: colors.paleCoral }]}>
          <Ionicons name="alert-circle-outline" size={17} color={colors.coral} />
        </View>
      </View>
      <View
        style={[
          styles.emptyCard,
          { backgroundColor: colors.card, borderColor: colors.line },
        ]}
      >
        <Ionicons name="bar-chart-outline" size={20} color={colors.quiet} />
        <Text style={[styles.emptyTitle, { color: colors.ink }]}>
          Course analytics will appear here
        </Text>
        <Text style={[styles.emptyCopy, { color: colors.softInk }]}>
          Most-missed questions need response data from a course.
        </Text>
      </View>

      <View
        style={[
          styles.recommendationCard,
          { borderColor: colors.line, backgroundColor: colors.card },
        ]}
      >
        <View style={[styles.recommendationIcon, { backgroundColor: colors.paleTeal }]}>
          <Ionicons name="sparkles-outline" size={19} color={colors.teal} />
        </View>
        <View style={styles.recommendationBody}>
          <Text style={[styles.recommendationTitle, { color: colors.ink }]}>
            Your recommendations
          </Text>
          <Text style={[styles.recommendationText, { color: colors.softInk }]}>
            Complete a diagnostic first. The API returns personal suggestions when results are available.
          </Text>
          <Pressable
            accessibilityRole="button"
            testID="insights-start-diagnostic"
            onPress={onStartQuiz}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <Text style={[styles.linkText, styles.inlineAction, { color: colors.teal }]}>
              Start a diagnostic
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function DifficultyExample({
  colors,
  courses,
  courseName,
  compact = false,
}: {
  colors: ReturnType<typeof useColors>;
  courses: Course[];
  courseName: CourseName;
  compact?: boolean;
}) {
  const courseIcon = courses.find((course) => course.name === courseName)?.icon;
  return (
    <View
      style={[
        styles.difficultyCard,
        compact && styles.difficultyCardCompact,
        { borderColor: colors.line, backgroundColor: colors.card },
      ]}
    >
      <View style={styles.difficultyTop}>
        <View style={styles.difficultyTopic}>
          <View style={[styles.topicIcon, { backgroundColor: colors.paleAmber }]}>
            <Ionicons
              name={courseIcon ?? 'book-outline'}
              size={17}
              color={colors.primary}
            />
          </View>
          <View>
            <Text style={[styles.difficultyName, { color: colors.ink }]}>
              Example topic
            </Text>
            <Text style={[styles.sectionSubtext, { color: colors.softInk }]}>
              {courseName}
            </Text>
          </View>
        </View>
        <View style={[styles.difficultBadge, { backgroundColor: colors.paleCoral }]}>
          <Text style={[styles.difficultBadgeText, { color: colors.coral }]}>
            Difficult
          </Text>
        </View>
      </View>
      <View style={styles.scoreRow}>
        <View style={[styles.scoreTrack, { backgroundColor: colors.secondary }]}>
          <View
            style={[
              styles.scoreFill,
              { backgroundColor: colors.amber, width: '78%' },
            ]}
          />
        </View>
        <Text style={[styles.scoreValue, { color: colors.ink }]}>0.78</Text>
      </View>
      <Text style={[styles.exampleCaption, { color: colors.quiet }]}>
        Contract example · not measured student data
      </Text>
    </View>
  );
}

function DifficultyScale({ colors }: { colors: ReturnType<typeof useColors> }) {
  const levels = [
    { name: 'Easy', range: '0.00–0.39', color: colors.teal, surface: colors.paleTeal },
    {
      name: 'Moderate',
      range: '0.40–0.69',
      color: colors.amberInk,
      surface: colors.paleAmber,
    },
    {
      name: 'Difficult',
      range: '0.70–1.00',
      color: colors.coral,
      surface: colors.paleCoral,
    },
  ];
  return (
    <View style={styles.scaleList}>
      {levels.map((level) => (
        <View
          key={level.name}
          style={[styles.scaleRow, { backgroundColor: level.surface }]}
        >
          <View style={[styles.scaleDot, { backgroundColor: level.color }]} />
          <Text style={[styles.scaleName, { color: colors.ink }]}>
            {level.name}
          </Text>
          <Text style={[styles.scaleRange, { color: level.color }]}>
            {level.range}
          </Text>
        </View>
      ))}
    </View>
  );
}

function CourseChip({
  course,
  selected,
  colors,
  onPress,
}: {
  course: Course;
  selected: boolean;
  colors: ReturnType<typeof useColors>;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled: !course.isAvailable }}
      accessibilityLabel={
        course.isAvailable
          ? `Select ${course.name}`
          : `${course.name}, coming soon`
      }
      testID={`course-chip-${course.name.toLowerCase().replaceAll(' ', '-')}`}
      onPress={onPress}
      disabled={!course.isAvailable}
      style={({ pressed }) => [
        styles.courseChip,
        {
          backgroundColor: selected ? colors.deep : colors.card,
          borderColor: selected ? colors.deep : colors.line,
          opacity: course.isAvailable ? 1 : 0.55,
        },
        pressed && styles.pressed,
      ]}
    >
      <Ionicons
        name={course.icon}
        size={16}
        color={selected ? colors.white : colors.primary}
      />
      <Text
        style={[
          styles.courseChipText,
          { color: selected ? colors.white : colors.ink },
        ]}
      >
        {course.name}
      </Text>
    </Pressable>
  );
}

function CourseCard({
  course,
  selected,
  colors,
  accentIndex,
  onPress,
}: {
  course: Course;
  selected: boolean;
  colors: ReturnType<typeof useColors>;
  accentIndex: number;
  onPress: () => void;
}) {
  const accentSurfaces = [
    colors.paleBlue,
    colors.paleTeal,
    colors.paleAmber,
    colors.paleCoral,
  ];
  const accentColors = [
    colors.primary,
    colors.teal,
    colors.amberInk,
    colors.coral,
  ];
  const colorIndex = accentIndex % accentSurfaces.length;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled: !course.isAvailable }}
      testID={`course-card-${course.name.toLowerCase().replaceAll(' ', '-')}`}
      onPress={onPress}
      disabled={!course.isAvailable}
      style={({ pressed }) => [
        styles.courseCard,
        {
          backgroundColor: colors.card,
          borderColor: selected ? colors.primary : colors.line,
          opacity: course.isAvailable ? 1 : 0.72,
        },
        pressed && styles.pressed,
      ]}
    >
      <View
        style={[
          styles.courseIcon,
          { backgroundColor: accentSurfaces[colorIndex] },
        ]}
      >
        <Ionicons
          name={course.icon}
          size={21}
          color={accentColors[colorIndex]}
        />
      </View>
      <Text style={[styles.courseName, { color: colors.ink }]}>
        {course.name}
      </Text>
      <Text style={[styles.courseMeta, { color: colors.softInk }]}>
        {course.isAvailable ? 'Available for study' : 'Coming soon'}
      </Text>
      <View style={styles.courseCardFooter}>
        <Text
          style={[
            styles.courseSelectedText,
            { color: selected ? colors.primary : colors.quiet },
          ]}
        >
          {selected
            ? 'Selected'
            : course.isAvailable
              ? 'Choose course'
              : 'Coming soon'}
        </Text>
        <Ionicons
          name={
            selected
              ? 'checkmark-circle'
              : course.isAvailable
                ? 'arrow-forward-circle-outline'
                : 'time-outline'
          }
          size={18}
          color={selected ? colors.primary : colors.quiet}
        />
      </View>
    </Pressable>
  );
}

function TopicTag({
  label,
  colors,
}: {
  label: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={[styles.topicTag, { backgroundColor: colors.paleBlue }]}>
      <Text style={[styles.topicChipText, { color: colors.primary }]}>
        {label}
      </Text>
    </View>
  );
}

function SelectableTopic({
  label,
  selected,
  colors,
  onPress,
}: {
  label: string;
  selected: boolean;
  colors: ReturnType<typeof useColors>;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      testID={`topic-${label.toLowerCase()}`}
      onPress={onPress}
      style={[
        styles.topicTag,
        {
          backgroundColor: selected ? colors.paleBlue : colors.secondary,
          borderColor: selected ? colors.primary : colors.line,
          borderWidth: 1,
        },
      ]}
    >
      <Text
        style={[
          styles.topicChipText,
          { color: selected ? colors.primary : colors.softInk },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function NavigationButton({
  label,
  icon,
  active,
  colors,
  onPress,
}: {
  label: string;
  icon:
    | IoniconName
    | 'home-custom'
    | 'course-book-custom'
    | 'quiz-custom'
    | 'insights-custom';
  active: boolean;
  colors: ReturnType<typeof useColors>;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      testID={`tab-${label.toLowerCase()}`}
      onPress={onPress}
      style={({ pressed }) => [styles.navButton, pressed && styles.pressed]}
    >
      {icon === 'home-custom' ? (
        <HomeGlyph
          size={22}
          color={active ? colors.primary : colors.quiet}
        />
      ) : icon === 'course-book-custom' ? (
        <CourseBookGlyph
          size={22}
          color={active ? colors.primary : colors.quiet}
        />
      ) : icon === 'quiz-custom' ? (
        <QuizGlyph size={22} color={active ? colors.primary : colors.quiet} />
      ) : icon === 'insights-custom' ? (
        <InsightsGlyph
          size={22}
          color={active ? colors.primary : colors.quiet}
        />
      ) : (
        <Ionicons
          name={icon}
          size={21}
          color={active ? colors.primary : colors.quiet}
        />
      )}
      <Text
        style={[
          styles.navLabel,
          { color: active ? colors.primary : colors.quiet },
        ]}
      >
        {label}
      </Text>
      {active ? (
        <View style={[styles.activeIndicator, { backgroundColor: colors.primary }]} />
      ) : null}
    </Pressable>
  );
}

function CourseBookGlyph({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <Path
        d="M11 3.99995C12.8839 2.91716 14.9355 2.15669 17.07 1.74995C17.551 1.63467 18.0523 1.63283 18.5341 1.74458C19.016 1.85632 19.4652 2.07852 19.8464 2.39375C20.2276 2.70897 20.5303 3.10856 20.7305 3.56086C20.9307 4.01316 21.0229 4.50585 21 4.99995V13.9999C20.9699 15.117 20.5666 16.1917 19.8542 17.0527C19.1419 17.9136 18.1617 18.5112 17.07 18.7499C14.9355 19.1567 12.8839 19.9172 11 20.9999"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10.9995 3.99995C9.1156 2.91716 7.06409 2.15669 4.92957 1.74995C4.44856 1.63467 3.94731 1.63283 3.46546 1.74458C2.98362 1.85632 2.53439 2.07852 2.15321 2.39375C1.77203 2.70897 1.46933 3.10856 1.26911 3.56086C1.0689 4.01316 0.976598 4.50585 0.999521 4.99995V13.9999C1.0296 15.117 1.433 16.1917 2.14533 17.0527C2.85767 17.9136 3.83793 18.5112 4.92957 18.7499C7.06409 19.1567 9.1156 19.9172 10.9995 20.9999"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M11 21V4"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function HomeGlyph({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 12.2039C2 9.91549 2 8.77128 2.5192 7.82274C3.0384 6.87421 3.98695 6.28551 5.88403 5.10813L7.88403 3.86687C9.88939 2.62229 10.8921 2 12 2C13.1079 2 14.1106 2.62229 16.116 3.86687L18.116 5.10812C20.0131 6.28551 20.9616 6.87421 21.4808 7.82274C22 8.77128 22 9.91549 22 12.2039V13.725C22 17.6258 22 19.5763 20.8284 20.7881C19.6569 22 17.7712 22 14 22H10C6.22876 22 4.34315 22 3.17157 20.7881C2 19.5763 2 17.6258 2 13.725V12.2039Z"
        stroke={color}
        strokeWidth={1.5}
      />
      <Path
        d="M9 16C9.85038 16.6303 10.8846 17 12 17C13.1154 17 14.1496 16.6303 15 16"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function QuizGlyph({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="1.75 1.75 20.5 20.5" fill="none">
      <Path
        d="M12.75 16.99C12.75 16.5758 12.4142 16.24 12 16.24C11.5858 16.24 11.25 16.5758 11.25 16.99H12.75ZM11.25 17C11.25 17.4142 11.5858 17.75 12 17.75C12.4142 17.75 12.75 17.4142 12.75 17H11.25ZM11.25 14C11.25 14.4142 11.5858 14.75 12 14.75C12.4142 14.75 12.75 14.4142 12.75 14H11.25ZM8.27587 8.98654C8.16802 9.38647 8.40479 9.7981 8.80472 9.90595C9.20465 10.0138 9.61628 9.77702 9.72413 9.3771L8.27587 8.98654ZM11.25 16.99V17H12.75V16.99H11.25ZM14.25 9.90909C14.25 10.5071 13.8779 10.8232 13.0775 11.369C12.4012 11.8301 11.25 12.5419 11.25 14H12.75C12.75 13.4581 13.0988 13.1699 13.9225 12.6083C14.6221 12.1313 15.75 11.402 15.75 9.90909H14.25ZM12 7.75C13.2867 7.75 14.25 8.73398 14.25 9.90909H15.75C15.75 7.87091 14.0801 6.25 12 6.25V7.75ZM9.72413 9.3771C9.96738 8.47508 10.8917 7.75 12 7.75V6.25C10.2678 6.25 8.70934 7.37913 8.27587 8.98654L9.72413 9.3771ZM8 4.75H16V3.25H8V4.75ZM19.25 8V16H20.75V8H19.25ZM16 19.25H8V20.75H16V19.25ZM4.75 16V8H3.25V16H4.75ZM8 19.25C6.20507 19.25 4.75 17.7949 4.75 16H3.25C3.25 18.6234 5.37665 20.75 8 20.75V19.25ZM19.25 16C19.25 17.7949 17.7949 19.25 16 19.25V20.75C18.6234 20.75 20.75 18.6234 20.75 16H19.25ZM16 4.75C17.7949 4.75 19.25 6.20507 19.25 8H20.75C20.75 5.37665 18.6234 3.25 16 3.25V4.75ZM8 3.25C5.37665 3.25 3.25 5.37665 3.25 8H4.75C4.75 6.20507 6.20507 4.75 8 4.75V3.25Z"
        fill={color}
      />
    </Svg>
  );
}

function InsightsGlyph({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="207.5 467.5 33 33" fill="none">
      <Path
        d="M235.9,471.449a3.524,3.524,0,0,0-2.594,5.925l-4.357,7.284a3.53,3.53,0,0,0-.877-.123,3.492,3.492,0,0,0-1.68.444l-3.372-3.372a3.488,3.488,0,0,0,.444-1.679,3.538,3.538,0,1,0-6.131,2.387l-4.358,7.284a3.477,3.477,0,0,0-.877-.123,3.568,3.568,0,1,0,2.594,1.15l4.357-7.284a3.53,3.53,0,0,0,.877.123,3.492,3.492,0,0,0,1.68-.444l3.372,3.372a3.488,3.488,0,0,0-.444,1.679,3.538,3.538,0,1,0,6.131-2.386l4.358-7.285a3.477,3.477,0,0,0,.877.123,3.537,3.537,0,1,0,0-7.075Zm-23.8,23.1a1.537,1.537,0,1,1,1.538-1.537A1.54,1.54,0,0,1,212.1,494.551Zm6.291-14.623a1.537,1.537,0,1,1,1.537,1.537A1.54,1.54,0,0,1,218.39,479.928Zm9.683,9.682a1.537,1.537,0,1,1,0-3.075,1.517,1.517,0,0,1,.777.219l.008.007.024.01a1.534,1.534,0,0,1-.809,2.839Zm7.828-13.086a1.517,1.517,0,0,1-.778-.219l-.007-.006-.014-.005a1.53,1.53,0,1,1,.8.23Z"
        fill={color}
      />
    </Svg>
  );
}

function ProfileGlyph({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12.12 12.78C12.05 12.77 11.96 12.77 11.88 12.78C10.12 12.72 8.71997 11.28 8.71997 9.50998C8.71997 7.69998 10.18 6.22998 12 6.22998C13.81 6.22998 15.28 7.69998 15.28 9.50998C15.27 11.28 13.88 12.72 12.12 12.78Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18.74 19.3801C16.96 21.0101 14.6 22.0001 12 22.0001C9.40001 22.0001 7.04001 21.0101 5.26001 19.3801C5.36001 18.4401 5.96001 17.5201 7.03001 16.8001C9.77001 14.9801 14.25 14.9801 16.97 16.8001C18.04 17.5201 18.64 18.4401 18.74 19.3801Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ProfileModal({
  visible,
  colors,
  onClose,
}: {
  visible: boolean;
  colors: ReturnType<typeof useColors>;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable
        style={[styles.modalScrim, { backgroundColor: colors.scrim }]}
        onPress={onClose}
      >
        <Pressable
          onPress={(event) => event.stopPropagation()}
          style={[
            styles.profileModal,
            { backgroundColor: colors.card, borderColor: colors.line },
          ]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close profile"
            testID="close-profile"
            onPress={onClose}
            style={({ pressed }) => [
              styles.modalClose,
              { backgroundColor: colors.secondary },
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="close" size={18} color={colors.primary} />
          </Pressable>
          <View style={[styles.profileAvatar, { backgroundColor: colors.paleBlue }]}>
            <ProfileGlyph size={30} color={colors.primary} />
          </View>
          <Text style={[styles.profileTitle, { color: colors.ink }]}>
            Study profile
          </Text>
          <Text style={[styles.profileCopy, { color: colors.softInk }]}>
            Your progress is stored locally on this device.
          </Text>
          <View style={[styles.roleBadge, { backgroundColor: colors.paleTeal }]}>
            <Ionicons name="school-outline" size={15} color={colors.teal} />
            <Text style={[styles.roleBadgeText, { color: colors.teal }]}>
              STUDENT
            </Text>
          </View>
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
    paddingHorizontal: 21,
  },
  header: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileButton: {
    width: 39,
    height: 39,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  page: {
    gap: 17,
  },
  welcome: {
    marginBottom: 2,
  },
  eyebrow: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    lineHeight: 14,
    letterSpacing: 1.1,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 27,
    lineHeight: 34,
    letterSpacing: -0.8,
    marginTop: 3,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
    maxWidth: 330,
  },
  heroCard: {
    borderRadius: 24,
    minHeight: 207,
    padding: 19,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  heroOrbitOne: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    top: -77,
    right: -27,
  },
  heroOrbitTwo: {
    position: 'absolute',
    width: 92,
    height: 92,
    borderRadius: 46,
    bottom: -43,
    right: 32,
  },
  heroIcon: {
    position: 'absolute',
    right: 20,
    top: 21,
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEyebrow: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    lineHeight: 14,
    letterSpacing: 0.9,
  },
  heroTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 21,
    lineHeight: 28,
    letterSpacing: -0.35,
    marginTop: 7,
  },
  heroCopy: {
    maxWidth: 228,
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 2,
  },
  heroAction: {
    minHeight: 39,
    alignSelf: 'flex-start',
    paddingHorizontal: 13,
    borderRadius: 13,
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heroActionText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  sectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.3,
  },
  sectionSubtext: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 2,
  },
  linkText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    lineHeight: 17,
  },
  inlineAction: {
    marginTop: 9,
  },
  courseRail: {
    gap: 8,
    paddingRight: 5,
  },
  courseChip: {
    borderWidth: 1,
    borderRadius: 14,
    minHeight: 38,
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  courseChipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
  },
  catalogMessage: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 12,
  },
  catalogMessageText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  catalogErrorTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    lineHeight: 25,
    textAlign: 'center',
  },
  retryButton: {
    minHeight: 44,
    minWidth: 130,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginTop: 4,
  },
  difficultyCard: {
    borderWidth: 1,
    borderRadius: 19,
    padding: 14,
  },
  difficultyCardCompact: {
    marginTop: 14,
    padding: 12,
  },
  difficultyTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyTopic: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  topicIcon: {
    width: 37,
    height: 37,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  difficultyName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    lineHeight: 17,
  },
  difficultBadge: {
    minHeight: 25,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  difficultBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 13,
  },
  scoreTrack: {
    flex: 1,
    height: 7,
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreFill: {
    height: '100%',
    borderRadius: 4,
  },
  scoreValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    width: 31,
    textAlign: 'right',
  },
  exampleCaption: {
    fontFamily: 'Inter_400Regular',
    fontSize: 9,
    lineHeight: 14,
    marginTop: 8,
  },
  recommendationCard: {
    borderWidth: 1,
    borderRadius: 19,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
  },
  recommendationIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommendationBody: {
    flex: 1,
    paddingTop: 1,
  },
  recommendationTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    lineHeight: 17,
  },
  recommendationText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },
  pageHeading: {
    marginBottom: 2,
  },
  previewNotice: {
    borderRadius: 13,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewNoticeText: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    lineHeight: 15,
  },
  courseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  courseCard: {
    width: '48%',
    minHeight: 142,
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
  },
  courseIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  courseName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 10,
  },
  courseMeta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 9,
    lineHeight: 14,
    marginTop: 2,
  },
  courseCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingTop: 9,
  },
  courseSelectedText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 9,
  },
  topicsCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 13,
  },
  topicsHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  smallIconBox: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicsTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    lineHeight: 17,
  },
  topicTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 7,
    marginTop: 12,
  },
  topicTag: {
    minHeight: 28,
    paddingHorizontal: 11,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicChipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
  },
  topicPlaceholder: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    lineHeight: 16,
    marginTop: 12,
  },
  quizSetupCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
  },
  setupTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 3,
  },
  largeIconBox: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 15,
    marginBottom: 8,
  },
  topicPlaceholderChip: {
    minHeight: 28,
    paddingHorizontal: 11,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  countOption: {
    width: 42,
    height: 35,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
  },
  inlineNotice: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 12,
  },
  primaryButton: {
    minHeight: 45,
    borderRadius: 14,
    marginTop: 17,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
  },
  disabledButton: {
    opacity: 0.45,
  },
  previewFootnote: {
    fontFamily: 'Inter_400Regular',
    fontSize: 9,
    lineHeight: 14,
    textAlign: 'center',
    marginTop: 9,
  },
  questionCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
  },
  questionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  questionNumber: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionNumberText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
  },
  questionCourse: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    lineHeight: 16,
  },
  sampleBadge: {
    paddingHorizontal: 8,
    minHeight: 22,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sampleBadgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 8,
    letterSpacing: 0.5,
  },
  questionPrompt: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    lineHeight: 23,
    marginTop: 18,
  },
  answerList: {
    gap: 8,
    marginTop: 14,
  },
  answerOption: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 13,
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  answerKey: {
    width: 26,
    height: 26,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  answerKeyText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
  },
  answerText: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
  },
  confidenceRow: {
    flexDirection: 'row',
    gap: 7,
  },
  confidenceOption: {
    flex: 1,
    minHeight: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confidenceText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
  },
  submittedCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  successIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submittedTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 17,
    lineHeight: 23,
    marginTop: 13,
    textAlign: 'center',
  },
  submittedCopy: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },
  responseNote: {
    width: '100%',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    marginTop: 18,
  },
  responseNoteText: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    lineHeight: 16,
  },
  secondaryButton: {
    minHeight: 43,
    width: '100%',
    borderWidth: 1,
    borderRadius: 13,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  secondaryButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
  },
  insightCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  scaleList: {
    gap: 7,
    marginTop: 14,
  },
  scaleRow: {
    minHeight: 36,
    borderRadius: 11,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scaleDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  scaleName: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
  },
  scaleRange: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
  },
  emptyCard: {
    minHeight: 124,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 9,
  },
  emptyCopy: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
    marginTop: 2,
  },
  navButton: {
    minWidth: 60,
    height: 49,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  navLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 8,
    lineHeight: 11,
  },
  activeIndicator: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    bottom: -2,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 58,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    paddingTop: 5,
  },
  modalScrim: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 13,
    paddingBottom: 14,
  },
  profileModal: {
    borderWidth: 1,
    borderRadius: 25,
    padding: 22,
    paddingBottom: 25,
    alignItems: 'center',
  },
  modalClose: {
    width: 33,
    height: 33,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  profileAvatar: {
    width: 62,
    height: 62,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  profileTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    lineHeight: 24,
    marginTop: 13,
  },
  profileCopy: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
    maxWidth: 270,
    marginTop: 4,
  },
  roleBadge: {
    minHeight: 29,
    paddingHorizontal: 11,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
  },
  roleBadgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    letterSpacing: 0.7,
  },
  signOutButton: {
    width: '100%',
    minHeight: 46,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 18,
  },
  signOutText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
  },
  pressed: {
    opacity: 0.76,
  },
});
