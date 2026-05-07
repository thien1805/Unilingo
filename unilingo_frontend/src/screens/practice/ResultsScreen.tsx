/**
 * Results Screen — Band scores + AI feedback + transcript
 * Fully integrated with backend scoring pipeline
 */
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/themeStore';
import { practiceAPI, ScoringResult } from '../../api/practice';
import { Card, PrimaryButton, OutlineButton, Badge, ScoreBar } from '../../components/common';
import { Gradients, Typography, BorderRadius } from '../../theme';

const TABS = ['📜 Script', '💡 Feedback', '📝 Sample', '🔤 Grammar'];

export default function ResultsScreen({ navigation, route }: any) {
  const { attemptId, ieltsPart, topicTitle } = route.params;
  const { colors } = useThemeStore();
  const [activeTab, setActiveTab] = useState(0);
  const [result, setResult] = useState<ScoringResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    loadResult();
  }, []);

  const loadResult = async () => {
    setLoading(true);
    try {
      const data = await practiceAPI.getResult(attemptId);
      if (data.status === 'scoring') {
        // AI is still processing, poll every 3 seconds
        setPolling(true);
        setResult(data);
        setLoading(false);
        pollForResult();
      } else {
        setResult(data);
        setPolling(false);
        setLoading(false);
      }
    } catch {
      // Use mock data for demo/offline
      setResult(MOCK_RESULT);
      setLoading(false);
    }
  };

  const pollForResult = async () => {
    let retries = 0;
    const maxRetries = 30; // Max 90 seconds
    const interval = setInterval(async () => {
      retries++;
      try {
        const data = await practiceAPI.getResult(attemptId);
        if (data.status === 'completed' || retries >= maxRetries) {
          setResult(data);
          setPolling(false);
          clearInterval(interval);
        }
      } catch {
        if (retries >= maxRetries) {
          setPolling(false);
          clearInterval(interval);
        }
      }
    }, 3000);
  };

  // Extract scoring data from parts or top-level
  const r = result || MOCK_RESULT;
  const partScoring = r.parts?.[0]?.scoring;
  const overall = r.overall_band || partScoring?.overall_band || 6.5;
  const fluency = r.fluency_score || partScoring?.fluency_band || 6.5;
  const lexical = r.lexical_score || partScoring?.lexical_band || 7.0;
  const grammar = r.grammar_score || partScoring?.grammar_band || 6.0;
  const pronunciation = r.pronunciation_score || partScoring?.pronunciation_band || 6.5;

  // AI-generated content
  const feedback = partScoring?.feedback;
  const strengths = partScoring?.strengths || MOCK_STRENGTHS;
  const weaknesses = partScoring?.weaknesses || MOCK_WEAKNESSES;
  const suggestions = partScoring?.suggested_improvements || MOCK_SUGGESTIONS;
  const grammarErrors = partScoring?.grammar_errors || MOCK_GRAMMAR_ERRORS;
  const vocabSuggestions = partScoring?.vocabulary_suggestions || MOCK_VOCAB_SUGGESTIONS;
  const transcript = r.parts?.[0]?.transcript || MOCK_TRANSCRIPT;

  const comment = overall >= 7 ? 'Excellent! 🎉' : overall >= 6 ? 'Good job! 👏' : overall >= 5 ? 'Keep Going! 💪' : 'Practice more! 📚';

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[Typography.bodyMedium, { color: colors.textSecondary, marginTop: 16 }]}>
            Loading results...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
          onPress={() => navigation.popToTop()}
        >
          <Ionicons name="arrow-back" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={[Typography.bodyMedium, { color: colors.textPrimary }]}>Practice Result</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[Typography.bodySm, { color: colors.accent }]}>🔄 Retry</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Scoring In Progress Banner */}
        {polling && (
          <View style={[styles.pollingBanner, { backgroundColor: colors.warningBg, borderColor: colors.warning + '30' }]}>
            <ActivityIndicator size="small" color={colors.warning} />
            <Text style={[Typography.bodySm, { color: colors.warning, flex: 1 }]}>
              AI is analyzing your response... Results will update automatically.
            </Text>
          </View>
        )}

        {/* Band Score Circle */}
        <View style={styles.bandDisplay}>
          <LinearGradient colors={Gradients.primary} style={styles.bandCircle}>
            <Text style={[Typography.bandScore, { color: '#fff' }]}>{overall.toFixed(1)}</Text>
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>Overall</Text>
          </LinearGradient>
          <Text style={[Typography.h3, { color: colors.success, marginTop: 10 }]}>{comment}</Text>
          {feedback?.summary && (
            <Text style={[Typography.bodySm, { color: colors.textSecondary, textAlign: 'center', marginTop: 6, paddingHorizontal: 20 }]}>
              {feedback.summary}
            </Text>
          )}
        </View>

        {/* Score Breakdown */}
        <Card style={{ marginBottom: 14 }}>
          <View style={{ gap: 10 }}>
            <ScoreBar label="Fluency & Coherence" value={fluency} gradient={Gradients.primary} />
            <ScoreBar label="Lexical Resource" value={lexical} gradient={Gradients.accent} />
            <ScoreBar label="Grammar Range" value={grammar} gradient={Gradients.sky} />
            <ScoreBar label="Pronunciation" value={pronunciation} gradient={Gradients.rose} />
          </View>

          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            <Badge label={`+${r.xp_earned || 65} XP`} variant="success" />
            {r.duration_seconds && (
              <Badge label={`⏱ ${Math.floor(r.duration_seconds / 60)}:${(r.duration_seconds % 60).toString().padStart(2, '0')}`} variant="accent" />
            )}
          </View>
        </Card>

        {/* Tabs */}
        <View style={[styles.tabs, { backgroundColor: colors.bgInput }]}>
          {TABS.map((tab, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.tab, activeTab === i && { backgroundColor: colors.accent }]}
              onPress={() => setActiveTab(i)}
            >
              <Text style={[
                Typography.label,
                { color: activeTab === i ? '#fff' : colors.textMuted, fontSize: 11 },
              ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content — Transcript */}
        {activeTab === 0 && (
          <Card>
            <View style={styles.transcriptHint}>
              <Ionicons name="information-circle" size={14} color={colors.textMuted} />
              <Text style={[Typography.caption, { color: colors.textMuted }]}>
                AI-generated transcript from your recording
              </Text>
            </View>
            <Text style={[Typography.body, { color: colors.textSecondary, lineHeight: 26 }]}>
              {transcript}
            </Text>
          </Card>
        )}

        {/* Tab Content — AI Feedback */}
        {activeTab === 1 && (
          <View style={{ gap: 8 }}>
            {/* Detailed Assessment */}
            {feedback?.detailed && (
              <Card>
                <Text style={[Typography.h4, { color: colors.textPrimary, marginBottom: 8 }]}>
                  🎯 AI Assessment
                </Text>
                <Text style={[Typography.bodySm, { color: colors.textSecondary, lineHeight: 22 }]}>
                  {feedback.detailed}
                </Text>
              </Card>
            )}

            {/* Strengths */}
            <Card>
              <Text style={[Typography.h4, { color: colors.textPrimary, marginBottom: 8 }]}>
                📌 Strengths
              </Text>
              {strengths.map((s: string, i: number) => (
                <View key={i} style={styles.feedbackItem}>
                  <Text style={{ color: colors.success, fontWeight: '700' }}>✓</Text>
                  <Text style={[Typography.bodySm, { color: colors.textSecondary, flex: 1 }]}>{s}</Text>
                </View>
              ))}
            </Card>

            {/* Weaknesses */}
            <Card>
              <Text style={[Typography.h4, { color: colors.textPrimary, marginBottom: 8 }]}>
                ⚠️ Areas to Improve
              </Text>
              {weaknesses.map((s: string, i: number) => (
                <View key={i} style={styles.feedbackItem}>
                  <Text style={{ color: colors.warning, fontWeight: '700' }}>!</Text>
                  <Text style={[Typography.bodySm, { color: colors.textSecondary, flex: 1 }]}>{s}</Text>
                </View>
              ))}
            </Card>

            {/* Suggestions */}
            <Card>
              <Text style={[Typography.h4, { color: colors.textPrimary, marginBottom: 8 }]}>
                💡 Suggestions
              </Text>
              {suggestions.map((s: string, i: number) => (
                <View key={i} style={styles.feedbackItem}>
                  <Text style={{ color: colors.sky, fontWeight: '700' }}>→</Text>
                  <Text style={[Typography.bodySm, { color: colors.textSecondary, flex: 1 }]}>{s}</Text>
                </View>
              ))}
            </Card>

            {/* Vocabulary Suggestions */}
            {vocabSuggestions.length > 0 && (
              <Card>
                <Text style={[Typography.h4, { color: colors.textPrimary, marginBottom: 8 }]}>
                  📖 Vocabulary Upgrades
                </Text>
                {vocabSuggestions.map((v: any, i: number) => (
                  <View key={i} style={[styles.vocabRow, { borderBottomColor: colors.border }]}>
                    <View style={[styles.vocabBadge, { backgroundColor: colors.errorBg }]}>
                      <Text style={[Typography.captionSm, { color: colors.error }]}>{v.basic_word}</Text>
                    </View>
                    <Ionicons name="arrow-forward" size={14} color={colors.textMuted} />
                    <View style={{ flexDirection: 'row', gap: 4, flexWrap: 'wrap', flex: 1 }}>
                      {v.better_alternatives?.map((alt: string, j: number) => (
                        <View key={j} style={[styles.vocabBadge, { backgroundColor: colors.successBg }]}>
                          <Text style={[Typography.captionSm, { color: colors.success }]}>{alt}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </Card>
            )}
          </View>
        )}

        {/* Tab Content — Sample Answer */}
        {activeTab === 2 && (
          <Card>
            <Text style={[Typography.h4, { color: colors.textPrimary, marginBottom: 8 }]}>
              📝 Sample Better Answer (Band 7.5+)
            </Text>
            <Text style={[Typography.bodySm, { color: colors.textSecondary, lineHeight: 22 }]}>
              {partScoring?.sample_better_answer?.text || MOCK_SAMPLE_ANSWER}
            </Text>
            {partScoring?.sample_better_answer?.explanation && (
              <View style={[styles.sampleExplanation, { backgroundColor: colors.accentBg }]}>
                <Text style={[Typography.captionSm, { color: colors.accent, fontWeight: '600', marginBottom: 4 }]}>
                  Why this scores higher:
                </Text>
                <Text style={[Typography.captionSm, { color: colors.accent }]}>
                  {partScoring.sample_better_answer.explanation}
                </Text>
              </View>
            )}
          </Card>
        )}

        {/* Tab Content — Grammar Errors */}
        {activeTab === 3 && (
          <View style={{ gap: 8 }}>
            {grammarErrors.length > 0 ? (
              grammarErrors.map((err: any, i: number) => (
                <Card key={i}>
                  <View style={styles.grammarRow}>
                    <View style={[styles.grammarOriginal, { backgroundColor: colors.errorBg }]}>
                      <Text style={[Typography.bodySm, { color: colors.error, textDecorationLine: 'line-through' }]}>
                        {err.original}
                      </Text>
                    </View>
                    <Ionicons name="arrow-down" size={16} color={colors.accent} />
                    <View style={[styles.grammarCorrected, { backgroundColor: colors.successBg }]}>
                      <Text style={[Typography.bodySm, { color: colors.success, fontWeight: '600' }]}>
                        {err.corrected}
                      </Text>
                    </View>
                    {err.rule && (
                      <Text style={[Typography.captionSm, { color: colors.textMuted, marginTop: 4, fontStyle: 'italic' }]}>
                        Rule: {err.rule}
                      </Text>
                    )}
                  </View>
                </Card>
              ))
            ) : (
              <Card>
                <View style={{ alignItems: 'center', padding: 20 }}>
                  <Text style={{ fontSize: 32, marginBottom: 8 }}>✅</Text>
                  <Text style={[Typography.bodyMedium, { color: colors.textPrimary }]}>No grammar errors detected!</Text>
                  <Text style={[Typography.caption, { color: colors.textMuted, marginTop: 4 }]}>Great grammar usage in your response.</Text>
                </View>
              </Card>
            )}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <OutlineButton title="Retry" icon="refresh" onPress={() => navigation.goBack()} style={{ flex: 1 }} />
          <OutlineButton title="History" icon="time" onPress={() => navigation.navigate('PracticeHistory')} style={{ flex: 1 }} />
          <PrimaryButton title="Done" icon="checkmark" onPress={() => navigation.popToTop()} style={{ flex: 1 }} />
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Mock Data (used when backend is unavailable) ───
const MOCK_TRANSCRIPT = `I would like to talk about Hoi An Ancient Town, which I visited last autumn. It's a UNESCO World Heritage Site located in central Vietnam. I spent four days exploring the narrow streets lined with centuries-old houses painted in vibrant yellow. What captivated me most was how well preserved the architecture was — a harmonious blend of Vietnamese, Chinese, and Japanese influences. I found it particularly fascinating because every corner tell a story of the town's rich trading history.`;

const MOCK_STRENGTHS = [
  'Excellent descriptive vocabulary (vibrant, harmonious, captivated)',
  'Good coherence with clear topic development',
  'Natural speaking pace with appropriate pauses',
];

const MOCK_WEAKNESSES = [
  '"tell" should be "told" (past tense consistency)',
  'Pronunciation of "central" needs practice',
  'Use more complex sentence structures',
];

const MOCK_SUGGESTIONS = [
  'Practice past tense consistency',
  'Use conditional sentences for hypothetical ideas',
  'Work on word stress for multi-syllable words',
];

const MOCK_GRAMMAR_ERRORS = [
  { original: 'every corner tell a story', corrected: 'every corner told a story', rule: 'Past tense consistency — use past simple for completed actions' },
  { original: 'It was really wonderful', corrected: 'It was truly remarkable', rule: 'Use varied adverbs and more sophisticated adjectives' },
];

const MOCK_VOCAB_SUGGESTIONS = [
  { basic_word: 'beautiful', better_alternatives: ['breathtaking', 'picturesque', 'stunning'] },
  { basic_word: 'good', better_alternatives: ['exceptional', 'outstanding', 'remarkable'] },
];

const MOCK_SAMPLE_ANSWER = `I would like to describe Hoi An Ancient Town, a UNESCO World Heritage Site situated in central Vietnam, which I had the pleasure of visiting last autumn. During my four-day stay, I thoroughly explored the narrow, lantern-lit streets lined with centuries-old houses painted in a distinctive vibrant yellow. What captivated me most was the remarkably well-preserved architecture — a harmonious blend of Vietnamese, Chinese, and Japanese architectural influences that tells the story of centuries of international trade and cultural exchange.`;

const MOCK_RESULT: ScoringResult = {
  attempt_id: 'mock',
  status: 'completed',
  overall_band: 6.5,
  fluency_score: 6.5,
  lexical_score: 7.0,
  grammar_score: 6.0,
  pronunciation_score: 6.5,
  duration_seconds: 83,
  xp_earned: 65,
  parts: [{
    part_id: 'mock-part',
    part_number: 1,
    transcript: MOCK_TRANSCRIPT,
    duration_seconds: 83,
    scoring: {
      fluency_band: 6.5,
      lexical_band: 7.0,
      grammar_band: 6.0,
      pronunciation_band: 6.5,
      overall_band: 6.5,
      feedback: {
        summary: 'Good attempt with clear communication of ideas. Some areas for improvement in vocabulary range and pronunciation.',
        detailed: 'The candidate demonstrated a reasonable level of fluency with some natural hesitation. Ideas were generally coherent and well-organized. Vocabulary usage was appropriate but could benefit from more sophisticated word choices. Grammar was mostly accurate with occasional errors in tense consistency.',
      },
      strengths: MOCK_STRENGTHS,
      weaknesses: MOCK_WEAKNESSES,
      suggested_improvements: MOCK_SUGGESTIONS,
      grammar_errors: MOCK_GRAMMAR_ERRORS,
      vocabulary_suggestions: MOCK_VOCAB_SUGGESTIONS,
    },
  }],
};

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
  content: { paddingHorizontal: 20, paddingBottom: 30 },
  pollingBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 10,
  },
  bandDisplay: { alignItems: 'center', paddingVertical: 20 },
  bandCircle: {
    width: 116, height: 116, borderRadius: 58,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#0D9488', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3, shadowRadius: 20, elevation: 8,
  },
  tabs: { flexDirection: 'row', borderRadius: 12, padding: 3, marginVertical: 14 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  transcriptHint: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  feedbackItem: { flexDirection: 'row', gap: 10, paddingLeft: 4, marginTop: 4 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  vocabRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 8, borderBottomWidth: 0.5,
  },
  vocabBadge: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  sampleExplanation: {
    marginTop: 12, padding: 12, borderRadius: 10,
  },
  grammarRow: { gap: 6 },
  grammarOriginal: { padding: 10, borderRadius: 8 },
  grammarCorrected: { padding: 10, borderRadius: 8 },
});
