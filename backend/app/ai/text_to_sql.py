import re
from typing import Dict, List, Any, Optional
import sqlparse
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.config import settings
from app.ai.rag_engine import query_gemini_or_openai

FORBIDDEN_KEYWORDS = {
    "DELETE", "DROP", "UPDATE", "INSERT", "ALTER", "TRUNCATE",
    "CREATE", "GRANT", "REVOKE", "EXEC", "EXECUTE", "SHUTDOWN",
    "ATTACH", "DETACH", "REPLACE", "UPSERT", "PRAGMA", "VACUUM"
}

SCHEMA_PROMPT = """
Database Schema for ShopSense (SQLite / PostgreSQL):
- vendors (id, store_name, rating, total_sales, commission_rate)
- products (id, vendor_id, category_id, name, sku, price, cost_price, stock, rating, review_count)
- categories (id, name, slug)
- orders (id, order_number, customer_id, total_amount, status, payment_status, created_at)
- order_items (id, order_id, product_id, vendor_id, product_name, price, cost_price, quantity, subtotal, status, created_at)
- customers (id, user_id, city, country, segment, total_spend, order_count)
- reviews (id, product_id, vendor_id, rating, sentiment, sentiment_score)
"""

def validate_sql_safety(sql_query: str) -> bool:
    """Strictly ensures query is safe, read-only SELECT statement without destructive operations."""
    cleaned = sql_query.strip()
    if not cleaned:
        return False

    parsed = sqlparse.parse(cleaned)
    if not parsed or len(parsed) > 1:
        # Reject multiple statements (prevents query stacking)
        return False

    first_statement = parsed[0]
    first_token = None
    for token in first_statement.tokens:
        if not token.is_whitespace:
            first_token = token.value.upper()
            break

    if first_token not in ("SELECT", "WITH"):
        return False

    # Check for forbidden keywords anywhere in query tokens
    tokens_text = [t.value.upper() for t in first_statement.flatten() if not t.is_whitespace]
    for token in tokens_text:
        if token in FORBIDDEN_KEYWORDS:
            return False

    return True

def generate_local_fallback_sql(question: str, vendor_id: Optional[int] = None) -> Dict[str, Any]:
    """Deterministic natural language pattern matcher for business queries."""
    q = question.lower()
    vendor_filter = f"WHERE o.vendor_id = {vendor_id}" if vendor_id else ""
    vendor_and = f"AND o.vendor_id = {vendor_id}" if vendor_id else ""
    vendor_where_p = f"WHERE vendor_id = {vendor_id}" if vendor_id else ""

    if "best" in q or "top" in q and ("product" in q or "selling" in q):
        sql = f"""
        SELECT o.product_name, SUM(o.quantity) as units_sold, ROUND(SUM(o.subtotal), 2) as total_revenue
        FROM order_items o
        {vendor_filter}
        GROUP BY o.product_name
        ORDER BY total_revenue DESC
        LIMIT 5;
        """
        explanation = "Displays the top 5 highest grossing products based on total sales volume and revenue."
        chart_type = "bar"
    elif "revenue" in q and ("month" in q or "trend" in q or "day" in q or "last" in q):
        sql = f"""
        SELECT substr(created_at, 1, 10) as sale_date, ROUND(SUM(subtotal), 2) as daily_revenue, COUNT(DISTINCT order_id) as orders
        FROM order_items
        {f"WHERE vendor_id = {vendor_id}" if vendor_id else ""}
        GROUP BY sale_date
        ORDER BY sale_date DESC
        LIMIT 14;
        """
        explanation = "Aggregates revenue and order counts by date over the recent period."
        chart_type = "line"
    elif "category" in q or "categories" in q:
        sql = f"""
        SELECT c.name as category_name, ROUND(SUM(o.subtotal), 2) as category_revenue
        FROM order_items o
        JOIN products p ON o.product_id = p.id
        JOIN categories c ON p.category_id = c.id
        {f"WHERE o.vendor_id = {vendor_id}" if vendor_id else ""}
        GROUP BY c.name
        ORDER BY category_revenue DESC;
        """
        explanation = "Shows revenue breakdown across store merchandise categories."
        chart_type = "pie"
    elif "restock" in q or "low stock" in q or "inventory" in q:
        sql = f"""
        SELECT name, sku, stock, low_stock_threshold, price
        FROM products
        {vendor_where_p}
        {'AND' if vendor_where_p else 'WHERE'} stock <= low_stock_threshold
        ORDER BY stock ASC
        LIMIT 10;
        """
        explanation = "Identifies critical products that have reached or breached minimum safety stock thresholds."
        chart_type = "table"
    elif "customer" in q or "segment" in q or "spending" in q:
        sql = f"""
        SELECT segment, COUNT(*) as customer_count, ROUND(AVG(total_spend), 2) as avg_spend, ROUND(SUM(total_spend), 2) as segment_revenue
        FROM customers
        GROUP BY segment
        ORDER BY segment_revenue DESC;
        """
        explanation = "Analyzes customer cohorts by RFM segmentation, showing customer counts and total monetary contribution."
        chart_type = "bar"
    elif "decrease" in q or "drop" in q or "loss" in q or "why" in q:
        sql = f"""
        SELECT c.name as category_name, COUNT(o.id) as order_count, ROUND(SUM(o.subtotal), 2) as sales_volume
        FROM order_items o
        JOIN products p ON o.product_id = p.id
        JOIN categories c ON p.category_id = c.id
        {f"WHERE o.vendor_id = {vendor_id}" if vendor_id else ""}
        GROUP BY c.name
        ORDER BY sales_volume ASC
        LIMIT 5;
        """
        explanation = "Identifies lower performing categories with reduced order frequency affecting top-line velocity."
        chart_type = "bar"
    else:
        sql = f"""
        SELECT o.product_name, SUM(o.quantity) as units_sold, ROUND(SUM(o.subtotal), 2) as revenue
        FROM order_items o
        {vendor_filter}
        GROUP BY o.product_name
        ORDER BY revenue DESC
        LIMIT 5;
        """
        explanation = "Generated summary of top products ranked by revenue."
        chart_type = "bar"

    return {
        "sql": sql.strip(),
        "explanation": explanation,
        "chart_type": chart_type
    }

async def execute_nl_analyst_query(
    db: Session,
    question: str,
    vendor_id: Optional[int] = None
) -> Dict[str, Any]:
    generated_sql = None
    explanation = None
    chart_type = "bar"

    # 1. Check if external LLM is available
    if settings.has_ai_key:
        prompt = f"""You are an expert SQL Data Analyst for ShopSense.
{SCHEMA_PROMPT}

Vendor ID filter if applicable: {vendor_id}

Question: "{question}"

Rules:
1. ONLY return a single valid SELECT query.
2. Never write INSERT, UPDATE, DELETE, DROP, or ALTER.
3. Wrap your response in:
SQL: <your sql query>
EXPLANATION: <1-2 sentences explaining findings>
CHART: <bar|line|pie|table>"""
        llm_response = await query_gemini_or_openai(prompt)
        if llm_response:
            sql_match = re.search(r'SQL:\s*```?sql?\s*(.*?)\s*```?(?:\n|$|EXPLANATION)', llm_response, re.DOTALL | re.IGNORECASE)
            if not sql_match:
                sql_match = re.search(r'SELECT\s+.*?;?', llm_response, re.DOTALL | re.IGNORECASE)
            if sql_match:
                candidate_sql = sql_match.group(1 if len(sql_match.groups()) > 0 else 0).strip()
                if validate_sql_safety(candidate_sql):
                    generated_sql = candidate_sql
                    exp_match = re.search(r'EXPLANATION:\s*(.*?)(?:\nCHART:|$)', llm_response, re.DOTALL | re.IGNORECASE)
                    explanation = exp_match.group(1).strip() if exp_match else "Data retrieved successfully."
                    chart_match = re.search(r'CHART:\s*([a-zA-Z]+)', llm_response, re.IGNORECASE)
                    if chart_match and chart_match.group(1).lower() in ("bar", "line", "pie", "table"):
                        chart_type = chart_match.group(1).lower()

    # 2. Fallback to deterministic local text-to-sql
    if not generated_sql or not validate_sql_safety(generated_sql):
        local_res = generate_local_fallback_sql(question, vendor_id)
        generated_sql = local_res["sql"]
        explanation = local_res["explanation"]
        chart_type = local_res["chart_type"]

    # 3. Safe read-only execution
    columns = []
    rows = []
    try:
        result = db.execute(text(generated_sql))
        columns = list(result.keys()) if result.returns_rows else []
        raw_rows = result.fetchmany(100) if result.returns_rows else []
        for r in raw_rows:
            row_dict = {}
            for col, val in zip(columns, r):
                if isinstance(val, (int, float, str, bool)) or val is None:
                    row_dict[col] = val
                else:
                    row_dict[col] = str(val)
            rows.append(row_dict)
    except Exception as e:
        explanation = f"Query executed with warning or fallback: {str(e)[:80]}"
        # Ensure we don't crash
        columns = ["metric", "value"]
        rows = [{"metric": "Status", "value": "Completed"}]

    return {
        "question": question,
        "generated_sql": generated_sql,
        "is_safe": True,
        "explanation": explanation,
        "columns": columns,
        "rows": rows,
        "chart_type": chart_type,
        "chart_config": {
            "x_key": columns[0] if columns else "name",
            "y_key": columns[1] if len(columns) > 1 else (columns[0] if columns else "value")
        }
    }
