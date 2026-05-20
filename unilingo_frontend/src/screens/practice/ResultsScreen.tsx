/**
 * Results Screen — Band scores + AI feedback + transcript
 * Fully integrated with backend scoring pipeline
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { useThemeStore } from '../../store/themeStore';
import { practiceAPI, ScoringResult } from '../../api/practice';
import { vocabularyAPI, DictionaryResult } from '../../api/vocabulary';
import { flashcardsAPI } from '../../api/flashcards';
import { Card, PrimaryButton, OutlineButton, Badge, ScoreBar, Mascot, MascotIcon } from '../../components/common';
import { Gradients, Typography, BorderRadius } from '../../theme';
import AppBackground from '../../components/common/AppBackground';
import { getMascotMoodByBandChange, getMascotMoodByOverall } from '../../utils/mascotMood';
import { formatBand, normalizeBand } from '../../utils/bandScore';

const TABS = ['Script', 'Feedback', 'Sample', 'Grammar'];

const averageScore = (values: Array<number | null | undefined>) => {
  const valid = values.filter((value): value is number => typeof value === 'number');
  if (valid.length === 0) return null;
  return normalizeBand(valid.reduce((sum, value) => sum + value, 0) / valid.length);
};

const combineScoringResults = (results: ScoringResult[]): ScoringResult => {
  if (results.length === 1) return results[0];

  const parts = results.flatMap((item, resultIndex) =>
    (item.parts || []).map((part: any) => ({
      ...part,
      part_number: resultIndex + 1,
      question_text: `${(item as any).ielts_part ? (item as any).ielts_part.replace('part', 'Part ') : `Part ${resultIndex + 1}`} - ${part.question_text || 'Topic Question'}`,
    }))
  );

  const status = results.some((item) => item.status === 'failed')
    ? 'failed'
    : results.some((item) => item.status === 'in_progress')
      ? 'in_progress'
    : results.every((item) => item.status === 'completed')
      ? 'completed'
      : 'scoring';

  return {
    ...results[results.length - 1],
    attempt_id: results.map((item) => item.attempt_id).join(','),
    status,
    overall_band: averageScore(results.map((item) => item.overall_band)),
    fluency_score: averageScore(results.map((item) => item.fluency_score)),
    lexical_score: averageScore(results.map((item) => item.lexical_score)),
    grammar_score: averageScore(results.map((item) => item.grammar_score)),
    pronunciation_score: averageScore(results.map((item) => item.pronunciation_score)),
    duration_seconds: results.reduce((sum, item) => sum + (item.duration_seconds || 0), 0),
    xp_earned: results.reduce((sum, item) => sum + (item.xp_earned || 0), 0),
    parts,
  };
};

export default function ResultsScreen({ navigation, route }: any) {
  const { attemptId, ieltsPart, topicTitle } = route.params;
  const attemptIds = React.useMemo(() => {
    const fullTestIds = route.params?.fullTestAttemptIds;
    const ids = Array.isArray(fullTestIds) && fullTestIds.length > 0
      ? fullTestIds
      : [attemptId];
    return ids.filter(Boolean);
  }, [attemptId, route.params?.fullTestAttemptIds]);
  const attemptIdsKey = attemptIds.join('|');
  const resultSourceAttemptId = attemptIds[attemptIds.length - 1] || attemptId;
  const { colors } = useThemeStore();
  const [activeTab, setActiveTab] = useState(0);
  const [result, setResult] = useState<ScoringResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);
  const [resultError, setResultError] = useState<string | null>(null);
  const mountedRef = useRef(false);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const submitRecoveryStartedRef = useRef(false);

  // Dictionary Lookup State
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedLookupSource, setSelectedLookupSource] = useState<'script' | 'sample'>('script');
  const [dictResult, setDictResult] = useState<DictionaryResult | null>(null);
  const [dictLoading, setDictLoading] = useState(false);
  const [savingVocab, setSavingVocab] = useState(false);
  const [addingFlashcard, setAddingFlashcard] = useState(false);
  const [dictActionMessage, setDictActionMessage] = useState<string | null>(null);
  const [pronouncingKey, setPronouncingKey] = useState<string | null>(null);
  const pronunciationSoundRef = useRef<Audio.Sound | null>(null);

  const stopPronunciation = useCallback(async (resetState = true) => {
    Speech.stop();
    if (pronunciationSoundRef.current) {
      await pronunciationSoundRef.current.unloadAsync().catch(() => {});
      pronunciationSoundRef.current = null;
    }
    if (resetState && mountedRef.current) {
      setPronouncingKey(null);
    }
  }, []);

  const playPronunciation = useCallback(async (word: string, audioUrl?: string | null, key = word) => {
    if (!word.trim()) return;

    await stopPronunciation();
    setPronouncingKey(key);

    if (audioUrl) {
      try {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        const { sound } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          { shouldPlay: true }
        );
        pronunciationSoundRef.current = sound;
        sound.setOnPlaybackStatusUpdate((status) => {
          if (!status.isLoaded) return;
          if (status.didJustFinish) {
            sound.unloadAsync().catch(() => {});
            if (pronunciationSoundRef.current === sound) {
              pronunciationSoundRef.current = null;
            }
            setPronouncingKey((current) => current === key ? null : current);
          }
        });
        return;
      } catch {
        // Fall back to device text-to-speech below.
      }
    }

    Speech.speak(word, {
      language: 'en-US',
      onDone: () => setPronouncingKey((current) => current === key ? null : current),
      onStopped: () => setPronouncingKey((current) => current === key ? null : current),
      onError: () => setPronouncingKey((current) => current === key ? null : current),
    });
  }, [stopPronunciation]);

  const handleLookup = async (word: string, source: 'script' | 'sample' = 'script') => {
    // Clean punctuation from word
    const cleanWord = word.replace(/[^a-zA-Z]/g, '').toLowerCase();
    if (!cleanWord) return;
    
    setSelectedWord(cleanWord);
    setSelectedLookupSource(source);
    setDictLoading(true);
    setDictResult(null);
    setDictActionMessage(null);
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

  const getFirstDefinition = (entry: DictionaryResult) => {
    const firstMeaning = entry.meanings?.[0];
    const firstDefinition = firstMeaning?.definitions?.[0];
    return {
      firstMeaning,
      firstDefinition,
      definition: firstDefinition?.definition || 'No definition available.',
      example: firstDefinition?.example || undefined,
    };
  };

  const saveDictionaryWord = async (entry: DictionaryResult) => {
    const { firstDefinition } = getFirstDefinition(entry);
    try {
      const saved = await vocabularyAPI.add({
        word: entry.word,
        phonetic: entry.phonetic || undefined,
        audio_url: entry.audio_url || undefined,
        definitions: entry.meanings?.flatMap((meaning) =>
          meaning.definitions.map((definition) => ({
            definition: definition.definition,
            part_of_speech: meaning.part_of_speech,
          }))
        ),
        examples: firstDefinition?.example ? [firstDefinition.example] : undefined,
        source_context: selectedLookupSource === 'sample' ? 'sample_answer' : 'practice_script',
        source_attempt_id: resultSourceAttemptId,
        tags: ['practice-result', selectedLookupSource],
      });
      return saved.id;
    } catch (error: any) {
      const existing = await vocabularyAPI
        .list({ search: entry.word, per_page: 10 })
        .then((result) => result.items.find((item) => item.word.toLowerCase() === entry.word.toLowerCase()))
        .catch(() => null);
      if (existing?.id) return existing.id;

      const detail = error?.response?.data?.detail;
      if (typeof detail === 'string' && detail.toLowerCase().includes('already')) {
        return undefined;
      }
      throw error;
    }
  };

  const handleSaveVocabulary = async () => {
    if (!dictResult) return;
    setSavingVocab(true);
    setDictActionMessage(null);
    try {
      await saveDictionaryWord(dictResult);
      setDictActionMessage(`Saved "${dictResult.word}" to Vocabulary.`);
    } catch {
      setDictActionMessage('Could not save this word. Please try again.');
    } finally {
      setSavingVocab(false);
    }
  };

  const getOrCreatePracticeDeck = async () => {
    const decks = await flashcardsAPI.listDecks();
    const existing = decks.items.find((deck) => deck.title.toLowerCase() === 'practice vocabulary');
    if (existing) return existing;
    return flashcardsAPI.createDeck({
      title: 'Practice Vocabulary',
      description: 'Words saved from speaking scripts and sample answers.',
    });
  };

  const handleAddToFlashcards = async () => {
    if (!dictResult) return;
    setAddingFlashcard(true);
    setDictActionMessage(null);
    try {
      const vocabularyId = await saveDictionaryWord(dictResult);
      const deck = await getOrCreatePracticeDeck();
      const { definition, example, firstMeaning } = getFirstDefinition(dictResult);
      const backContent = [
        firstMeaning?.part_of_speech ? `(${firstMeaning.part_of_speech}) ${definition}` : definition,
        dictResult.phonetic ? `Pronunciation: ${dictResult.phonetic}` : null,
        example ? `Example: ${example}` : null,
      ].filter(Boolean).join('\n\n');

      await flashcardsAPI.addCard(deck.id, {
        front_content: dictResult.word,
        back_content: backContent,
        audio_url: dictResult.audio_url || undefined,
        vocabulary_id: vocabularyId,
        extra_info: {
          source: selectedLookupSource,
          source_attempt_id: resultSourceAttemptId,
        },
      });
      setDictActionMessage(`Added "${dictResult.word}" to Practice Vocabulary flashcards.`);
    } catch {
      setDictActionMessage('Could not add this word to flashcards. Please try again.');
    } finally {
      setAddingFlashcard(false);
    }
  };

  const renderLookupWords = (text: string, source: 'script' | 'sample' = 'script') => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
      {text.split(/\s+/).filter(Boolean).map((word: string, i: number) => (
        <TouchableOpacity key={`${source}-${word}-${i}`} onPress={() => handleLookup(word, source)}>
          <Text style={[Typography.body, { color: colors.textSecondary, lineHeight: 26, marginRight: 4 }]}>
            {word}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const fetchCombinedResult = async () => {
    const results = await Promise.all(attemptIds.map((id) => practiceAPI.getResult(id)));
    return combineScoringResults(results);
  };

  const recoverSubmit = () => {
    if (submitRecoveryStartedRef.current) return;
    submitRecoveryStartedRef.current = true;
    attemptIds.forEach((id) => {
      practiceAPI.submit(id, { waitForResult: false, timeoutSeconds: 5 }).catch((error) => {
        console.log('[Results] Submit recovery failed:', error);
      });
    });
  };

  const handleResultData = (data: ScoringResult) => {
    if (!mountedRef.current) return;

    setResult(data);
    if (data.status === 'completed') {
      stopPolling();
      setPolling(false);
      setLoading(false);
      setResultError(null);
      const hasScoring = data.parts?.some((part: any) => !!part.scoring);
      if (!hasScoring) {
        setResultError('The attempt finished, but no AI scoring data was returned. Please retry the test.');
      }
      return;
    }

    if (data.status === 'failed') {
      stopPolling();
      setPolling(false);
      setLoading(false);
      setResultError('AI scoring failed for this attempt. Please retry the test.');
      return;
    }

    if ((data.status === 'in_progress' || data.status === 'scoring') && !submitRecoveryStartedRef.current) {
      recoverSubmit();
    }

    setResultError(null);
    setPolling(true);
    setLoading(false);
    pollForResult();
  };

  useEffect(() => {
    mountedRef.current = true;
    loadResult();

    return () => {
      mountedRef.current = false;
      stopPolling();
      stopPronunciation(false);
    };
  }, [attemptIdsKey, stopPronunciation]);

  const loadResult = async () => {
    stopPolling();
    setLoading(true);
    setResultError(null);
    try {
      const data = await fetchCombinedResult();
      handleResultData(data);
    } catch (err) {
      console.log('[Results] Error loading result:', err);
      // Don't use mock — start polling in case it's still being created
      if (mountedRef.current) {
        setPolling(true);
        setLoading(false);
        pollForResult();
      }
    }
  };

  const pollForResult = async () => {
    stopPolling();
    let retries = 0;
    const maxRetries = 120; // Max 6 minutes
    pollIntervalRef.current = setInterval(async () => {
      if (!mountedRef.current) {
        stopPolling();
        return;
      }
      retries++;
      try {
        const data = await fetchCombinedResult();
        if (!mountedRef.current) return;

        setResult(data);
        if (data.status === 'completed') {
          const hasScoring = data.parts?.some((part: any) => !!part.scoring);
          stopPolling();
          setPolling(false);
          setLoading(false);
          setResultError(null);
          if (!hasScoring) {
            setResultError('The attempt finished, but no AI scoring data was returned. Please retry the test.');
          }
          return;
        }

        if (data.status === 'failed') {
          stopPolling();
          setPolling(false);
          setLoading(false);
          setResultError('AI scoring failed for this attempt. Please retry the test.');
          return;
        }

        if ((data.status === 'in_progress' || data.status === 'scoring') && !submitRecoveryStartedRef.current) {
          recoverSubmit();
        }

        if (retries >= maxRetries) {
          stopPolling();
          setPolling(false);
          setLoading(false);
          setResultError('AI scoring is still running. Keep this screen open and tap Check again in a moment.');
        }
      } catch {
        if (retries >= maxRetries) {
          stopPolling();
          if (mountedRef.current) {
            setPolling(false);
            setLoading(false);
            setResultError('Could not fetch the AI scoring result. Please check your connection and try again.');
          }
        }
      }
    }, 3000);
  };

  // Extract scoring data — prefer top-level (aggregated by backend), fallback to first part
  const r = result || { status: 'scoring', parts: [] } as any;
  const parts = r.parts || [];
  const firstScoring = parts[0]?.scoring;

  // Top-level scores are already averaged by the backend across all parts
  const overall = normalizeBand(r.overall_band ?? firstScoring?.overall_band ?? 0);
  const fluency = normalizeBand(r.fluency_score ?? firstScoring?.fluency_band ?? 0);
  const lexical = normalizeBand(r.lexical_score ?? firstScoring?.lexical_band ?? 0);
  const grammar = normalizeBand(r.grammar_score ?? firstScoring?.grammar_band ?? 0);
  const pronunciation = normalizeBand(r.pronunciation_score ?? firstScoring?.pronunciation_band ?? 0);

  // Aggregate AI-generated content from all parts
  const allScoringParts = parts.filter((p: any) => p.scoring);
  const feedback = firstScoring?.feedback;
  const strengths = allScoringParts.flatMap((p: any) => p.scoring?.strengths || []).filter(Boolean);
  const weaknesses = allScoringParts.flatMap((p: any) => p.scoring?.weaknesses || []).filter(Boolean);
  const suggestions = allScoringParts.flatMap((p: any) => p.scoring?.suggested_improvements || []).filter(Boolean);
  const grammarErrors = allScoringParts.flatMap((p: any) => p.scoring?.grammar_errors || []).filter(Boolean);
  const vocabSuggestions = allScoringParts.flatMap((p: any) => p.scoring?.vocabulary_suggestions || []).filter(Boolean);

  const comment = overall >= 7 ? 'Excellent!' : overall >= 6 ? 'Good job!' : overall >= 5 ? 'Keep Going!' : 'Practice more!';
  const overallMascotMood = getMascotMoodByOverall(overall);

  const getQuestionMascotMood = (index: number) => {
    const currentBand = parts[index]?.scoring?.overall_band;
    const rawPreviousBand = index > 0 ? parts[index - 1]?.scoring?.overall_band : null;
    const previousBand = typeof rawPreviousBand === 'number' ? normalizeBand(rawPreviousBand) : null;
    if (typeof currentBand !== 'number') return 'idle';
    return getMascotMoodByBandChange(previousBand, normalizeBand(currentBand));
  };

  if (loading || polling) {
    return (
      <AppBackground>
        <SafeAreaView style={styles.safe}>
          <View style={styles.container}>
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
            <Mascot mood="confused" size={128} animated />
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
              Please keep this screen open while our AI examiner analyzes your pronunciation, vocabulary, and grammar.
            </Text>
          </View>
          </View>
        </SafeAreaView>
      </AppBackground>
    );
  }

  if (resultError) {
    return (
      <AppBackground>
        <SafeAreaView style={styles.safe}>
          <View style={styles.container}>
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

            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
              <Mascot mood="confused" size={128} animated />
              <Text style={[Typography.h2, { color: colors.textPrimary, textAlign: 'center', marginTop: 16, marginBottom: 10 }]}>
                Could not grade this attempt
              </Text>
              <Text style={[Typography.bodyMedium, { color: colors.textSecondary, textAlign: 'center', lineHeight: 24 }]}>
                {resultError}
              </Text>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 24, width: '100%' }}>
                <OutlineButton title="Check again" icon="refresh" onPress={loadResult} style={{ flex: 1 }} />
                <PrimaryButton title="Done" icon="checkmark" onPress={() => navigation.popToTop()} style={{ flex: 1 }} />
              </View>
            </View>
          </View>
        </SafeAreaView>
      </AppBackground>
    );
  }

  return (
    <AppBackground>
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
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
          <Text style={[Typography.bodySm, { color: colors.accent }]}>Retry</Text>
        </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
        {/* Band Score Circle */}
        <View style={styles.bandDisplay}>
          <Mascot mood={overallMascotMood} size={118} animated />
          <LinearGradient colors={Gradients.primary} style={styles.bandCircle}>
            <Text style={[Typography.bandScore, { color: '#fff' }]}>{formatBand(overall)}</Text>
            <Text style={{ fontSize: 11, color: '#1F2937', marginTop: 2 }}>Overall</Text>
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
              <Badge label={`${Math.floor(r.duration_seconds / 60)}:${(r.duration_seconds % 60).toString().padStart(2, '0')}`} variant="accent" />
            )}
          </View>
        </Card>

        {/* XP Prominent Display */}
        {r.xp_earned > 0 && (
          <LinearGradient 
            colors={['#FEF3C7', '#FDE68A']} 
            style={{ borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#F59E0B', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF7D6', alignItems: 'center', justifyContent: 'center' }}>
                <MascotIcon mood="happy" size={32} />
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
                  <View style={styles.questionResultHeader}>
                    <Text style={[Typography.h4, { color: colors.accent, flex: 1 }]}>
                      Q{index + 1}: {p.question_text || 'Topic Question'}
                    </Text>
                    <Mascot mood={getQuestionMascotMood(index)} size={54} animated />
                  </View>
                  <View style={styles.resultMetaRow}>
                    <Badge
                      label={p.has_audio === false ? 'No recording' : 'Recording saved'}
                      variant={p.has_audio === false ? 'warning' : 'success'}
                    />
                    {p.scoring && <Badge label="AI scored" variant="accent" />}
                  </View>
                  {renderLookupWords(p.transcript || 'No speech recorded.', 'script')}
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
                  AI Assessment
                </Text>
                <Text style={[Typography.bodySm, { color: colors.textSecondary, lineHeight: 22 }]}>
                  {feedback.detailed}
                </Text>
              </Card>
            )}

            {/* Strengths */}
            <Card>
              <Text style={[Typography.h4, { color: colors.textPrimary, marginBottom: 8 }]}>
                Strengths
              </Text>
              {strengths.map((s: string, i: number) => (
                <View key={i} style={styles.feedbackItem}>
                  <Ionicons name="checkmark" size={16} color={colors.success} />
                  <Text style={[Typography.bodySm, { color: colors.textSecondary, flex: 1 }]}>{s}</Text>
                </View>
              ))}
            </Card>

            {/* Weaknesses */}
            <Card>
              <Text style={[Typography.h4, { color: colors.textPrimary, marginBottom: 8 }]}>
                Areas to Improve
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
                Suggestions
              </Text>
              {suggestions.map((s: string, i: number) => (
                <View key={i} style={styles.feedbackItem}>
                  <Ionicons name="arrow-forward" size={16} color={colors.sky} />
                  <Text style={[Typography.bodySm, { color: colors.textSecondary, flex: 1 }]}>{s}</Text>
                </View>
              ))}
            </Card>

            {/* Vocabulary Suggestions */}
            {vocabSuggestions.length > 0 && (
              <Card>
                <Text style={[Typography.h4, { color: colors.textPrimary, marginBottom: 8 }]}>
                  Vocabulary Upgrades
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
              Sample Better Answer (Band 7.5+)
            </Text>
            <View style={styles.transcriptHint}>
              <Ionicons name="information-circle" size={14} color={colors.textMuted} />
              <Text style={[Typography.caption, { color: colors.textMuted }]}>
                Tap any word to save it or add it to flashcards
              </Text>
            </View>
            {renderLookupWords(firstScoring?.sample_better_answer?.text || 'No sample answer was returned for this attempt.', 'sample')}
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
                  <MascotIcon mood="happy" size={40} />
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
            <TouchableOpacity onPress={() => { stopPronunciation(); setSelectedWord(null); }}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 20 }}>
            {dictLoading ? (
              <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 40 }} />
            ) : dictResult ? (
              <View style={[styles.dictCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
                <View style={styles.dictWordRow}>
                  <View style={styles.dictWordInfo}>
                    <Text style={[styles.dictWord, { color: colors.textPrimary }]}>{dictResult.word}</Text>
                    {dictResult.phonetic && (
                      <Text style={[styles.dictPhonetic, { color: colors.accent }]}>{dictResult.phonetic}</Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={[styles.pronounceBtn, { backgroundColor: colors.accentBg }]}
                    onPress={() => playPronunciation(dictResult.word, dictResult.audio_url, `result-${dictResult.word}`)}
                    disabled={pronouncingKey === `result-${dictResult.word}`}
                  >
                    {pronouncingKey === `result-${dictResult.word}` ? (
                      <ActivityIndicator size="small" color={colors.accent} />
                    ) : (
                      <Ionicons name="volume-high-outline" size={22} color={colors.accent} />
                    )}
                  </TouchableOpacity>
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

                {dictActionMessage && (
                  <View style={[styles.dictActionMessage, { backgroundColor: colors.accentBg }]}>
                    <Text style={[Typography.caption, { color: colors.accent, textAlign: 'center' }]}>
                      {dictActionMessage}
                    </Text>
                  </View>
                )}

                <OutlineButton
                  title="Save Vocabulary"
                  icon="bookmark"
                  loading={savingVocab}
                  disabled={addingFlashcard}
                  onPress={handleSaveVocabulary}
                  style={{ marginTop: 10 }}
                />
                <PrimaryButton 
                  title="Add to Flashcards" 
                  icon="add"
                  loading={addingFlashcard}
                  disabled={savingVocab}
                  onPress={handleAddToFlashcards}
                  style={{ marginTop: 10 }}
                />
              </View>
            ) : null}
          </ScrollView>
        </SafeAreaView>
        </Modal>

        </View>
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
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
    shadowColor: '#F6D85F', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3, shadowRadius: 20, elevation: 8,
  },
  tabs: { flexDirection: 'row', borderRadius: 12, padding: 3, marginVertical: 14 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  transcriptHint: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  questionResultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  resultMetaRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 8 },
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
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 30, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  dictCard: { borderRadius: 12, padding: 16, borderWidth: 1 },
  dictWordRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  dictWordInfo: { flex: 1 },
  dictWord: { fontSize: 24, fontWeight: '700' },
  dictPhonetic: { fontSize: 16 },
  pronounceBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  pos: { fontSize: 14, fontStyle: 'italic', marginBottom: 8, fontWeight: '600' },
  defRow: { flexDirection: 'row', gap: 8 },
  defNum: { fontSize: 14, width: 14 },
  defText: { fontSize: 15, lineHeight: 22 },
  exampleText: { fontSize: 14, fontStyle: 'italic', marginTop: 4, marginLeft: 22 },
  dictActionMessage: { borderRadius: 10, padding: 10, marginTop: 6 },
});
