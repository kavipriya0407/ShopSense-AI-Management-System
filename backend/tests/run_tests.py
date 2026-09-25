import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import hash_password, verify_password, create_access_token
from app.ai.text_to_sql import validate_sql_safety

def run_all_tests():
    print("=" * 60)
    print("RUNNING SHOPSENSE BACKEND TEST SUITE")
    print("=" * 60)
    client = TestClient(app)
    passed = 0
    total = 0

    def test(name, fn):
        nonlocal passed, total
        total += 1
        try:
            fn()
            print(f" [PASS] {name}")
            passed += 1
        except Exception as e:
            print(f" [FAIL] {name}: {e}")

    # 1. Security
    def t_security():
        pwd = "SecretPassword123!"
        hashed = hash_password(pwd)
        assert verify_password(pwd, hashed) is True
        assert verify_password("WrongPassword", hashed) is False
        token = create_access_token({"sub": "1", "role": "ADMIN"})
        assert len(token) > 20
    test("Password Hashing & JWT Validation", t_security)

    # 2. Root API
    def t_root():
        res = client.get("/")
        assert res.status_code == 200
        assert res.json()["status"] == "online"
    test("API Root & Health Check", t_root)

    # 3. Categories API
    def t_categories():
        res = client.get("/api/categories")
        assert res.status_code == 200
        assert len(res.json()) >= 8
    test("Category Catalog Retrieval", t_categories)

    # 4. Products API
    def t_products():
        res = client.get("/api/products?page=1&page_size=10")
        assert res.status_code == 200
        data = res.json()
        assert data["total"] >= 100
        assert len(data["items"]) == 10

        res_p = client.get("/api/products?min_price=10000&max_price=30000")
        assert res_p.status_code == 200
        for item in res_p.json()["items"]:
            assert 10000 <= item["price"] <= 30000
    test("Product Search, Filtering, and Pagination", t_products)

    # 5. Text-to-SQL Guardrails
    def t_sql_guard():
        assert validate_sql_safety("SELECT * FROM products LIMIT 5;") is True
        assert validate_sql_safety("DROP TABLE users;") is False
        assert validate_sql_safety("DELETE FROM products WHERE id = 1;") is False
        assert validate_sql_safety("UPDATE products SET price = 0;") is False
        assert validate_sql_safety("INSERT INTO users (email) VALUES ('h@h.com');") is False
        assert validate_sql_safety("TRUNCATE TABLE orders;") is False
        assert validate_sql_safety("SELECT * FROM products; DROP TABLE users;") is False
    test("Text-to-SQL AST Safety & Anti-Injection Guardrails", t_sql_guard)

    # 6. Role-Based Demo Authentication & Security Controls
    def t_demo_auth():
        from app.config import settings
        # Customer & Vendor demo logins work
        for role in ["vendor", "customer"]:
            res = client.post(f"/api/auth/quick-demo-login?role={role}")
            assert res.status_code == 200, f"Demo login failed for {role}"
            assert "access_token" in res.json()
            assert res.json()["user"]["role"] == role.upper()

        # Admin demo login is enabled for demo access
        res_admin_demo = client.post("/api/auth/quick-demo-login?role=admin")
        assert res_admin_demo.status_code == 200, "Admin demo login must succeed"
        assert res_admin_demo.json()["user"]["role"] == "ADMIN"

        # Authorized Admin logs in via credentials (Requirement 9)
        res_admin = client.post("/api/auth/login", json={
            "email": settings.ADMIN_EMAIL,
            "password": settings.ADMIN_PASSWORD
        })
        assert res_admin.status_code == 200, "Authorized Admin credential login must succeed"
        assert res_admin.json()["user"]["role"] == "ADMIN"
        admin_token = res_admin.json()["access_token"]

        # Public registration cannot create Admin (Requirement 10)
        res_reg = client.post("/api/auth/register", json={
            "email": "hacker_admin@example.com",
            "password": "Password123!",
            "full_name": "Rogue Admin",
            "role": "ADMIN"
        })
        assert res_reg.status_code == 403, "Public registration must reject ADMIN role"

        # Vendor token
        res_v = client.post("/api/auth/quick-demo-login?role=vendor")
        vendor_token = res_v.json()["access_token"]

        # Customer token
        res_c = client.post("/api/auth/quick-demo-login?role=customer")
        customer_token = res_c.json()["access_token"]

        # Admin API protection (Requirement 13)
        res_unauth = client.get("/api/admin/orders")
        assert res_unauth.status_code in (401, 403)
        res_cust_admin = client.get("/api/admin/orders", headers={"Authorization": f"Bearer {customer_token}"})
        assert res_cust_admin.status_code == 403, "Customer must be rejected from Admin API"
        res_vend_admin = client.get("/api/admin/orders", headers={"Authorization": f"Bearer {vendor_token}"})
        assert res_vend_admin.status_code == 403, "Vendor must be rejected from Admin API"

        # Authorized Admin gets 200
        res_admin_ok = client.get("/api/admin/orders", headers={"Authorization": f"Bearer {admin_token}"})
        assert res_admin_ok.status_code == 200, "Authorized Admin must access Admin API"

        # Admin Marketplace CSV export (Requirement 28, 29)
        res_csv_admin = client.get("/api/admin/orders/export/csv", headers={"Authorization": f"Bearer {admin_token}"})
        assert res_csv_admin.status_code == 200
        assert "text/csv" in res_csv_admin.headers.get("content-type", "")
        assert "Order ID" in res_csv_admin.text

        # Vendor Sales CSV export (Requirement 27, 29)
        res_csv_vend = client.get("/api/vendor/sales/export/csv", headers={"Authorization": f"Bearer {vendor_token}"})
        assert res_csv_vend.status_code == 200
        assert "text/csv" in res_csv_vend.headers.get("content-type", "")

        # Customer Orders CSV export (Requirement 25, 29)
        res_csv_cust = client.get("/api/orders/export/csv", headers={"Authorization": f"Bearer {customer_token}"})
        assert res_csv_cust.status_code == 200
        assert "text/csv" in res_csv_cust.headers.get("content-type", "")

    test("Security, RBAC, Admin Lockout & Dynamic CSV Exports", t_demo_auth)

    # 7. System Health
    def t_system_health():
        res = client.get("/api/system/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "OPERATIONAL"
        assert data["database"]["status"] == "HEALTHY"
        assert data["metrics"]["total_products"] >= 100
        assert data["metrics"]["total_orders"] >= 500
    test("System Health & Database Integrity Check", t_system_health)

    # 8. Recommendation Engine
    def t_recommendations():
        res = client.get("/api/recommendations?limit=6")
        assert res.status_code == 200
        assert len(res.json()) == 6
    test("AI Recommendation Engine API", t_recommendations)

    print("=" * 60)
    print(f"TEST RESULTS: {passed}/{total} PASSED")
    print("=" * 60)
    if passed != total:
        sys.exit(1)

if __name__ == "__main__":
    run_all_tests()
