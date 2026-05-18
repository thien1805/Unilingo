/**
 * Results Screen — Band scores + AI feedback + transcript
 * Fully integrated with backend scoring pipeline
 */
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/themeStore';
import { practiceAPI, ScoringResult } from '../../api/practice';
import { vocabularyAPI, DictionaryResult } from '../../api/vocabulary';
import { Card, PrimaryButton, OutlineButton, Badge, ScoreBar } from '../../components/common';
import { Gradients, Typography, BorderRadius } from '../../theme';

const TABS = ['Script', 'Feedback', 'Sample', 'Grammar'];

export default function ResultsScreen({ navigation, route }: any) {
  const { attemptId, ieltsPart, topicTitle } = route.params;
  const { colors } = useThemeStore();
  const [activeTab, setActiveTab] = useState(0);
  const [result, setResult] = useState<ScoringResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);

  // Dictionary Lookup State
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [dictResult, setDictResult] = useState<DictionaryResult | null>(null);
  const [dictLoading, setDictLoading] = useState(false);

  const handleLookup = async (word: string) => {
    // Clean punctuation from word
    const cleanWord = word.replace(/[^a-zA-Z]/g, '').toLowerCase();
    if (!cleanWord) return;
    
    setSelectedWord(cleanWord);
    setDictLoading(true);
    setDictResult(null);
    try {
      const res = await vocabularyAPI.lookupDictionary(cleanWord);
      setDictResult(res);
    } catch {
      setDictResult({
        word: cleanWord,
        phonetic: null,
        audio_url: null,
        meanings: [{
          part_of_speech: 'unknown',
          definitions: [{
            definition: 'Definition not found in dictionary.',
            example: null,
            synonyms: [],
            antonyms: [],
          }],
        }],
      });
    } finally {
      setDictLoading(false);
    }
  };

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
    } catch (err) {
      console.log('[Results] Error loading result:', err);
      // Don't use mock — start polling in case it's still being created
      setPolling(true);
      setLoading(false);
      pollForResult();
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

  // Extract scoring data — prefer top-level (aggregated by backend), fallback to first part
  const r = result || { status: 'scoring', parts: [] } as any;
  const parts = r.parts || [];
  const firstScoring = parts[0]?.scoring;

  // Top-level scores are already averaged by the backend across all parts
  const overall = r.overall_band ?? firstScoring?.overall_band ?? 0;
  const fluency = r.fluency_score ?? firstScoring?.fluency_band ?? 0;
  const lexical = r.lexical_score ?? firstScoring?.lexical_band ?? 0;
  const grammar = r.grammar_score ?? firstScoring?.grammar_band ?? 0;
  const pronunciation = r.pronunciation_score ?? firstScoring?.pronunciation_band ?? 0;

  // Aggregate AI-generated content from all parts
  const allScoringParts = parts.filter((p: any) => p.scoring);
  const feedback = firstScoring?.feedback;
  const strengths = allScoringParts.flatMap((p: any) => p.scoring?.strengths || []).filter(Boolean);
  const weaknesses = allScoringParts.flatMap((p: any) => p.scoring?.weaknesses || []).filter(Boolean);
  const suggestions = allScoringParts.flatMap((p: any) => p.scoring?.suggested_improvements || []).filter(Boolean);
  const grammarErrors = allScoringParts.flatMap((p: any) => p.scoring?.grammar_errors || []).filter(Boolean);
  const vocabSuggestions = allScoringParts.flatMap((p: any) => p.scoring?.vocabulary_suggestions || []).filter(Boolean);

  const comment = overall >= 7 ? 'Excellent! 🎉' : overall >= 6 ? 'Good job! 👏' : overall >= 5 ? 'Keep Going! 💪' : 'Practice more! 📚';

  if (loading || polling) {
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
          <View style={{ width: 38 }} />
        </View>

        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
          <View style={{
            width: 80, height: 80, borderRadius: 40,
            backgroundColor: colors.accentBg,
            alignItems: 'center', justifyContent: 'center',
            marginBottom: 24,
          }}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
          <Text style={[Typography.h2, { color: colors.textPrimary, textAlign: 'center', marginBottom: 12 }]}>
            AI is grading...
          </Text>
          <Text style={[Typography.bodyMedium, { color: colors.textSecondary, textAlign: 'center', lineHeight: 24 }]}>
            Please wait a moment while our AI examiner analyzes your pronunciation, vocabulary, and grammar.
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

          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
            {r.duration_seconds && (
              <Badge label={`⏱ ${Math.floor(r.duration_seconds / 60)}:${(r.duration_seconds % 60).toString().padStart(2, '0')}`} variant="accent" />
            )}
          </View>
        </Card>

        {/* XP Prominent Display */}
        {r.xp_earned > 0 && (
          <LinearGradient 
            colors={['rgba(245, 158, 11, 0.1)', 'rgba(245, 158, 11, 0.05)']} 
            style={{ borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.3)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(245, 158, 11, 0.2)', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 24 }}>⭐</Text>
              </View>
              <View>
                <Text style={[Typography.h4, { color: '#D97706' }]}>+{r.xp_earned} XP Earned!</Text>
                <Text style={[Typography.caption, { color: colors.textSecondary }]}>Keep practicing to climb the leaderboard</Text>
              </View>
            </View>
          </LinearGradient>
        )}

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
          <View style={{ gap: 12 }}>
            <View style={styles.transcriptHint}>
              <Ionicons name="information-circle" size={14} color={colors.textMuted} />
              <Text style={[Typography.caption, { color: colors.textMuted }]}>
                Tap any word to look up its meaning
              </Text>
            </View>
            
            {r.parts && r.parts.length > 0 ? (
              r.parts.map((p: any, index: number) => (
                <Card key={index} style={{ marginBottom: 8 }}>
                  <Text style={[Typography.h4, { color: colors.accent, marginBottom: 8 }]}>
                    Q{index + 1}: {p.question_text || 'Topic Question'}
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {(p.transcript || 'No speech recorded.').split(' ').map((word: string, i: number) => (
                      <TouchableOpacity key={i} onPress={() => handleLookup(word)}>
                        <Text style={[Typography.body, { color: colors.textSecondary, lineHeight: 26, marginRight: 4 }]}>
                          {word}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </Card>
              ))
            ) : (
              <Card>
                <Text style={[Typography.bodySm, { color: colors.textSecondary }]}>
                  No transcript is available for this attempt yet.
                </Text>
              </Card>
            )}
          </View>
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
              {firstScoring?.sample_better_answer?.text || 'No sample answer was returned for this attempt.'}
            </Text>
            {firstScoring?.sample_better_answer?.explanation && (
              <View style={[styles.sampleExplanation, { backgroundColor: colors.accentBg }]}>
                <Text style={[Typography.captionSm, { color: colors.accent, fontWeight: '600', marginBottom: 4 }]}>
                  Why this scores higher:
                </Text>
                <Text style={[Typography.captionSm, { color: colors.accent }]}>
                  {firstScoring.sample_better_answer.explanation}
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

      {/* Dictionary Modal */}
      <Modal visible={!!selectedWord} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={[{ flex: 1, backgroundColor: colors.bgBody }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Dictionary</Text>
            <TouchableOpacity onPress={() => setSelectedWord(null)}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 20 }}>
            {dictLoading ? (
              <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 40 }} />
            ) : dictResult ? (
              <View style={[styles.dictCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
                <View style={styles.dictWordRow}>
                  <Text style={[styles.dictWord, { color: colors.textPrimary }]}>{dictResult.word}</Text>
                  {dictResult.phonetic && (
                    <Text style={[styles.dictPhonetic, { color: colors.accent }]}>{dictResult.phonetic}</Text>
                  )}
                </View>

                {dictResult.meanings?.map((meaning, mIdx) => (
                  <View key={mIdx} style={{ marginBottom: 16 }}>
                    <Text style={[styles.pos, { color: colors.accent }]}>{meaning.part_of_speech}</Text>
                    {meaning.definitions?.map((def, dIdx) => (
                      <View key={dIdx} style={{ marginBottom: 8 }}>
                        <View style={styles.defRow}>
                          <Text style={[styles.defNum, { color: colors.textMuted }]}>{dIdx + 1}.</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.defText, { color: colors.textPrimary }]}>{def.definition}</Text>
                          </View>
                        </View>
                        {def.example && (
                          <Text style={[styles.exampleText, { color: colors.textSecondary }]}>"{def.example}"</Text>
                        )}
                      </View>
                    ))}
                  </View>
                ))}

                <PrimaryButton 
                  title="Add to Flashcards" 
                  icon="add"
                  onPress={() => {
                    setSelectedWord(null);
                    navigation.navigate('Vocabulary', { screen: 'VocabularyHub', params: { searchWord: dictResult.word } });
                  }} 
                  style={{ marginTop: 10 }}
                />
              </View>
            ) : null}
          </ScrollView>
        </SafeAreaView>
      </Modal>

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
  content: { paddingHorizontal: 20, paddingBottom: 100 },
  pollingBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 10,
  },
  bandDisplay: { alignItems: 'center', paddingVertical: 20 },
  bandCircle: {
    width: 116, height: 116, borderRadius: 58,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#3350B2', shadowOffset: { width: 0, height: 0 },
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
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 30, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  dictCard: { borderRadius: 12, padding: 16, borderWidth: 1 },
  dictWordRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  dictWord: { fontSize: 24, fontWeight: '700' },
  dictPhonetic: { fontSize: 16 },
  pos: { fontSize: 14, fontStyle: 'italic', marginBottom: 8, fontWeight: '600' },
  defRow: { flexDirection: 'row', gap: 8 },
  defNum: { fontSize: 14, width: 14 },
  defText: { fontSize: 15, lineHeight: 22 },
  exampleText: { fontSize: 14, fontStyle: 'italic', marginTop: 4, marginLeft: 22 },
});
