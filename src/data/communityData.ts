export interface Comment {
  id: string;
  authorName: string;
  content: string;
  timestamp: string;
}

export interface Post {
  id: string;
  authorName: string;
  location: string;
  content: string;
  likes: number;
  comments: Comment[];
  timestamp: string;
  isLikedByMe: boolean;
  likedBy?: string[];
}

export const initialCommunityPosts: Post[] = [
  {
    id: 'p1',
    authorName: 'Suresh Patil',
    location: 'Baramati, Pune',
    content: 'Has anyone started sowing soybean yet? The weather forecast says rain might delay things next week. What is the ideal time this year?',
    likes: 24,
    comments: [
      { id: 'c1', authorName: 'Ramesh Desai', content: 'I am waiting till next week. Soil moisture is currently too low.', timestamp: '2 hours ago' },
      { id: 'c2', authorName: 'Govind Rao', content: 'I planted 2 days ago. Let\'s hope for the best!', timestamp: '1 hour ago' },
    ],
    timestamp: '5 hours ago',
    isLikedByMe: false,
  },
  {
    id: 'p2',
    authorName: 'Anil Kumar',
    location: 'Hassan, Karnataka',
    content: 'My tractor broke down and I urgently need a mechanic who can fix a Mahindra 575 DI clutch. Any contacts nearby?',
    likes: 8,
    comments: [
      { id: 'c3', authorName: 'Shivaraj', content: 'Call Munna Garage near the APMC gate. He is very reliable.', timestamp: '30 mins ago' },
    ],
    timestamp: 'Yesterday',
    isLikedByMe: true,
  },
  {
    id: 'p3',
    authorName: 'Tukaram M.',
    location: 'Sangli, MH',
    content: 'Very happy with this year\'s Turmeric harvest! Using organic compost really made a difference in the rhizome size. I recommend everyone try mixing vermicompost before planting.',
    likes: 112,
    comments: [],
    timestamp: '2 days ago',
    isLikedByMe: false,
  },
  {
    id: 'p4',
    authorName: 'Dinesh',
    location: 'Nashik, Maharashtra',
    content: 'What is the current mandi rate for export quality onions? I heard it dipped recently.',
    likes: 15,
    comments: [
      { id: 'c4', authorName: 'Prakash', content: 'It is around ₹1800-₹2200 per quintal right now.', timestamp: 'Yesterday' }
    ],
    timestamp: '3 days ago',
    isLikedByMe: false,
  }
];
