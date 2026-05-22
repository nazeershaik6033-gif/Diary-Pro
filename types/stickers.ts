export interface StickerDef {
  id: string
  emoji: string
  label: string
  category: StickerCategory
}

export type StickerCategory = 'feeling' | 'activity' | 'weather' | 'food' | 'social'

export const STICKER_CATEGORIES: { id: StickerCategory; label: string; emoji: string }[] = [
  { id: 'feeling',  label: 'Feeling',  emoji: '😊' },
  { id: 'activity', label: 'Activity', emoji: '🏃' },
  { id: 'weather',  label: 'Weather',  emoji: '☀️' },
  { id: 'food',     label: 'Food',     emoji: '🍽️' },
  { id: 'social',   label: 'Social',   emoji: '👥' },
]

export const STICKERS: StickerDef[] = [
  // Feeling
  { id: 'feel_great',     emoji: '😄', label: 'Great',      category: 'feeling' },
  { id: 'feel_happy',     emoji: '😊', label: 'Happy',      category: 'feeling' },
  { id: 'feel_okay',      emoji: '😐', label: 'Okay',       category: 'feeling' },
  { id: 'feel_sad',       emoji: '😢', label: 'Sad',        category: 'feeling' },
  { id: 'feel_angry',     emoji: '😠', label: 'Angry',      category: 'feeling' },
  { id: 'feel_anxious',   emoji: '😰', label: 'Anxious',    category: 'feeling' },
  { id: 'feel_tired',     emoji: '😴', label: 'Tired',      category: 'feeling' },
  { id: 'feel_excited',   emoji: '🤩', label: 'Excited',    category: 'feeling' },
  { id: 'feel_grateful',  emoji: '🙏', label: 'Grateful',   category: 'feeling' },
  { id: 'feel_motivated', emoji: '💪', label: 'Motivated',  category: 'feeling' },
  { id: 'feel_loved',     emoji: '🥰', label: 'Loved',      category: 'feeling' },
  { id: 'feel_confused',  emoji: '😕', label: 'Confused',   category: 'feeling' },
  // Activity
  { id: 'act_workout',    emoji: '🏋️', label: 'Workout',    category: 'activity' },
  { id: 'act_running',    emoji: '🏃', label: 'Running',    category: 'activity' },
  { id: 'act_yoga',       emoji: '🧘', label: 'Yoga',       category: 'activity' },
  { id: 'act_reading',    emoji: '📚', label: 'Reading',    category: 'activity' },
  { id: 'act_music',      emoji: '🎵', label: 'Music',      category: 'activity' },
  { id: 'act_cooking',    emoji: '🍳', label: 'Cooking',    category: 'activity' },
  { id: 'act_travel',     emoji: '✈️', label: 'Travel',     category: 'activity' },
  { id: 'act_work',       emoji: '💼', label: 'Work',       category: 'activity' },
  { id: 'act_study',      emoji: '📖', label: 'Study',      category: 'activity' },
  { id: 'act_gaming',     emoji: '🎮', label: 'Gaming',     category: 'activity' },
  { id: 'act_art',        emoji: '🎨', label: 'Art',        category: 'activity' },
  { id: 'act_movie',      emoji: '🎬', label: 'Movie',      category: 'activity' },
  // Weather
  { id: 'wx_sunny',       emoji: '☀️', label: 'Sunny',      category: 'weather' },
  { id: 'wx_cloudy',      emoji: '☁️', label: 'Cloudy',     category: 'weather' },
  { id: 'wx_rainy',       emoji: '🌧️', label: 'Rainy',      category: 'weather' },
  { id: 'wx_stormy',      emoji: '⛈️', label: 'Stormy',     category: 'weather' },
  { id: 'wx_snowy',       emoji: '❄️', label: 'Snowy',      category: 'weather' },
  { id: 'wx_windy',       emoji: '💨', label: 'Windy',      category: 'weather' },
  // Food
  { id: 'food_coffee',    emoji: '☕', label: 'Coffee',     category: 'food' },
  { id: 'food_healthy',   emoji: '🥗', label: 'Healthy',    category: 'food' },
  { id: 'food_pizza',     emoji: '🍕', label: 'Pizza',      category: 'food' },
  { id: 'food_dessert',   emoji: '🍰', label: 'Dessert',    category: 'food' },
  // Social
  { id: 'soc_family',     emoji: '👨‍👩‍👧', label: 'Family',     category: 'social' },
  { id: 'soc_friends',    emoji: '👫', label: 'Friends',    category: 'social' },
  { id: 'soc_alone',      emoji: '🧍', label: 'Solo',       category: 'social' },
  { id: 'soc_date',       emoji: '💑', label: 'Date',       category: 'social' },
  { id: 'soc_party',      emoji: '🎉', label: 'Party',      category: 'social' },
]

export const STICKER_MAP = Object.fromEntries(STICKERS.map(s => [s.id, s])) as Record<string, StickerDef>

// Mood migration map: old MoodLevel (1-5) → sticker ID
export const MOOD_TO_STICKER: Record<number, string> = {
  1: 'feel_sad',
  2: 'feel_confused',
  3: 'feel_okay',
  4: 'feel_happy',
  5: 'feel_great',
}
