/**
 * VocabularyScreen — Word list + Dictionary search + filter
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Modal,
  ScrollView,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { useThemeStore } from '../../store/themeStore';
import { vocabularyAPI, VocabularyItem, DictionaryResult } from '../../api/vocabulary';
import { flashcardsAPI, FlashcardDeck } from '../../api/flashcards';
import { Gradients } from '../../theme';
import { AppModal, useAppModal } from '../../components/common/AppModal';
import AppBackground from '../../components/common/AppBackground';
import MascotIcon from '../../components/common/MascotIcon';

const FILTER_KEYS = ['all', 'new', 'learning', 'mastered'] as const;

const MASTERY_COLORS: Record<string, string> = {
  new: '#0EA5E9',
  learning: '#F59E0B',
  reviewing: '#F59E0B',
  mastered: '#10B981',
};

const MASTERY_BACKGROUNDS: Record<string, string> = {
  new: '#E0F2FE',
  learning: '#FEF3C7',
  reviewing: '#FEF3C7',
  mastered: '#D1FAE5',
};

export default function VocabularyScreen({ navigation }: any) {
  const { colors } = useThemeStore();
  const { modal, hideModal, showError, showSuccess, showInfo } = useAppModal();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [words, setWords] = useState<VocabularyItem[]>([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState<Record<string, number>>({ all: 0, new: 0, learning: 0, mastered: 0 });
  const [loading, setLoading] = useState(true);

  // Dictionary
  const [dictSearch, setDictSearch] = useState('');
  const [dictResult, setDictResult] = useState<DictionaryResult | null>(null);
  const [dictLoading, setDictLoading] = useState(false);
  const [showDict, setShowDict] = useState(false);
  const [addingWord, setAddingWord] = useState(false);
  const [pronouncingKey, setPronouncingKey] = useState<string | null>(null);

  // Add to Flashcard Deck
  const [showDeckPicker, setShowDeckPicker] = useState(false);
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [decksLoading, setDecksLoading] = useState(false);
  const [pendingWord, setPendingWord] = useState<DictionaryResult | null>(null);
  const [pendingVocabItem, setPendingVocabItem] = useState<VocabularyItem | null>(null);
  const [addingToDeck, setAddingToDeck] = useState<string | null>(null);

  // Word Detail
  const [selectedWord, setSelectedWord] = useState<VocabularyItem | null>(null);

  // Debounce search to prevent spamming the API on every keystroke
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());
  const pronunciationSoundRef = useRef<Audio.Sound | null>(null);

  const stopPronunciation = useCallback(async () => {
    Speech.stop();
    if (pronunciationSoundRef.current) {
      await pronunciationSoundRef.current.unloadAsync().catch(() => {});
      pronunciationSoundRef.current = null;
    }
    setPronouncingKey(null);
  }, []);

  useEffect(() => {
    return () => {
      stopPronunciation();
    };
  }, [stopPronunciation]);

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

  const loadWords = useCallback(async () => {
    try {
      const mastery = activeFilter === 'all' ? undefined : activeFilter;
      const result = await vocabularyAPI.list({
        mastery_level: mastery,
        search: debouncedSearch || undefined,
        per_page: 50,
      });
      setWords(result.items);
      setTotal(result.total);
      // Update count for current filter
      setCounts(prev => ({ ...prev, [activeFilter]: result.total }));
      // Load counts for all filters in background
      if (activeFilter === 'all' && !debouncedSearch) {
        const [newC, learningC, masteredC] = await Promise.allSettled([
          vocabularyAPI.list({ mastery_level: 'new', per_page: 1 }),
          vocabularyAPI.list({ mastery_level: 'learning', per_page: 1 }),
          vocabularyAPI.list({ mastery_level: 'mastered', per_page: 1 }),
        ]);
        setCounts({
          all: result.total,
          new: newC.status === 'fulfilled' ? newC.value.total : 0,
          learning: learningC.status === 'fulfilled' ? learningC.value.total : 0,
          mastered: masteredC.status === 'fulfilled' ? masteredC.value.total : 0,
        });
      }
    } catch {
      setWords([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [activeFilter, debouncedSearch]);

  useEffect(() => { loadWords(); }, [loadWords]);

  const lookupWord = async () => {
    if (!dictSearch.trim()) return;
    setDictLoading(true);
    try {
      const result = await vocabularyAPI.lookupDictionary(dictSearch.trim());
      setDictResult(result);
    } catch {
      showInfo('Not Found', `Could not find "${dictSearch}" in the dictionary.`);
      setDictResult(null);
    } finally {
      setDictLoading(false);
    }
  };

  const addToList = async () => {
    if (!dictResult) return;
    setAddingWord(true);
    try {
      const firstMeaning = dictResult.meanings?.[0];
      const firstDef = firstMeaning?.definitions?.[0];
      await vocabularyAPI.add({
        word: dictResult.word,
        phonetic: dictResult.phonetic || undefined,
        audio_url: dictResult.audio_url || undefined,
        definitions: dictResult.meanings?.flatMap(m =>
          m.definitions.map(d => ({ definition: d.definition, part_of_speech: m.part_of_speech }))
        ),
        examples: firstDef?.example ? [firstDef.example] : undefined,
      });
      showSuccess('Added!', `"${dictResult.word}" added to your vocabulary.`);
      setShowDict(false);
      setDictResult(null);
      setDictSearch('');
      loadWords();
    } catch (error: any) {
      const msg = error.response?.data?.detail || 'Failed to add word';
      showError('Error', typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setAddingWord(false);
    }
  };

  const closeDeckPicker = () => {
    setShowDeckPicker(false);
    setPendingWord(null);
    setPendingVocabItem(null);
  };

  const openDeckPicker = (word: DictionaryResult) => {
    Keyboard.dismiss();
    setPendingWord(word);
    setPendingVocabItem(null);
    setShowDict(false);
    setDictResult(null);
    setDictSearch('');
    setTimeout(() => setShowDeckPicker(true), 250);
    loadDecks();
  };

  const loadDecks = async () => {
    setDecksLoading(true);
    try {
      const result = await flashcardsAPI.listDecks();
      setDecks(result.items);
    } catch {
      setDecks([]);
    } finally {
      setDecksLoading(false);
    }
  };

  const addWordToDeck = async (deckId: string) => {
    const word = pendingWord || pendingVocabItem;
    if (!word) return;
    setAddingToDeck(deckId);
    try {
      let frontContent: string;
      let backContent: string;

      if ('meanings' in word) {
        // DictionaryResult
        frontContent = word.word;
        const meanings = word.meanings?.map(m =>
          `(${m.part_of_speech}) ${m.definitions.map(d => d.definition).join('; ')}`
        ).join('\n') || '';
        backContent = word.phonetic
          ? `${meanings}\n\n${word.phonetic}`
          : meanings;
      } else {
        // VocabularyItem
        frontContent = word.word;
        const defs = typeof word.definitions === 'string'
          ? word.definitions
          : Array.isArray(word.definitions)
            ? word.definitions.map((d: any) => `(${d.part_of_speech || ''}) ${d.definition}`).join('\n')
            : '';
        backContent = word.phonetic ? `${defs}\n\n${word.phonetic}` : defs;
      }

      await flashcardsAPI.addCard(deckId, {
        front_content: frontContent,
        back_content: backContent,
      });
      closeDeckPicker();
      showSuccess('Added to Deck!', `"${frontContent}" has been added to the flashcard deck.`);
    } catch (error: any) {
      const msg = error.response?.data?.detail || 'Failed to add card';
      showError('Error', typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setAddingToDeck(null);
    }
  };

  const handleChangeMastery = async (item: VocabularyItem, newLevel: 'new' | 'learning' | 'reviewing' | 'mastered') => {
    const oldLevel = item.mastery_level;
    
    // Optimistic UI update
    setWords(prev => {
      // If currently viewing a specific tab and changing to another, remove it from view
      if (activeFilter !== 'all' && newLevel !== activeFilter) {
        return prev.filter(w => w.id !== item.id);
      }
      return prev.map(w => w.id === item.id ? { ...w, mastery_level: newLevel } : w);
    });
    
    setCounts(prev => ({
      ...prev,
      [oldLevel]: Math.max(0, (prev[oldLevel] || 0) - 1),
      [newLevel]: (prev[newLevel] || 0) + 1,
    }));

    try {
      await vocabularyAPI.updateMastery(item.id, newLevel);
      swipeableRefs.current.get(item.id)?.close();
    } catch {
      showError('Error', 'Failed to update mastery level');
      // Revert optimistic update by reloading words
      loadWords();
    }
  };

  const handleAddVocabToDeck = (item: VocabularyItem) => {
    setPendingWord(null);
    setPendingVocabItem(item);
    setShowDeckPicker(true);
    loadDecks();
    swipeableRefs.current.get(item.id)?.close();
  };

  const MASTERY_OPTIONS: { level: 'new' | 'learning' | 'mastered'; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { level: 'new', label: 'New', icon: 'sparkles-outline' },
    { level: 'learning', label: 'Learning', icon: 'school-outline' },
    { level: 'mastered', label: 'Mastered', icon: 'checkmark-done-outline' },
  ];

  const renderRightActions = (item: VocabularyItem) => {
    return (
      <View style={styles.swipeActions}>
        {MASTERY_OPTIONS.filter(o => o.level !== item.mastery_level).map(opt => (
          <TouchableOpacity
            key={opt.level}
            style={[styles.swipeAction, { backgroundColor: MASTERY_COLORS[opt.level] }]}
            onPress={() => handleChangeMastery(item, opt.level)}
          >
            <Ionicons name={opt.icon} size={16} color="#fff" />
            <Text style={styles.swipeActionText}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.swipeAction, { backgroundColor: colors.accent }]}
          onPress={() => handleAddVocabToDeck(item)}
        >
          <Ionicons name="layers-outline" size={16} color="#fff" />
          <Text style={styles.swipeActionText}>Deck</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderWord = ({ item }: { item: VocabularyItem }) => (
    <Swipeable
      ref={ref => { if (ref) swipeableRefs.current.set(item.id, ref); }}
      renderRightActions={() => renderRightActions(item)}
      overshootRight={false}
    >
      <TouchableOpacity
        style={[styles.vocabItem, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
        activeOpacity={0.7}
        onPress={() => setSelectedWord(item)}
      >
        <View style={[styles.masteryBar, { backgroundColor: MASTERY_COLORS[item.mastery_level] || colors.sky }]} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.wordText, { color: colors.textPrimary }]}>{item.word}</Text>
          {item.phonetic && <Text style={[styles.phonetic, { color: colors.textMuted }]}>{item.phonetic}</Text>}
          <Text style={[styles.definition, { color: colors.textSecondary }]} numberOfLines={1}>
            {typeof item.definitions === 'string'
              ? item.definitions
              : Array.isArray(item.definitions)
                ? item.definitions[0]?.definition || ''
                : ''}
          </Text>
        </View>
        <View style={[styles.masteryChip, { backgroundColor: MASTERY_BACKGROUNDS[item.mastery_level] || colors.skyBg }]}>
          <Text style={[styles.masteryText, { color: MASTERY_COLORS[item.mastery_level] }]}>{item.mastery_level}</Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );

  return (
    <AppBackground>
    <SafeAreaView style={[styles.safe, { backgroundColor: 'transparent' }]}> 
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>My Vocabulary</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>{total} words</Text>
        </View>
        <TouchableOpacity
          style={[styles.dictBtn, { backgroundColor: colors.accent }]}
          onPress={() => setShowDict(true)}
        >
          <Ionicons name="search" size={16} color="#fff" />
          <Text style={styles.dictBtnText}>Dictionary</Text>
        </TouchableOpacity>
      </View>

      {/* Flashcard Banner */}
      <TouchableOpacity
        style={styles.flashcardBanner}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('FlashcardDecks')}
      >
        <LinearGradient
          colors={Gradients.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.flashcardBannerGradient}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.flashcardBannerTitle}>Flashcards</Text>
            <Text style={styles.flashcardBannerDesc}>Study with spaced repetition</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#1F2937" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Search */}
      <View style={[styles.searchBar, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          value={search}
          onChangeText={setSearch}
          placeholder="Search my words..."
          placeholderTextColor={colors.textMuted}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {FILTER_KEYS.map(key => {
          const label = key === 'all' ? 'All' : key.charAt(0).toUpperCase() + key.slice(1);
          const count = counts[key] || 0;
          const isActive = activeFilter === key;
          return (
            <TouchableOpacity
              key={key}
              style={[
                styles.filterTab,
                {
                  backgroundColor: isActive ? colors.accent : colors.bgCard,
                  borderColor: isActive ? colors.accent : colors.border,
                },
              ]}
              onPress={() => setActiveFilter(key)}
            >
              <Text style={[
                styles.filterText,
                { color: isActive ? '#fff' : colors.textSecondary },
              ]}>
                {label}{count > 0 ? ` ${count}` : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Word List */}
      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /></View>
      ) : (
        <FlatList
          data={words}
          keyExtractor={item => item.id}
          renderItem={renderWord}
          contentContainerStyle={{ gap: 6, paddingBottom: 100, paddingHorizontal: 20 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MascotIcon mood="jump" size={250} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No words yet. Use Dictionary to add words!
              </Text>
            </View>
          }
        />
      )}

      {/* Dictionary Modal */}
      <Modal visible={showDict} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgBody }]}> 
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Dictionary</Text>
            <TouchableOpacity onPress={() => { setShowDict(false); setDictResult(null); setDictSearch(''); }}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Dict search */}
          <View style={[styles.dictSearchRow, { paddingHorizontal: 20 }]}>
            <View style={[styles.searchBar, { backgroundColor: colors.bgCard, borderColor: colors.border, flex: 1 }]}>
              <Ionicons name="search" size={18} color={colors.textMuted} />
              <TextInput
                style={[styles.searchInput, { color: colors.textPrimary }]}
                value={dictSearch}
                onChangeText={setDictSearch}
                placeholder="Look up a word..."
                placeholderTextColor={colors.textMuted}
                onSubmitEditing={lookupWord}
                returnKeyType="search"
                autoFocus
              />
            </View>
            <TouchableOpacity style={[styles.lookupBtn, { backgroundColor: colors.accent }]} onPress={lookupWord}>
              {dictLoading ? <ActivityIndicator color="#fff" size="small" /> : <Ionicons name="arrow-forward" size={20} color="#fff" />}
            </TouchableOpacity>
          </View>

          {/* Dict result */}
          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
            {dictResult && (
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
                    onPress={() => playPronunciation(dictResult.word, dictResult.audio_url, `dict-${dictResult.word}`)}
                    disabled={pronouncingKey === `dict-${dictResult.word}`}
                  >
                    {pronouncingKey === `dict-${dictResult.word}` ? (
                      <ActivityIndicator size="small" color={colors.accent} />
                    ) : (
                      <Ionicons name="volume-high-outline" size={22} color={colors.accent} />
                    )}
                  </TouchableOpacity>
                </View>

                {dictResult.meanings?.map((meaning, mi) => (
                  <View key={mi} style={styles.meaningBlock}>
                    <Text style={[styles.pos, { color: colors.accent }]}>{meaning.part_of_speech}</Text>
                    {meaning.definitions.map((def, di) => (
                      <View key={di} style={styles.defRow}>
                        <Text style={[styles.defNum, { color: colors.textMuted }]}>{di + 1}.</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.defText, { color: colors.textPrimary }]}>{def.definition}</Text>
                          {def.example && (
                            <Text style={[styles.exampleText, { color: colors.textSecondary }]}>"{def.example}"</Text>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                ))}

                <TouchableOpacity
                  style={[styles.addBtn, { backgroundColor: colors.accent }]}
                  onPress={addToList}
                  disabled={addingWord}
                >
                  {addingWord ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="add" size={18} color="#fff" />
                      <Text style={styles.addBtnText}>Add to My List</Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* Add to Flashcard Deck Button */}
                <TouchableOpacity
                  style={[styles.addToDeckBtn, { borderColor: colors.accent }]}
                  onPress={() => openDeckPicker(dictResult)}
                >
                  <Ionicons name="layers-outline" size={18} color={colors.accent} />
                  <Text style={[styles.addToDeckBtnText, { color: colors.accent }]}>Add to Flashcard Deck</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Deck Picker Modal */}
      <Modal visible={showDeckPicker} animationType="slide" transparent>
        <View style={styles.deckPickerOverlay}>
          <View style={[styles.deckPickerCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <View style={styles.deckPickerHeader}>
              <Text style={[styles.deckPickerTitle, { color: colors.textPrimary }]}>Choose a Deck</Text>
              <TouchableOpacity onPress={closeDeckPicker}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            {(pendingWord || pendingVocabItem) && (
              <Text style={[styles.deckPickerSubtitle, { color: colors.textSecondary }]}>
                Adding "{(pendingWord || pendingVocabItem)?.word}" to a flashcard deck
              </Text>
            )}
            {decksLoading ? (
              <ActivityIndicator size="large" color={colors.accent} style={{ marginVertical: 40 }} />
            ) : decks.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <MascotIcon mood="idle" size={40} />
                <Text style={[{ color: colors.textSecondary, fontFamily: 'PlusJakartaSans-Regular', fontSize: 14, textAlign: 'center' }]}>
                  No decks yet. Create a deck first in Flashcards.
                </Text>
              </View>
            ) : (
              <FlatList
                data={decks}
                keyExtractor={item => item.id}
                style={{ maxHeight: 300 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.deckPickerItem, { borderColor: colors.border }]}
                    onPress={() => addWordToDeck(item.id)}
                    disabled={addingToDeck !== null}
                  >
                    <View style={[styles.deckPickerItemIcon, { backgroundColor: colors.accentBg }]}>
                      <Ionicons name="layers" size={20} color={colors.accent} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.deckPickerItemTitle, { color: colors.textPrimary }]}>{item.title}</Text>
                      <Text style={[styles.deckPickerItemCount, { color: colors.textMuted }]}>{item.card_count} cards</Text>
                    </View>
                    {addingToDeck === item.id ? (
                      <ActivityIndicator size="small" color={colors.accent} />
                    ) : (
                      <Ionicons name="add-circle-outline" size={22} color={colors.accent} />
                    )}
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Word Detail Modal */}
      <Modal visible={!!selectedWord} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgBody }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Word Details</Text>
            <TouchableOpacity onPress={() => setSelectedWord(null)}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
            {selectedWord && (
              <View style={[styles.dictCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
                <View style={styles.dictWordRow}>
                  <View style={styles.dictWordInfo}>
                    <Text style={[styles.dictWord, { color: colors.textPrimary }]}>{selectedWord.word}</Text>
                    {selectedWord.phonetic && (
                      <Text style={[styles.dictPhonetic, { color: colors.accent }]}>{selectedWord.phonetic}</Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={[styles.pronounceBtn, { backgroundColor: colors.accentBg }]}
                    onPress={() => playPronunciation(selectedWord.word, selectedWord.audio_url, `saved-${selectedWord.id}`)}
                    disabled={pronouncingKey === `saved-${selectedWord.id}`}
                  >
                    {pronouncingKey === `saved-${selectedWord.id}` ? (
                      <ActivityIndicator size="small" color={colors.accent} />
                    ) : (
                      <Ionicons name="volume-high-outline" size={22} color={colors.accent} />
                    )}
                  </TouchableOpacity>
                </View>

                <View style={styles.meaningBlock}>
                  {typeof selectedWord.definitions === 'string' ? (
                    <Text style={[styles.defText, { color: colors.textPrimary, marginBottom: 8 }]}>{selectedWord.definitions}</Text>
                  ) : Array.isArray(selectedWord.definitions) ? (
                    selectedWord.definitions.map((def: any, idx: number) => (
                      <View key={idx} style={{ marginBottom: 12 }}>
                        {def.part_of_speech && (
                          <Text style={[styles.pos, { color: colors.accent }]}>{def.part_of_speech}</Text>
                        )}
                        <View style={styles.defRow}>
                          <Text style={[styles.defNum, { color: colors.textMuted }]}>{idx + 1}.</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.defText, { color: colors.textPrimary }]}>{def.definition}</Text>
                          </View>
                        </View>
                      </View>
                    ))
                  ) : null}

                  {selectedWord.examples && selectedWord.examples.length > 0 && (
                    <View style={{ marginTop: 10 }}>
                      <Text style={[styles.pos, { color: colors.textSecondary, marginBottom: 4, fontStyle: 'normal' }]}>Examples:</Text>
                      {selectedWord.examples.map((ex: string, idx: number) => (
                        <Text key={idx} style={[styles.exampleText, { color: colors.textSecondary, marginBottom: 4 }]}>• "{ex}"</Text>
                      ))}
                    </View>
                  )}
                  
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 8 }}>
                    <Text style={[styles.pos, { color: colors.textSecondary, marginBottom: 0, fontStyle: 'normal' }]}>Mastery:</Text>
                    <View style={[styles.masteryChip, { backgroundColor: MASTERY_BACKGROUNDS[selectedWord.mastery_level] || colors.skyBg, alignSelf: 'flex-start' }]}>
                      <Text style={[styles.masteryText, { color: MASTERY_COLORS[selectedWord.mastery_level] }]}>{selectedWord.mastery_level}</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* App Modal */}
      <AppModal config={modal} onDismiss={hideModal} />
    </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14 },
  title: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 24 },
  subtitle: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 13, marginTop: 2 },
  dictBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  flashcardBanner: { marginHorizontal: 20, borderRadius: 14, overflow: 'hidden', marginBottom: 14 },
  flashcardBannerGradient: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingVertical: 18, borderRadius: 14 },
  flashcardBannerTitle: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 15, color: '#1F2937', marginBottom: 2 },
  flashcardBannerDesc: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 11, color: '#475569' },
  dictBtnText: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 13, color: '#1F2937' },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, paddingHorizontal: 14, borderWidth: 1, marginHorizontal: 20, marginBottom: 14 },
  searchInput: { flex: 1, paddingVertical: 12, fontFamily: 'PlusJakartaSans-Regular', fontSize: 14 },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 14,
    height: 38,
    alignItems: 'center',
  },
  filterTab: {
    paddingVertical: 0,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterText: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 12, includeFontPadding: false },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  vocabItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 17, borderRadius: 12, borderWidth: 1 },
  masteryBar: { width: 5, height: 38, borderRadius: 3 },
  wordText: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 15 },
  phonetic: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 12, marginTop: 1 },
  definition: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 13, marginTop: 2 },
  masteryChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  masteryText: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 10, textTransform: 'capitalize' },
  empty: { alignItems: 'center', paddingTop: 54 },
  emptyText: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 14, marginTop: 8, textAlign: 'center' },
  // Modal
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
  modalTitle: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 22 },
  dictSearchRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  lookupBtn: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  dictCard: { borderRadius: 16, borderWidth: 1, padding: 20 },
  dictWordRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  dictWordInfo: { flex: 1 },
  dictWord: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 28 },
  dictPhonetic: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 16, marginTop: 4 },
  pronounceBtn: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  meaningBlock: { marginBottom: 16 },
  pos: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 14, fontStyle: 'italic', marginBottom: 8 },
  defRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  defNum: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 13, width: 18 },
  defText: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 14, lineHeight: 20 },
  exampleText: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 13, fontStyle: 'italic', marginTop: 4, lineHeight: 18 },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 48, borderRadius: 24, marginTop: 16 },
  addBtnText: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 15, color: '#1F2937' },
  addToDeckBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 48, borderRadius: 24, marginTop: 10, borderWidth: 1.5 },
  addToDeckBtnText: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 15 },
  // Deck Picker
  deckPickerOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#111827' },
  deckPickerCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, padding: 24, paddingBottom: 40 },
  deckPickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  deckPickerTitle: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 20 },
  deckPickerSubtitle: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 13, marginBottom: 20 },
  deckPickerItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, borderBottomWidth: 1 },
  deckPickerItemIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  deckPickerItemTitle: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 15 },
  deckPickerItemCount: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 12, marginTop: 2 },
  // Swipe Actions
  swipeActions: { flexDirection: 'row', alignItems: 'stretch' },
  swipeAction: {
    justifyContent: 'center', alignItems: 'center',
    width: 64, paddingHorizontal: 4,
  },
  swipeActionText: {
    fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 9,
    color: '#fff', marginTop: 4, textAlign: 'center',
  },
});
