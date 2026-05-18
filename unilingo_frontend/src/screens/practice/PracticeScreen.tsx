/**
 * Practice Screen — Part selector + Topic grid
 */
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../../store/themeStore';
import { topicsAPI, Topic } from '../../api/topics';
import { Card, Badge, SectionTitle, Mascot } from '../../components/common';
import AppBackground from '../../components/common/AppBackground';
import { Gradients, Typography, Spacing, BorderRadius } from '../../theme';

import { SafeAreaView } from 'react-native-safe-area-context';

const PARTS = [
  { key: 'part1', label: 'Part 1 - Interview', desc: 'Familiar topics about yourself, work, studies, and interests', emoji: '💬', time: '4-5 mins', bgKey: 'accentBg', colorKey: 'accent' },
  { key: 'part2', label: 'Part 2 - Long Turn', desc: 'Speak for 1-2 minutes on a given cue card topic', emoji: '🎤', time: '3-4 mins', bgKey: 'roseBg', colorKey: 'rose' },
  { key: 'part3', label: 'Part 3 - Discussion', desc: 'Abstract questions linked to Part 2 topic', emoji: '🗣️', time: '4-5 mins', bgKey: 'skyBg', colorKey: 'sky' },
];

const TOPIC_ICONS: Record<string, string> = {
  'work': '💼', 'hometown': '🏘️', 'hobbies': '🎨', 'technology': '📱',
  'food': '🍕', 'travel': '✈️', 'environment': '🌍', 'education': '🎓',
  'health': '🏥', 'sports': '⚽', 'family': '👨‍👩‍👧', 'culture': '🎭',
};

export default function PracticeScreen({ navigation, route }: any) {
  const { colors } = useThemeStore();
  const [selectedPart, setSelectedPart] = useState<string | null>(route?.params?.selectedPart || null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicError, setTopicError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedPart) {
      loadTopics(selectedPart);
    }
  }, [selectedPart]);

  const loadTopics = async (part: string) => {
    try {
      setTopicError(null);
      const result = await topicsAPI.list({ ielts_part: part });
      setTopics(result.items);
    } catch {
      setTopics([]);
      setTopicError('Topics could not be loaded. Please check the backend CMS content.');
    }
  };

  const getTopicIcon = (title: string) => {
    const key = Object.keys(TOPIC_ICONS).find((k) =>
      title.toLowerCase().includes(k)
    );
    return TOPIC_ICONS[key || ''] || '📝';
  };

  return (
    <AppBackground>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
        <ScrollView
          style={[styles.container, { backgroundColor: 'transparent' }]}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
        <View style={styles.topBar}>
          <View>
            <Text style={[Typography.h2, { color: colors.textPrimary }]}>Practice</Text>
            <Text style={[Typography.caption, { color: colors.textMuted }]}>
              Choose a speaking mode and start when you are ready.
            </Text>
          </View>
          <Mascot mood="idle" size={86} animated />
        </View>

        {/* IELTS Speaking Mock Test */}
        <SectionTitle title="IELTS Speaking Mock Test" />
        <TouchableOpacity
          style={[
            styles.mockTestCard,
            { backgroundColor: colors.bgCard, borderColor: colors.border },
          ]}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('MockTestIntro')}
        >
          <LinearGradient colors={Gradients.primary} style={styles.mockIcon}>
            <Ionicons name="videocam" size={24} color="#1F2937" />
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <View style={styles.mockTitleRow}>
              <Text style={[Typography.h4, { color: colors.textPrimary, flex: 1 }]}>
                IELTS Speaking Mock Test
              </Text>
              <View style={[styles.hardcoreBadge, { backgroundColor: colors.errorBg }]}>
                <Text style={[styles.hardcoreText, { color: colors.error }]}>Hardcore</Text>
              </View>
            </View>
            <Text style={[Typography.caption, { color: colors.textSecondary, lineHeight: 18 }]}>
              Complete Part 1, Part 2, and Part 3 with camera and microphone simulation.
            </Text>
            <View style={styles.partMeta}>
              <Text style={[Typography.captionSm, { color: colors.textMuted }]}>
                🎥 Camera + mic
              </Text>
              <Text style={[Typography.captionSm, { color: colors.textMuted }]}>
                ⏱️ Full 3-part test
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Virtual Room - Full Test */}
        <SectionTitle title="Mock Test (Virtual Room)" />
        <TouchableOpacity
          style={[
            styles.partCard,
            { backgroundColor: colors.bgCard, borderColor: colors.border, marginBottom: 20 },
          ]}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('VirtualRoom', { isFullTest: true })}
        >
          <View style={[styles.partIcon, { backgroundColor: colors.accentBg }]}>
            <Text style={{ fontSize: 24 }}>🎓</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[Typography.h4, { color: colors.textPrimary, marginBottom: 3 }]}>Full IELTS Speaking Test</Text>
            <Text style={[Typography.caption, { color: colors.textSecondary, lineHeight: 18 }]}>Practice all 3 parts consecutively in a simulated exam environment.</Text>
            <View style={styles.partMeta}>
              <Text style={[Typography.captionSm, { color: colors.textMuted }]}>⏱️ 11-14 mins</Text>
            </View>
          </View>
        </TouchableOpacity>

        <SectionTitle title="Choose a Part" />
      <View style={styles.partCards}>
        {PARTS.map((part) => (
          <TouchableOpacity
            key={part.key}
            style={[
              styles.partCard,
              {
                backgroundColor: colors.bgCard,
                borderColor: selectedPart === part.key ? colors.accent : colors.border,
              },
            ]}
            activeOpacity={0.7}
            onPress={() => setSelectedPart(part.key)}
          >
            <View
              style={[
                styles.partIcon,
                { backgroundColor: (colors as any)[part.bgKey] },
              ]}
            >
              <Text style={{ fontSize: 24 }}>{part.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[Typography.h4, { color: colors.textPrimary, marginBottom: 3 }]}>
                {part.label}
              </Text>
              <Text style={[Typography.caption, { color: colors.textSecondary, lineHeight: 18 }]}>
                {part.desc}
              </Text>
              <View style={styles.partMeta}>
                <Text style={[Typography.captionSm, { color: colors.textMuted }]}>
                  ⏱️ {part.time}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Topic Grid */}
      {selectedPart && (
        <>
          <SectionTitle
            title={`${selectedPart.replace('part', 'Part ')} Topics`}
          />
          <View style={styles.topicGrid}>
            {topics.map(
              (topic, i) => (
                <TouchableOpacity
                  key={topic.id || i}
                  style={[
                    styles.topicCard,
                    { backgroundColor: colors.bgCard, borderColor: colors.border },
                  ]}
                  activeOpacity={0.7}
                  onPress={() =>
                    navigation.navigate('VirtualRoom', {
                      topicId: topic.id,
                      topicTitle: topic.title,
                      ieltsPart: selectedPart,
                    })
                  }
                >
                  <Text style={{ fontSize: 28, marginBottom: 8 }}>{getTopicIcon(topic.title)}</Text>
                  <Text style={[Typography.bodyMedium, { color: colors.textPrimary, marginBottom: 3 }]}>
                    {topic.title}
                  </Text>
                  <Text style={[Typography.captionSm, { color: colors.textMuted }]}>
                    {topic.question_count || 0} questions
                  </Text>
                  <Badge
                    label={topic.difficulty || 'Medium'}
                    variant={
                      topic.difficulty === 'easy' ? 'easy' : topic.difficulty === 'hard' ? 'hard' : 'medium'
                    }
                  />
                </TouchableOpacity>
              )
            )}
          </View>
          {topics.length === 0 && (
            <View style={[styles.emptyTopics, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
              <Ionicons name="albums-outline" size={22} color={colors.textMuted} />
              <Text style={[Typography.caption, { color: colors.textSecondary, textAlign: 'center' }]}>
                {topicError || 'No active topics yet. Add them in the admin CMS.'}
              </Text>
            </View>
          )}
        </>
      )}
        </ScrollView>
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 14,
  },
  partCards: { gap: 10, marginBottom: 22 },
  partCard: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    padding: 18, borderRadius: 16, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  partIcon: {
    width: 54, height: 54, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  partMeta: { flexDirection: 'row', gap: 12, marginTop: 6 },
  mockTestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  mockIcon: {
    width: 58,
    height: 58,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  hardcoreBadge: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  hardcoreText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  topicGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
  },
  topicCard: {
    width: '48%', padding: 16, borderRadius: 14, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
    gap: 4,
  },
  emptyTopics: {
    width: '100%', minHeight: 110, borderRadius: 14, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center', padding: 18, gap: 8,
  },
});
