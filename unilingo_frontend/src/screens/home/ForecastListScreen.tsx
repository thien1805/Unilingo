import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/themeStore';
import { forecastAPI, ForecastItem } from '../../api/forecast';
import AppBackground from '../../components/common/AppBackground';
import MascotIcon from '../../components/common/MascotIcon';
import Markdown from 'react-native-markdown-display';

export default function ForecastListScreen({ route, navigation }: any) {
  const { skill, title, icon, color } = route.params;
  const { colors } = useThemeStore();
  const [forecasts, setForecasts] = useState<ForecastItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForecast, setSelectedForecast] = useState<ForecastItem | null>(null);

  useEffect(() => {
    loadData();
  }, [skill]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await forecastAPI.getForecasts(1, 20, skill);
      setForecasts(data.items || []);
    } catch (error) {
      console.log('Error loading forecasts:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (selectedForecast) {
      return (
        <ScrollView style={styles.detailContainer} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.backButton} onPress={() => setSelectedForecast(null)}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            <Text style={[styles.backText, { color: colors.textPrimary }]}>Back to list</Text>
          </TouchableOpacity>
          <Text style={[styles.detailTitle, { color: colors.textPrimary }]}>{selectedForecast.title}</Text>
          <Text style={[styles.detailDate, { color: colors.textMuted }]}>
            {new Date(selectedForecast.created_at).toLocaleDateString()}
          </Text>
          <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border, padding: 16, marginTop: 16, marginBottom: 40 }]}>
             <Markdown style={{ body: { color: colors.textPrimary, fontSize: 15, lineHeight: 24 } }}>
               {selectedForecast.content}
             </Markdown>
          </View>
        </ScrollView>
      );
    }

    if (loading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      );
    }

    if (forecasts.length === 0) {
      return (
        <View style={styles.center}>
          <MascotIcon mood="sad" size={60} />
          <Text style={[styles.emptyText, { color: colors.textSecondary, marginTop: 16 }]}>
            No forecasts available yet for {skill}.
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={forecasts}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
            onPress={() => setSelectedForecast(item)}
            activeOpacity={0.8}
          >
             <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>{item.title}</Text>
             {item.excerpt ? (
               <Text style={[styles.itemExcerpt, { color: colors.textSecondary }]} numberOfLines={2}>
                 {item.excerpt}
               </Text>
             ) : null}
             <Text style={[styles.itemDate, { color: colors.textMuted }]}>
               {new Date(item.created_at).toLocaleDateString()}
             </Text>
          </TouchableOpacity>
        )}
      />
    );
  };

  return (
    <AppBackground>
      <SafeAreaView style={styles.safe}>
        {!selectedForecast && (
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <View style={styles.headerTitleWrap}>
              <View style={[styles.skillIcon, { backgroundColor: `${color}18` }]}>
                <Ionicons name={icon} size={20} color={color} />
              </View>
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{title} Forecasts</Text>
            </View>
            <View style={{ width: 24 }} />
          </View>
        )}
        
        {renderContent()}

      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
  },
  closeBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  skillIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 18,
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  itemTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    marginBottom: 6,
  },
  itemExcerpt: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    marginBottom: 10,
    lineHeight: 20,
  },
  itemDate: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 16,
    textAlign: 'center',
  },
  detailContainer: {
    flex: 1,
    padding: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  backText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
  },
  detailTitle: {
    fontFamily: 'PlusJakartaSans-ExtraBold',
    fontSize: 24,
    marginBottom: 8,
  },
  detailDate: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
  },
});
