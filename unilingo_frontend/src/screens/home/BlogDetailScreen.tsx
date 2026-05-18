import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/themeStore';
import { blogAPI, BlogPost } from '../../api/blog';
import { Typography } from '../../theme';
import Markdown from 'react-native-markdown-display';
import AppBackground from '../../components/common/AppBackground';

const { width } = Dimensions.get('window');

export default function BlogDetailScreen({ route, navigation }: any) {
  const { slug } = route.params;
  const { colors } = useThemeStore();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPost();
  }, [slug]);

  const loadPost = async () => {
    try {
      const data = await blogAPI.getPostBySlug(slug);
      setPost(data);
    } catch (error) {
      console.error('Failed to load blog post', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppBackground>
        <SafeAreaView style={styles.safe}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        </SafeAreaView>
      </AppBackground>
    );
  }

  if (!post) {
    return (
      <AppBackground>
        <SafeAreaView style={styles.safe}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={[Typography.body, { color: colors.textSecondary }]}>Post not found</Text>
          </View>
        </SafeAreaView>
      </AppBackground>
    );
  }

  return (
    <AppBackground>
      <SafeAreaView style={styles.safe}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[Typography.h3, { flex: 1, textAlign: 'center', color: colors.textPrimary }]} numberOfLines={1}>Blog</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {post.cover_image_url && (
          <Image source={{ uri: post.cover_image_url }} style={styles.coverImage} />
        )}
        
        <View style={styles.contentPadding}>
          <View style={styles.tagsRow}>
            <View style={[styles.tag, { backgroundColor: colors.accentBg }]}>
              <Text style={[Typography.captionSm, { color: colors.accent, fontWeight: 'bold' }]}>
                {post.category.toUpperCase()}
              </Text>
            </View>
            <Text style={[Typography.caption, { color: colors.textMuted }]}>
              • {post.read_time_minutes} min read
            </Text>
          </View>
          
          <Text style={[Typography.h2, { color: colors.textPrimary, marginVertical: 12 }]}>
            {post.title}
          </Text>

          <View style={styles.authorRow}>
            <View style={[styles.authorAvatar, { backgroundColor: colors.bgInput }]}>
               <Text style={{ fontSize: 16 }}>{post.author_avatar || '📝'}</Text>
            </View>
            <View>
              <Text style={[Typography.bodySm, { color: colors.textPrimary, fontWeight: 'bold' }]}>
                {post.author_name}
              </Text>
              <Text style={[Typography.captionSm, { color: colors.textMuted }]}>
                {post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Draft'} • {post.view_count} views
              </Text>
            </View>
          </View>

          {/* Markdown Content */}
          <View style={styles.markdownContainer}>
            <Markdown
              style={{
                body: { ...Typography.body, color: colors.textPrimary, lineHeight: 26 },
                heading1: { ...Typography.h1, color: colors.textPrimary, marginTop: 24, marginBottom: 12 },
                heading2: { ...Typography.h2, color: colors.textPrimary, marginTop: 20, marginBottom: 10 },
                heading3: { ...Typography.h3, color: colors.textPrimary, marginTop: 16, marginBottom: 8 },
                paragraph: { marginBottom: 16 },
                strong: { fontWeight: 'bold', color: colors.textPrimary },
                em: { fontStyle: 'italic' },
                link: { color: colors.accent, textDecorationLine: 'underline' },
                blockquote: { 
                  borderLeftWidth: 4, 
                  borderLeftColor: colors.accent,
                  paddingLeft: 12, 
                  marginVertical: 16,
                  fontStyle: 'italic',
                  color: colors.textSecondary 
                },
                code_inline: { 
                  backgroundColor: colors.bgInput, 
                  padding: 4, 
                  borderRadius: 4, 
                  fontFamily: 'Courier' 
                },
                code_block: { 
                  backgroundColor: colors.bgInput, 
                  padding: 16, 
                  borderRadius: 8, 
                  fontFamily: 'Courier',
                  marginVertical: 16
                },
                list_item: { marginBottom: 8 },
                bullet_list: { marginBottom: 16 },
                ordered_list: { marginBottom: 16 },
              }}
            >
              {post.content}
            </Markdown>
          </View>
        </View>
        </ScrollView>
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  headerRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 20, 
    paddingTop: 8, 
    paddingBottom: 16 
  },
  backBtn: { 
    width: 40, height: 40, 
    borderRadius: 20, 
    borderWidth: 1,
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  scrollContent: { paddingBottom: 40 },
  coverImage: { 
    width: width - 40, 
    height: 200, 
    borderRadius: 16, 
    marginHorizontal: 20,
    marginBottom: 20 
  },
  contentPadding: { paddingHorizontal: 20 },
  tagsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  authorRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12, 
    marginTop: 8,
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  authorAvatar: { 
    width: 40, height: 40, 
    borderRadius: 20, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  markdownContainer: { marginTop: 8 },
});
