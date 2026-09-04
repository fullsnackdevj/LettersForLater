/**
 * Curated question deck for Jay & Kiss ("The Know-Me Prompts")
 * Categories:
 * - 'favorites': Food, drinks, colors, little cravings
 * - 'comfort': What brings peace, how to care for them when sad/stressed
 * - 'quirks': Funny habits, childhood memories, secret traits
 * - 'hypothetical': Fun, playful, "what if" scenarios
 * - 'about_us': Love, memories of the two of them, future hopes
 */

export const KNOW_ME_CATEGORIES = {
  favorites: {
    id: 'favorites',
    label: 'Favorites & Cravings',
    icon: '☕',
    color: 'bg-amber-100 text-amber-900 border-amber-300'
  },
  comfort: {
    id: 'comfort',
    label: 'Comfort & Care',
    icon: '🫂',
    color: 'bg-rose-100 text-rose-900 border-rose-300'
  },
  quirks: {
    id: 'quirks',
    label: 'Quirks & Memories',
    icon: '💭',
    color: 'bg-purple-100 text-purple-900 border-purple-300'
  },
  hypothetical: {
    id: 'hypothetical',
    label: 'Fun & Playful',
    icon: '🌟',
    color: 'bg-blue-100 text-blue-900 border-blue-300'
  },
  about_us: {
    id: 'about_us',
    label: 'About Us & Love',
    icon: '💖',
    color: 'bg-emerald-100 text-emerald-900 border-emerald-300'
  }
};

export const KNOW_ME_QUESTIONS = [
  // ─── ☕ FAVORITES & CRAVINGS ───
  {
    id: 'fav_1',
    category: 'favorites',
    text: "What's your exact, go-to coffee or milk tea order?",
    placeholder: "e.g. Iced Spanish Latte, 50% sweetness, oat milk..."
  },
  {
    id: 'fav_2',
    category: 'favorites',
    text: "What is your favorite color, and what does it remind you of?",
    placeholder: "e.g. Sage green because it feels peaceful and calm..."
  },
  {
    id: 'fav_3',
    category: 'favorites',
    text: "What is your ultimate midnight snack when you're craving something yummy?",
    placeholder: "e.g. Pancit canton with soft boiled egg, or fries with ice cream..."
  },
  {
    id: 'fav_4',
    category: 'favorites',
    text: "If you could only eat one fast food meal for the rest of your life, what is it?",
    placeholder: "e.g. Jollibee 2pc Chickenjoy spicy with peach mango pie..."
  },
  {
    id: 'fav_5',
    category: 'favorites',
    text: "What is your favorite flower or plant?",
    placeholder: "e.g. White lilies, sunflowers, baby's breath..."
  },
  {
    id: 'fav_6',
    category: 'favorites',
    text: "What scents or smells instantly make you feel relaxed or happy?",
    placeholder: "e.g. Fresh vanilla, lavender, the smell of rain (petrichor), coffee brewing..."
  },
  {
    id: 'fav_7',
    category: 'favorites',
    text: "What's your favorite ice cream flavor?",
    placeholder: "e.g. Cookies & cream, matcha, avocado, salted caramel..."
  },
  {
    id: 'fav_8',
    category: 'favorites',
    text: "What is a food or vegetable you absolutely refuse to eat?",
    placeholder: "e.g. Ampalaya, cilantro, okra, anything too spicy..."
  },
  {
    id: 'fav_9',
    category: 'favorites',
    text: "What is your favorite season or type of weather?",
    placeholder: "e.g. Rainy afternoons wrapped in a blanket, cool breezy mornings..."
  },
  {
    id: 'fav_10',
    category: 'favorites',
    text: "What is your comfort movie or series that you can rewatch 100 times?",
    placeholder: "e.g. A favorite K-drama, Disney movie, or sitcom..."
  },
  {
    id: 'fav_11',
    category: 'favorites',
    text: "What kind of music or genre puts you in the best mood?",
    placeholder: "e.g. Acoustic love songs, worship music, 90s OPM, lo-fi beats..."
  },
  {
    id: 'fav_12',
    category: 'favorites',
    text: "What's your favorite sweet pastry or dessert?",
    placeholder: "e.g. Cheesecake, ensaymada, cinnamon roll, brownies..."
  },
  {
    id: 'fav_13',
    category: 'favorites',
    text: "What is your favorite clothing piece to wear when relaxing at home?",
    placeholder: "e.g. Oversized hoodie, soft pajama pants, old concert tee..."
  },
  {
    id: 'fav_14',
    category: 'favorites',
    text: "What is your favorite time of day and why?",
    placeholder: "e.g. 6:00 AM quiet dawn, or golden hour sunset..."
  },
  {
    id: 'fav_15',
    category: 'favorites',
    text: "What is your favorite pizza topping combination?",
    placeholder: "e.g. Pepperoni with lots of cheese, Hawaiian (yes or no pineapple?), four cheese..."
  },
  {
    id: 'fav_16',
    category: 'favorites',
    text: "What's your favorite holiday of the year?",
    placeholder: "e.g. Christmas, New Year's Eve, or birthdays..."
  },
  {
    id: 'fav_17',
    category: 'favorites',
    text: "What is your shoe and clothing size?",
    placeholder: "e.g. Shoe: 7 US / 38 EU, Shirt: Medium, Ring: 5.5..."
  },
  {
    id: 'fav_18',
    category: 'favorites',
    text: "What is your current favorite song right now?",
    placeholder: "e.g. Song title and artist..."
  },
  {
    id: 'fav_19',
    category: 'favorites',
    text: "What's your dream breakfast on a lazy Sunday morning?",
    placeholder: "e.g. Garlic rice with tapsilog, pancakes with syrup and hot coffee..."
  },
  {
    id: 'fav_20',
    category: 'favorites',
    text: "What is a small item under ₱200 / $5 that always makes you smile when received?",
    placeholder: "e.g. Cute stickers, iced coffee, hair clip, dark chocolate..."
  },

  // ─── 🫂 COMFORT & CARE ───
  {
    id: 'comf_1',
    category: 'comfort',
    text: "When you've had an exhausting or stressful day, what is the best thing I can do for you?",
    placeholder: "e.g. Just listen without trying to fix it, bring food, or give a long warm hug..."
  },
  {
    id: 'comf_2',
    category: 'comfort',
    text: "When you start overthinking, what reminder or truth brings you back to peace?",
    placeholder: "e.g. Remind me that God is in control, or tell me everything will be fine..."
  },
  {
    id: 'comf_3',
    category: 'comfort',
    text: "What's your subtle tell when you're feeling down but trying to pretend you're fine?",
    placeholder: "e.g. I get quiet, give short replies, or avoid eye contact..."
  },
  {
    id: 'comf_4',
    category: 'comfort',
    text: "How do you prefer to de-escalate or reset when tension or disagreement happens?",
    placeholder: "e.g. Hold hands, take 10 minutes to breathe, pray together..."
  },
  {
    id: 'comf_5',
    category: 'comfort',
    text: "What is your primary love language?",
    placeholder: "Words of Affirmation, Quality Time, Physical Touch, Acts of Service, or Gifts?"
  },
  {
    id: 'comf_6',
    category: 'comfort',
    text: "What is a Bible verse or spiritual quote that anchors you in hard times?",
    placeholder: "e.g. Jeremiah 29:11, Proverbs 3:5-6, Matthew 6:34..."
  },
  {
    id: 'comf_7',
    category: 'comfort',
    text: "What is your biggest pet peeve in daily communication?",
    placeholder: "e.g. Being left on delivered for hours without an update, vague replies..."
  },
  {
    id: 'comf_8',
    category: 'comfort',
    text: "When you feel sick or unwell, what comforts you the most?",
    placeholder: "e.g. Hot soup / arroz caldo, warm compress, cold water, gentle back rubs..."
  },
  {
    id: 'comf_9',
    category: 'comfort',
    text: "What is something I say or do that makes you feel deeply safe?",
    placeholder: "e.g. When you pray for me, when you hold my hand in public..."
  },
  {
    id: 'comf_10',
    category: 'comfort',
    text: "Do you prefer to be alone for a bit when overwhelmed, or do you prefer company?",
    placeholder: "e.g. Need 20 minutes of silence first, then I want company..."
  },
  {
    id: 'comf_11',
    category: 'comfort',
    text: "What is one fear you have that you don't talk about often?",
    placeholder: "e.g. Failing expectations, uncertainty about the future..."
  },
  {
    id: 'comf_12',
    category: 'comfort',
    text: "What kind of compliments mean the most to you?",
    placeholder: "e.g. Compliments about my heart/character, my appearance, or my hard work..."
  },
  {
    id: 'comf_13',
    category: 'comfort',
    text: "What is your bedtime routine when you can't fall asleep?",
    placeholder: "e.g. Listening to rain sounds, reading scripture, scrolling TikTok..."
  },
  {
    id: 'comf_14',
    category: 'comfort',
    text: "What boundary is super important to you in our relationship?",
    placeholder: "e.g. Honesty even when uncomfortable, never sleeping with anger..."
  },
  {
    id: 'comf_15',
    category: 'comfort',
    text: "How can I pray for you more specifically in this season of your life?",
    placeholder: "e.g. Peace of mind, wisdom at work/studies, emotional strength..."
  },

  // ─── 💭 QUIRKS & MEMORIES ───
  {
    id: 'quirk_1',
    category: 'quirks',
    text: "What was your childhood dream job growing up?",
    placeholder: "e.g. Pilot, doctor, artist, astronaut, teacher..."
  },
  {
    id: 'quirk_2',
    category: 'quirks',
    text: "What's a weird habit or quirk you have that most people don't know about?",
    placeholder: "e.g. I must sleep with a specific blanket, I smell food before tasting..."
  },
  {
    id: 'quirk_3',
    category: 'quirks',
    text: "What was your favorite cartoon or TV show when you were a kid?",
    placeholder: "e.g. Tom & Jerry, Spongebob, Pokemon, Sailormoon..."
  },
  {
    id: 'quirk_4',
    category: 'quirks',
    text: "What is something irrational that you're secretly afraid of?",
    placeholder: "e.g. Clowns, spiders, dark water, elevators, lizards..."
  },
  {
    id: 'quirk_5',
    category: 'quirks',
    text: "What is a funny or embarrassing memory from your school days?",
    placeholder: "e.g. Tripping in the hallway, calling the teacher 'Mom'..."
  },
  {
    id: 'quirk_6',
    category: 'quirks',
    text: "Do you have any hidden or useless talents?",
    placeholder: "e.g. Can roll my tongue, do animal sounds, memorize license plates..."
  },
  {
    id: 'quirk_7',
    category: 'quirks',
    text: "What is your favorite childhood snack or candy that gives you instant nostalgia?",
    placeholder: "e.g. ChocNut, Haw Flakes, Iced Gems, Mik-Mik, Sweet Corn..."
  },
  {
    id: 'quirk_8',
    category: 'quirks',
    text: "Are you naturally a morning bird or a late-night owl?",
    placeholder: "e.g. Night owl because the world is quiet, or early bird with coffee..."
  },
  {
    id: 'quirk_9',
    category: 'quirks',
    text: "What's the most sentimental physical object you currently own?",
    placeholder: "e.g. A stuffed toy, an old letter, a bracelet, a childhood photo..."
  },
  {
    id: 'quirk_10',
    category: 'quirks',
    text: "If you could instantly learn any foreign language, which one would it be?",
    placeholder: "e.g. Japanese, Italian, French, Korean, Spanish..."
  },
  {
    id: 'quirk_11',
    category: 'quirks',
    text: "What is something you believed as a child that turned out to be completely false?",
    placeholder: "e.g. Swallowing watermelon seeds makes a plant grow in your stomach..."
  },
  {
    id: 'quirk_12',
    category: 'quirks',
    text: "How do you sleep? (Back, side, stomach? One pillow or four?)",
    placeholder: "e.g. Side sleeper with one pillow under my head and hugging a bolster..."
  },
  {
    id: 'quirk_13',
    category: 'quirks',
    text: "What's the best advice anyone ever gave you?",
    placeholder: "e.g. Advice from parents, mentors, or pastor..."
  },
  {
    id: 'quirk_14',
    category: 'quirks',
    text: "What is your guilty pleasure song that you sing in the shower?",
    placeholder: "e.g. An iconic 2000s pop song, boyband track, or dramatic ballad..."
  },
  {
    id: 'quirk_15',
    category: 'quirks',
    text: "If you could have dinner with any biblical figure (besides Jesus), who would you choose?",
    placeholder: "e.g. David, Esther, Paul, Moses, Peter..."
  },

  // ─── 🌟 FUN & PLAYFUL ───
  {
    id: 'fun_1',
    category: 'hypothetical',
    text: "If we suddenly won ₱10 Million right now, what's the first thing you'd do?",
    placeholder: "e.g. Tithe, pay off family debts, buy a house lot, book a trip..."
  },
  {
    id: 'fun_2',
    category: 'hypothetical',
    text: "If a zombie apocalypse started today, what is your survival weapon and role?",
    placeholder: "e.g. The navigator, the supply scavenger, the cook..."
  },
  {
    id: 'fun_3',
    category: 'hypothetical',
    text: "If you could have one superpower, what would it be and why?",
    placeholder: "e.g. Teleportation so we can see each other anytime, time travel, invisibility..."
  },
  {
    id: 'fun_4',
    category: 'hypothetical',
    text: "If you had to be an animal for 24 hours, which animal would you be?",
    placeholder: "e.g. A pampered golden retriever, a cat that naps all day, an eagle..."
  },
  {
    id: 'fun_5',
    category: 'hypothetical',
    text: "What is the most adventurous thing you want us to try together at least once?",
    placeholder: "e.g. Scuba diving, paragliding, hot air balloon, camping in the woods..."
  },
  {
    id: 'fun_6',
    category: 'hypothetical',
    text: "If you could teleport to any place in the world for 1 hour right now, where are we going?",
    placeholder: "e.g. A quiet cafe in Japan, a snowy cabin in Switzerland, a beach in Palawan..."
  },
  {
    id: 'fun_7',
    category: 'hypothetical',
    text: "Who is more likely to lose their keys or phone between the two of us?",
    placeholder: "e.g. Definitely you! Or definitely me because..."
  },
  {
    id: 'fun_8',
    category: 'hypothetical',
    text: "If our love story was turned into a movie, what would the title be?",
    placeholder: "e.g. 'Worth the Wait', 'The 2032 Promise', 'Jay Finally Got A Kiss'..."
  },
  {
    id: 'fun_9',
    category: 'hypothetical',
    text: "If you could instantly master any musical instrument, which one would it be?",
    placeholder: "e.g. Piano, acoustic guitar, violin, drums..."
  },
  {
    id: 'fun_10',
    category: 'hypothetical',
    text: "If we had a pet dog together, what would we name it?",
    placeholder: "e.g. Mochi, Toby, Cookie, Peanut, Bagel..."
  },
  {
    id: 'fun_11',
    category: 'hypothetical',
    text: "What board game or card game are you most competitive at?",
    placeholder: "e.g. Monopoly, Uno, Scrabble, Codenames..."
  },
  {
    id: 'fun_12',
    category: 'hypothetical',
    text: "If you had to trade lives with any fictional character for a week, who?",
    placeholder: "e.g. A character living in a cozy countryside cottage..."
  },

  // ─── 💖 ABOUT US & LOVE ───
  {
    id: 'love_1',
    category: 'about_us',
    text: "What was your very first impression of me when we first met or talked?",
    placeholder: "e.g. I thought you were so quiet/funny/kind..."
  },
  {
    id: 'love_2',
    category: 'about_us',
    text: "What is a song that always makes you think of me or our story?",
    placeholder: "e.g. Song title and the specific lyric that hits you..."
  },
  {
    id: 'love_3',
    category: 'about_us',
    text: "What is your favorite memory or date of us so far?",
    placeholder: "e.g. That long coffee talk, the late night call, our first trip..."
  },
  {
    id: 'love_4',
    category: 'about_us',
    text: "What is a little habit of mine that secretly melts your heart?",
    placeholder: "e.g. The way you laugh, when you check if I've eaten, your smile..."
  },
  {
    id: 'love_5',
    category: 'about_us',
    text: "When did you realize: 'I truly, deeply love this person'?",
    placeholder: "e.g. A specific quiet moment where it just hit you..."
  },
  {
    id: 'love_6',
    category: 'about_us',
    text: "What is something you are most excited for when 2032 arrives and our vault unlocks?",
    placeholder: "e.g. Reading all these letters together, seeing how far God brought us..."
  },
  {
    id: 'love_7',
    category: 'about_us',
    text: "What is your favorite picture or photo of us?",
    placeholder: "e.g. Describe the photo and why you love it so much..."
  },
  {
    id: 'love_8',
    category: 'about_us',
    text: "What is one dream you have for our future home?",
    placeholder: "e.g. A big kitchen, a cozy reading nook, lots of natural light..."
  },
  {
    id: 'love_9',
    category: 'about_us',
    text: "What is a funny quote or inside joke between the two of us?",
    placeholder: "e.g. Something only the two of you would understand..."
  },
  {
    id: 'love_10',
    category: 'about_us',
    text: "If you could tell my future self in 2032 one sentence, what would it be?",
    placeholder: "e.g. I hope you are still looking at her/him with the exact same sparkle in your eyes..."
  }
];

/**
 * Returns a random question from the question deck.
 * Optionally filters out questions the user has already answered.
 */
export function getRandomQuestion(excludeIds = []) {
  const available = KNOW_ME_QUESTIONS.filter(q => !excludeIds.includes(q.id));
  if (available.length === 0) {
    // If all answered, cycle from the whole deck
    return KNOW_ME_QUESTIONS[Math.floor(Math.random() * KNOW_ME_QUESTIONS.length)];
  }
  return available[Math.floor(Math.random() * available.length)];
}
