import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AppLanguage } from '../i18n';
import { Post, Comment } from '../data/communityData';
import { StorageCommunity } from '../utils/StorageCommunity';

type Props = {
  username: string;
  language: AppLanguage;
  onBack: () => void;
  onGoVideoCall: (targetUser: string) => void;
  route: any; // expects { postId: string }
};

export function PostCommentsScreen({ username, onBack, onGoVideoCall, route }: Props) {
  const { t } = useTranslation();
  const postId = route.params.postId;

  const [post, setPost] = useState<Post | null>(null);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    loadPost();
  }, [postId]);

  const loadPost = async () => {
    const p = await StorageCommunity.getPost(postId);
    setPost(p);
  };

  const handlePostComment = async () => {
    if (!newComment.trim() || !post) return;

    const cmt: Comment = {
      id: Math.random().toString(),
      authorName: username,
      content: newComment.trim(),
      timestamp: 'Just now', // Simple static timestamp for local db mapping
    };

    const updated = await StorageCommunity.addComment(postId, cmt);
    if (updated) {
      setPost(updated);
      setNewComment('');
    }
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentCard}>
      <View style={styles.commentHeader}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>{item.authorName.charAt(0)}</Text>
        </View>
        <Text style={styles.commentAuthor}>{item.authorName}</Text>
        <Text style={styles.commentTime}> • {item.timestamp}</Text>
      </View>
      <Text style={styles.commentContent}>{item.content}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 20}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('community.commentsTitle', 'Comments')}</Text>
          <View style={{ width: 40 }} />
        </View>

        <FlatList
          data={post?.comments || []}
          keyExtractor={(item) => item.id}
          renderItem={renderComment}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            post ? (
              <View style={styles.originalPost}>
                <View style={styles.cardHeader}>
                  <View style={styles.avatarPlaceholderLarge}>
                    <Text style={styles.avatarTextLarge}>{post.authorName.charAt(0)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.author}>{post.authorName}</Text>
                    <Text style={styles.metaText}>{post.location} • {post.timestamp}</Text>
                  </View>
                  {/* Video Call Action */}
                  <TouchableOpacity 
                    style={styles.callButton}
                    onPress={() => onGoVideoCall(post.authorName)}
                  >
                    <Text style={styles.callIcon}>📹</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.content}>{post.content}</Text>
                <View style={styles.divider} />
                <Text style={styles.commentsCount}>{post.comments.length} {t('community.comments', 'Comments')}</Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>{t('community.noComments', 'No comments yet. Be the first!')}</Text>
            </View>
          }
        />

        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            placeholder={t('community.writeComment', 'Write a comment...')}
            placeholderTextColor="#94a3b8"
            value={newComment}
            onChangeText={setNewComment}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendBtn, !newComment.trim() && styles.sendBtnDisabled]} 
            disabled={!newComment.trim()}
            onPress={handlePostComment}
          >
            <Text style={styles.sendText}>{t('community.postComment', 'Post')}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
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
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b' },
  list: { padding: 16 },
  
  originalPost: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatarPlaceholderLarge: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarTextLarge: { fontSize: 20, fontWeight: '700', color: '#16a34a' },
  author: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  metaText: { fontSize: 13, color: '#64748b', marginTop: 2 },
  
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  callIcon: { fontSize: 20 },

  content: { fontSize: 16, color: '#334155', lineHeight: 24, marginBottom: 12 },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 12 },
  commentsCount: { fontSize: 15, fontWeight: '700', color: '#1e293b' },

  commentCard: { backgroundColor: '#ffffff', borderRadius: 12, padding: 14, marginBottom: 10 },
  commentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  avatarPlaceholder: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  avatarText: { fontSize: 14, fontWeight: '700', color: '#475569' },
  commentAuthor: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  commentTime: { fontSize: 12, color: '#64748b' },
  commentContent: { fontSize: 15, color: '#334155', lineHeight: 22, marginLeft: 36 },
  
  emptyBox: { padding: 20, alignItems: 'center' },
  emptyText: { color: '#94a3b8', fontSize: 15 },

  inputArea: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    padding: 12, 
    paddingBottom: Platform.OS === 'ios' ? 32 : 24, // Lift it higher off the bottom edge
    backgroundColor: '#ffffff', 
    borderTopWidth: 1, 
    borderTopColor: '#f1f5f9' 
  },
  input: { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 16, color: '#1e293b', maxHeight: 100 },
  sendBtn: { marginLeft: 12, backgroundColor: '#16a34a', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20, justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: '#a7f3d0' },
  sendText: { color: '#ffffff', fontWeight: '700', fontSize: 15 },
});
