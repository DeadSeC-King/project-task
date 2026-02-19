import requests
import os
from dotenv import load_dotenv

load_dotenv('/app/backend/.env')

BACKEND_URL = "https://tradable-goods.preview.emergentagent.com"
API = f"{BACKEND_URL}/api"

products = [
    {
        "name": "Cyber Deck 2077",
        "description": "Advanced neural interface software for seamless digital integration. Boost your productivity with cutting-edge AI assistance.",
        "category": "Software",
        "image_url": "https://images.unsplash.com/photo-1766601269422-a6673de6daf3?crop=entropy&cs=srgb&fm=jpg&q=85",
        "base_price": 1299.00,
        "max_retail_price": 5999.00,
        "price_increment_percent": 8.0
    },
    {
        "name": "Neural Link V2",
        "description": "Revolutionary brain-computer interface toolkit. Access infinite data streams directly from your consciousness.",
        "category": "Hardware",
        "image_url": "https://images.unsplash.com/photo-1758524572193-3ebae7d5ff1a?crop=entropy&cs=srgb&fm=jpg&q=85",
        "base_price": 2499.00,
        "max_retail_price": 9999.00,
        "price_increment_percent": 10.0
    },
    {
        "name": "Quantum Key",
        "description": "Unbreakable encryption system powered by quantum computing. Secure your digital assets with military-grade protection.",
        "category": "Security",
        "image_url": "https://images.unsplash.com/photo-1675627451054-99b6c760b6d2?crop=entropy&cs=srgb&fm=jpg&q=85",
        "base_price": 899.00,
        "max_retail_price": 4999.00,
        "price_increment_percent": 7.0
    },
    {
        "name": "Data Shard Alpha",
        "description": "Crystallized information storage solution. Contains proprietary algorithms and exclusive digital blueprints.",
        "category": "Storage",
        "image_url": "https://images.unsplash.com/photo-1720983025381-7174d55327de?crop=entropy&cs=srgb&fm=jpg&q=85",
        "base_price": 599.00,
        "max_retail_price": 2999.00,
        "price_increment_percent": 6.0
    },
    {
        "name": "Holo Terminal Pro",
        "description": "3D holographic development environment. Code in virtual reality with gesture-based controls.",
        "category": "Development",
        "image_url": "https://images.unsplash.com/photo-1607555557810-f99617a505d7?crop=entropy&cs=srgb&fm=jpg&q=85",
        "base_price": 1799.00,
        "max_retail_price": 7999.00,
        "price_increment_percent": 9.0
    },
    {
        "name": "Synth Wave Pack",
        "description": "Premium collection of digital audio samples and synthesizer presets. Perfect for futuristic music production.",
        "category": "Audio",
        "image_url": "https://images.unsplash.com/photo-1762279388988-3f8abcc7dca2?crop=entropy&cs=srgb&fm=jpg&q=85",
        "base_price": 399.00,
        "max_retail_price": 1999.00,
        "price_increment_percent": 5.0
    },
    {
        "name": "AI Vision Suite",
        "description": "Complete computer vision toolkit with pre-trained models. Analyze images and videos with superhuman accuracy.",
        "category": "AI/ML",
        "image_url": "https://images.unsplash.com/photo-1766601269422-a6673de6daf3?crop=entropy&cs=srgb&fm=jpg&q=85",
        "base_price": 2999.00,
        "max_retail_price": 14999.00,
        "price_increment_percent": 12.0
    },
    {
        "name": "Blockchain Gateway",
        "description": "Instant access to decentralized networks. Build and deploy smart contracts with zero friction.",
        "category": "Blockchain",
        "image_url": "https://images.unsplash.com/photo-1675627451054-99b6c760b6d2?crop=entropy&cs=srgb&fm=jpg&q=85",
        "base_price": 1499.00,
        "max_retail_price": 6999.00,
        "price_increment_percent": 8.5
    }
]

def seed_products():
    print("Seeding products...")
    for product in products:
        try:
            response = requests.post(f"{API}/products", json=product)
            if response.status_code == 200:
                print(f"✓ Added: {product['name']}")
            else:
                print(f"✗ Failed to add: {product['name']} - {response.text}")
        except Exception as e:
            print(f"✗ Error adding {product['name']}: {str(e)}")
    
    print("\nSeeding complete!")

if __name__ == "__main__":
    seed_products()
