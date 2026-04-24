/**
 * FlashcardStudyScreen — Card flip + swipe study mode (SM-2 SRS)
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

// Safe haptics wrapper for Expo Go compatibility
const hapticImpact = (style: Haptics.ImpactFeedbackStyle) => {
  try { Haptics.impactAsync(style).catch(() => {}); } catch {}
};
import { useThemeStore } from '../../store/themeStore';
import { flashcardsAPI, FlashcardCard, FlashcardDeck } from '../../api/flashcards';
import { Gradients } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

// Mock cards for when backend is unavailable
const MOCK_CARDS: FlashcardCard[] = [
  { id: 'c1', deck_id: '', vocabulary_id: null, front_content: 'sustainable', back_content: 'able to be maintained at a certain rate or level\n\n/səˈsteɪnəbəl/', audio_url: null, extra_info: null, order_index: 0 },
  { id: 'c2', deck_id: '', vocabulary_id: null, front_content: 'coherent', back_content: 'logical and consistent; forming a unified whole\n\n/koʊˈhɪrənt/', audio_url: null, extra_info: null, order_index: 1 },
  { id: 'c3', deck_id: '', vocabulary_id: null, front_content: 'elaborate', back_content: 'involving many carefully arranged parts or details\n\n/ɪˈlæbərət/', audio_url: null, extra_info: null, order_index: 2 },
  { id: 'c4', deck_id: '', vocabulary_id: null, front_content: 'perceive', back_content: 'become aware or conscious of (something)\n\n/pərˈsiːv/', audio_url: null, extra_info: null, order_index: 3 },
  { id: 'c5', deck_id: '', vocabulary_id: null, front_content: 'prevalent', back_content: 'widespread in a particular area or at a particular time\n\n/ˈprɛvələnt/', audio_url: null, extra_info: null, order_index: 4 },
  { id: 'c6', deck_id: '', vocabulary_id: null, front_content: 'fluctuate', back_content: 'rise and fall irregularly in number or amount\n\n/ˈflʌktʃueɪt/', audio_url: null, extra_info: null, order_index: 5 },
  { id: 'c7', deck_id: '', vocabulary_id: null, front_content: 'inevitable', back_content: 'certain to happen; unavoidable\n\n/ɪnˈevɪtəbəl/', audio_url: null, extra_info: null, order_index: 6 },
  { id: 'c8', deck_id: '', vocabulary_id: null, front_content: 'substantial', back_content: 'of considerable importance, size, or worth\n\n/səbˈstænʃəl/', audio_url: null, extra_info: null, order_index: 7 },
];

const QUALITY_BUTTONS = [
  { quality: 1, label: 'Again', emoji: '❌', color: '#EF4444' },
  { quality: 3, label: 'Hard', emoji: '🤔', color: '#F59E0B' },
  { quality: 5, label: 'Easy', emoji: '✅', color: '#10B981' },
];

export default function FlashcardStudyScreen({ navigation, route }: any) {
  const { deckId, deckTitle } = route.params;
  const { colors } = useThemeStore();

  const [cards, setCards] = useState<FlashcardCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [stats, setStats] = useState({ easy: 0, hard: 0, again: 0 });

  // Animated values
  const flipProgress = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const cardScale = useSharedValue(1);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const session = await flashcardsAPI.getStudySession(deckId);
      setCards(session.cards_to_study);
    } catch {
      setCards(MOCK_CARDS);
    } finally {
      setLoading(false);
    }
  };

  const currentCard = cards[currentIndex];

  const flipCard = useCallback(() => {
    hapticImpact(Haptics.ImpactFeedbackStyle.Light);
    if (isFlipped) {
      flipProgress.value = withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) });
    } else {
      flipProgress.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) });
    }
    setIsFlipped(!isFlipped);
  }, [isFlipped]);

  const goToNext = useCallback((quality: number) => {
    // Record review
    if (currentCard && !currentCard.id.startsWith('c')) {
      flashcardsAPI.reviewCard(currentCard.id, quality).catch(() => {});
    }

    // Update stats
    setStats(prev => ({
      easy: prev.easy + (quality === 5 ? 1 : 0),
      hard: prev.hard + (quality === 3 ? 1 : 0),
      again: prev.again + (quality === 1 ? 1 : 0),
    }));

    hapticImpact(
      quality === 5 ? Haptics.ImpactFeedbackStyle.Light :
      quality === 1 ? Haptics.ImpactFeedbackStyle.Heavy :
      Haptics.ImpactFeedbackStyle.Medium
    );

    if (currentIndex >= cards.length - 1) {
      setCompleted(true);
      return;
    }

    // Animate card out
    const direction = quality === 5 ? 1 : quality === 1 ? -1 : 0;
    translateX.value = withTiming(direction * SCREEN_WIDTH * 1.5, { duration: 300 }, () => {
      runOnJS(resetAndAdvance)();
    });
  }, [currentIndex, cards.length, currentCard]);

  const resetAndAdvance = () => {
    setCurrentIndex(prev => prev + 1);
    setIsFlipped(false);
    flipProgress.value = 0;
    translateX.value = 0;
    translateY.value = 0;
    cardScale.value = withSpring(1);
  };

  // Gesture for swipe
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY * 0.3;
      cardScale.value = interpolate(
        Math.abs(e.translationX),
        [0, SCREEN_WIDTH / 2],
        [1, 0.9]
      );
    })
    .onEnd((e) => {
      if (e.translationX > SWIPE_THRESHOLD) {
        // Swipe right = Easy
        translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 250 });
        runOnJS(goToNext)(5);
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        // Swipe left = Again
        translateX.value = withTiming(-SCREEN_WIDTH * 1.5, { duration: 250 });
        runOnJS(goToNext)(1);
      } else {
        // Spring back
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        cardScale.value = withSpring(1);
      }
    });

  // Front card animated style
  const frontStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1200 },
      { rotateY: `${interpolate(flipProgress.value, [0, 1], [0, 180])}deg` },
    ],
    backfaceVisibility: 'hidden' as const,
    opacity: flipProgress.value > 0.5 ? 0 : 1,
  }));

  // Back card animated style
  const backStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1200 },
      { rotateY: `${interpolate(flipProgress.value, [0, 1], [180, 360])}deg` },
    ],
    backfaceVisibility: 'hidden' as const,
    opacity: flipProgress.value > 0.5 ? 1 : 0,
  }));

  // Card container animated style (for swipe)
  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: cardScale.value },
      { rotate: `${interpolate(translateX.value, [-SCREEN_WIDTH, 0, SCREEN_WIDTH], [-15, 0, 15])}deg` },
    ],
  }));

  // Swipe label styles
  const knowLabelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0, 1]),
  }));
  const dontKnowLabelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, -SWIPE_THRESHOLD], [0, 1]),
  }));

  const progress = cards.length > 0 ? (currentIndex / cards.length) : 0;

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgPrimary }]}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (completed || cards.length === 0) {
    const total = stats.easy + stats.hard + stats.again;
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgPrimary }]}>
        <View style={styles.completedContainer}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>🎉</Text>
          <Text style={[styles.completedTitle, { color: colors.textPrimary }]}>
            {cards.length === 0 ? 'No cards to study!' : 'Session Complete!'}
          </Text>
          <Text style={[styles.completedSubtitle, { color: colors.textSecondary }]}>
            {cards.length === 0
              ? 'Add some vocabulary words first, then come back.'
              : `You studied ${total} card${total !== 1 ? 's' : ''} today.`}
          </Text>

          {total > 0 && (
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: '#10B98118' }]}>
                <Text style={[styles.statNum, { color: '#10B981' }]}>{stats.easy}</Text>
                <Text style={[styles.statCardLabel, { color: '#10B981' }]}>✅ Easy</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#F59E0B18' }]}>
                <Text style={[styles.statNum, { color: '#F59E0B' }]}>{stats.hard}</Text>
                <Text style={[styles.statCardLabel, { color: '#F59E0B' }]}>🤔 Hard</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#EF444418' }]}>
                <Text style={[styles.statNum, { color: '#EF4444' }]}>{stats.again}</Text>
                <Text style={[styles.statCardLabel, { color: '#EF4444' }]}>❌ Again</Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[styles.doneBtn, { backgroundColor: colors.accent }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgPrimary }]}>
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={[styles.backBtn, { borderColor: colors.border }]}
          onPress={() => {
            if (currentIndex > 0) {
              Alert.alert('Exit Study?', 'Your progress will be saved.', [
                { text: 'Continue', style: 'cancel' },
                { text: 'Exit', onPress: () => navigation.goBack() },
              ]);
            } else {
              navigation.goBack();
            }
          }}
        >
          <Ionicons name="arrow-back" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: colors.textPrimary }]} numberOfLines={1}>
          {deckTitle || 'Study'}
        </Text>
        <Text style={[styles.counter, { color: colors.textMuted }]}>
          {currentIndex + 1}/{cards.length}
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressBar, { backgroundColor: colors.bgInput }]}>
        <LinearGradient
          colors={Gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressFill, { width: `${progress * 100}%` }]}
        />
      </View>

      {/* Card Area */}
      <View style={styles.cardArea}>
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.cardContainer, containerStyle]}>
            {/* Swipe Labels */}
            <Animated.View style={[styles.swipeLabel, styles.swipeLabelRight, knowLabelStyle]}>
              <Text style={styles.swipeLabelText}>✅ Know it!</Text>
            </Animated.View>
            <Animated.View style={[styles.swipeLabel, styles.swipeLabelLeft, dontKnowLabelStyle]}>
              <Text style={styles.swipeLabelText}>❌ Again</Text>
            </Animated.View>

            {/* Front of Card */}
            <Animated.View style={[styles.card, frontStyle]}>
              <TouchableOpacity
                style={[styles.cardInner, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
                activeOpacity={0.9}
                onPress={flipCard}
              >
                <View style={[styles.cardTopBadge, { backgroundColor: colors.accentBg }]}>
                  <Text style={[styles.cardTopBadgeText, { color: colors.accent }]}>FRONT</Text>
                </View>
                <Text style={[styles.cardWord, { color: colors.textPrimary }]}>
                  {currentCard?.front_content}
                </Text>
                <View style={[styles.flipHint, { backgroundColor: colors.bgSecondary }]}>
                  <Ionicons name="sync-outline" size={14} color={colors.textMuted} />
                  <Text style={[styles.flipHintText, { color: colors.textMuted }]}>Tap to flip</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>

            {/* Back of Card */}
            <Animated.View style={[styles.card, styles.cardBack, backStyle]}>
              <TouchableOpacity
                style={[styles.cardInner, { backgroundColor: colors.bgCard, borderColor: colors.borderAccent }]}
                activeOpacity={0.9}
                onPress={flipCard}
              >
                <View style={[styles.cardTopBadge, { backgroundColor: colors.successBg }]}>
                  <Text style={[styles.cardTopBadgeText, { color: colors.success }]}>BACK</Text>
                </View>
                <Text style={[styles.cardDefinition, { color: colors.textPrimary }]}>
                  {currentCard?.back_content}
                </Text>
                <View style={[styles.flipHint, { backgroundColor: colors.bgSecondary }]}>
                  <Ionicons name="sync-outline" size={14} color={colors.textMuted} />
                  <Text style={[styles.flipHintText, { color: colors.textMuted }]}>Tap to flip back</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </GestureDetector>
      </View>

      {/* Swipe Hint */}
      <Text style={[styles.swipeHint, { color: colors.textMuted }]}>
        ← Swipe left: Don't know  ·  Swipe right: Know it! →
      </Text>

      {/* Quality Rating Buttons */}
      <View style={styles.ratingRow}>
        {QUALITY_BUTTONS.map(btn => (
          <TouchableOpacity
            key={btn.quality}
            style={[styles.ratingBtn, { backgroundColor: btn.color + '15', borderColor: btn.color + '30' }]}
            onPress={() => goToNext(btn.quality)}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 20, marginBottom: 4 }}>{btn.emoji}</Text>
            <Text style={[styles.ratingLabel, { color: btn.color }]}>{btn.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 10,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  topTitle: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 17, flex: 1, textAlign: 'center', marginHorizontal: 8 },
  counter: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 14, minWidth: 40, textAlign: 'right' },
  progressBar: { height: 4, borderRadius: 2, marginHorizontal: 20, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  cardArea: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 24, paddingVertical: 16,
  },
  cardContainer: {
    width: SCREEN_WIDTH - 48,
    height: 360,
    position: 'relative',
  },
  card: {
    width: '100%', height: '100%',
    position: 'absolute', top: 0, left: 0,
  },
  cardBack: {},
  cardInner: {
    flex: 1, borderRadius: 24, borderWidth: 1.5,
    padding: 28, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 16, elevation: 4,
  },
  cardTopBadge: {
    position: 'absolute', top: 16, left: 20,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999,
  },
  cardTopBadgeText: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 10, letterSpacing: 1 },
  cardWord: { fontFamily: 'PlusJakartaSans-ExtraBold', fontSize: 32, textAlign: 'center' },
  cardDefinition: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 18, textAlign: 'center', lineHeight: 28 },
  flipHint: {
    position: 'absolute', bottom: 20,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
  },
  flipHintText: { fontFamily: 'PlusJakartaSans-Medium', fontSize: 11 },
  swipeLabel: {
    position: 'absolute', top: 20, zIndex: 10,
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12,
  },
  swipeLabelRight: { right: 20, backgroundColor: '#10B98130' },
  swipeLabelLeft: { left: 20, backgroundColor: '#EF444430' },
  swipeLabelText: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 14, color: '#fff' },
  swipeHint: {
    fontFamily: 'PlusJakartaSans-Regular', fontSize: 11, textAlign: 'center',
    paddingHorizontal: 20, marginBottom: 12,
  },
  ratingRow: {
    flexDirection: 'row', gap: 12, paddingHorizontal: 20,
    paddingBottom: 100, justifyContent: 'center',
  },
  ratingBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 14,
    borderRadius: 16, borderWidth: 1,
  },
  ratingLabel: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 13 },
  // Completed screen
  completedContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32,
  },
  completedTitle: { fontFamily: 'PlusJakartaSans-ExtraBold', fontSize: 28, marginBottom: 8, textAlign: 'center' },
  completedSubtitle: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 15, textAlign: 'center', marginBottom: 32 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  statCard: { flex: 1, alignItems: 'center', padding: 16, borderRadius: 16 },
  statNum: { fontFamily: 'PlusJakartaSans-ExtraBold', fontSize: 28, marginBottom: 4 },
  statCardLabel: { fontFamily: 'PlusJakartaSans-Medium', fontSize: 12 },
  doneBtn: {
    width: '100%', height: 54, borderRadius: 27,
    alignItems: 'center', justifyContent: 'center',
  },
  doneBtnText: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 17, color: '#fff' },
});
