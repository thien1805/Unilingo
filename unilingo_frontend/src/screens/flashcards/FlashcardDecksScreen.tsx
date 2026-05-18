/**
 * FlashcardDecksScreen — My flashcard decks
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TextInput,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/themeStore';
import { flashcardsAPI, FlashcardDeck } from '../../api/flashcards';
import { AppModal, useAppModal } from '../../components/common/AppModal';
import AppBackground from '../../components/common/AppBackground';
import MascotIcon from '../../components/common/MascotIcon';

export default function FlashcardDecksScreen({ navigation }: any) {
  const { colors } = useThemeStore();
  const { modal, hideModal, showError, showConfirm } = useAppModal();
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadDecks = useCallback(async () => {
    try {
      setLoadError(null);
      const result = await flashcardsAPI.listDecks();
      setDecks(result.items);
    } catch (error: any) {
      setDecks([]);
      setLoadError(error.response?.data?.detail || 'Could not load flashcard decks.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDecks(); }, [loadDecks]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDecks();
    setRefreshing(false);
  }, [loadDecks]);

  const handleCreate = async () => {
    if (!newTitle.trim()) {
      showError('Error', 'Please enter a deck title');
      return;
    }
    setCreating(true);
    try {
      const deck = await flashcardsAPI.createDeck({
        title: newTitle.trim(),
        description: newDesc.trim() || undefined,
      });
      setDecks(prev => [deck, ...prev]);
      setShowCreate(false);
      setNewTitle('');
      setNewDesc('');
    } catch (error: any) {
      const msg = error.response?.data?.detail || 'Failed to create deck';
      showError('Error', typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setCreating(false);
    }
  };


  const handleDelete = (deck: FlashcardDeck) => {
    showConfirm(
      'Delete Deck',
      `Delete "${deck.title}"? This cannot be undone.`,
      async () => {
        try {
          await flashcardsAPI.deleteDeck(deck.id);
          setDecks(prev => prev.filter(d => d.id !== deck.id));
        } catch {
          showError('Error', 'Failed to delete deck');
        }
      },
      { confirmText: 'Delete', destructive: true }
    );
  };

  const renderDeck = ({ item }: { item: FlashcardDeck; index: number }) => (
    <TouchableOpacity
      style={[styles.deckCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('FlashcardDeckDetail', {
        deckId: item.id,
        deckTitle: item.title,
      })}
      onLongPress={() => handleDelete(item)}
    >
      <View style={[styles.deckIcon, { backgroundColor: colors.accentBg }]}>
        <MascotIcon mood="idle" size={34} />
      </View>
      <Text style={[styles.deckTitle, { color: colors.textPrimary }]} numberOfLines={2}>
        {item.title}
      </Text>
      {item.description && (
        <Text style={[styles.deckDesc, { color: colors.textMuted }]} numberOfLines={1}>
          {item.description}
        </Text>
      )}
      <View style={styles.deckFooter}>
        <View style={[styles.cardCount, { backgroundColor: colors.bgSecondary }]}>
          <Ionicons name="layers-outline" size={12} color={colors.accent} />
          <Text style={[styles.cardCountText, { color: colors.accent }]}>
            {item.card_count} cards
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <AppBackground>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backBtn, { borderColor: colors.border }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Flashcards</Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.accent }]}
          onPress={() => setShowCreate(true)}
        >
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
        </View>


        {/* Deck Grid */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : (
          <FlatList
            data={decks}
            renderItem={renderDeck}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.grid}
            columnWrapperStyle={styles.gridRow}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
            }
            ListEmptyComponent={
              <View style={styles.empty}>
                <MascotIcon mood="confused" size={52} />
                <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                  {loadError ? 'Decks unavailable' : 'No decks yet'}
                </Text>
                <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
                  {loadError || 'Create a new deck or auto-generate from vocabulary'}
                </Text>
                {loadError && (
                  <TouchableOpacity style={[styles.retryBtn, { borderColor: colors.border }]} onPress={loadDecks}>
                    <Text style={[styles.retryText, { color: colors.accent }]}>Retry</Text>
                  </TouchableOpacity>
                )}
              </View>
            }
          />
        )}

        {/* Create Deck Modal */}
        <Modal visible={showCreate} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>New Deck</Text>
              <TouchableOpacity onPress={() => setShowCreate(false)}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={[styles.modalInput, { backgroundColor: colors.bgInput, borderColor: colors.border }]}>
              <Ionicons name="layers-outline" size={18} color={colors.textMuted} />
              <TextInput
                style={[styles.modalInputText, { color: colors.textPrimary }]}
                placeholder="Deck title"
                placeholderTextColor={colors.textMuted}
                value={newTitle}
                onChangeText={setNewTitle}
                autoFocus
              />
            </View>

            <View style={[styles.modalInput, { backgroundColor: colors.bgInput, borderColor: colors.border }]}>
              <Ionicons name="document-text-outline" size={18} color={colors.textMuted} />
              <TextInput
                style={[styles.modalInputText, { color: colors.textPrimary }]}
                placeholder="Description (optional)"
                placeholderTextColor={colors.textMuted}
                value={newDesc}
                onChangeText={setNewDesc}
              />
            </View>

            <TouchableOpacity
              style={[styles.createBtn, { backgroundColor: colors.accent }]}
              onPress={handleCreate}
              disabled={creating}
            >
              {creating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.createBtnText}>Create Deck</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
        </Modal>

        {/* App Modal */}
        <AppModal config={modal} onDismiss={hideModal} />
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  title: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 22 },
  addBtn: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
  },
  autoBanner: { marginHorizontal: 20, borderRadius: 16, overflow: 'hidden', marginBottom: 16, borderWidth: 0 },
  autoBannerGradient: { borderRadius: 16, padding: 18 },
  autoBannerContent: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  autoBannerIcon: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#FFF7D6',
    alignItems: 'center', justifyContent: 'center',
  },
  autoBannerTitle: {
    fontFamily: 'PlusJakartaSans-Bold', fontSize: 16, color: '#1F2937', marginBottom: 3,
  },
  autoBannerDesc: {
    fontFamily: 'PlusJakartaSans-Regular', fontSize: 12, color: '#475569',
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  grid: { paddingHorizontal: 20, paddingBottom: 100, gap: 12 },
  gridRow: { gap: 12 },
  deckCard: {
    flex: 1, padding: 16, borderRadius: 16, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  deckIcon: {
    width: 56, height: 56, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  deckTitle: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 15, marginBottom: 4 },
  deckDesc: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 12, marginBottom: 10 },
  deckFooter: { marginTop: 'auto' },
  cardCount: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, alignSelf: 'flex-start',
  },
  cardCountText: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 11 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 20, marginBottom: 8 },
  emptyDesc: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  retryBtn: { marginTop: 14, borderWidth: 1, borderRadius: 18, paddingHorizontal: 18, paddingVertical: 9 },
  retryText: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 13 },
  // Modal
  modalOverlay: {
    flex: 1, justifyContent: 'flex-end',
    backgroundColor: '#111827',
  },
  modalCard: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderWidth: 1, padding: 24, paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 20 },
  modalInput: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: 14, borderWidth: 1, paddingHorizontal: 16,
    marginBottom: 14,
  },
  modalInputText: {
    flex: 1, fontFamily: 'PlusJakartaSans-Regular', fontSize: 15,
    paddingVertical: 14,
  },
  createBtn: {
    height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center',
    marginTop: 8,
  },
  createBtnText: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 16, color: '#1F2937' },
});
