import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import hash_password, verify_password, create_access_token
from app.ai.text_to_sql import validate_sql_safety

client = TestClient(app)

def test_password_hashing():
    pwd = "SecretPassword123!"
    hashed = hash_password(pwd)
    assert verify_password(pwd, hashed) is True
    assert verify_password("WrongPassword", hashed) is False

def test_jwt_token_flow():
    token = create_access_token({"sub": "1", "role": "ADMIN"})
    assert isinstance(token, str)
    assert len(token) > 20

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "ShopSense" in data["message"]

def test_categories_api():
    response = client.get("/api/categories")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 8
    assert any(c["slug"] == "laptops-computing" for c in data)

def test_products_catalog_search_and_filter():
    # Listing
    response = client.get("/api/products?page=1&page_size=10")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 100
    assert len(data["items"]) == 10

    # Search
    response = client.get("/api/products?search=Titanium")
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) > 0

    # Price filter
    response = client.get("/api/products?min_price=10000&max_price=30000")
    assert response.status_code == 200
    data = response.json()
    for item in data["items"]:
        assert 10000 <= item["price"] <= 30000

def test_text_to_sql_security_guardrails():
    # Safe queries must pass
    assert validate_sql_safety("SELECT * FROM products LIMIT 5;") is True
    assert validate_sql_safety("WITH top_sales AS (SELECT * FROM order_items) SELECT * FROM top_sales;") is True
    assert validate_sql_safety("SELECT p.name, SUM(o.quantity) FROM products p JOIN order_items o ON p.id=o.product_id GROUP BY p.name;") is True

    # Destructive queries MUST BE BLOCKED
    assert validate_sql_safety("DROP TABLE users;") is False
    assert validate_sql_safety("DELETE FROM products WHERE id = 1;") is False
    assert validate_sql_safety("UPDATE products SET price = 0;") is False
    assert validate_sql_safety("INSERT INTO users (email) VALUES ('hacker@evil.com');") is False
    assert validate_sql_safety("TRUNCATE TABLE orders;") is False
    assert validate_sql_safety("ALTER TABLE customers ADD COLUMN hack TEXT;") is False
    assert validate_sql_safety("SELECT * FROM products; DROP TABLE users;") is False

def test_quick_demo_login():
    for role in ["admin", "vendor", "customer"]:
        response = client.post(f"/api/auth/quick-demo-login?role={role}")
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["role"] == role.upper()

def test_system_health():
    response = client.get("/api/system/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "OPERATIONAL"
    assert data["database"]["status"] == "HEALTHY"
    assert data["metrics"]["total_products"] >= 100
    assert data["metrics"]["total_orders"] >= 500
