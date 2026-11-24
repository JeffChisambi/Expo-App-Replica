import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';

type TabKey = 'home' | 'courses' | 'quiz' | 'insights';
type CourseName =
  | 'Mathematics'
  | 'Physics'
  | 'Chemistry'
  | 'Biology'
  | 'Computer Science'
  | 'Engineering';
type Confidence = 'low' | 'medium' | 'high';
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const courses: { name: CourseName; icon: IoniconName }[] = [
  { name: 'Mathematics', icon: 'calculator-outline' },
  { name: 'Physics', icon: 'planet-outline' },
  { name: 'Chemistry', icon: 'flask-outline' },
  { name: 'Biology', icon: 'leaf-outline' },
  { name: 'Computer Science', icon: 'code-slash-outline' },
  { name: 'Engineering', icon: 'construct-outline' },
];

const sampleQuestion = {
  prompt: 'Which expression is equivalent to 2(x + 3)?',
  options: [
    { key: 'A', text: '2x + 3' },
    { key: 'B', text: '2x + 6' },
    { key: 'C', text: 'x + 6' },
    { key: 'D', text: '2x + 9' },
  ],
};

export default function SmartStudyDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [selectedCourse, setSelectedCourse] =
    useState<CourseName>('Mathematics');
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['Algebra']);
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

  const startQuiz = () => {
    if (selectedCourse !== 'Mathematics') {
      setSampleNotice(
        'The contract sample includes a Mathematics question. Other question sets load from the question bank.',
      );
      return;
    }
    setSampleNotice('');
    setSelectedOption(null);
    setConfidence(null);
    setQuizStage('question');
  };

  const openQuizSetup = () => {
    setQuizStage('setup');
    setSelectedOption(null);
    setConfidence(null);
    setSampleNotice('');
    setActiveTab('quiz');
  };

  const toggleTopic = (topic: string) => {
    setSelectedTopics((current) =>
      current.includes(topic)
        ? current.filter((item) => item !== topic)
        : [...current, topic],
    );
  };

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
          <View style={styles.brand}>
            <View style={[styles.brandIcon, { backgroundColor: colors.deep }]}>
              <Ionicons name="school-outline" size={20} color={colors.white} />
            </View>
            <View>
              <Text style={[styles.brandName, { color: colors.ink }]}>
                STEM SmartStudy
              </Text>
              <Text style={[styles.brandCaption, { color: colors.softInk }]}>
                Learn what matters next
              </Text>
            </View>
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
            <Ionicons name="person-outline" size={19} color={colors.primary} />
          </Pressable>
        </View>

        {activeTab === 'home' ? (
          <HomeScreen
            colors={colors}
            selectedCourse={selectedCourse}
            onSelectCourse={setSelectedCourse}
            onOpenCourses={() => setActiveTab('courses')}
            onStartQuiz={openQuizSetup}
            onOpenInsights={() => setActiveTab('insights')}
          />
        ) : activeTab === 'courses' ? (
          <CoursesScreen
            colors={colors}
            selectedCourse={selectedCourse}
            onSelectCourse={setSelectedCourse}
          />
        ) : activeTab === 'quiz' ? (
          <QuizScreen
            colors={colors}
            selectedCourse={selectedCourse}
            onSelectCourse={(course) => {
              setSelectedCourse(course);
              setSampleNotice('');
            }}
            selectedTopics={selectedTopics}
            onToggleTopic={toggleTopic}
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
          icon="home-outline"
          active={activeTab === 'home'}
          colors={colors}
          onPress={() => setActiveTab('home')}
        />
        <NavigationButton
          label="Courses"
          icon="book-outline"
          active={activeTab === 'courses'}
          colors={colors}
          onPress={() => setActiveTab('courses')}
        />
        <NavigationButton
          label="Quiz"
          icon="help-circle-outline"
          active={activeTab === 'quiz'}
          colors={colors}
          onPress={openQuizSetup}
        />
        <NavigationButton
          label="Insights"
          icon="analytics-outline"
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
  selectedCourse,
  onSelectCourse,
  onOpenCourses,
  onStartQuiz,
  onOpenInsights,
}: {
  colors: ReturnType<typeof useColors>;
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

      <DifficultyExample colors={colors} />

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
  selectedCourse,
  onSelectCourse,
}: {
  colors: ReturnType<typeof useColors>;
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
          Course names shown are examples from the API contract.
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
        {selectedCourse === 'Mathematics' ? (
          <View style={styles.topicTags}>
            <TopicTag label="Algebra" colors={colors} />
            <TopicTag label="Geometry" colors={colors} />
            <Text style={[styles.exampleCaption, { color: colors.quiet }]}>
              Contract examples
            </Text>
          </View>
        ) : (
          <Text style={[styles.topicPlaceholder, { color: colors.softInk }]}>
            Choose a course topic when its course data is available.
          </Text>
        )}
      </View>
    </View>
  );
}

function QuizScreen({
  colors,
  selectedCourse,
  onSelectCourse,
  selectedTopics,
  onToggleTopic,
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
  selectedCourse: CourseName;
  onSelectCourse: (course: CourseName) => void;
  selectedTopics: string[];
  onToggleTopic: (topic: string) => void;
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
            {(selectedCourse === 'Mathematics'
              ? ['Algebra', 'Geometry']
              : ['All available topics']
            ).map((topic) =>
              topic === 'All available topics' ? (
                <View
                  key={topic}
                  style={[styles.topicPlaceholderChip, { backgroundColor: colors.secondary }]}
                >
                  <Text style={[styles.topicChipText, { color: colors.softInk }]}>
                    {topic}
                  </Text>
                </View>
              ) : (
                <SelectableTopic
                  key={topic}
                  label={topic}
                  selected={selectedTopics.includes(topic)}
                  colors={colors}
                  onPress={() => onToggleTopic(topic)}
                />
              ),
            )}
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
            disabled={selectedCourse === 'Mathematics' && selectedTopics.length === 0}
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: colors.primary },
              selectedCourse === 'Mathematics' &&
                selectedTopics.length === 0 &&
                styles.disabledButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="play" size={16} color={colors.white} />
            <Text style={[styles.primaryButtonText, { color: colors.white }]}>
              Start sample quiz
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
                Mathematics · Algebra
              </Text>
              <Text style={[styles.sectionSubtext, { color: colors.softInk }]}>
                Sample question from the API contract
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
  onStartQuiz,
}: {
  colors: ReturnType<typeof useColors>;
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
        <DifficultyExample colors={colors} compact />
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
  compact = false,
}: {
  colors: ReturnType<typeof useColors>;
  compact?: boolean;
}) {
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
            <Ionicons name="calculator-outline" size={17} color={colors.amberInk} />
          </View>
          <View>
            <Text style={[styles.difficultyName, { color: colors.ink }]}>
              Algebra
            </Text>
            <Text style={[styles.sectionSubtext, { color: colors.softInk }]}>
              Mathematics
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
              { backgroundColor: colors.coral, width: '78%' },
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
  course: { name: CourseName; icon: IoniconName };
  selected: boolean;
  colors: ReturnType<typeof useColors>;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`Select ${course.name}`}
      testID={`course-chip-${course.name.toLowerCase().replaceAll(' ', '-')}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.courseChip,
        {
          backgroundColor: selected ? colors.deep : colors.card,
          borderColor: selected ? colors.deep : colors.line,
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
  course: { name: CourseName; icon: IoniconName };
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
      accessibilityState={{ selected }}
      testID={`course-card-${course.name.toLowerCase().replaceAll(' ', '-')}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.courseCard,
        {
          backgroundColor: colors.card,
          borderColor: selected ? colors.primary : colors.line,
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
        STEM course
      </Text>
      <View style={styles.courseCardFooter}>
        <Text
          style={[
            styles.courseSelectedText,
            { color: selected ? colors.primary : colors.quiet },
          ]}
        >
          {selected ? 'Selected' : 'Choose course'}
        </Text>
        <Ionicons
          name={selected ? 'checkmark-circle' : 'arrow-forward-circle-outline'}
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
  icon: IoniconName;
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
      <Ionicons
        name={icon}
        size={21}
        color={active ? colors.primary : colors.quiet}
      />
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
            <Ionicons name="close" size={18} color={colors.ink} />
          </Pressable>
          <View style={[styles.profileAvatar, { backgroundColor: colors.paleBlue }]}>
            <Ionicons name="person-outline" size={27} color={colors.primary} />
          </View>
          <Text style={[styles.profileTitle, { color: colors.ink }]}>
            Student view
          </Text>
          <Text style={[styles.profileCopy, { color: colors.softInk }]}>
            Your personal quiz attempts and study recommendations belong to your account.
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
    gap: 10,
  },
  brandIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    lineHeight: 19,
    letterSpacing: -0.25,
  },
  brandCaption: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    lineHeight: 14,
    marginTop: 1,
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
  pressed: {
    opacity: 0.76,
  },
});
