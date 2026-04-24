/**
 * Results Screen — Band scores + AI feedback + transcript
 */
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/themeStore';
import { practiceAPI, ScoringResult } from '../../api/practice';
import { Card, PrimaryButton, OutlineButton, Badge, ScoreBar } from '../../components/common';
import { Gradients, Typography, BorderRadius } from '../../theme';

const TABS = ['📜 Script', '💡 Feedback', '📝 Sample'];

export default function ResultsScreen({ navigation, route }: any) {
  const { attemptId, ieltsPart, topicTitle } = route.params;
  const { colors } = useThemeStore();
  const [activeTab, setActiveTab] = useState(0);
  const [result, setResult] = useState<ScoringResult | null>(null);

  useEffect(() => {
    loadResult();
  }, []);

  const loadResult = async () => {
    try {
      const data = await practiceAPI.getResult(attemptId);
      setResult(data);
    } catch {
      // Use mock data
      setResult(MOCK_RESULT);
    }
  };

  const r = result || MOCK_RESULT;
  const overall = r.overall_band || 6.5;
  const comment = overall >= 7 ? 'Great! 🎉' : overall >= 6 ? 'Good! 🎉' : 'Keep Going! 💪';

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
        {/* Band Score Circle */}
        <View style={styles.bandDisplay}>
          <LinearGradient colors={Gradients.primary} style={styles.bandCircle}>
            <Text style={[Typography.bandScore, { color: '#fff' }]}>{overall.toFixed(1)}</Text>
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>Overall</Text>
          </LinearGradient>
          <Text style={[Typography.h3, { color: colors.success, marginTop: 10 }]}>{comment}</Text>
        </View>

        {/* Score Breakdown */}
        <Card style={{ marginBottom: 14 }}>
          <View style={{ gap: 10 }}>
            <ScoreBar label="Fluency & Coherence" value={r.fluency_score || 6.5} gradient={Gradients.primary} />
            <ScoreBar label="Lexical Resource" value={r.lexical_score || 7.0} gradient={Gradients.accent} />
            <ScoreBar label="Grammar Range" value={r.grammar_score || 6.0} gradient={Gradients.sky} />
            <ScoreBar label="Pronunciation" value={r.pronunciation_score || 6.5} gradient={Gradients.rose} />
          </View>

          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            <Badge label={`+${r.xp_earned || 65} XP`} variant="success" />
            <Badge label="🔥 13 day streak" variant="warning" />
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
                { color: activeTab === i ? '#fff' : colors.textMuted },
              ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {activeTab === 0 && (
          <Card>
            <View style={styles.transcriptHint}>
              <Ionicons name="information-circle" size={14} color={colors.textMuted} />
              <Text style={[Typography.caption, { color: colors.textMuted }]}>
                Long-press a word to look up & save
              </Text>
            </View>
            <Text style={[Typography.body, { color: colors.textSecondary, lineHeight: 26 }]}>
              {MOCK_TRANSCRIPT}
            </Text>
          </Card>
        )}

        {activeTab === 1 && (
          <View style={{ gap: 8 }}>
            <Card>
              <Text style={[Typography.h4, { color: colors.textPrimary, marginBottom: 8 }]}>
                📌 Strengths
              </Text>
              {['Excellent descriptive vocabulary (vibrant, harmonious, captivated)',
                'Good coherence with clear topic development',
                'Natural speaking pace with appropriate pauses',
              ].map((s, i) => (
                <View key={i} style={styles.feedbackItem}>
                  <Text style={{ color: colors.success, fontWeight: '700' }}>✓</Text>
                  <Text style={[Typography.bodySm, { color: colors.textSecondary, flex: 1 }]}>{s}</Text>
                </View>
              ))}
            </Card>

            <Card>
              <Text style={[Typography.h4, { color: colors.textPrimary, marginBottom: 8 }]}>
                ⚠️ Areas to Improve
              </Text>
              {['"tell" should be "told" (past tense consistency)',
                'Pronunciation of "central" needs practice',
                'Use more complex sentence structures',
              ].map((s, i) => (
                <View key={i} style={styles.feedbackItem}>
                  <Text style={{ color: colors.warning, fontWeight: '700' }}>!</Text>
                  <Text style={[Typography.bodySm, { color: colors.textSecondary, flex: 1 }]}>{s}</Text>
                </View>
              ))}
            </Card>

            <Card>
              <Text style={[Typography.h4, { color: colors.textPrimary, marginBottom: 8 }]}>
                🎯 Suggestions
              </Text>
              {['Practice past tense consistency',
                'Use conditional sentences for hypothetical ideas',
                'Work on word stress for multi-syllable words',
              ].map((s, i) => (
                <View key={i} style={styles.feedbackItem}>
                  <Text style={{ color: colors.sky, fontWeight: '700' }}>→</Text>
                  <Text style={[Typography.bodySm, { color: colors.textSecondary, flex: 1 }]}>{s}</Text>
                </View>
              ))}
            </Card>
          </View>
        )}

        {activeTab === 2 && (
          <Card>
            <Text style={[Typography.h4, { color: colors.textPrimary, marginBottom: 8 }]}>
              📝 Sample Better Answer
            </Text>
            <Text style={[Typography.bodySm, { color: colors.textSecondary, lineHeight: 22 }]}>
              I would like to describe Hoi An Ancient Town, a UNESCO World Heritage Site situated in
              central Vietnam, which I had the pleasure of visiting last autumn. During my four-day
              stay, I thoroughly explored the narrow, lantern-lit streets lined with centuries-old
              houses painted in a distinctive vibrant yellow. What captivated me most was...
            </Text>
          </Card>
        )}

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <OutlineButton title="Retry" icon="refresh" onPress={() => navigation.goBack()} style={{ flex: 1 }} />
          <OutlineButton title="Share" icon="share-social" onPress={() => {}} style={{ flex: 1 }} />
          <PrimaryButton title="Save" icon="bookmark" onPress={() => navigation.popToTop()} style={{ flex: 1 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const MOCK_TRANSCRIPT = `I would like to talk about Hoi An Ancient Town, which I visited last autumn. It's a UNESCO World Heritage Site located in central Vietnam. I spent four days exploring the narrow streets lined with centuries-old houses painted in vibrant yellow. What captivated me most was how well preserved the architecture was — a harmonious blend of Vietnamese, Chinese, and Japanese influences. I found it particularly fascinating because every corner tell a story of the town's rich trading history.`;

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
  parts: [],
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
  bandDisplay: { alignItems: 'center', paddingVertical: 20 },
  bandCircle: {
    width: 116, height: 116, borderRadius: 58,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#0D9488', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3, shadowRadius: 20, elevation: 8,
  },
  tabs: { flexDirection: 'row', borderRadius: 12, padding: 4, marginVertical: 14 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  transcriptHint: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  feedbackItem: { flexDirection: 'row', gap: 10, paddingLeft: 4, marginTop: 4 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
});
