import random
import uuid
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.config import settings
from app.database.session import SessionLocal, engine, Base
from app.core.security import hash_password
from app.models.models import (
    User, UserRole, Vendor, Customer, CustomerSegment,
    Category, Product, InventoryLog, Order, OrderItem,
    OrderStatus, PaymentStatus, Transaction, Review,
    SentimentType, Notification, NotificationType
)
from app.ml.sentiment import analyze_review_text

DEMO_PASSWORD = "ShopSense@123"

CATEGORIES_DATA = [
    {
        "name": "Laptops & Computing",
        "slug": "laptops-computing",
        "icon": "Laptop",
        "image_url": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
        "description": "High performance ultrabooks, creator workstations, and business laptops."
    },
    {
        "name": "Audio & Headphones",
        "slug": "audio-headphones",
        "icon": "Headphones",
        "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
        "description": "Studio-grade wireless ANC headphones, earbuds, and spatial sound speakers."
    },
    {
        "name": "Smartphones & Wearables",
        "slug": "smartphones-wearables",
        "icon": "Smartphone",
        "image_url": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80",
        "description": "Flagship 5G smartphones, AMOLED smartwatches, and fitness trackers."
    },
    {
        "name": "Gaming & Consoles",
        "slug": "gaming-consoles",
        "icon": "Gamepad2",
        "image_url": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80",
        "description": "Next-gen consoles, mechanical keyboards, gaming mice, and VR headsets."
    },
    {
        "name": "Smart Home & IoT",
        "slug": "smart-home-iot",
        "icon": "Home",
        "image_url": "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&auto=format&fit=crop&q=80",
        "description": "Intelligent lighting, robotic vacuum cleaners, security hubs, and smart plugs."
    },
    {
        "name": "Cameras & Optics",
        "slug": "cameras-optics",
        "icon": "Camera",
        "image_url": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80",
        "description": "Full-frame mirrorless cameras, 4K action cams, and creator ring lights."
    },
    {
        "name": "Home Appliances",
        "slug": "home-appliances",
        "icon": "Tv",
        "image_url": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80",
        "description": "Smart air purifiers, espresso coffee machines, and induction blenders."
    },
    {
        "name": "Accessories & Gear",
        "slug": "accessories-gear",
        "icon": "Package",
        "image_url": "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80",
        "description": "Fast GaN chargers, ergonomic laptop stands, braided cables, and tech sleeves."
    }
]

VENDORS_DATA = [
    {
        "name": "Nexus Tech Hub",
        "email": "vendor@shopsense.com", # Primary demo vendor
        "full_name": "Vikram Patel",
        "desc": "Official authorized flagship distributor for next-gen consumer technology.",
        "rating": 4.9,
        "commission": 0.10
    },
    {
        "name": "Apex Audio Labs",
        "email": "vendor2@shopsense.com",
        "full_name": "Priya Sen",
        "desc": "Audiophile grade personal sound systems and acoustic accessories.",
        "rating": 4.8,
        "commission": 0.10
    },
    {
        "name": "Aero Gaming Systems",
        "email": "vendor3@shopsense.com",
        "full_name": "Rohan Mehra",
        "desc": "Pro esports gear, mechanical keyboards, and high-FPS gaming peripherals.",
        "rating": 4.7,
        "commission": 0.12
    },
    {
        "name": "Lumina Smart Living",
        "email": "vendor4@shopsense.com",
        "full_name": "Ananya Roy",
        "desc": "Automated home security, ambient IoT lighting, and robotic care products.",
        "rating": 4.6,
        "commission": 0.08
    },
    {
        "name": "Optix Vision Pro",
        "email": "vendor5@shopsense.com",
        "full_name": "Kabir Das",
        "desc": "Cinematic 4K camera gear, stabilizer gimbals, and optics for creators.",
        "rating": 4.8,
        "commission": 0.10
    },
    {
        "name": "VoltPulse Electronics",
        "email": "vendor6@shopsense.com",
        "full_name": "Deepak Gupta",
        "desc": "GaN chargers, magnetic power banks, and high-speed thunderbolt docks.",
        "rating": 4.7,
        "commission": 0.08
    },
    {
        "name": "Zenith Compute Corp",
        "email": "vendor7@shopsense.com",
        "full_name": "Kavita Reddy",
        "desc": "Business ultrabooks, dual monitor setups, and workspace ergonomics.",
        "rating": 4.9,
        "commission": 0.10
    },
    {
        "name": "PureAir & Kitchens",
        "email": "vendor8@shopsense.com",
        "full_name": "Arjun Nair",
        "desc": "HEPA air purifiers, cold-brew appliances, and modern smart kitchens.",
        "rating": 4.6,
        "commission": 0.09
    },
    {
        "name": "Titan Wearables",
        "email": "vendor9@shopsense.com",
        "full_name": "Siddharth Rao",
        "desc": "AMOLED smartwatch trackers, sleep monitors, and GPS sports watches.",
        "rating": 4.7,
        "commission": 0.10
    },
    {
        "name": "SoundWave Acoustics",
        "email": "vendor10@shopsense.com",
        "full_name": "Tanvi Sharma",
        "desc": "Subwoofers, party speakers, and waterproof rugged outdoor sound.",
        "rating": 4.8,
        "commission": 0.11
    },
    {
        "name": "NextGen Peripherals",
        "email": "vendor11@shopsense.com",
        "full_name": "Rahul Verma",
        "desc": "Ergonomic vertical mice, desk mats, and wireless stream controllers.",
        "rating": 4.7,
        "commission": 0.09
    }
]

PRODUCT_TEMPLATES = [
    # Laptops (cat 0)
    ("Titanium Book 16 Pro M3", 0, 149999, 169999, "Apple M3 Max Architecture, 36GB RAM, 1TB NVMe, Liquid Retina XDR 120Hz display with 22hr battery life.", "titanium,laptop,apple,m3,pro,creator", "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80"),
    ("Zenith StudioBook 14 OLED", 0, 109999, 124999, "Intel Core Ultra 9 185H, 32GB LPDDR5X, 2.8K 120Hz OLED touch panel, CNC aluminum chassis.", "zenith,studiobook,oled,laptop,intel", "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80"),
    ("AeroBlade 15 RTX 4080 Gaming Laptop", 0, 189999, 219999, "AMD Ryzen 9 7945HX, Nvidia GeForce RTX 4080 12GB, 240Hz QHD Display, per-key RGB keyboard.", "aeroblade,rtx4080,gaming,laptop,ryzen", "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80"),
    ("SwiftAir 13 Ultralight Laptop", 0, 64999, 74999, "Weighing only 980 grams with 16GB RAM, Intel Core i7, 512GB SSD and all-day 18hr battery.", "swiftair,ultralight,portable,laptop,work", "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&auto=format&fit=crop&q=80"),
    ("PixelBook Fold Dual-Screen", 0, 129999, 149999, "Innovative dual OLED touchscreens with detachable magnetic Bluetooth keyboard and stylus support.", "pixelbook,fold,dualscreen,oled,innovation", "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80"),
    ("CarbonX 14 Business Thinker", 0, 89999, 99999, "Mil-spec tested carbon fiber casing, fingerprint scanner, privacy shutter, 32GB RAM, 1TB SSD.", "carbonx,business,durable,thinker,secure", "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80"),
    ("VisionDesk 27-inch 4K All-in-One", 0, 94999, 110000, "Sleek metallic unibody 4K HDR display with wireless keyboard and studio beamforming microphones.", "all-in-one,desktop,4k,visiondesk,clean", "https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800&auto=format&fit=crop&q=80"),

    # Audio & Headphones (cat 1)
    ("AcousticMaster 900 Noise-Cancelling Headphones", 1, 24999, 29999, "Industry-leading active noise cancellation with 40mm beryllium drivers, LDAC high-res audio and 45h playback.", "headphones,anc,audiophile,ldac,wireless", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"),
    ("PulseBuds Pro Spatial ANC Earbuds", 1, 12999, 15999, "Dynamic head-tracking spatial audio, IPX5 water resistance, wireless charging case, crystal-clear 6-mic calls.", "pulsebuds,earbuds,spatial,anc,tws", "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80"),
    ("Sonosound Wave Bluetooth Speaker", 1, 8999, 11999, "360-degree room filling sound with dual passive radiators, 24-hour battery and rugged waterproof IP67.", "speaker,bluetooth,waterproof,outdoor,bass", "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80"),
    ("StudioMonitor X7 Professional Reference", 1, 34999, 39999, "Flat frequency response bi-amplified studio nearfield monitors with balanced XLR inputs.", "studiomonitor,reference,sound,recording,music", "https://images.unsplash.com/photo-1520170350707-b2da59970118?w=800&auto=format&fit=crop&q=80"),
    ("CinemaBar 5.1 Dolby Atmos Soundbar", 1, 27999, 32999, "True 5.1 channel surround system with wireless subwoofer, HDMI eARC, 4K passthrough and Alexa integration.", "soundbar,dolbyatmos,cinemabar,surround,tv", "https://images.unsplash.com/photo-1543512214-318c7553f230?w=800&auto=format&fit=crop&q=80"),
    ("RetroGroove Vinyl Turntable Hi-Fi", 1, 18999, 22999, "Belt-drive audiophile turntable with built-in phono preamp, Audio-Technica magnetic cartridge, Bluetooth out.", "turntable,vinyl,retro,hifi,music", "https://images.unsplash.com/photo-1539375665275-f9de415ef9ac?w=800&auto=format&fit=crop&q=80"),

    # Smartphones & Wearables (cat 2)
    ("Nexus 15 Ultra 5G (256GB)", 2, 79999, 89999, "Snapdragon 8 Gen 3, 200MP Periscope Camera, 6.8-inch Dynamic AMOLED 2X, Titanium Frame, 5000mAh battery.", "smartphone,nexus,ultra,flagship,5g,camera", "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80"),
    ("Apex Fold Pro 5G", 2, 119999, 139999, "Seamless 7.9-inch foldable inner display with zero hinge gap, stylus pen, multitasking triple split-screen.", "foldable,apex,smartphone,5g,large-screen", "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80"),
    ("Nova Watch Ultra Titanium Smartwatch", 2, 29999, 34999, "Dual-frequency GPS, Sapphire crystal display, ECG heart health sensor, titanium case, 7-day battery.", "smartwatch,titanium,gps,ecg,fitness,wearable", "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80"),
    ("Vibe 12 Lite Budget Flagship", 2, 24999, 28999, "Dimensity 8200 5G processor, 120Hz OLED, 67W Turbo Charger in box, 50MP Sony IMX890 sensor.", "vibe,lite,budget,flagship,5g,smartphone", "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80"),
    ("Aura Ring Health & Sleep Tracker", 2, 19999, 23999, "Sleek titanium smart ring measuring body temperature, sleep stages, HRV, and recovery readiness.", "smartring,health,sleep,wearable,titanium", "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80"),

    # Gaming & Consoles (cat 3)
    ("AeroStation 5 Pro Gaming Console", 3, 54999, 59999, "Custom 8-core AMD Zen 4 CPU, RDNA 3 GPU, 2TB high-speed SSD, 4K 120Hz ray tracing with haptic controller.", "console,gaming,aerostation,4k,raytracing", "https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=800&auto=format&fit=crop&q=80"),
    ("Apex Strike Mechanical Keyboard RGB", 3, 11499, 13999, "Hot-swappable magnetic hall-effect switches, rapid trigger, gasket mounted, sound dampening foam.", "keyboard,mechanical,gaming,rgb,esports", "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80"),
    ("HyperGlide 4K Wireless Gaming Mouse", 3, 6999, 8999, "Ultralight 49g ergonomic design, 4000Hz polling rate, PixArt 3395 sensor, 100hr battery life.", "mouse,wireless,ultralight,gaming,esports", "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80"),
    ("CyberVision VR2 Spatial Headset", 3, 44999, 49999, "Dual 4K micro-OLED lenses, inside-out eye tracking, pancake lenses, wireless PC VR streaming.", "vr,virtualreality,headset,spatial,gaming", "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=800&auto=format&fit=crop&q=80"),
    ("Predator 34-inch QD-OLED Curved Monitor", 3, 74999, 84999, "175Hz refresh rate, 0.03ms response time, 1800R curvature, True Black 400 HDR immersion.", "monitor,curved,qdoled,ultrawide,gaming", "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80"),

    # Smart Home & IoT (cat 4)
    ("RoboVac X9 AI Lidar Vacuum & Mop", 4, 38999, 44999, "5000Pa suction power with 3D obstacle avoidance camera, self-emptying dock and ultrasonic mop lifting.", "robovac,vacuum,smartclean,home,automation", "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80"),
    ("Lumina Glow Smart Light Bulbs (Pack of 4)", 4, 3499, 4499, "16 million colors, Apple HomeKit & Alexa compatible, circadian rhythm sync, energy tracking.", "smartlight,rgb,iot,homekit,alexa", "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80"),
    ("SecureCam 2K Outdoor Solar Security Cam", 4, 7999, 9999, "100% wire-free continuous solar charging, color night vision, AI human & vehicle detection, siren.", "security,camera,solar,smartcam,outdoor", "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80"),
    ("SmartDial Thermostat & Air Quality Hub", 4, 11999, 14999, "Precise room climate control, PM2.5 and CO2 sensor, touch ring dial, geofencing energy saver.", "thermostat,iot,airquality,smartdial,ecofriendly", "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&auto=format&fit=crop&q=80"),

    # Cameras & Optics (cat 5)
    ("Lumix Alpha 7R Full-Frame Mirrorless", 5, 184999, 204999, "61MP BSI sensor, 8K 30p and 4K 120p video, 8-stop in-body image stabilization, AI autofocus tracking.", "camera,mirrorless,fullframe,photography,video", "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80"),
    ("SkyMaster 4K Mini Gimbal Drone", 5, 42999, 49999, "Sub-249g travel drone with 3-axis mechanical gimbal, 38min flight time, omnidirectional obstacle sensors.", "drone,4k,aerial,skymaster,gimbal,creator", "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&auto=format&fit=crop&q=80"),
    ("GoAction 12 Waterproof Action Cam", 5, 31999, 36999, "HyperSmooth 6.0 stabilization, waterproof to 10m without case, front & rear LCD screens, 5.3K60 fps.", "actioncam,waterproof,sports,travel,gopro", "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80"),
    ("GimbalPro 3-Axis Smartphone Stabilizer", 5, 8999, 11499, "Magnetic clamp, built-in extension rod, gesture control, face tracking for smooth cinematic vlogging.", "gimbal,stabilizer,vlog,smartphone,creator", "https://images.unsplash.com/photo-1589256469067-ea99122bbdc4?w=800&auto=format&fit=crop&q=80"),

    # Home Appliances (cat 6)
    ("AeroPure Smart HEPA Air Purifier Max", 6, 16999, 19999, "True HEPA H13 filter removes 99.97% particles, covers 800 sq ft, whisper-quiet 24dB night mode.", "airpurifier,hepa,cleanair,home,wellness", "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80"),
    ("BaristaTouch Espresso Machine Pro", 6, 46999, 52999, "Integrated precision conical burr grinder, 15-bar Italian pump, micro-foam steam wand for latte art.", "espresso,coffee,barista,kitchen,premium", "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80"),
    ("VortexBlend 1200W Commercial Blender", 6, 9999, 12999, "Aircraft-grade stainless steel blades, variable speed dial + pulse, BPA-free 2L pitcher for smoothies.", "blender,smoothie,kitchen,vortex,appliance", "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&auto=format&fit=crop&q=80"),

    # Accessories & Gear (cat 7)
    ("VoltStorm 140W GaN 4-Port Fast Charger", 7, 4499, 5999, "Power Delivery 3.1 charges MacBook Pro to 50% in 28 mins, compact foldable prongs, universal worldwide voltage.", "charger,gan,fastcharging,usbc,travel", "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80"),
    ("MagCharge 3-in-1 Wireless Charging Stand", 7, 3999, 4999, "Fast charges Phone, Watch and Earbuds simultaneously with magnetic auto-alignment and ambient LED night light.", "wirelesscharger,magsafe,apple,stand,accessories", "https://images.unsplash.com/photo-1622445262464-84b14e32452e?w=800&auto=format&fit=crop&q=80"),
    ("ErgoLift Aluminum Laptop Riser Stand", 7, 2499, 3299, "Heat-dissipating aerospace aluminum alloy, ergonomic 6-height angles, silicone anti-slip protection.", "laptopstand,ergonomic,aluminum,desk,office", "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80"),
    ("OmniDock 12-in-1 Thunderbolt 4 Docking Station", 7, 14999, 17999, "Dual 4K 60Hz displays, 100W laptop pass-through charging, Gigabit Ethernet, SD card reader, audio jack.", "dock,thunderbolt,usbc,multidisplay,workspace", "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80")
]

REVIEW_COMMENTS = [
    ("Exceptional build quality and battery life! Surpassed all my expectations. Highly recommended.", 5),
    ("Very satisfied with the performance. Fast delivery and sleek design.", 5),
    ("Great product, great value for money. The display resolution is stunning.", 5),
    ("Good product overall, works as advertised. Setup took a little bit longer than expected.", 4),
    ("Decent performance for the price point. Packaging was slightly bent in transit.", 4),
    ("Solid features. Battery lasts around a full workday. Would buy again.", 4),
    ("Average experience. It gets slightly warm under heavy load, but works fine.", 3),
    ("Product is fine but delivery was delayed by 2 days.", 3),
    ("Disappointed with the sound clarity at higher volumes. Customer support was slow to reply.", 2),
    ("Did not match expectations. Build quality felt cheaper than shown in photos.", 2),
    ("Defective unit received, had to request a replacement. Frustrating experience.", 1)
]

INDIAN_CITIES = ["Bengaluru", "Mumbai", "Delhi", "Hyderabad", "Pune", "Chennai", "Kolkata", "Ahmedabad", "Jaipur", "Chandigarh"]

def seed_database():
    db: Session = SessionLocal()
    try:
        # Check if already seeded
        admin_user = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
        if admin_user and db.query(Product).count() >= 100:
            print("Database already contains seeded data. Skipping.")
            return

        print("--- Seeding ShopSense Platform Data ---")
        now = datetime.now(timezone.utc)

        # 1. Create Admin User (Single authorized administrator)
        if not admin_user:
            admin_user = User(
                email=settings.ADMIN_EMAIL,
                hashed_password=hash_password(settings.ADMIN_PASSWORD),
                full_name="Platform Administrator",
                role=UserRole.ADMIN,
                avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&fit=crop&q=80",
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            print(f"[OK] Created Administrator: {settings.ADMIN_EMAIL}")

        # 2. Create Categories
        categories = []
        for cat_info in CATEGORIES_DATA:
            existing_cat = db.query(Category).filter(Category.slug == cat_info["slug"]).first()
            if not existing_cat:
                existing_cat = Category(
                    name=cat_info["name"],
                    slug=cat_info["slug"],
                    description=cat_info["description"],
                    icon=cat_info["icon"],
                    image_url=cat_info["image_url"]
                )
                db.add(existing_cat)
                db.commit()
                db.refresh(existing_cat)
            categories.append(existing_cat)
        print(f"[OK] Created {len(categories)} Categories")

        # 3. Create Vendors
        vendors = []
        for v_info in VENDORS_DATA:
            v_user = db.query(User).filter(User.email == v_info["email"]).first()
            if not v_user:
                v_user = User(
                    email=v_info["email"],
                    hashed_password=hash_password(DEMO_PASSWORD),
                    full_name=v_info["full_name"],
                    role=UserRole.VENDOR,
                    avatar_url=f"https://images.unsplash.com/photo-{1500000000000 + random.randint(100000, 999999)}?w=200&fit=crop&q=80",
                    is_active=True
                )
                db.add(v_user)
                db.commit()
                db.refresh(v_user)

            vendor_rec = db.query(Vendor).filter(Vendor.user_id == v_user.id).first()
            if not vendor_rec:
                vendor_rec = Vendor(
                    user_id=v_user.id,
                    store_name=v_info["name"],
                    slug=v_info["name"].lower().replace(" ", "-"),
                    description=v_info["desc"],
                    logo_url="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&fit=crop&q=80",
                    banner_url="https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&fit=crop&q=80",
                    rating=v_info["rating"],
                    commission_rate=v_info["commission"],
                    is_verified=True
                )
                db.add(vendor_rec)
                db.commit()
                db.refresh(vendor_rec)
            vendors.append(vendor_rec)
        print(f"[OK] Created {len(vendors)} Vendors (Primary: vendor@shopsense.com)")

        # 4. Create Customers (100+ customers)
        customers = []
        # Primary demo customer
        demo_cust_user = db.query(User).filter(User.email == "customer@shopsense.com").first()
        if not demo_cust_user:
            demo_cust_user = User(
                email="customer@shopsense.com",
                hashed_password=hash_password(DEMO_PASSWORD),
                full_name="Aditi Sharma",
                role=UserRole.CUSTOMER,
                avatar_url="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&fit=crop&q=80",
                is_active=True
            )
            db.add(demo_cust_user)
            db.commit()
            db.refresh(demo_cust_user)

        demo_cust = db.query(Customer).filter(Customer.user_id == demo_cust_user.id).first()
        if not demo_cust:
            demo_cust = Customer(
                user_id=demo_cust_user.id,
                phone="9876543210",
                address="Flat 402, Skyline Towers, Indiranagar",
                city="Bengaluru",
                country="India",
                segment=CustomerSegment.VIP
            )
            db.add(demo_cust)
            db.commit()
            db.refresh(demo_cust)
        customers.append(demo_cust)

        # Generate remaining 100+ customers
        first_names = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna", "Ishaan",
                       "Diya", "Saanvi", "Aanya", "Aadhya", "Pari", "Ananya", "Myra", "Sara", "Isha", "Rhea",
                       "Karan", "Siddharth", "Manish", "Gaurav", "Sneha", "Pooja", "Meera", "Neha", "Divya", "Tarun"]
        last_names = ["Sharma", "Verma", "Patel", "Mehta", "Reddy", "Nair", "Iyer", "Rao", "Gupta", "Malhotra",
                      "Bhatia", "Kapoor", "Chopra", "Deshmukh", "Joshi", "Saxena", "Sen", "Bose", "Choudhury", "Pillai"]

        for i in range(1, 105):
            fn = random.choice(first_names)
            ln = random.choice(last_names)
            email = f"{fn.lower()}.{ln.lower()}{i}@example.com"
            existing_u = db.query(User).filter(User.email == email).first()
            if not existing_u:
                c_user = User(
                    email=email,
                    hashed_password=hash_password("Customer@123"),
                    full_name=f"{fn} {ln}",
                    role=UserRole.CUSTOMER,
                    avatar_url=f"https://images.unsplash.com/photo-{1500000000000 + random.randint(100000, 999999)}?w=200&fit=crop&q=80",
                    is_active=True
                )
                db.add(c_user)
                db.commit()
                db.refresh(c_user)

                c_prof = Customer(
                    user_id=c_user.id,
                    phone=f"98{random.randint(10000000, 99999999)}",
                    address=f"House #{random.randint(10, 999)}, Tech Enclave",
                    city=random.choice(INDIAN_CITIES),
                    country="India",
                    segment=CustomerSegment.NEW
                )
                db.add(c_prof)
                db.commit()
                db.refresh(c_prof)
                customers.append(c_prof)
            else:
                c_prof = db.query(Customer).filter(Customer.user_id == existing_u.id).first()
                if c_prof:
                    customers.append(c_prof)

        print(f"[OK] Created {len(customers)} Customers (Primary: customer@shopsense.com)")

        # 5. Create 100+ Products across all categories
        products = []
        sku_counter = 1000
        for i in range(108):
            template = PRODUCT_TEMPLATES[i % len(PRODUCT_TEMPLATES)]
            cat_idx = template[1]
            cat = categories[cat_idx]
            vendor = vendors[i % len(vendors)]
            
            # Slight variations for diversity
            variant_suffix = f" (Gen {2 + (i // len(PRODUCT_TEMPLATES))})" if i >= len(PRODUCT_TEMPLATES) else ""
            prod_name = f"{template[0]}{variant_suffix}"
            sku = f"SKU-{cat.slug[:3].upper()}-{sku_counter}"
            sku_counter += 1

            price = float(template[2] + (random.randint(-5, 10) * 500))
            compare_price = float(template[3] + (random.randint(0, 10) * 500))
            cost_price = round(price * random.uniform(0.55, 0.70), 2)
            
            # Varied stock levels (some low stock for intelligence alerts)
            if i % 8 == 0:
                stock = random.randint(2, 8) # low stock
            elif i % 15 == 0:
                stock = 0 # out of stock
            else:
                stock = random.randint(25, 180)

            existing_p = db.query(Product).filter(Product.sku == sku).first()
            if not existing_p:
                p = Product(
                    vendor_id=vendor.id,
                    category_id=cat.id,
                    name=prod_name,
                    slug=prod_name.lower().replace(" ", "-").replace("(", "").replace(")", "").replace("/", "-") + f"-{sku.lower()}",
                    sku=sku,
                    price=price,
                    compare_at_price=compare_price,
                    cost_price=cost_price,
                    description=template[4],
                    ai_description=f"Generated by ShopSense AI: The {prod_name} offers top-tier engineering, exceptional customer satisfaction, and fast dispatch from {vendor.store_name}.",
                    seo_title=f"{prod_name} - Best Price Online | ShopSense",
                    seo_keywords=template[5],
                    tags=template[5],
                    stock=stock,
                    low_stock_threshold=10,
                    rating=round(random.uniform(4.2, 4.9), 1),
                    review_count=random.randint(12, 140),
                    image_url=template[6],
                    is_active=True
                )
                db.add(p)
                db.commit()
                db.refresh(p)
                products.append(p)
            else:
                products.append(existing_p)

        print(f"[OK] Created {len(products)} Products")

        # 6. Create 500+ Orders across the last 90 days
        print("Generating 500+ historical orders and transactions...")
        for o_idx in range(540):
            days_ago = random.randint(0, 90)
            order_time = now - timedelta(days=days_ago, hours=random.randint(0, 23), minutes=random.randint(0, 59))
            
            cust = random.choice(customers)
            order_num = f"SS-{(now - timedelta(days=days_ago)).strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"

            # Pick 1-4 products
            num_items = random.choices([1, 2, 3, 4], weights=[0.55, 0.30, 0.10, 0.05])[0]
            selected_products = random.sample(products, num_items)

            order_total = 0.0
            order_items = []
            affected_vendors = set()

            for p in selected_products:
                qty = random.randint(1, 2)
                subtotal = round(p.price * qty, 2)
                order_total += subtotal
                affected_vendors.add(p.vendor_id)

                order_items.append(OrderItem(
                    product_id=p.id,
                    vendor_id=p.vendor_id,
                    product_name=p.name,
                    price=p.price,
                    cost_price=p.cost_price,
                    quantity=qty,
                    subtotal=subtotal,
                    status=OrderStatus.DELIVERED if days_ago > 3 else OrderStatus.CONFIRMED,
                    created_at=order_time
                ))

            order = Order(
                order_number=order_num,
                customer_id=cust.id,
                total_amount=round(order_total, 2),
                tax_amount=round(order_total * 0.05, 2),
                shipping_amount=0.0,
                status=OrderStatus.DELIVERED if days_ago > 3 else OrderStatus.CONFIRMED,
                payment_status=PaymentStatus.PAID,
                payment_method=random.choice(["UPI", "Credit Card", "Net Banking", "Debit Card"]),
                shipping_address={"city": cust.city or "Bengaluru", "address": cust.address or "100 Innovation Way"},
                created_at=order_time
            )
            db.add(order)
            db.commit()
            db.refresh(order)

            for oi in order_items:
                oi.order_id = order.id
                db.add(oi)

            # Transactions
            for v_id in affected_vendors:
                v_sub = sum(i.subtotal for i in order_items if i.vendor_id == v_id)
                v_obj = db.query(Vendor).filter(Vendor.id == v_id).first()
                p_fee = round(v_sub * (v_obj.commission_rate if v_obj else 0.10), 2)
                txn = Transaction(
                    transaction_ref=f"TXN-{uuid.uuid4().hex[:10].upper()}",
                    order_id=order.id,
                    vendor_id=v_id,
                    amount=v_sub,
                    platform_fee=p_fee,
                    vendor_net=round(v_sub - p_fee, 2),
                    payment_method="CARD",
                    status=PaymentStatus.PAID,
                    created_at=order_time
                )
                db.add(txn)
                if v_obj:
                    v_obj.total_sales = round(v_obj.total_sales + v_sub, 2)

            cust.order_count += 1
            cust.total_spend = round(cust.total_spend + order_total, 2)

        db.commit()
        print("[OK] Created 540 Orders and Transactions")

        # 7. Create Reviews with Aspect Sentiment
        print("Seeding reviews and sentiment analysis...")
        for p in products[:40]:
            num_revs = random.randint(3, 8)
            for _ in range(num_revs):
                cust = random.choice(customers)
                comment_tpl, rating = random.choice(REVIEW_COMMENTS)
                sentiment, score, pros, cons = analyze_review_text(comment_tpl, rating)
                
                rev = Review(
                    product_id=p.id,
                    customer_id=cust.id,
                    vendor_id=p.vendor_id,
                    rating=rating,
                    title=f"{sentiment.value.title()} Review",
                    comment=comment_tpl,
                    sentiment=sentiment,
                    sentiment_score=score,
                    pros=pros,
                    cons=cons,
                    created_at=now - timedelta(days=random.randint(1, 45))
                )
                db.add(rev)

        db.commit()
        print("[OK] Seeded Reviews with Sentiment Analysis")

        # 8. Create Initial Notifications for Vendors & Admin
        for v in vendors[:3]:
            notif = Notification(
                user_id=v.user_id,
                vendor_id=v.id,
                title="Welcome to ShopSense Intelligence",
                message="Your store analytics, forecasting engine, and AI Data Analyst are fully initialized.",
                type=NotificationType.SYSTEM,
                link="/vendor/dashboard"
            )
            db.add(notif)

        db.commit()
        print("[OK] Notifications created")

        # Calculate initial RFM for all customers
        from app.analytics.rfm import calculate_customer_rfm
        calculate_customer_rfm(db)
        print("[OK] Customer RFM Segments calculated")

        print("\n=======================================================")
        print(">> SHOPSENSE SEED DATA POPULATED SUCCESSFULLY! <<")
        print("Demo Accounts:")
        print(f"  Admin:    admin@shopsense.com     / {DEMO_PASSWORD}")
        print(f"  Vendor:   vendor@shopsense.com    / {DEMO_PASSWORD}")
        print(f"  Customer: customer@shopsense.com  / {DEMO_PASSWORD}")
        print("=======================================================\n")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    seed_database()
