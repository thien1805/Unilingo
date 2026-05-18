/**
 * FlashcardDeckDetailScreen — View cards in a deck + manually add new cards
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
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/themeStore';
import { flashcardsAPI, FlashcardCard, FlashcardDeck } from '../../api/flashcards';
import { Gradients } from '../../theme';
import { AppModal, useAppModal } from '../../components/common/AppModal';
import AppBackground from '../../components/common/AppBackground';
import MascotIcon from '../../components/common/MascotIcon';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function FlashcardDeckDetailScreen({ navigation, route }: any) {
  const { deckId, deckTitle } = route.params;
  const { colors } = useThemeStore();
  const { modal, hideModal, showError, showSuccess, showConfirm } = useAppModal();

  const [cards, setCards] = useState<FlashcardCard[]>([]);
  const [deck, setDeck] = useState<FlashcardDeck | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Add Card modal
  const [showAddCard, setShowAddCard] = useState(false);
  const [frontContent, setFrontContent] = useState('');
  const [backContent, setBackContent] = useState('');
  const [adding, setAdding] = useState(false);

  const loadDeckDetail = useCallback(async () => {
    try {
      const result = await flashcardsAPI.getDeckDetail(deckId);
      setDeck(result.deck);
      setCards(result.cards);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  }, [deckId]);

  useEffect(() => { loadDeckDetail(); }, [loadDeckDetail]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDeckDetail();
    setRefreshing(false);
  }, [loadDeckDetail]);

  const handleAddCard = async () => {
    if (!frontContent.trim()) {
      showError('Error', 'Please enter the front content (word)');
      return;
    }
    if (!backContent.trim()) {
      showError('Error', 'Please enter the back content (meaning)');
      return;
    }
    setAdding(true);
    try {
      const newCard = await flashcardsAPI.addCard(deckId, {
        front_content: frontContent.trim(),
        back_content: backContent.trim(),
      });
      setCards(prev => [...prev, newCard]);
      setFrontContent('');
      setBackContent('');
      setShowAddCard(false);
      showSuccess('Added!', `"${newCard.front_content}" has been added to this deck.`);
    } catch (error: any) {
      const msg = error.response?.data?.detail || 'Failed to add card';
      showError('Error', typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteCard = (card: FlashcardCard) => {
    showConfirm(
      'Delete Card',
      `Delete "${card.front_content}"? This cannot be undone.`,
      async () => {
        try {
          await flashcardsAPI.deleteCard(card.id);
          setCards(prev => prev.filter(c => c.id !== card.id));
        } catch {
          showError('Error', 'Failed to delete card');
        }
      },
      { confirmText: 'Delete', destructive: true }
    );
  };

  const renderCard = ({ item, index }: { item: FlashcardCard; index: number }) => (
    <TouchableOpacity
      style={[styles.cardItem, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
      activeOpacity={0.8}
      onLongPress={() => handleDeleteCard(item)}
    >
      <View style={styles.cardItemLeft}>
        <View style={[styles.cardIndex, { backgroundColor: colors.accentBg }]}>
          <Text style={[styles.cardIndexText, { color: colors.accent }]}>{index + 1}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardFront, { color: colors.textPrimary }]} numberOfLines={1}>
            {item.front_content}
          </Text>
          <Text style={[styles.cardBack, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.back_content}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
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
        <View style={{ flex: 1, marginHorizontal: 12 }}>
          <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
            {deckTitle || 'Deck'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {cards.length} card{cards.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.accent }]}
          onPress={() => setShowAddCard(true)}
        >
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
        </View>

        {/* Study Button Banner */}
        {cards.length > 0 && (
          <TouchableOpacity
            style={styles.studyBanner}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('FlashcardStudy', { deckId, deckTitle })}
          >
            <LinearGradient
              colors={Gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.studyBannerGradient}
            >
              <View style={styles.studyBannerContent}>
                <View style={styles.studyBannerIcon}>
                  <Ionicons name="play" size={24} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.studyBannerTitle}>Start Studying</Text>
                  <Text style={styles.studyBannerDesc}>
                    Swipe cards to learn • {cards.length} cards ready
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#1F2937" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Cards List */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : (
          <FlatList
            data={cards}
            renderItem={renderCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
            }
            ListEmptyComponent={
              <View style={styles.empty}>
                <MascotIcon mood="idle" size={52} />
                <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                  No cards yet
                </Text>
                <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
                  Tap the + button to add your first flashcard
                </Text>
                <TouchableOpacity
                  style={[styles.emptyBtn, { backgroundColor: colors.accent }]}
                  onPress={() => setShowAddCard(true)}
                >
                  <Ionicons name="add" size={18} color="#fff" />
                  <Text style={styles.emptyBtnText}>Add Card</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}

        {/* Add Card Modal */}
        <Modal visible={showAddCard} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Add New Card</Text>
              <TouchableOpacity onPress={() => { setShowAddCard(false); setFrontContent(''); setBackContent(''); }}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Front (Word / Phrase)</Text>
            <View style={[styles.modalInput, { backgroundColor: colors.bgInput, borderColor: colors.border }]}>
              <Ionicons name="text-outline" size={18} color={colors.textMuted} />
              <TextInput
                style={[styles.modalInputText, { color: colors.textPrimary }]}
                placeholder="e.g. sustainable"
                placeholderTextColor={colors.textMuted}
                value={frontContent}
                onChangeText={setFrontContent}
                autoFocus
              />
            </View>

            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Back (Meaning / Definition)</Text>
            <View style={[styles.modalInput, styles.modalInputMultiline, { backgroundColor: colors.bgInput, borderColor: colors.border }]}>
              <Ionicons name="document-text-outline" size={18} color={colors.textMuted} style={{ marginTop: 14 }} />
              <TextInput
                style={[styles.modalInputText, { color: colors.textPrimary }]}
                placeholder="e.g. able to be maintained at a certain rate"
                placeholderTextColor={colors.textMuted}
                value={backContent}
                onChangeText={setBackContent}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={[styles.addCardBtn, { backgroundColor: colors.accent }]}
              onPress={handleAddCard}
              disabled={adding}
            >
              {adding ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="add-circle-outline" size={20} color="#fff" />
                  <Text style={styles.addCardBtnText}>Add Card</Text>
                </>
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
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  title: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 20 },
  subtitle: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 12, marginTop: 2 },
  addBtn: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
  },
  studyBanner: { marginHorizontal: 20, borderRadius: 16, overflow: 'hidden', marginBottom: 16 },
  studyBannerGradient: { borderRadius: 16, padding: 18 },
  studyBannerContent: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  studyBannerIcon: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#FFF7D6',
    alignItems: 'center', justifyContent: 'center',
  },
  studyBannerTitle: {
    fontFamily: 'PlusJakartaSans-Bold', fontSize: 16, color: '#1F2937', marginBottom: 3,
  },
  studyBannerDesc: {
    fontFamily: 'PlusJakartaSans-Regular', fontSize: 12, color: '#475569',
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  cardItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderRadius: 14, borderWidth: 1, marginBottom: 10,
  },
  cardItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  cardIndex: {
    width: 32, height: 32, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  cardIndexText: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 13 },
  cardFront: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 15, marginBottom: 2 },
  cardBack: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 12, lineHeight: 18 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 20, marginBottom: 8 },
  emptyDesc: {
    fontFamily: 'PlusJakartaSans-Regular', fontSize: 14,
    textAlign: 'center', lineHeight: 20, marginBottom: 24, paddingHorizontal: 20,
  },
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 24, paddingVertical: 14, borderRadius: 999,
  },
  emptyBtnText: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 15, color: '#1F2937' },
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
    marginBottom: 20,
  },
  modalTitle: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 20 },
  fieldLabel: {
    fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 13, marginBottom: 8, marginLeft: 4,
  },
  modalInput: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: 14, borderWidth: 1, paddingHorizontal: 16,
    marginBottom: 16,
  },
  modalInputMultiline: {
    alignItems: 'flex-start', minHeight: 80,
  },
  modalInputText: {
    flex: 1, fontFamily: 'PlusJakartaSans-Regular', fontSize: 15,
    paddingVertical: 14,
  },
  addCardBtn: {
    height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center',
    marginTop: 8, flexDirection: 'row', gap: 8,
  },
  addCardBtnText: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 16, color: '#1F2937' },
});
