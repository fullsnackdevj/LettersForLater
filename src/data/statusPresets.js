/**
 * LettersForLater - Couple Status Presets & Sweet Cheers
 * 32 comprehensive activity presets with categories, emojis, and tailored sweet cheer responses
 */

export const STATUS_CATEGORIES = [
  { id: 'all', label: 'All Activities' },
  { id: 'work_school', label: 'Work & School' },
  { id: 'meals_breaks', label: 'Food & Breaks' },
  { id: 'daily_rest', label: 'Daily Life' },
  { id: 'love_faith', label: 'Love & Faith' }
];

export const STATUS_PRESETS = [
  // ── Work & School ──────────────────────────────────────────
  {
    id: 'heading_home_work',
    category: 'work_school',
    emoji: '🚗',
    text: 'Heading home from work',
    filipino: 'Pauwi na from work.',
    cheers: [
      'Ingat sa biyahe pauwi love! 🚗💕',
      'Good job today, rest soon! 🌙',
      'Update me pagdating mo safe! 🏡',
      "Can't wait to talk to you! 🥰"
    ]
  },
  {
    id: 'in_meeting',
    category: 'work_school',
    emoji: '💼',
    text: 'In a meeting',
    filipino: 'Nasa meeting..',
    cheers: [
      'Good luck sa meeting love! 💼✨',
      'Rooting for you! Galingan mo! 🌟',
      'Mute mo pag antok jk 🤭',
      "You're doing amazing! 💪"
    ]
  },
  {
    id: 'on_way_work',
    category: 'work_school',
    emoji: '🚗',
    text: 'On my way to work',
    filipino: 'papunta na sa work',
    cheers: [
      'Ingat sa biyahe love! 🚗💕',
      'Have a wonderful day ahead! ✨',
      'You got this today! 💪',
      'Drink your water! 💧'
    ]
  },
  {
    id: 'arrived_work',
    category: 'work_school',
    emoji: '🏢',
    text: 'Arrived at work',
    filipino: 'nakarating na sa work',
    cheers: [
      'Glad you arrived safely! 🥰',
      'Have a productive day love! 💼',
      "Don't stress too much! 🫶",
      'Cheering for you! ✨'
    ]
  },
  {
    id: 'working_now',
    category: 'work_school',
    emoji: '💻',
    text: 'Working now',
    filipino: 'working na',
    cheers: [
      "Kaya mo 'yan love! Proud of you! ✨",
      'Take short breaks ha! 💆‍♂️',
      'Always cheering for you! 💪❤️',
      'Rest your eyes a bit! 👀'
    ]
  },
  {
    id: 'preparing_work',
    category: 'work_school',
    emoji: '👔',
    text: 'Getting ready for work',
    filipino: 'preparing for work',
    cheers: [
      'Good morning handsome/pretty! ☀️',
      "Don't forget breakfast ha! 🥞",
      'Looking great today for sure! ✨',
      'Have an awesome day ahead! 💕'
    ]
  },
  {
    id: 'on_way_school',
    category: 'work_school',
    emoji: '🎒',
    text: 'On my way to school',
    filipino: 'papunta ng school',
    cheers: [
      'Ingat sa biyahe student! 🎒💕',
      'Have fun learning today! 📖',
      'You got this today! ✨',
      'Stay hydrated! 💧'
    ]
  },
  {
    id: 'at_school',
    category: 'work_school',
    emoji: '🏫',
    text: 'At school now',
    filipino: 'nasa school na',
    cheers: [
      'Safe arrival! Galingan sa class! 🎓',
      'Proud student partner! ✨',
      'Listen attentively ha! 📝',
      'Rooting for you! 🌟'
    ]
  },
  {
    id: 'studying_now',
    category: 'work_school',
    emoji: '📚',
    text: 'Studying now',
    filipino: 'studying na',
    cheers: [
      'Study well love! You got this! 🧠✨',
      'Brain break muna if pagod na! ☕',
      'Smartest & sweetest person ever! 💡❤️',
      'Proud of your hard work! 🌟'
    ]
  },
  {
    id: 'heading_home_school',
    category: 'work_school',
    emoji: '🚶‍♂️',
    text: 'Heading home from school',
    filipino: 'pauwi na from school',
    cheers: [
      'Ingat pauwi love! 🚶‍♂️💕',
      'Good job sa class today! 🌟',
      'Pahinga pagdating sa bahay! 🏡',
      "Can't wait to chat! 🥰"
    ]
  },
  {
    id: 'preparing_school',
    category: 'work_school',
    emoji: '🚿',
    text: 'Getting ready for school',
    filipino: 'preparing for school',
    cheers: [
      'Have an awesome school day! ☀️',
      "Don't forget your things! 🎒",
      'Rooting for your classes today! ✨',
      'Good morning love! 🥞'
    ]
  },

  // ── Food & Breaks ──────────────────────────────────────────
  {
    id: 'breakfast',
    category: 'meals_breaks',
    emoji: '🥞',
    text: 'Eating breakfast',
    filipino: 'eating breakfast',
    cheers: [
      'Enjoy breakfast love! Kain marami! 🥞',
      'Good start to the day! ☀️',
      'Eat well and stay energized! 😋',
      'Sarap naman! ☕'
    ]
  },
  {
    id: 'lunch_break',
    category: 'meals_breaks',
    emoji: '🍱',
    text: 'Lunch break',
    filipino: 'lunch break',
    cheers: [
      'Happy lunch break! Kain mabuti! 🍱💕',
      'Take a relaxing break ha! 🌿',
      "Don't skip water! 🥤",
      'Kain nang marami love! 😋'
    ]
  },
  {
    id: 'coffee_break',
    category: 'meals_breaks',
    emoji: '☕',
    text: 'Coffee break',
    filipino: 'coffee break',
    cheers: [
      'Enjoy your coffee love! ☕✨',
      'Caffeine boost for my hardworker! 🤎',
      'Savor the sip & relax! ☕❤️',
      'Penge coffee! 🤎'
    ]
  },
  {
    id: 'snacks',
    category: 'meals_breaks',
    emoji: '🍪',
    text: 'Snack time',
    filipino: 'eating snacks',
    cheers: [
      'Penge snack love! 🍪😋',
      'Enjoy your meryenda! 🧃',
      'Yum! Treat yourself! ✨',
      'Kain mabuti! 🥐'
    ]
  },
  {
    id: 'dinner',
    category: 'meals_breaks',
    emoji: '🍽️',
    text: 'Having dinner',
    filipino: 'dinner',
    cheers: [
      'Kain nang marami for dinner! 🍽️💕',
      'Sarap naman! Kain mabuti! 😋',
      'Happy dinner time love! 🕯️',
      'Rest well after eating! 🌙'
    ]
  },

  // ── Daily Life & Rest ──────────────────────────────────────
  {
    id: 'just_listening_music',
    category: 'daily_rest',
    emoji: '🎧',
    text: 'Listening to music',
    filipino: 'Just listening to music..',
    cheers: [
      "Send me what you're listening to! 🎵🎧",
      'Vibe well love! 🎶✨',
      'Music heals everything 🤍',
      'Play our song next! 📻💕'
    ]
  },
  {
    id: 'calling_mama',
    category: 'daily_rest',
    emoji: '📞',
    text: 'On a call with Mama',
    filipino: 'Call kami ni mama..',
    cheers: [
      'Say hi to Mama for me! 📞❤️',
      'Enjoy your chika with Mama! 👩‍👧✨',
      'Take your time with Mama! 🫶',
      'Family first always! 💕'
    ]
  },
  {
    id: 'reflecting_pondering',
    category: 'daily_rest',
    emoji: '💭',
    text: 'Reflecting & pondering',
    filipino: 'nagmumuni muni ngayon..',
    cheers: [
      'Take all the quiet time you need love 💭🤍',
      "I'm always here for you 🌿",
      'Thinking of you too ✨',
      'Sending you peaceful vibes 🌸'
    ]
  },
  {
    id: 'just_woke_up',
    category: 'daily_rest',
    emoji: '🥱',
    text: 'Just woke up',
    filipino: 'just woke up',
    cheers: [
      'Good morning my love! ☀️❤️',
      'Did you sleep well? 🥰',
      'Have the sweetest day today! ✨',
      'Rise and shine beautiful! 🌸'
    ]
  },
  {
    id: 'at_home',
    category: 'daily_rest',
    emoji: '🏡',
    text: 'At home now',
    filipino: 'nasa bahay na',
    cheers: [
      'Welcome home love! Pahinga ka na! 🏡💕',
      "Glad you're home safe! 🥰",
      'Kick back and relax! 🛋️',
      'Pahinga na love! 🤍'
    ]
  },
  {
    id: 'bonding_friends',
    category: 'daily_rest',
    emoji: '👯',
    text: 'Hanging out with friends',
    filipino: 'bonding with friends',
    cheers: [
      'Enjoy your hangout love! 👯✨',
      'Have super fun with them! 🎉',
      'Ingat kayo always! 💕',
      'Enjoy the moments! 🌟'
    ]
  },
  {
    id: 'bonding_family',
    category: 'daily_rest',
    emoji: '👨‍👩‍👧‍👦',
    text: 'Family time',
    filipino: 'bonding with family',
    cheers: [
      'Enjoy quality family time! 👨‍👩‍👧‍👦❤️',
      'Warmest regards to everyone! 🫶',
      'Cherish these moments! ✨',
      'Say hi to family for me! 🤍'
    ]
  },
  {
    id: 'sleeping',
    category: 'daily_rest',
    emoji: '😴',
    text: 'Sleeping / Going to bed',
    filipino: 'sleeping',
    cheers: [
      'Good night love, sweet dreams! 🌙😴',
      'Sleep tight and rest well! 🤍',
      'See you in my dreams! ✨',
      'Rest your mind & body! 🛌'
    ]
  },

  // ── Love & Faith ───────────────────────────────────────────
  {
    id: 'preparing_church',
    category: 'love_faith',
    emoji: '👗',
    text: 'Getting ready for church',
    filipino: 'preparing for church.',
    cheers: [
      'Blessed Sunday prep love! 👗✨',
      'Looking good for the Lord! ⛪',
      "Don't forget your Bible & notebook! 📖",
      'God bless your day! 🤍'
    ]
  },
  {
    id: 'on_way_church',
    category: 'love_faith',
    emoji: '⛪',
    text: 'On my way to church',
    filipino: 'papunta ng church.',
    cheers: [
      'Ingat sa biyahe to church! ⛪🚗',
      'Have a blessed service today! 🙏✨',
      "Excited for God's word for you! 🤍",
      'Praying for safe travel! 🕊️'
    ]
  },
  {
    id: 'home_from_church',
    category: 'love_faith',
    emoji: '🕊️',
    text: 'Home from church',
    filipino: 'nakauwi na from church.',
    cheers: [
      'Hope you were blessed today! 🕊️✨',
      'Pahinga ka na love! 🏡💕',
      'Share the sermon takeaways later! 📖',
      'God is good always! 🤍'
    ]
  },
  {
    id: 'in_lifegroup',
    category: 'love_faith',
    emoji: '👥',
    text: 'In LifeGroup',
    filipino: 'Nasa LifeGroup ako..',
    cheers: [
      'Enjoy fellowship & deep talks! 👥🙏',
      'Have a fruitful LifeGroup session! 📖✨',
      'Say hi to the group! 🤍',
      'God bless your fellowship! 🕊️'
    ]
  },
  {
    id: 'done_lifegroup',
    category: 'love_faith',
    emoji: '🤝',
    text: 'Done with LifeGroup',
    filipino: 'tapos na lifeGroup..',
    cheers: [
      'Blessed to have your group! 🤝✨',
      'Ingat pauwi from LifeGroup! 🚗💕',
      'Tell me all about it later! 🥰',
      'Pahinga ka na love! 🏡'
    ]
  },
  {
    id: 'writing_devotion',
    category: 'love_faith',
    emoji: '📖',
    text: 'Writing my devotion',
    filipino: 'writing my devotion',
    cheers: [
      'Blessed quiet time love! 📖🙏',
      'God is with you always! 🤍',
      'Share your revelation later! ✨',
      "Enjoy God's presence! 🕊️"
    ]
  },
  {
    id: 'missing_you',
    category: 'love_faith',
    emoji: '🥺',
    text: 'Missing you so much',
    filipino: 'i miss you',
    cheers: [
      'Miss you more love! 🥺💕',
      'Sending you tight warm hugs! 🫂❤️',
      'Wish I could hug you right now! 🫶',
      'Counting down till we meet! ⏳❤️'
    ]
  },
  {
    id: 'loving_you',
    category: 'love_faith',
    emoji: '🫶',
    text: 'Loving you always',
    filipino: 'i love you always',
    cheers: [
      'I love you more than words! 🫶❤️',
      'You are my greatest blessing! ✨',
      'Forever and always with you! 💍',
      'Love you to infinity! 💕'
    ]
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

export const CATEGORIZED_CHEERS = [
  {
    category: 'Love & Sweetness 💕',
    cheers: [
      'I love you always! 🫶❤️',
      'Miss you so much! 🥺💕',
      'Sending warm tight hugs! 🫂',
      'You make me smile every day! ✨'
    ]
  },
  {
    category: 'Encouragement & Work 💪',
    cheers: [
      'Proud of your hard work! 💼🌟',
      "You've got this love! 💪✨",
      'Take short breaks ha! 💆‍♂️',
      'Don’t forget to hydrate! 💧'
    ]
  },
  {
    category: 'Faith & Blessings 🕊️',
    cheers: [
      'God bless you always! 🕊️✨',
      'Praying for you today love! 🙏🤍',
      'Have a blessed day! 📖✨'
    ]
  },
  {
    category: 'Care & Rest 🌙',
    cheers: [
      'Pahinga ka na love! 🏡💕',
      'Ingat sa biyahe always! 🚗',
      'Sleep well & sweet dreams! 🌙'
    ]
  }
];

/**
 * Returns tailored cheers for a given status ID or text, falling back to category/general cheers
 */
export function getCheersForStatus(statusId, statusText = '') {
  // Find matching preset by ID
  let preset = STATUS_PRESETS.find(p => p.id === statusId);

  // Fallback: match by statusText if ID is custom
  if (!preset && statusText) {
    const q = statusText.toLowerCase();
    preset = STATUS_PRESETS.find(p => 
      p.text.toLowerCase().includes(q) || 
      (p.filipino && p.filipino.toLowerCase().includes(q))
    );
  }

  if (preset?.cheers && preset.cheers.length > 0) {
    return preset.cheers;
  }

  return QUICK_CHEERS;
}
