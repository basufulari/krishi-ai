import React, { useState, useEffect } from 'react';
import { Animated, Easing, View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AppLanguage } from '../i18n';
import { Post } from '../data/communityData';
import { StorageCommunity } from '../utils/StorageCommunity';

type Props = {
  username: string;
  language: AppLanguage;
  onBackHome: () => void;
  onGoCreatePost: () => void;
  onGoComments: (postId: string) => void;
  route?: any; // To catch returning new posts
};

export function CommunityScreen({ username, onBackHome, onGoCreatePost, onGoComments, route }: Props) {
  const { t } = useTranslation();
  const [posts, setPosts] = useState<Post[]>([]);
  const feedIn = React.useRef(new Animated.Value(0)).current;
  const fabFloat = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    StorageCommunity.getPosts(username).then(setPosts);
  }, [username]);

  useEffect(() => {
    feedIn.setValue(0);
    Animated.timing(feedIn, {
      toValue: 1,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(fabFloat, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(fabFloat, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [fabFloat, feedIn, posts.length]);

  // Sniff for newly created posts returning from CreatePostScreen
  useEffect(() => {
    if (route?.params?.newPost) {
      const np = route.params.newPost;
      const newPostObj: Post = {
        id: Math.random().toString(),
        authorName: username,
        location: 'Current Location',
        content: np,
        likes: 0,
        comments: [],
        timestamp: 'Just now',
        isLikedByMe: false,
      };
      // Save directly to persistent storage then update state
      StorageCommunity.savePost(newPostObj).then(() => {
         setPosts((prev) => [newPostObj, ...prev]);
      });
    }
  }, [route?.params?.newPost]);

  const toggleLike = async (id: string) => {
    const updated = await StorageCommunity.toggleLike(id, username);
    if (updated.length > 0) {
      setPosts(updated);
    }
  };

  const renderPost = ({ item, index }: { item: Post; index: number }) => (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: feedIn.interpolate({
            inputRange: [0, 0.2 + index * 0.08, 1],
            outputRange: [0, 0, 1],
          }),
          transform: [
            {
              translateY: feedIn.interpolate({
                inputRange: [0, 1],
                outputRange: [18 + index * 4, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>{item.authorName.charAt(0)}</Text>
        </View>
        <View>
          <Text style={styles.author}>{item.authorName}</Text>
          <Text style={styles.metaText}>{item.location} • {item.timestamp}</Text>
        </View>
      </View>
      
      <Text style={styles.content}>{item.content}</Text>

      {item.comments.length > 0 && (
        <View style={styles.commentsPreview}>
          <Text style={styles.commentAuthor}>{item.comments[0].authorName}: </Text>
          <Text style={styles.commentText} numberOfLines={1}>{item.comments[0].content}</Text>
        </View>
      )}

      <View style={styles.actionsBox}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => toggleLike(item.id)}>
          <Text style={[styles.actionIcon, item.isLikedByMe && styles.actionIconActive]}>
            {item.isLikedByMe ? '♥' : '♡'}
          </Text>
          <Text style={styles.actionText}>{item.likes} {t('community.likes', 'Likes')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionBtn} onPress={() => onGoComments(item.id)}>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionText}>{item.comments.length} {t('community.comments', 'Comments')}</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBackHome} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('community.title', 'Krishi Samvad')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        contentContainerStyle={styles.list}
      />

      <Animated.View
        style={{
          transform: [
            {
              translateY: fabFloat.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -5],
              }),
            },
          ],
        }}
      >
      <TouchableOpacity style={styles.fab} onPress={onGoCreatePost}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f1f5f9' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  backText: { fontSize: 24, color: '#16a34a' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#16a34a' },
  list: { padding: 16 },
  card: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatarPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#16a34a' },
  author: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  metaText: { fontSize: 12, color: '#64748b', marginTop: 2 },
  content: { fontSize: 15, color: '#334155', lineHeight: 22, marginBottom: 16 },
  commentsPreview: { backgroundColor: '#f8fafc', padding: 10, borderRadius: 8, flexDirection: 'row', marginBottom: 16 },
  commentAuthor: { fontSize: 13, fontWeight: '700', color: '#475569' },
  commentText: { fontSize: 13, color: '#64748b', flex: 1 },
  actionsBox: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', marginRight: 24 },
  actionIcon: { fontSize: 18, color: '#94a3b8', marginRight: 6 },
  actionIconActive: { color: '#dc2626' },
  actionText: { fontSize: 14, color: '#64748b', fontWeight: '500' },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 60, height: 60, borderRadius: 30, backgroundColor: '#16a34a', alignItems: 'center', justifyContent: 'center', shadowColor: '#16a34a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  fabText: { fontSize: 32, color: '#ffffff', fontWeight: '300', marginTop: -4 },
});
