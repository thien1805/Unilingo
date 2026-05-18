import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import apiClient from '../../api/client';
import { usersAPI } from '../../api/users';
import { ScrollView } from 'react-native';

interface CommitmentModalProps {
  visible: boolean;
  onClose: () => void;
}

export const StreakModal: React.FC<CommitmentModalProps> = ({ visible, onClose }) => {
  const { colors } = useThemeStore();
  const [selectedGoal, setSelectedGoal] = useState<number | null>(null);
  const [targetBand, setTargetBand] = useState<number>(7.0);

  const goals = [
    { days: 7, xp: 20, emoji: '🔥', title: '7 Days', subtitle: 'Starter Goal' },
    { days: 14, xp: 50, emoji: '🚀', title: '14 Days', subtitle: 'Dedicated' },
    { days: 30, xp: 120, emoji: '💎', title: '30 Days', subtitle: 'Master' },
  ];

  const handleCommit = async () => {
    if (!selectedGoal) return;
    try {
      // 1. Update Profile (Target Band)
      await usersAPI.updateProfile({ target_band_score: targetBand });
      // 2. Set Streak Goal
      await apiClient.post('/users/me/streak-goal', { days: selectedGoal });
      
      // Refresh user
      const updatedUser = await usersAPI.getMe();
      useAuthStore.getState().setUser(updatedUser);
    } catch (e) {
      console.log('Failed to save onboarding', e);
    } finally {
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.bgPrimary }]}>
          <View style={styles.header}>
            <View style={[styles.iconCircle, { backgroundColor: colors.accentBg }]}>
              <Ionicons name="flag" size={36} color={colors.accent} />
            </View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              Set Your Goal!
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Commit to a daily learning streak. Complete it to earn massive bonus XP!
            </Text>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>1. Choose Target Band</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {[4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0].map(band => (
                <TouchableOpacity
                  key={band}
                  style={[
                    styles.bandChip,
                    {
                      backgroundColor: targetBand === band ? colors.accent : colors.bgInput,
                      borderColor: targetBand === band ? colors.accent : colors.border,
                    },
                  ]}
                  onPress={() => setTargetBand(band)}
                >
                  <Text style={[
                    styles.bandChipText,
                    { color: targetBand === band ? '#fff' : colors.textSecondary },
                  ]}>
                    {band.toFixed(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>2. Set Your Goal!</Text>
          <View style={styles.goalsContainer}>
            {goals.map((goal, idx) => {
              const isSelected = selectedGoal === goal.days;
              return (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.7}
                  onPress={() => setSelectedGoal(goal.days)}
                  style={[
                    styles.goalCard,
                    { 
                      backgroundColor: colors.bgCard,
                      borderColor: isSelected ? colors.accent : colors.border,
                      borderWidth: isSelected ? 2 : 1,
                    }
                  ]}
                >
                  <Text style={styles.goalEmoji}>{goal.emoji}</Text>
                  <View style={styles.goalInfo}>
                    <Text style={[styles.goalTitle, { color: colors.textPrimary }]}>{goal.title}</Text>
                    <Text style={[styles.goalSubtitle, { color: colors.textMuted }]}>{goal.subtitle}</Text>
                  </View>
                  <View style={[styles.xpBadge, { backgroundColor: isSelected ? colors.accent : colors.bgSecondary }]}>
                    <Text style={[styles.xpText, { color: isSelected ? '#fff' : colors.textPrimary }]}>
                      +{goal.xp} XP
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity 
            style={[
              styles.btn, 
              { backgroundColor: selectedGoal ? colors.accent : colors.bgSecondary }
            ]} 
            onPress={selectedGoal ? handleCommit : undefined} 
            activeOpacity={0.8}
            disabled={!selectedGoal}
          >
            <Text style={[styles.btnText, { color: selectedGoal ? '#fff' : colors.textMuted }]}>
              {selectedGoal ? `Commit & Save` : 'Select a Goal'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#111827',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: 'PlusJakartaSans-ExtraBold',
    fontSize: 26,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    marginBottom: 12,
  },
  bandChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 50,
    alignItems: 'center',
  },
  bandChipText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
  },
  goalsContainer: {
    gap: 12,
    marginBottom: 32,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
  },
  goalEmoji: {
    fontSize: 28,
    marginRight: 16,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    marginBottom: 2,
  },
  goalSubtitle: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
  },
  xpBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  xpText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 13,
  },
  btn: {
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
  },
});
