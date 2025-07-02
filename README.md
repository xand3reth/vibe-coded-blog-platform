# Vibe-coded Blog Platform

A modern, full-stack blog platform built with Next.js, React Native, and Supabase.

## 🌟 Features

- **Web Platform**
  - Responsive blog interface
  - Admin dashboard for content management
  - Real-time comments and interactions
  - SEO optimized content
  - Authentication system

- **Mobile App**
  - Native mobile experience
  - Offline reading capability
  - Push notifications
  - User profile management
  - Seamless content synchronization

## 🛠 Tech Stack

### Web Platform
- Next.js
- TypeScript
- Tailwind CSS
- Supabase

### Mobile App
- React Native
- TypeScript
- Supabase SDK

### Backend
- Supabase (PostgreSQL)
- Row Level Security
- Real-time subscriptions

## 🚀 Getting Started

### Prerequisites
- Node.js 16.x or higher
- npm or yarn
- Supabase account

### Web Platform Setup
1. Navigate to the web directory:
```bash
cd web/blog
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

### Mobile App Setup
1. Navigate to the mobile directory:
```bash
cd mobile
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
```bash
cp env.example .env
```

4. Start the development server:
```bash
npm start
# or
yarn start
```

## 📱 Mobile App Features
- Seamless reading experience
- Bookmark favorite articles
- Dark mode support
- Share articles
- Push notifications for new content

## 💻 Web Platform Features
- Rich text editor for content creation
- Image optimization
- Comment system
- Analytics dashboard
- SEO optimization tools

## 🔐 Security
- Secure authentication with Supabase
- Row Level Security (RLS) policies
- Protected API routes
- Environment variable protection

## 📦 Project Structure
```
├── mobile/           # React Native mobile app
├── web/             # Next.js web platform
│   └── blog/        # Blog implementation
└── shared/          # Shared resources
    └── supabase/    # Database schema and configurations
```

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support
If you have any issues or questions, please create an issue.

---

> This project is a good example of cross-platform development using React Native and Next.js. It provides a consistent user experience across both mobile and web platforms while developing optimized apps for each platform. 