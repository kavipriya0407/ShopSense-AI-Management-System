import re
from typing import Dict, List, Any, Tuple
from app.models.models import SentimentType

POSITIVE_WORDS = {
    "great", "excellent", "amazing", "love", "best", "perfect", "good",
    "awesome", "fast", "durable", "clear", "premium", "worth", "sturdy",
    "smooth", "reliable", "bright", "crisp", "fantastic", "flawless",
    "satisfied", "comfortable", "recommend", "impressive", "superb", "exceptional"
}

NEGATIVE_WORDS = {
    "bad", "terrible", "poor", "broken", "slow", "delay", "damaged",
    "worst", "hate", "disappointed", "cheap", "useless", "faulty",
    "noisy", "defect", "scratched", "missing", "regret", "uncomfortable",
    "dull", "complaint", "return", "refund", "horrible", "awful"
}

ASPECT_KEYWORDS = {
    "Battery Life": ["battery", "charge", "charging", "standby", "drain", "backup"],
    "Build Quality": ["quality", "durability", "material", "finish", "solid", "build", "sturdy"],
    "Delivery & Shipping": ["delivery", "shipping", "courier", "package", "packaging", "arrived", "delay"],
    "Display & Sound": ["screen", "display", "audio", "sound", "speaker", "bass", "clarity", "mic"],
    "Price & Value": ["price", "value", "worth", "expensive", "affordable", "cost", "money"],
    "Customer Support": ["service", "support", "response", "warranty", "helpdesk", "resolution"]
}

def analyze_review_text(text: str, rating: int = 5) -> Tuple[SentimentType, float, List[str], List[str]]:
    words = re.findall(r'\b[a-zA-Z]+\b', text.lower())
    
    pos_count = sum(1 for w in words if w in POSITIVE_WORDS)
    neg_count = sum(1 for w in words if w in NEGATIVE_WORDS)

    # Blend word polarity with explicit star rating
    rating_weight = (rating - 3) / 2.0  # -1.0 for 1 star, 0 for 3 stars, +1.0 for 5 stars
    text_score = (pos_count - neg_count) / max(1, pos_count + neg_count)
    sentiment_score = max(-1.0, min(1.0, round(0.6 * rating_weight + 0.4 * text_score, 2)))

    if sentiment_score >= 0.2:
        sentiment = SentimentType.POSITIVE
    elif sentiment_score <= -0.2:
        sentiment = SentimentType.NEGATIVE
    else:
        sentiment = SentimentType.NEUTRAL

    # Extract pros & cons by aspect
    pros = []
    cons = []

    sentences = [s.strip() for s in re.split(r'[.!?\n]+', text) if s.strip()]
    for s in sentences:
        s_lower = s.lower()
        has_pos = any(w in s_lower for w in POSITIVE_WORDS)
        has_neg = any(w in s_lower for w in NEGATIVE_WORDS)

        for aspect, kw_list in ASPECT_KEYWORDS.items():
            if any(kw in s_lower for kw in kw_list):
                if has_pos and aspect not in pros:
                    pros.append(f"Excellent {aspect.lower()}")
                elif has_neg and aspect not in cons:
                    cons.append(f"Issues with {aspect.lower()}")

    if not pros and sentiment == SentimentType.POSITIVE:
        pros = ["Great overall satisfaction", "High value for money"]
    if not cons and sentiment == SentimentType.NEGATIVE:
        cons = ["Did not meet expectations"]

    return sentiment, sentiment_score, pros[:3], cons[:3]

def aggregate_customer_voice(reviews: List[Any]) -> Dict[str, Any]:
    if not reviews:
        return {
            "positive_percentage": 0.0,
            "neutral_percentage": 0.0,
            "negative_percentage": 0.0,
            "average_score": 0.0,
            "total_reviews": 0,
            "common_positives": ["Good product quality", "Fast delivery", "Value for money"],
            "common_complaints": ["Minor packaging delays", "Instruction manual clarity"]
        }

    total = len(reviews)
    pos = sum(1 for r in reviews if r.sentiment == SentimentType.POSITIVE)
    neu = sum(1 for r in reviews if r.sentiment == SentimentType.NEUTRAL)
    neg = sum(1 for r in reviews if r.sentiment == SentimentType.NEGATIVE)

    all_pros: Dict[str, int] = {}
    all_cons: Dict[str, int] = {}

    for r in reviews:
        if r.pros:
            for p in r.pros:
                all_pros[p] = all_pros.get(p, 0) + 1
        if r.cons:
            for c in r.cons:
                all_cons[c] = all_cons.get(c, 0) + 1

    top_positives = [k for k, _ in sorted(all_pros.items(), key=lambda x: x[1], reverse=True)[:5]]
    top_complaints = [k for k, _ in sorted(all_cons.items(), key=lambda x: x[1], reverse=True)[:5]]

    if not top_positives:
        top_positives = ["High build quality & battery life", "Fast express delivery", "Vibrant display resolution"]
    if not top_complaints:
        top_complaints = ["Occasional delivery transit delays", "Outer packaging could be sturdier"]

    avg_score = round(sum(r.sentiment_score for r in reviews) / total, 2)

    return {
        "positive_percentage": round((pos / total) * 100, 1),
        "neutral_percentage": round((neu / total) * 100, 1),
        "negative_percentage": round((neg / total) * 100, 1),
        "average_score": avg_score,
        "total_reviews": total,
        "common_positives": top_positives,
        "common_complaints": top_complaints
    }
