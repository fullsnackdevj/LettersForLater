/**
 * LettersForLater - Couple Status Presets
 * 22 translated activity presets with categories & emojis
 */

export const STATUS_CATEGORIES = [
  { id: 'all', label: 'All Activities' },
  { id: 'work_school', label: 'Work & School' },
  { id: 'meals_breaks', label: 'Food & Breaks' },
  { id: 'daily_rest', label: 'Daily Life' },
  { id: 'love_faith', label: 'Love & Faith' }
];

export const STATUS_PRESETS = [
  // Work & School
  {
    id: 'on_way_work',
    category: 'work_school',
    emoji: '🚗',
    text: 'On my way to work',
    filipino: 'papunta na sa work'
  },
  {
    id: 'arrived_work',
    category: 'work_school',
    emoji: '🏢',
    text: 'Arrived at work',
    filipino: 'nakarating na sa work'
  },
  {
    id: 'working_now',
    category: 'work_school',
    emoji: '💻',
    text: 'Working now',
    filipino: 'working na'
  },
  {
    id: 'preparing_work',
    category: 'work_school',
    emoji: '👔',
    text: 'Getting ready for work',
    filipino: 'preparing for work'
  },
  {
    id: 'on_way_school',
    category: 'work_school',
    emoji: '🎒',
    text: 'On my way to school',
    filipino: 'papunta ng school'
  },
  {
    id: 'at_school',
    category: 'work_school',
    emoji: '🏫',
    text: 'At school now',
    filipino: 'nasa school na'
  },
  {
    id: 'studying_now',
    category: 'work_school',
    emoji: '📚',
    text: 'Studying now',
    filipino: 'studying na'
  },
  {
    id: 'heading_home_school',
    category: 'work_school',
    emoji: '🚶‍♂️',
    text: 'Heading home from school',
    filipino: 'pauwi na from school'
  },
  {
    id: 'preparing_school',
    category: 'work_school',
    emoji: '🚿',
    text: 'Getting ready for school',
    filipino: 'preparing for school'
  },

  // Food & Breaks
  {
    id: 'breakfast',
    category: 'meals_breaks',
    emoji: '🥞',
    text: 'Eating breakfast',
    filipino: 'eating breakfast'
  },
  {
    id: 'lunch_break',
    category: 'meals_breaks',
    emoji: '🍱',
    text: 'Lunch break',
    filipino: 'lunch break'
  },
  {
    id: 'coffee_break',
    category: 'meals_breaks',
    emoji: '☕',
    text: 'Coffee break',
    filipino: 'coffee break'
  },
  {
    id: 'snacks',
    category: 'meals_breaks',
    emoji: '🍪',
    text: 'Snack time',
    filipino: 'eating snacks'
  },
  {
    id: 'dinner',
    category: 'meals_breaks',
    emoji: '🍽️',
    text: 'Having dinner',
    filipino: 'dinner'
  },

  // Daily Life & Rest
  {
    id: 'just_woke_up',
    category: 'daily_rest',
    emoji: '🥱',
    text: 'Just woke up',
    filipino: 'just woke up'
  },
  {
    id: 'at_home',
    category: 'daily_rest',
    emoji: '🏡',
    text: 'At home now',
    filipino: 'nasa bahay na'
  },
  {
    id: 'bonding_friends',
    category: 'daily_rest',
    emoji: '👯',
    text: 'Hanging out with friends',
    filipino: 'bonding with friends'
  },
  {
    id: 'bonding_family',
    category: 'daily_rest',
    emoji: '👨‍👩‍👧‍👦',
    text: 'Family time',
    filipino: 'bonding with family'
  },
  {
    id: 'sleeping',
    category: 'daily_rest',
    emoji: '😴',
    text: 'Sleeping / Going to bed',
    filipino: 'sleeping'
  },

  // Love & Faith
  {
    id: 'writing_devotion',
    category: 'love_faith',
    emoji: '📖',
    text: 'Writing my devotion',
    filipino: 'writing my devotion'
  },
  {
    id: 'missing_you',
    category: 'love_faith',
    emoji: '🥺',
    text: 'Missing you so much',
    filipino: 'i miss you'
  },
  {
    id: 'loving_you',
    category: 'love_faith',
    emoji: '🫶',
    text: 'Loving you always',
    filipino: 'i love you always'
  }
];

export const QUICK_CHEERS = [
  'Take care! 💕',
  'Proud of you! ✨',
  'Eat well! 🍱',
  'Miss you too! 🥺',
  'Rest well! 🌙',
  'You got this! 💪'
];
