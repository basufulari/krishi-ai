import { initialCommunityPosts, Post, Comment } from '../data/communityData';
import { StorageNotifications } from './StorageNotifications';
import { BACKEND_URL } from '../config';

export const StorageCommunity = {
  getPosts: async (viewerId?: string): Promise<Post[]> => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/posts`);
      if (res.ok) {
        const data = await res.json();
        const viewer = viewerId ? String(viewerId) : '';
        return (Array.isArray(data) ? data : []).map((p: any) => {
          const likedBy: string[] = Array.isArray(p?.likedBy) ? p.likedBy.map(String) : [];
          const isLikedByMe = viewer ? likedBy.includes(viewer) : false;
          return {
            ...(p as Post),
            location: String(p?.location || 'Current Location'),
            isLikedByMe,
          };
        });
      }
      return initialCommunityPosts.map((p) => ({ ...p, isLikedByMe: false }));
    } catch {
      return initialCommunityPosts.map((p) => ({ ...p, isLikedByMe: false }));
    }
  },

  savePost: async (newPost: Post): Promise<void> => {
    try {
      await fetch(`${BACKEND_URL}/api/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost)
      });
    } catch {
      // ignore
    }
  },

  getPost: async (postId: string): Promise<Post | null> => {
    try {
      const posts = await StorageCommunity.getPosts();
      return posts.find((p) => p.id === postId) || null;
    } catch {
      return null;
    }
  },

  addComment: async (postId: string, comment: Comment): Promise<Post | null> => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(comment)
      });
      
      if (res.ok) {
        const data = await res.json();
        
        // Notification logic triggers for post author locally
        const postAuthor = data.post.authorName;
        if (postAuthor !== comment.authorName) {
          StorageNotifications.addNotification({
            targetUser: postAuthor,
            type: 'COMMENT',
            message: `${comment.authorName} commented on your post`,
            timestamp: 'Just now',
          });
        }
        
        return data.post;
      }
      return null;
    } catch {
      return null;
    }
  },

  toggleLike: async (postId: string, viewerId: string): Promise<Post[]> => {
    try {
      await fetch(`${BACKEND_URL}/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: viewerId })
      });
      return await StorageCommunity.getPosts(viewerId);
    } catch {
      return await StorageCommunity.getPosts(viewerId);
    }
  }
};
