/**
 * Virtual Room Screen — AI Examiner practice room
 */
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/themeStore';
import { practiceAPI, PracticeAttempt } from '../../api/practice';
import { topicsAPI, Question } from '../../api/topics';
import { PrimaryButton, OutlineButton, Card } from '../../components/common';
import { Gradients, Typography, BorderRadius } from '../../theme';

export default function VirtualRoomScreen({ navigation, route }: any) {
  const { topicId, topicTitle, ieltsPart } = route.params;
  const { colors } = useThemeStore();
  const [attempt, setAttempt] = useState<PracticeAttempt | null>(null);
  const [prepTime, setPrepTime] = useState(ieltsPart === 'part2' ? 60 : 0);
  const [isPreparing, setIsPreparing] = useState(ieltsPart === 'part2');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    startPractice();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isPreparing && prepTime > 0) {
      timerRef.current = setInterval(() => {
        setPrepTime((t) => {
          if (t <= 1) {
            setIsPreparing(false);
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPreparing]);

  const startPractice = async () => {
    try {
      const result = await practiceAPI.start({
        topic_id: topicId,
        ielts_part: ieltsPart,
      });
      setAttempt(result);
    } catch {
      // Use mock question
      setAttempt({
        attempt_id: 'mock-1',
        topic_title: topicTitle,
        ielts_part: ieltsPart,
        question: {
          id: 'q1',
          question_text: 'Describe a place you have visited that you found very interesting.',
          question_text_vi: null,
          ielts_part: ieltsPart,
          cue_card_content: ieltsPart === 'part2' ? JSON.stringify({
            prompt: 'You should say:',
            points: [
              'where this place is',
              'when you visited it',
              'what you did there',
              'and explain why you found it interesting',
            ],
          }) : null,
          follow_up_questions: null,
          difficulty: 'medium',
          sample_answer: null,
          key_vocabulary: null,
        },
        status: 'in_progress',
      });
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const cueCard = attempt?.question?.cue_card_content
    ? (typeof attempt.question.cue_card_content === 'string'
      ? JSON.parse(attempt.question.cue_card_content)
      : attempt.question.cue_card_content)
    : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text
          style={[Typography.bodyMedium, { color: colors.textPrimary, flex: 1, textAlign: 'center' }]}
          numberOfLines={1}
        >
          {ieltsPart.replace('part', 'Part ')} — {topicTitle}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* AI Examiner Avatar */}
        <LinearGradient
          colors={Gradients.primary}
          style={styles.examinerAvatar}
        >
          <Text style={{ fontSize: 42 }}>🤖</Text>
        </LinearGradient>

        {/* Question */}
        <Card style={{ marginBottom: 10 }}>
          <Text style={[Typography.captionSm, {
            color: colors.accent, fontWeight: '700',
            textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6,
          }]}>
            Question
          </Text>
          <Text style={[Typography.body, { color: colors.textPrimary, lineHeight: 22 }]}>
            {attempt?.question?.question_text || 'Loading...'}
          </Text>
        </Card>

        {/* Cue Card (Part 2 only) */}
        {cueCard && (
          <View style={[styles.cueCard, { backgroundColor: colors.accentBg, borderColor: colors.borderAccent }]}>
            <Text style={[Typography.label, { color: colors.accent, marginBottom: 6 }]}>
              📋 Cue Card
            </Text>
            <Text style={[Typography.bodySm, { color: colors.textSecondary, marginBottom: 6 }]}>
              {cueCard.prompt || 'You should say:'}
            </Text>
            {(cueCard.points || []).map((point: string, i: number) => (
              <View key={i} style={styles.cuePoint}>
                <Text style={[Typography.bodySm, { color: colors.accent, fontWeight: '700' }]}>•</Text>
                <Text style={[Typography.bodySm, { color: colors.textSecondary }]}>{point}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Prep Timer */}
        {isPreparing && (
          <View style={styles.prepTimer}>
            <Text style={[Typography.bodySm, { color: colors.textMuted, marginBottom: 4 }]}>
              Preparation Time
            </Text>
            <Text style={[styles.timerText, { color: colors.accent2 }]}>
              {formatTime(prepTime)}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <OutlineButton
          title="Notes"
          icon="create"
          onPress={() => Alert.alert('Notes', 'Jot down your ideas here')}
          style={{ flex: 1 }}
        />
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() =>
            navigation.navigate('Recording', {
              attemptId: attempt?.attempt_id,
              question: attempt?.question,
              ieltsPart,
              topicTitle,
            })
          }
        >
          <LinearGradient
            colors={['#F43F5E', '#E11D48']}
            style={styles.recordBtn}
          >
            <Ionicons name="mic" size={18} color="#fff" />
            <Text style={[Typography.button, { color: '#fff' }]}>Start Recording</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 14,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  content: { padding: 20, paddingTop: 0 },
  examinerAvatar: {
    width: 96, height: 96, borderRadius: 48,
    alignSelf: 'center', alignItems: 'center', justifyContent: 'center',
    marginVertical: 14,
    shadowColor: '#0D9488', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3, shadowRadius: 20, elevation: 8,
  },
  cueCard: {
    borderRadius: 12, padding: 16, marginBottom: 10,
    borderWidth: 1,
  },
  cuePoint: { flexDirection: 'row', gap: 8, paddingLeft: 4, marginTop: 5 },
  prepTimer: { alignItems: 'center', padding: 14 },
  timerText: { fontSize: 36, fontWeight: '800', letterSpacing: 2 },
  actions: {
    flexDirection: 'row', gap: 12, padding: 20, paddingBottom: 100,
  },
  recordBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 14,
  },
});
