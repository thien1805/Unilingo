/**
 * Practice Screen — Part selector + Topic grid
 */
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/themeStore';
import { topicsAPI, Topic } from '../../api/topics';
import { Card, Badge, SectionTitle } from '../../components/common';
import { Typography, Spacing, BorderRadius } from '../../theme';

const PARTS = [
  { key: 'part1', label: 'Part 1 — Interview', desc: 'Familiar topics about yourself, work, studies, and interests', emoji: '💬', time: '4-5 mins', bgKey: 'accentBg', colorKey: 'accent' },
  { key: 'part2', label: 'Part 2 — Long Turn', desc: 'Speak for 1-2 minutes on a given cue card topic', emoji: '🎤', time: '3-4 mins', bgKey: 'roseBg', colorKey: 'rose' },
  { key: 'part3', label: 'Part 3 — Discussion', desc: 'Abstract questions linked to Part 2 topic', emoji: '🗣️', time: '4-5 mins', bgKey: 'skyBg', colorKey: 'sky' },
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

  useEffect(() => {
    if (selectedPart) {
      loadTopics(selectedPart);
    }
  }, [selectedPart]);

  const loadTopics = async (part: string) => {
    try {
      const result = await topicsAPI.list({ ielts_part: part });
      setTopics(result.items);
    } catch {
      // Use mock data
      setTopics(MOCK_TOPICS.filter((t) => t.ielts_part === part));
    }
  };

  const getTopicIcon = (title: string) => {
    const key = Object.keys(TOPIC_ICONS).find((k) =>
      title.toLowerCase().includes(k)
    );
    return TOPIC_ICONS[key || ''] || '📝';
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bgBody }]}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topBar}>
        <Text style={[Typography.h2, { color: colors.textPrimary }]}>Practice</Text>
      </View>

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
            {(topics.length > 0 ? topics : MOCK_TOPICS.filter((t) => t.ielts_part === selectedPart)).map(
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
        </>
      )}
    </ScrollView>
  );
}

const MOCK_TOPICS: Topic[] = [
  { id: '1', title: 'Work & Studies', title_vi: null, description: null, category: 'daily_life', ielts_part: 'part1', difficulty: 'easy', is_active: true, order_index: 1, question_count: 5 },
  { id: '2', title: 'Hometown', title_vi: null, description: null, category: 'places', ielts_part: 'part1', difficulty: 'easy', is_active: true, order_index: 2, question_count: 4 },
  { id: '3', title: 'Hobbies', title_vi: null, description: null, category: 'lifestyle', ielts_part: 'part1', difficulty: 'easy', is_active: true, order_index: 3, question_count: 4 },
  { id: '4', title: 'Technology', title_vi: null, description: null, category: 'technology', ielts_part: 'part1', difficulty: 'medium', is_active: true, order_index: 4, question_count: 3 },
  { id: '5', title: 'Food & Cooking', title_vi: null, description: null, category: 'lifestyle', ielts_part: 'part1', difficulty: 'easy', is_active: true, order_index: 5, question_count: 4 },
  { id: '6', title: 'Travel', title_vi: null, description: null, category: 'travel', ielts_part: 'part1', difficulty: 'medium', is_active: true, order_index: 6, question_count: 5 },
  { id: '7', title: 'A Place You Visited', title_vi: null, description: null, category: 'travel', ielts_part: 'part2', difficulty: 'medium', is_active: true, order_index: 1, question_count: 3 },
  { id: '8', title: 'A Person You Admire', title_vi: null, description: null, category: 'people', ielts_part: 'part2', difficulty: 'medium', is_active: true, order_index: 2, question_count: 2 },
  { id: '9', title: 'Environment', title_vi: null, description: null, category: 'society', ielts_part: 'part3', difficulty: 'hard', is_active: true, order_index: 1, question_count: 4 },
  { id: '10', title: 'Education', title_vi: null, description: null, category: 'education', ielts_part: 'part3', difficulty: 'hard', is_active: true, order_index: 2, question_count: 3 },
];

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  topBar: { paddingTop: 8, paddingBottom: 14 },
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
  topicGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
  },
  topicCard: {
    width: '48%', padding: 16, borderRadius: 14, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
    gap: 4,
  },
});
