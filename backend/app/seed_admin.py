import os
from sqlalchemy.orm import Session
from app.config import settings
from app.database.session import SessionLocal, engine, Base
from app.core.security import hash_password
from app.models.models import User, UserRole

def seed_admin() -> User:
    """
    Enforces ONLY ONE authorized Admin account on the platform:
    1. Reads ADMIN_EMAIL and ADMIN_PASSWORD from backend settings / environment.
    2. Checks whether the Admin account already exists.
    3. If it exists, ensures role is ADMIN and updates/retains password hash.
    4. If it does not exist, creates the single Admin account.
    5. Demotes or removes any other admin accounts so that there is strictly ONE Admin.
    """
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        admin_email = settings.ADMIN_EMAIL.strip().lower()
        admin_password = settings.ADMIN_PASSWORD

        # Check for existing user with ADMIN_EMAIL
        admin_user = db.query(User).filter(User.email == admin_email).first()

        if admin_user:
            admin_user.role = UserRole.ADMIN
            admin_user.hashed_password = hash_password(admin_password)
            admin_user.is_active = True
            db.commit()
            db.refresh(admin_user)
            print(f"[OK] Single Administrator verified and updated: {admin_email}")
        else:
            admin_user = User(
                email=admin_email,
                hashed_password=hash_password(admin_password),
                full_name="Platform Administrator",
                role=UserRole.ADMIN,
                avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&fit=crop&q=80",
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            print(f"[OK] Single Administrator created: {admin_email}")

        # Ensure NO OTHER user has ADMIN role
        other_admins = db.query(User).filter(User.role == UserRole.ADMIN, User.id != admin_user.id).all()
        for other in other_admins:
            other.role = UserRole.CUSTOMER
            print(f"[SECURITY] Demoted unauthorized admin account: {other.email} -> CUSTOMER")
        
        if other_admins:
            db.commit()

        print(f"ShopSense Administrator Account Ready: {admin_user.email} (Role: {admin_user.role.value})")
        return admin_user

    except Exception as e:
        db.rollback()
        print(f"Error seeding admin: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_admin()
