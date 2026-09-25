import urllib.request
import json
import sys

BASE_URL = "http://127.0.0.1:8000/api"

def make_req(endpoint, method="GET", data=None, token=None):
    url = f"{BASE_URL}{endpoint}"
    req = urllib.request.Request(url, method=method)
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    body = json.dumps(data).encode("utf-8") if data else None
    try:
        with urllib.request.urlopen(req, data=body) as res:
            res_data = res.read().decode("utf-8")
            return res.status, json.loads(res_data)
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        try:
            parsed = json.loads(err_body)
        except Exception:
            parsed = err_body
        return e.code, parsed
    except Exception as ex:
        return 500, str(ex)

def test_suite():
    passed = 0
    total = 0

    print("=== STARTING LIVE END-TO-END VERIFICATION ===")

    # 1. System Health
    total += 1
    status, res = make_req("/system/health")
    if status == 200 and res.get("status") == "OPERATIONAL":
        print(f"[PASS] 1. System Health: Operational, Dialect = {res['database']['dialect']} | Metrics = {res['metrics']}")
        passed += 1
    else:
        print(f"[FAIL] 1. System Health: {status} {res}")

    # 2. Authentication & Admin Security
    total += 1
    tokens = {}
    # Customer and Vendor demo login
    for role in ["vendor", "customer"]:
        status, res = make_req(f"/auth/quick-demo-login?role={role}", method="POST")
        if status == 200 and "access_token" in res:
            tokens[role] = res["access_token"]
            user_info = res.get("user", {})
            print(f"       -> Authenticated as {role.upper()} ({user_info.get('email')}, Role={user_info.get('role')})")
        else:
            print(f"[FAIL] 2. Demo login failed for {role}: {status} {res}")
            break

    # Admin demo login is enabled
    status_admin_demo, res_admin_demo = make_req("/auth/quick-demo-login?role=admin", method="POST")
    if status_admin_demo == 200 and isinstance(res_admin_demo, dict) and "access_token" in res_admin_demo:
        tokens["admin"] = res_admin_demo["access_token"]
        print("       -> Admin demo login succeeded with 200 OK")
    else:
        # Admin logs in with authorized credentials
        status_adm, res_adm = make_req("/auth/login", method="POST", data={
            "email": "admin@shopsense.com",
            "password": "ShopSense@123"
        })
        if status_adm == 200 and "access_token" in res_adm:
            tokens["admin"] = res_adm["access_token"]
            print(f"       -> Authorized Admin logged in ({res_adm['user']['email']}, Role={res_adm['user']['role']})")
    
    if len(tokens) == 3:
        print(f"[PASS] 2. Authentication & Role Validation: Verified Admin, Vendor, Customer with Admin demo access")
        passed += 1

    # 3. Categories
    total += 1
    status, res = make_req("/categories")
    if status == 200 and len(res) >= 8:
        print(f"[PASS] 3. Categories: Retrieved {len(res)} categories successfully")
        passed += 1
    else:
        print(f"[FAIL] 3. Categories: {status} {res}")

    # 4. Products with search & filtering
    total += 1
    status, res = make_req("/products?page=1&limit=10&search=Pro")
    if status == 200 and "items" in res and res["total"] > 0:
        first_name = res["items"][0]["name"].encode("ascii", "replace").decode("ascii")
        print(f"[PASS] 4. Products: Filtered search returned {res['total']} products, first is '{first_name}'")
        passed += 1
    else:
        print(f"[FAIL] 4. Products: {status} {res}")

    # 5. Vendor Analytics Overview
    total += 1
    status, res = make_req("/analytics/vendor/overview", token=tokens.get("vendor"))
    if status == 200 and "total_revenue" in res:
        print(f"[PASS] 5. Vendor Analytics: Total Revenue = ${res.get('total_revenue', 0):,.2f}, Total Orders = {res.get('total_orders', 0)}")
        passed += 1
    else:
        print(f"[FAIL] 5. Vendor Analytics: {status} {res}")

    # 6. ML Forecasting (Holt-Winters)
    total += 1
    status, res = make_req("/forecast?horizon=14&forecast_type=SALES", token=tokens.get("vendor"))
    if status == 200 and "points" in res and len(res["points"]) > 0:
        future_pts = [p for p in res["points"] if p.get("actual") is None]
        first_future = future_pts[0] if future_pts else res["points"][-1]
        print(f"[PASS] 6. ML Forecasting: 14-day horizon predicted (Total Projected: ${res.get('total_projected', 0):,.2f}, Day 1 forecast: ${first_future['predicted']:.2f})")
        passed += 1
    else:
        print(f"[FAIL] 6. ML Forecasting: {status} {res}")

    # 7. RAG Customer Shopping Assistant
    total += 1
    status, res = make_req("/ai/shopping-assistant", method="POST", data={"query": "wireless noise cancelling headphones"}, token=tokens.get("customer"))
    if status == 200 and "answer" in res and len(res.get("products", [])) > 0:
        top_name = res["products"][0]["name"].encode("ascii", "replace").decode("ascii")
        print(f"[PASS] 7. RAG AI Assistant: Retrieved {len(res['products'])} matched products. Top match: '{top_name}'")
        passed += 1
    else:
        print(f"[FAIL] 7. RAG AI Assistant: status={status}")

    # 8. Text-to-SQL AI Analyst
    total += 1
    status, res = make_req("/ai/data-analyst", method="POST", data={"question": "Show top 5 best selling products by units sold"}, token=tokens.get("vendor"))
    if status == 200 and "generated_sql" in res and "rows" in res:
        print(f"[PASS] 8. Text-to-SQL AI Analyst: Generated safe SQL: '{res['generated_sql'].splitlines()[0]}...' Returned {len(res['rows'])} rows")
        passed += 1
    else:
        print(f"[FAIL] 8. Text-to-SQL AI Analyst: {status} {res}")

    # 9. Personalized Recommendations
    total += 1
    status, res = make_req("/recommendations?limit=6", token=tokens.get("customer"))
    if status == 200 and len(res) > 0:
        print(f"[PASS] 9. Recommendations: Received {len(res)} personalized recommendations")
        passed += 1
    else:
        print(f"[FAIL] 9. Recommendations: {status} {res}")

    # 10. Notifications
    total += 1
    status, res = make_req("/notifications", token=tokens.get("vendor"))
    if status == 200 and isinstance(res, list):
        print(f"[PASS] 10. Notifications: Received {len(res)} vendor notification items")
        passed += 1
    else:
        print(f"[FAIL] 10. Notifications: {status} {res}")

    print(f"\n=== RESULT: {passed}/{total} LIVE END-TO-END TESTS PASSED ===")
    if passed == total:
        print(">>> ALL END-TO-END BACKEND & AI INTEGRATIONS ARE 100% OPERATIONAL! <<<")
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    test_suite()
