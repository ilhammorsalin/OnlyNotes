# OnlyNotes - Tinder for University Notes

A mobile-first web application that gamifies the discovery and sharing of university notes through an engaging swipe-based interface.

## Features

### Diamond Navigation
- **Swipe Up**: Access your Library of saved notes
- **Swipe Down**: View Social features (Leaderboard & Profile)
- **Swipe Right**: Save note to your Library
- **Swipe Left**: Skip note
- **Tap**: Open note in Reading Mode

### Reading Mode
- Full-screen immersive reading experience
- Smart blur mechanic: First 30% visible, remaining 70% blurred
- Scroll past 200px to unlock full content and auto-upvote
- Beautiful animations and toast notifications

### Library View
- Searchable collection of saved notes
- Masonry grid layout
- Quick access to reading mode

### Social View
- **Leaderboard**: Top 10 contributors with special styling for top 3
- **Profile**: Personal stats, earnings, achievements
- Upload new notes

## Tech Stack

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS** (Dark mode with Slate/Zinc palette)
- **Framer Motion** (Physics-based swipe animations)
- **Lucide React** (Icons)

## Getting Started

### Install dependencies:
```bash
npm install
```

### Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for production:
```bash
npm run build
npm start
```

## Project Structure

```
OnlyNotes/
├── app/
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Main home view with navigation
│   └── globals.css      # Global styles with Tailwind
├── components/
│   ├── NoteCard.tsx     # Swipeable card component
│   ├── ReadingMode.tsx  # Full-screen reading view
│   ├── LibraryView.tsx  # Saved notes grid
│   └── SocialView.tsx   # Leaderboard and profile
├── lib/
│   └── data.ts          # Mock data for notes and users
└── tailwind.config.js   # Tailwind configuration
```

## Key Interactions

### Card Swipe Physics
Cards use Framer Motion's drag capabilities with spring animations for natural, responsive feel. Visual feedback with animated heart/X icons confirms swipe actions.

### Blur Unlock Mechanic
The reading mode implements a progressive reveal system:
1. Shows 30% of content clearly
2. Applies CSS blur to remaining 70%
3. Monitors scroll position
4. Removes blur smoothly when scrolled past 200px
5. Triggers celebration toast on unlock

### Gesture-Based Navigation
Entire viewport supports vertical dragging to switch between main views, creating an intuitive mobile navigation experience without traditional UI elements.

## Design System

- **Colors**: Indigo/Violet accent on Slate/Zinc dark background
- **Typography**: System sans-serif stack for optimal readability
- **Animations**: Spring-based physics for organic feel
- **Layout**: Mobile-first with max-width constraints

## License

MIT
