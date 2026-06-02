export const WRITING_PROMPTS = [
  "What made you smile today, even briefly?",
  "Describe a moment from today you don't want to forget.",
  "What's one thing you're grateful for that you often overlook?",
  "What challenged you today, and how did you handle it?",
  "If today were a color, what would it be and why?",
  "Who did you think about today, and what would you say to them?",
  "What's something you learned — about yourself or the world?",
  "What decision are you sitting with right now?",
  "Describe your energy today: high, low, scattered, calm?",
  "What's one habit you want to carry into tomorrow?",
  "What conversation stayed with you today?",
  "What are you looking forward to this week?",
  "Write about a place you'd like to be right now.",
  "What did your body need today that you gave or didn't give it?",
  "What's a fear you're carrying? Write it out.",
  "What would your future self thank you for doing today?",
  "What's something small you did today that actually mattered?",
  "How did you show up for yourself or someone else today?",
  "What's a belief you're questioning lately?",
  "What does success look like for you this month?",
  "What do you need to let go of?",
  "If you had one extra hour today, how would you use it?",
  "What emotion keeps showing up for you this week?",
  "Describe your morning in three words. Explain each.",
  "What's a memory that made you feel safe and happy?",
  "What are you currently avoiding, and why?",
  "What small win are you proud of lately?",
  "What does rest look like for you?",
  "What's a value you've been living by lately?",
  "What do you want more of in your life right now?",
]

export function getDailyPrompt(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  )
  return WRITING_PROMPTS[dayOfYear % WRITING_PROMPTS.length]
}
