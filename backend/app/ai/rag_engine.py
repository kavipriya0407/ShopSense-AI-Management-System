import re
from typing import Dict, List, Any, Optional
import httpx
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.config import settings
from app.models.models import Product, Category

SUGGESTED_QUESTIONS = [
    "What is the best laptop for video editing and programming?",
    "Show me top-rated wireless noise-canceling headphones under ₹15,000",
    "Which products are best for college students on a budget?",
    "Show me smart watches with long battery life",
    "What are the highest-rated smartphones available right now?"
]

def extract_price_constraint(query: str) -> Optional[float]:
    match = re.search(r'(?:under|below|less than|max|budget of)\s*(?:₹|rs\.?|inr)?\s*([0-9,]+)', query, re.IGNORECASE)
    if match:
        try:
            return float(match.group(1).replace(",", ""))
        except ValueError:
            pass
    return None

def retrieve_relevant_products(db: Session, query: str, limit: int = 4) -> List[Product]:
    query_lower = query.lower()
    max_price = extract_price_constraint(query_lower)

    db_query = db.query(Product).filter(Product.is_active == True)
    if max_price:
        db_query = db_query.filter(Product.price <= max_price)

    # Keyword tokens
    stop_words = {"what", "is", "the", "for", "me", "show", "best", "good", "a", "an", "and", "under", "in", "with", "have", "which"}
    tokens = [w for w in re.findall(r'\b[a-zA-Z0-9]+\b', query_lower) if w not in stop_words and len(w) > 2]

    if tokens:
        clauses = []
        for t in tokens:
            clauses.append(Product.name.ilike(f"%{t}%"))
            clauses.append(Product.tags.ilike(f"%{t}%"))
            clauses.append(Product.description.ilike(f"%{t}%"))
        db_query = db_query.filter(or_(*clauses))

    # Order by rating & review count
    products = db_query.order_by(Product.rating.desc(), Product.review_count.desc()).limit(limit).all()

    # Fallback if no exact token matches: fetch top rated items within price constraint
    if not products:
        fallback_query = db.query(Product).filter(Product.is_active == True)
        if max_price:
            fallback_query = fallback_query.filter(Product.price <= max_price)
        products = fallback_query.order_by(Product.rating.desc()).limit(limit).all()

    return products

async def query_gemini_or_openai(prompt: str) -> Optional[str]:
    """Call Google Gemini or OpenAI if API key is provided."""
    if settings.GEMINI_API_KEY:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}]
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    return data["candidates"][0]["content"]["parts"][0]["text"]
        except Exception:
            pass

    if settings.OPENAI_API_KEY:
        try:
            url = "https://api.openai.com/v1/chat/completions"
            headers = {"Authorization": f"Bearer {settings.OPENAI_API_KEY}"}
            payload = {
                "model": "gpt-4o-mini",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.3
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(url, headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    return data["choices"][0]["message"]["content"]
        except Exception:
            pass

    return None

async def answer_shopping_query(db: Session, user_query: str) -> Dict[str, Any]:
    matched_products = retrieve_relevant_products(db, user_query, limit=4)
    
    product_cards = []
    catalog_context_lines = []

    for p in matched_products:
        cat_name = p.category.name if p.category else "Electronics"
        vendor_name = p.vendor.store_name if p.vendor else "ShopSense Verified Store"
        product_cards.append({
            "id": p.id,
            "name": p.name,
            "slug": p.slug,
            "price": p.price,
            "compare_at_price": p.compare_at_price,
            "rating": p.rating,
            "review_count": p.review_count,
            "image_url": p.image_url,
            "category": cat_name,
            "vendor": vendor_name,
            "stock": p.stock,
            "in_stock": p.stock > 0
        })
        catalog_context_lines.append(
            f"- {p.name} | Category: {cat_name} | Price: ₹{p.price:,.2f} | Rating: {p.rating}⭐ ({p.review_count} reviews) | In-stock: {p.stock} units | Vendor: {vendor_name}"
        )

    context_str = "\n".join(catalog_context_lines)
    prompt = f"""You are the ShopSense AI Shopping Assistant. Help the customer choose the best product based strictly on our store's actual catalog.
Do NOT invent products that are not in the context list.

User Question: "{user_query}"

Relevant Available Products in ShopSense Catalog:
{context_str}

Provide a helpful, polite, and persuasive recommendation explaining why these specific products match their needs. Highlight key features, value for money, and customer ratings."""

    mode = "local_rag"
    answer_text = None

    if settings.has_ai_key:
        answer_text = await query_gemini_or_openai(prompt)
        if answer_text:
            mode = "gemini_rag" if settings.GEMINI_API_KEY else "openai_rag"

    if not answer_text:
        # Deterministic rich fallback synthesis
        if matched_products:
            primary = matched_products[0]
            answer_text = (
                f"Based on our catalog, the top recommendation is **{primary.name}** priced at **₹{primary.price:,.2f}** "
                f"with a **{primary.rating} ⭐** customer satisfaction rating ({primary.review_count} verified reviews). "
                f"It is currently in stock from *{primary.vendor.store_name if primary.vendor else 'ShopSense'}*. "
            )
            if len(matched_products) > 1:
                secondary = matched_products[1]
                answer_text += (
                    f"\n\nAnother excellent alternative is **{secondary.name}** at **₹{secondary.price:,.2f}**, "
                    f"which offers great value in the *{secondary.category.name if secondary.category else 'curated'}* category."
                )
            answer_text += "\n\nYou can click on any product card below to view full specifications, customer sentiment, or add it to your cart."
        else:
            answer_text = (
                "I searched our store catalog but couldn't find an exact match for your query. "
                "Try browsing our trending electronics, home appliances, and accessories, or adjusting your price filters!"
            )

    return {
        "answer": answer_text,
        "suggested_questions": SUGGESTED_QUESTIONS,
        "products": product_cards,
        "mode": mode
    }
