# Diary Pro

A premium offline-first iOS PWA for tracking every dimension of your daily life — journaling, work, GTD productivity, fitness, habits, health, and long-term goals — in one beautifully designed app.

---

## Features

### Personal Diary
- Rich text editor with bold, italic, lists
- Mood picker (1–5 scale with emoji)
- Three daily gratitude prompts
- Photo attachments (stored locally in IndexedDB)
- Tag system for filtering entries
- Full-text search across all entries
- Writing streak counter
- Monthly calendar view with entry dots

### Work Log
- Log tasks, meetings, wins, blockers, and notes
- Priority levels (high / medium / low)
- Daily work entry history

### GTD — Getting Things Done
- Quick-capture inbox from any screen via the floating action button
- Process inbox items one at a time into:
  - Next Actions (with context tags: @home @office @phone @computer @errands @anywhere)
  - Projects (with completion percentage)
  - Waiting For
  - Someday / Maybe
- 5-step Weekly Review Wizard (Collect → Process → Organize → Reflect → Engage)

### Gym Tracker
- Workout templates with drag-to-reorder exercises
- Active workout session (crash-safe: persisted to IndexedDB immediately)
- Epley formula personal record detection with PR celebration badge
- Body metrics charts — weight, body fat, waist (via Recharts)
- 54 pre-seeded exercises across all muscle groups

### Habit Tracker
- Daily habit rings with SVG animation
- Streak counters per habit
- 13-week heatmap grid
- 6 pre-seeded habit templates (water, sleep, meditation, reading, exercise, no-alcohol)

### Health & Wellness
- Sleep log (bedtime, wake time, quality rating)
- Water tracker with glass-by-glass visualization
- Daily energy/mood log
- Supplement tracker with timing reminders

### Goals & Vision Board
- Three goal tiers: 1-Year, 5-Year, and Lifetime
- Milestones with progress bar
- Daily affirmations
- Vision board photo attachments

### Settings
- PIN lock (SHA-256 hashed, auto-locks when app is backgrounded)
- Push notifications with configurable reminder times (iOS 16.4+ PWA only)
- JSON backup export / import (all data, all 26 tables)

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS with custom warm theme |
| Fonts | Playfair Display (headings) + Lato (body) |
| Storage | Dexie.js (IndexedDB) — offline-first |
| Animations | Framer Motion |
| Charts | Recharts |
| Rich Text | Tiptap |
| Forms | react-hook-form |
| PDF Export | jsPDF + html2canvas |
| Icons | lucide-react |
| PWA | next-pwa (Workbox) |

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for production

```bash
npm run build
npm start
```

### Add to iOS Home Screen

1. Open the app in Safari on iOS
2. Tap the Share button → **Add to Home Screen**
3. The app runs in standalone mode with full offline support

---

## Design System

- **Paper** `#F5F0E8` — warm cream background
- **Amber** `#C4933F` — primary accent
- **Ink** `#2C1810` — body text
- **Sage** `#7A9E7E` — GTD accent
- **Blush** `#E8A598` — health accent

---

## iOS PWA Notes

- Minimum iOS 16.4 for push notifications
- All data is stored locally in IndexedDB — nothing leaves your device
- Photos are stored as base64 in the database (separate from the service worker cache to stay within iOS's 50MB cache limit)
- Safe-area insets are respected on all notched devices
- Auto-zoom on input focus is prevented (all inputs use `font-size: 16px`)
