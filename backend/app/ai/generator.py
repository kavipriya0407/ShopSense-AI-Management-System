from typing import Dict, List, Any, Optional
from app.config import settings
from app.ai.rag_engine import query_gemini_or_openai

async def generate_product_ai_metadata(
    name: str,
    category: Optional[str] = None,
    rough_specs: Optional[str] = None,
    tone: str = "premium"
) -> Dict[str, Any]:
    """Generates SEO title, product descriptions, keywords, tags, and category suggestion."""
    if settings.has_ai_key:
        prompt = f"""Generate rich e-commerce product copy for an online store.
Product Name: {name}
Category: {category or 'Electronics/Lifestyle'}
Specifications/Details: {rough_specs or 'High quality, durable, modern design'}
Tone: {tone}

Output format:
SEO_TITLE: <catchy SEO title under 60 chars>
SHORT_DESC: <engaging 1-2 sentence elevator pitch>
FULL_DESC: <compelling 2 paragraph product description with benefits and specs>
TAGS: <comma separated tags>
SEO_KEYWORDS: <comma separated keywords>
CATEGORY_SUGGESTION: <best fitting category>
"""
        response = await query_gemini_or_openai(prompt)
        if response:
            try:
                def extract_field(label: str) -> str:
                    import re
                    match = re.search(rf'{label}:\s*(.*?)(?=\n[A-Z_]+:|$)', response, re.DOTALL)
                    return match.group(1).strip() if match else ""

                seo_title = extract_field("SEO_TITLE") or f"{name} - Premium Edition | ShopSense"
                short_desc = extract_field("SHORT_DESC") or f"Discover exceptional performance and craft with the {name}."
                full_desc = extract_field("FULL_DESC") or f"Engineered for reliability, the {name} combines cutting-edge engineering with refined style."
                raw_tags = extract_field("TAGS") or "premium, trending, top-rated"
                raw_keywords = extract_field("SEO_KEYWORDS") or f"{name.lower()}, buy {name.lower()}, online shopping"
                cat_sugg = extract_field("CATEGORY_SUGGESTION") or (category or "Electronics")

                return {
                    "seo_title": seo_title,
                    "short_description": short_desc,
                    "full_description": full_desc,
                    "tags": [t.strip() for t in raw_tags.split(",") if t.strip()],
                    "seo_keywords": [k.strip() for k in raw_keywords.split(",") if k.strip()],
                    "category_suggestion": cat_sugg
                }
            except Exception:
                pass

    # Deterministic high-quality fallback
    clean_name = name.strip().title()
    cat = category or "Electronics & Gadgets"
    seo_title = f"{clean_name} - High Performance & Sleek Design | ShopSense"
    short_desc = f"Experience unmatched reliability and contemporary elegance with the all-new {clean_name}."
    full_desc = (
        f"The {clean_name} sets a new benchmark in its class, bringing together precision engineering, "
        f"durable materials, and intuitive ease of use. Designed to seamlessly fit into your daily workflow "
        f"and lifestyle, it provides an uncompromising blend of speed, battery efficiency, and premium tactile feel.\n\n"
        f"Whether you are working remotely, traveling, or relaxing at home, the {clean_name} delivers dependable "
        f"satisfaction backed by verified customer reviews and ShopSense buyer protection."
    )
    tags = [clean_name.lower(), "trending", "best-seller", "smart-choice", cat.lower()]
    keywords = [f"buy {clean_name.lower()}", f"best {clean_name.lower()} 2026", f"{clean_name.lower()} review", f"{cat.lower()} online"]

    return {
        "seo_title": seo_title,
        "short_description": short_desc,
        "full_description": full_desc,
        "tags": tags,
        "seo_keywords": keywords,
        "category_suggestion": cat
    }
