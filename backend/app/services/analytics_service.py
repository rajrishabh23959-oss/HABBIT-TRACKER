"""
Analytics Service — Feature #6: Deep Habit Insights.
Analyzes performance time, failure patterns, and generates recommendations.
"""
from typing import Dict, List
from collections import defaultdict
from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models.habit_log import HabitLog
from app.models.habit import Habit

DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
TIME_SLOTS = {
    "morning": "Morning (5–11 AM)",
    "afternoon": "Afternoon (11 AM–5 PM)",
    "evening": "Evening (5–9 PM)",
    "night": "Night (9 PM–12 AM)",
}


def get_habit_insights(db: Session, user_id: str) -> Dict:
    """
    Analyze habit logs to generate:
    1. Best performance day (day of week with highest completion)
    2. Failure pattern (day with most misses)
    3. Streak insights
    4. Recommendations
    """
    # Get all logs for this user
    all_logs = db.query(HabitLog).filter(HabitLog.user_id == user_id).all()
    habits = db.query(Habit).filter(
        Habit.user_id == user_id,
        Habit.is_active == True,
        Habit.habit_type == "positive",
    ).all()

    if not all_logs or not habits:
        return _empty_insights()

    habit_count = max(len(habits), 1)

    # Aggregate by day of week
    dow_completed = defaultdict(int)
    dow_total = defaultdict(int)

    for log in all_logs:
        if not isinstance(log.log_date, date):
            continue
        dow = log.log_date.weekday()  # 0=Monday, 6=Sunday
        dow_total[dow] += 1
        if log.completed:
            dow_completed[dow] += 1

    # Calculate completion rate per day
    dow_rates = {}
    for dow in range(7):
        total = dow_total.get(dow, 0)
        completed = dow_completed.get(dow, 0)
        dow_rates[dow] = round(completed / max(total, 1) * 100, 1)

    best_day_idx = max(dow_rates, key=dow_rates.get) if dow_rates else 0
    worst_day_idx = min(dow_rates, key=dow_rates.get) if dow_rates else 2

    best_day = DAYS_OF_WEEK[best_day_idx]
    worst_day = DAYS_OF_WEEK[worst_day_idx]
    best_rate = dow_rates.get(best_day_idx, 0)
    worst_rate = dow_rates.get(worst_day_idx, 0)

    # Build weekly chart data
    weekly_chart = [
        {"day": DAYS_OF_WEEK[i][:3], "rate": dow_rates.get(i, 0)}
        for i in range(7)
    ]

    # Generate insights
    insights = []

    if best_rate > 70:
        insights.append({
            "emoji": "🏆",
            "title": f"Best Day: {best_day}",
            "text": f"Aap {best_day} ko {best_rate:.0f}% habits complete karte hain — apni difficult habits isi din schedule karein!"
        })

    if worst_rate < 40 and worst_day != best_day:
        insights.append({
            "emoji": "⚠️",
            "title": f"Weak Day: {worst_day}",
            "text": f"{worst_day} aapka sabse mushkil din hai ({worst_rate:.0f}% completion). Is din ek nayi chhoti habit add karein ya goals reduce karein."
        })

    # Overall completion
    total_completed = sum(1 for log in all_logs if log.completed)
    total_logs = len(all_logs)
    overall_pct = round(total_completed / max(total_logs, 1) * 100, 1)

    if overall_pct >= 80:
        insights.append({
            "emoji": "🔥",
            "title": "Consistency King/Queen!",
            "text": f"Aapki overall {overall_pct:.0f}% completion rate exceptional hai. Keep going!"
        })
    elif overall_pct >= 50:
        insights.append({
            "emoji": "📈",
            "title": "Good Progress!",
            "text": f"{overall_pct:.0f}% completion — aap right track par hain. Ek aur push karo!"
        })
    else:
        insights.append({
            "emoji": "💡",
            "title": "Time to Reset Goals",
            "text": f"Abhi {overall_pct:.0f}% completion hai. Try karein: goals 50% chhote karein aur consistency build karein."
        })

    # Failure pattern recommendation
    if worst_rate < 30:
        insights.append({
            "emoji": "🎯",
            "title": f"{worst_day} Strategy Needed",
            "text": f"Har {worst_day} ko habits miss ho rahi hain. Is din ek 'anchor habit' set karein jaise morning walk ya 5-min journal."
        })

    return {
        "weekly_chart": weekly_chart,
        "best_day": best_day,
        "best_day_rate": best_rate,
        "worst_day": worst_day,
        "worst_day_rate": worst_rate,
        "overall_completion": overall_pct,
        "insights": insights,
        "total_logs_analyzed": total_logs,
    }


def _empty_insights() -> Dict:
    return {
        "weekly_chart": [{"day": d[:3], "rate": 0} for d in DAYS_OF_WEEK],
        "best_day": "Monday",
        "best_day_rate": 0,
        "worst_day": "Wednesday",
        "worst_day_rate": 0,
        "overall_completion": 0,
        "insights": [
            {
                "emoji": "🌱",
                "title": "Start Tracking!",
                "text": "Abhi tak koi data nahi hai. Pehle kuch din habits track karein phir insights milenge."
            }
        ],
        "total_logs_analyzed": 0,
    }
