"""
AI Service — Gemini API integration for HabitGame.
Used by: Mood suggestions (#1), Habit Stacking (#2), AI Chat (#8), Kindness (#9).
"""
import os
import json
import logging
from typing import List, Dict, Optional

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

logger = logging.getLogger(__name__)

# Offline fallback suggestions by mood
MOOD_FALLBACKS = {
    "tired": [
        {"name": "10-min Walk", "emoji": "🚶", "reason": "Light movement boosts energy without strain", "adapted_from": "Gym"},
        {"name": "2-min Stretching", "emoji": "🤸", "reason": "Releases tension from tiredness", "adapted_from": "Stretching"},
        {"name": "5 Deep Breaths", "emoji": "🧘", "reason": "Quick reset for your nervous system", "adapted_from": "Meditation"},
    ],
    "stressed": [
        {"name": "2-min Box Breathing", "emoji": "💨", "reason": "Activates your parasympathetic nervous system instantly", "adapted_from": None},
        {"name": "5-min Meditation", "emoji": "🧘", "reason": "Lowers cortisol in under 5 minutes", "adapted_from": "Meditation"},
        {"name": "Write 3 Gratitudes", "emoji": "📝", "reason": "Shifts focus from stress to appreciation", "adapted_from": None},
    ],
    "energetic": [
        {"name": "Full Gym Workout", "emoji": "💪", "reason": "Channel that energy into peak performance", "adapted_from": "Gym"},
        {"name": "30-min Run", "emoji": "🏃", "reason": "Perfect day to push your limits", "adapted_from": None},
        {"name": "Cold Shower Challenge", "emoji": "🚿", "reason": "Amplify your energy with a cold plunge", "adapted_from": "Cold Shower"},
    ],
    "happy": [
        {"name": "Call a Friend", "emoji": "📞", "reason": "Spread the joy and strengthen connections", "adapted_from": None},
        {"name": "Learn Something New", "emoji": "📖", "reason": "Happy mind absorbs knowledge 40% better", "adapted_from": "Reading / Learning"},
        {"name": "Help Someone Today", "emoji": "🤝", "reason": "Multiplies your happiness through giving", "adapted_from": None},
    ],
}

MOOD_MESSAGES = {
    "tired": "Aap thake hue hain — aaj chhote goals se shuru karein. Har ek step count karta hai! 💪",
    "stressed": "Stress normal hai. Pehle breathe karein, phir sochein. Aap sambhal sakte hain! 🌿",
    "energetic": "Aap aaj force mein hain! Yahi woh din hai jab bade goals attack karein! 🔥",
    "happy": "Khushi ka mood — aaj kuch nayi aadatein banane ka perfect time hai! 😊",
}

KINDNESS_CHALLENGES = [
    {"challenge_text": "Kisi stranger ki aaj genuinely compliment karo", "emoji": "😊", "category": "stranger"},
    {"challenge_text": "Ghar par kisi ki bina maange koi kaam kar do", "emoji": "🏠", "category": "family"},
    {"challenge_text": "Ek purane dost ko sirf 'soch raha tha tujhe' message bhejo", "emoji": "💬", "category": "self"},
    {"challenge_text": "Kisi ke liye darwaza khola rakho aur smile karo", "emoji": "🚪", "category": "stranger"},
    {"challenge_text": "Apne kisi close person ko ek handwritten note do", "emoji": "✉️", "category": "family"},
    {"challenge_text": "Kisi ki madad karo jo struggle kar raha ho", "emoji": "🤝", "category": "community"},
    {"challenge_text": "Apne aap ko ek compliment do aur mirror mein smile karo", "emoji": "🪞", "category": "self"},
    {"challenge_text": "Ek local shop ka food order karke unhe support karo", "emoji": "🛍️", "category": "community"},
    {"challenge_text": "Kisi bujurg ko rasta dikhao ya madad karo", "emoji": "👴", "category": "stranger"},
    {"challenge_text": "Apne family member ke liye chai ya coffee banao", "emoji": "☕", "category": "family"},
    {"challenge_text": "Office mein kisi ke kaam ki tarif karo sincerely", "emoji": "⭐", "category": "community"},
    {"challenge_text": "Kisi ko ek inspiring article ya video share karo", "emoji": "📱", "category": "self"},
    {"challenge_text": "Park mein trash pick up karo — ek minute bhi kaafi hai", "emoji": "🌳", "category": "community"},
    {"challenge_text": "Apne dost ko unke goal ke liye encourage karo", "emoji": "🎯", "category": "family"},
    {"challenge_text": "Aaj kisi se bhi phone par angry mat hona — patience rakhna", "emoji": "☯️", "category": "self"},
]


def _init_gemini():
    """Initialize Gemini client."""
    if not GEMINI_AVAILABLE:
        return None
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key or api_key == "AIzaSyDummyKeyReplaceWithReal":
        return None
    try:
        genai.configure(api_key=api_key)
        return genai.GenerativeModel("gemini-1.5-flash")
    except Exception as e:
        logger.error(f"Gemini init error: {e}")
        return None


async def get_mood_suggestions(mood: str, existing_habits: List[str]) -> Dict:
    """Feature #1: Return mood-adapted habit suggestions."""
    mood = mood.lower()

    model = _init_gemini()
    if model:
        try:
            habits_str = ", ".join(existing_habits[:5]) if existing_habits else "Gym, Meditation, Reading"
            prompt = f"""User ka mood hai: {mood}. Unki existing habits hain: {habits_str}.

Unhe 3 mood-adapted habit suggestions do jo unki current energy ke hisaab se realistic ho.
Response JSON format mein do:
{{
  "message": "Hinglish mein encouraging message (1-2 lines)",
  "motivational_quote": "Short motivational quote in English or Hindi",
  "suggestions": [
    {{"name": "habit name", "emoji": "emoji", "reason": "why this suits their mood (Hinglish)", "adapted_from": "original habit name or null"}},
    ...
  ]
}}

Rules:
- Agar tired: bade goals ko chhota karo (1hr gym → 10min walk)
- Agar stressed: breathing/meditation focus karo
- Agar energetic: full power goals suggest karo
- Agar happy: social/learning goals suggest karo
- Sirf valid JSON return karo"""

            response = model.generate_content(prompt)
            text = response.text.strip()
            # Remove markdown code blocks if present
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            data = json.loads(text)
            return {
                "mood": mood,
                "message": data.get("message", MOOD_MESSAGES.get(mood, "")),
                "suggestions": data.get("suggestions", MOOD_FALLBACKS.get(mood, [])),
                "motivational_quote": data.get("motivational_quote", "Every small step is progress!"),
            }
        except Exception as e:
            logger.error(f"Gemini mood suggestion error: {e}")

    # Offline fallback
    return {
        "mood": mood,
        "message": MOOD_MESSAGES.get(mood, "Aaj bhi ek step aage badhein! 💪"),
        "suggestions": MOOD_FALLBACKS.get(mood, MOOD_FALLBACKS["energetic"]),
        "motivational_quote": "Small steps every day lead to big changes.",
    }


async def get_chat_response(
    messages: List[Dict],
    user_name: str,
    missed_habits: Optional[List[str]] = None,
) -> str:
    """Feature #8: AI habit coach chatbot response."""
    model = _init_gemini()

    missed_str = ", ".join(missed_habits) if missed_habits else "koi nahi"

    system_prompt = f"""Tu ek friendly Hindi/Hinglish habit coach hai. Tera naam 'HabitBot' hai.
User ka naam: {user_name}
Miss ki hui habits (aaj tak): {missed_str}

Rules:
- Baat karo warmly, judge mat karo
- Agar habits miss ho rahi hain, toh compassionate raho
- Practical advice do — goals chote karo, schedule adjust karo
- Kabhi zyada lamba mat likho — 2-3 lines max
- Hinglish mein baat karo (Hindi + English mix)
- If habits are missed 3+ days, proactively suggest downsizing the goal"""

    if model:
        try:
            # Build conversation
            history = []
            for msg in messages[:-1]:  # all but last
                role = "user" if msg["role"] == "user" else "model"
                history.append({"role": role, "parts": [msg["content"]]})

            chat = model.start_chat(history=history)
            last_msg = messages[-1]["content"] if messages else "Hello"
            full_prompt = system_prompt + "\n\nUser: " + last_msg
            response = chat.send_message(full_prompt)
            return response.text.strip()
        except Exception as e:
            logger.error(f"Gemini chat error: {e}")

    # Fallback responses
    fallbacks = [
        f"Hey {user_name}! Koi baat nahi, aaj ek chhoti si habit se shuru karte hain. Kya problem aa rahi hai? 🌱",
        "Main samajhta/samajhti hoon. Life busy hoti hai. Chaliye goals thode adjust karte hain! 💪",
        f"Ek kaam karo {user_name} — aaj sirf 5 minute dedicate karo. Bas 5 minute, deal? ✅",
        "Yaad rakho: Slip hona fail hona nahi hai. Kal se fresh start! 🌅",
    ]
    import random
    return random.choice(fallbacks)


async def get_habit_stack_suggestion(new_habit: str, existing_routines: List[str]) -> Dict:
    """Feature #2: Suggest best trigger for habit stacking."""
    model = _init_gemini()

    routines_str = ", ".join(existing_routines) if existing_routines else "Subah uthna, Chai peena, Office aana"

    if model:
        try:
            prompt = f"""User nayi habit banana chahta hai: "{new_habit}"
Unki existing daily routines hain: {routines_str}

Suggest karo kaunsi existing routine ke saath yeh habit best "stack" hogi.
Response JSON mein do:
{{
  "best_trigger": "Chai banane ke turant baad",
  "stack_sentence": "{{trigger}} ke baad main {{new_habit}} karunga/karунgi",
  "reason": "Kyon yeh combination best hai (Hinglish mein, 1-2 lines)",
  "alternative_triggers": ["trigger2", "trigger3"]
}}
Sirf valid JSON return karo."""

            response = model.generate_content(prompt)
            text = response.text.strip()
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            return json.loads(text)
        except Exception as e:
            logger.error(f"Gemini habit stack error: {e}")

    # Fallback
    return {
        "best_trigger": "Subah uthne ke baad",
        "stack_sentence": f"Subah uthne ke baad main {new_habit} karunga/karungi",
        "reason": "Subah ka time sabse effective hota hai — willpower peak par hoti hai.",
        "alternative_triggers": ["Chai banane ke baad", "Lunch ke baad", "Sone se pehle"],
    }


async def get_daily_kindness_challenge() -> Dict:
    """Feature #9: Get a random daily kindness challenge."""
    import random
    from datetime import date

    # Use date as seed for consistent daily challenge
    today = date.today()
    seed = today.year * 10000 + today.month * 100 + today.day
    random.seed(seed)
    challenge = random.choice(KINDNESS_CHALLENGES)
    random.seed()  # reset seed
    return challenge
