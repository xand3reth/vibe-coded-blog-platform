-- Test data generation script
-- Assuming admin account is already created

-- Create test user profiles (actually created automatically by trigger after auth.users creation)
INSERT INTO profiles (id, email, display_name, avatar_url, bio, role, created_at, updated_at)
VALUES 
  ('d0d1b132-d794-4875-8c41-e9b0e6827c8f', '0x.xand3r@gmail.com', 'Admin', 'https://avatars.githubusercontent.com/u/1?v=4', 'Blog administrator.', 'admin', NOW(), NOW()),
  ('f0f1c232-e794-4975-9c41-f9b0e6927c9f', 'user1@example.com', 'User1', 'https://avatars.githubusercontent.com/u/2?v=4', 'First test user.', 'user', NOW(), NOW()),
  ('g0g1d332-f794-4a75-ac41-g9b0e6a27d0f', 'user2@example.com', 'User2', 'https://avatars.githubusercontent.com/u/3?v=4', 'Second test user.', 'user', NOW(), NOW());

-- Create test tags
INSERT INTO tags (id, name, slug, description, created_at, updated_at)
VALUES 
  ('a1a1a111-1111-1111-1111-a1a1a1a1a1a1', 'React Native', 'react-native', 'Mobile app development framework', NOW(), NOW()),
  ('b2b2b222-2222-2222-2222-b2b2b2b2b2b2', 'Next.js', 'nextjs', 'React-based full-stack framework', NOW(), NOW()),
  ('c3c3c333-3333-3333-3333-c3c3c3c3c3c3', 'Supabase', 'supabase', 'Firebase alternative backend service', NOW(), NOW()),
  ('d4d4d444-4444-4444-4444-d4d4d4d4d4d4', 'TypeScript', 'typescript', 'Static typing for JavaScript', NOW(), NOW()),
  ('e5e5e555-5555-5555-5555-e5e5e5e5e5e5', 'Full Stack', 'fullstack', 'Full-stack development related', NOW(), NOW());

-- Test posts creation
INSERT INTO posts (id, author_id, title, slug, content, excerpt, cover_image_url, status, view_count, published_at, created_at, updated_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111',
   'd0d1b132-d794-4875-8c41-e9b0e6827c8f',
   'Full Stack Development with React Native and Next.js',
   'react-native-nextjs-fullstack',
   '# Full Stack Development with React Native and Next.js

Learn how to develop a full-stack application that supports both mobile and web using React Native and Next.js.

## Project Structure

```
project/
├── mobile/          # React Native app
├── web/            # Next.js web app
└── shared/         # Shared logic
```

## Tech Stack

- **Mobile**: React Native + Expo
- **Web**: Next.js + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **State Management**: Zustand
- **Navigation**: React Navigation (Mobile) + Next.js Router (Web)

## Development Process

### 1. Initial Project Setup

First, create the project structure and initialize each platform.

```bash
npx create-expo-app mobile
npx create-next-app web
```

### 2. Shared Logic

Organize types, utility functions, and API clients in the `shared` folder.

### 3. Authentication System

Implement Google OAuth login using Supabase Auth.

## Conclusion

Using React Native and Next.js together enables efficient development supporting both mobile and web with a single backend.',
   'Learn how to develop a full-stack application that supports both mobile and web using React Native and Next.js.',
   'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop',
   'published',
   127,
   NOW() - INTERVAL '2 days',
   NOW() - INTERVAL '3 days',
   NOW() - INTERVAL '1 day'),

  ('22222222-2222-2222-2222-222222222222',
   'd0d1b132-d794-4875-8c41-e9b0e6827c8f',
   'Building a Real-time Chat App with Supabase',
   'supabase-realtime-chat',
   '# Building a Real-time Chat App with Supabase

Let''s build a real-time chat application using Supabase''s Realtime feature.

## What is Supabase Realtime?

Supabase Realtime is a feature that detects PostgreSQL changes in real-time and delivers them to clients.

## Database Design

```sql
-- messages table
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  channel_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policy setup
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
```

## Client Implementation

```typescript
// Real-time subscription
const subscription = supabase
  .channel("messages")
  .on("postgres_changes", {
    event: "INSERT",
    schema: "public",
    table: "messages"
  }, (payload) => {
    setMessages(prev => [...prev, payload.new])
  })
  .subscribe()
```

## Conclusion

With Supabase Realtime, you can implement real-time features easily without complex WebSocket setup.',
   'A guide to building a real-time chat application using Supabase Realtime features.',
   'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=400&fit=crop',
   'published',
   89,
   NOW() - INTERVAL '5 days',
   NOW() - INTERVAL '6 days',
   NOW() - INTERVAL '4 days'),

  ('33333333-3333-3333-3333-333333333333',
   'd0d1b132-d794-4875-8c41-e9b0e6827c8f',
   'Advanced TypeScript Techniques',
   'typescript-advanced-techniques',
   '# Advanced TypeScript Techniques

Introducing advanced techniques for more effective use of TypeScript.

## Conditional Types

```typescript
type ApiResponse<T> = T extends string 
  ? { message: T } 
  : { data: T }
```

## Mapped Types

```typescript
type Partial<T> = {
  [P in keyof T]?: T[P]
}
```

## Template Literal Types

```typescript
type EventName<T extends string> = `on${Capitalize<T>}`
type ClickEvent = EventName<"click"> // "onClick"
```

These advanced techniques allow you to write safer and more expressive code.',
   'Exploring advanced TypeScript techniques including conditional types, mapped types, and template literal types.',
   NULL,
   'draft',
   0,
   NULL,
   NOW() - INTERVAL '1 day',
   NOW() - INTERVAL '1 day');

-- Test comments creation
INSERT INTO comments (id, post_id, author_id, content, created_at, updated_at)
VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   '11111111-1111-1111-1111-111111111111',
   'f0f1c232-e794-4975-9c41-f9b0e6927c9f',
   'Really useful article! I was curious about the React Native and Next.js combination, and this helped a lot.',
   NOW() - INTERVAL '1 day',
   NOW() - INTERVAL '1 day'),
   
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   '11111111-1111-1111-1111-111111111111',
   'g0g1d332-f794-4a75-ac41-g9b0e6a27d0f',
   'The project structure you shared is impressive. I''d love to know more about the shared folder organization.',
   NOW() - INTERVAL '18 hours',
   NOW() - INTERVAL '18 hours'),

  ('cccccccc-cccc-cccc-cccc-cccccccccccc',
   '22222222-2222-2222-2222-222222222222',
   'f0f1c232-e794-4975-9c41-f9b0e6927c9f',
   'I didn''t know Supabase Realtime was this easy to implement. I want to try this in my next project.',
   NOW() - INTERVAL '2 days',
   NOW() - INTERVAL '2 days');

-- Post-tag connection
INSERT INTO post_tags (post_id, tag_id)
VALUES 
  -- React Native + Next.js post
  ('11111111-1111-1111-1111-111111111111', 'a1a1a111-1111-1111-1111-a1a1a1a1a1a1'),
  ('11111111-1111-1111-1111-111111111111', 'b2b2b222-2222-2222-2222-b2b2b2b2b2b2'),
  ('11111111-1111-1111-1111-111111111111', 'e5e5e555-5555-5555-5555-e5e5e5e5e5e5'),
   
  -- Supabase chat post
  ('22222222-2222-2222-2222-222222222222', 'c3c3c333-3333-3333-3333-c3c3c3c3c3c3'),
   
  -- TypeScript post
  ('33333333-3333-3333-3333-333333333333', 'd4d4d444-4444-4444-4444-d4d4d4d4d4d4'); 