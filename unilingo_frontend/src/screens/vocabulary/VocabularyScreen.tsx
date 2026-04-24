/**
 * VocabularyScreen — Word list + Dictionary search + filter
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/themeStore';
import { vocabularyAPI, VocabularyItem, DictionaryResult } from '../../api/vocabulary';
import { Gradients } from '../../theme';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'learning', label: 'Learning' },
  { key: 'mastered', label: 'Mastered' },
];

const MASTERY_COLORS: Record<string, string> = {
  new: '#0EA5E9',
  learning: '#F59E0B',
  reviewing: '#F59E0B',
  mastered: '#10B981',
};

export default function VocabularyScreen({ navigation }: any) {
  const { colors } = useThemeStore();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [words, setWords] = useState<VocabularyItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Dictionary
  const [dictSearch, setDictSearch] = useState('');
  const [dictResult, setDictResult] = useState<DictionaryResult | null>(null);
  const [dictLoading, setDictLoading] = useState(false);
  const [showDict, setShowDict] = useState(false);
  const [addingWord, setAddingWord] = useState(false);

  const loadWords = useCallback(async () => {
    try {
      const mastery = activeFilter === 'all' ? undefined : activeFilter;
      const result = await vocabularyAPI.list({
        mastery_level: mastery,
        search: search || undefined,
        per_page: 50,
      });
      setWords(result.items);
      setTotal(result.total);
    } catch {
      setWords([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [activeFilter, search]);

  useEffect(() => { loadWords(); }, [loadWords]);

  const lookupWord = async () => {
    if (!dictSearch.trim()) return;
    setDictLoading(true);
    try {
      const result = await vocabularyAPI.lookupDictionary(dictSearch.trim());
      setDictResult(result);
    } catch {
      Alert.alert('Not Found', `Could not find "${dictSearch}" in the dictionary.`);
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
      Alert.alert('Added!', `"${dictResult.word}" added to your vocabulary.`);
      setShowDict(false);
      setDictResult(null);
      setDictSearch('');
      loadWords();
    } catch (error: any) {
      const msg = error.response?.data?.detail || 'Failed to add word';
      Alert.alert('Error', typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setAddingWord(false);
    }
  };

  const renderWord = ({ item }: { item: VocabularyItem }) => (
    <View style={[styles.vocabItem, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
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
      <View style={[styles.masteryChip, { backgroundColor: MASTERY_COLORS[item.mastery_level] + '20' }]}>
        <Text style={[styles.masteryText, { color: MASTERY_COLORS[item.mastery_level] }]}>{item.mastery_level}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgBody }]}>
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
          <View style={styles.flashcardBannerIcon}>
            <Text style={{ fontSize: 22 }}>🃏</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.flashcardBannerTitle}>Flashcards</Text>
            <Text style={styles.flashcardBannerDesc}>Study with spaced repetition</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
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

      {/* Filter Tabs - FIXED */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterTab,
              {
                backgroundColor: activeFilter === f.key ? colors.accent : colors.bgCard,
                borderColor: activeFilter === f.key ? colors.accent : colors.border,
              },
            ]}
            onPress={() => setActiveFilter(f.key)}
          >
            <Text style={[
              styles.filterText,
              { color: activeFilter === f.key ? '#fff' : colors.textSecondary },
            ]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

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
              <Text style={{ fontSize: 40 }}>📝</Text>
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
                  <Text style={[styles.dictWord, { color: colors.textPrimary }]}>{dictResult.word}</Text>
                  {dictResult.phonetic && (
                    <Text style={[styles.dictPhonetic, { color: colors.accent }]}>{dictResult.phonetic}</Text>
                  )}
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
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14 },
  title: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 24 },
  subtitle: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 13, marginTop: 2 },
  dictBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  flashcardBanner: { marginHorizontal: 20, borderRadius: 14, overflow: 'hidden', marginBottom: 14 },
  flashcardBannerGradient: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14 },
  flashcardBannerIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  flashcardBannerTitle: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 15, color: '#fff', marginBottom: 2 },
  flashcardBannerDesc: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 11, color: 'rgba(255,255,255,0.75)' },
  dictBtnText: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 13, color: '#fff' },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, paddingHorizontal: 14, borderWidth: 1, marginHorizontal: 20, marginBottom: 14 },
  searchInput: { flex: 1, paddingVertical: 12, fontFamily: 'PlusJakartaSans-Regular', fontSize: 14 },
  filterRow: { gap: 8, paddingHorizontal: 20, marginBottom: 14 },
  filterTab: { paddingVertical: 8, paddingHorizontal: 18, borderRadius: 999, borderWidth: 1 },
  filterText: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 13 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  vocabItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, borderWidth: 1 },
  masteryBar: { width: 5, height: 38, borderRadius: 3 },
  wordText: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 15 },
  phonetic: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 12, marginTop: 1 },
  definition: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 13, marginTop: 2 },
  masteryChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  masteryText: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 10, textTransform: 'capitalize' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 14, marginTop: 12, textAlign: 'center' },
  // Modal
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
  modalTitle: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 22 },
  dictSearchRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  lookupBtn: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  dictCard: { borderRadius: 16, borderWidth: 1, padding: 20 },
  dictWordRow: { marginBottom: 16 },
  dictWord: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 28 },
  dictPhonetic: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 16, marginTop: 4 },
  meaningBlock: { marginBottom: 16 },
  pos: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 14, fontStyle: 'italic', marginBottom: 8 },
  defRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  defNum: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 13, width: 18 },
  defText: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 14, lineHeight: 20 },
  exampleText: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 13, fontStyle: 'italic', marginTop: 4, lineHeight: 18 },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 48, borderRadius: 24, marginTop: 16 },
  addBtnText: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 15, color: '#fff' },
});
