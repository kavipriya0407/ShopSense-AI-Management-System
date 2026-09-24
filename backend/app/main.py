from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database.session import engine, Base
import app.models # ensure models are registered with Base

# Import all routers
from app.api import (
    auth, products, categories, inventory, orders,
    customers, vendors, reviews, analytics, forecast,
    recommendations, ai_assistant, ai_analyst, ai_generator,
    reports, notifications, system_health, ws, admin
)
from app.seed_admin import seed_admin

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure tables are created on startup
    Base.metadata.create_all(bind=engine)
    # Ensure the single authorized admin account is seeded
    try:
        seed_admin()
    except Exception as e:
        print(f"Warning: automatic admin seed failed: {e}")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=f"{settings.PROJECT_TAGLINE}\n\nMulti-vendor E-Commerce + Business Intelligence + ML & GenAI Platform.",
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS Middleware - strictly configured for frontend origins, methods, and headers
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"],
)

# Register REST and WebSocket routers
api_prefix = settings.API_V1_STR
app.include_router(auth.router, prefix=api_prefix)
app.include_router(admin.router, prefix=api_prefix)
app.include_router(products.router, prefix=api_prefix)
app.include_router(categories.router, prefix=api_prefix)
app.include_router(inventory.router, prefix=api_prefix)
app.include_router(orders.router, prefix=api_prefix)
app.include_router(customers.router, prefix=api_prefix)
app.include_router(vendors.router, prefix=api_prefix)
app.include_router(vendors.vendor_router, prefix=api_prefix)
app.include_router(reviews.router, prefix=api_prefix)
app.include_router(analytics.router, prefix=api_prefix)
app.include_router(forecast.router, prefix=api_prefix)
app.include_router(recommendations.router, prefix=api_prefix)
app.include_router(ai_assistant.router, prefix=api_prefix)
app.include_router(ai_analyst.router, prefix=api_prefix)
app.include_router(ai_generator.router, prefix=api_prefix)
app.include_router(reports.router, prefix=api_prefix)
app.include_router(notifications.router, prefix=api_prefix)
app.include_router(system_health.router, prefix=api_prefix)
app.include_router(ws.router, prefix=api_prefix)

@app.get("/")
def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API",
        "tagline": settings.PROJECT_TAGLINE,
        "docs_url": "/docs",
        "status": "online"
    }
