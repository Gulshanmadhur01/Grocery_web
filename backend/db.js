import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'data.json');

// Lock to prevent concurrent write collisions
let writePromise = Promise.resolve();

const initialData = {
  users: [],
  categories: [
    { id: 'cat-1', name: 'Fruits & Vegetables', slug: 'fruits-vegetables', icon: 'Apple', image: 'https://images.unsplash.com/photo-1610832958506-c5693b474026?w=600&auto=format&fit=crop&q=80' },
    { id: 'cat-2', name: 'Dairy, Bread & Eggs', slug: 'dairy-eggs', icon: 'Egg', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80' },
    { id: 'cat-3', name: 'Bakery & Biscuits', slug: 'bakery', icon: 'Croissant', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80' },
    { id: 'cat-4', name: 'Atta, Rice & Dal', slug: 'grocery-staples', icon: 'Coins', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80' },
    { id: 'cat-5', name: 'Cold Drinks & Juices', slug: 'beverages', icon: 'CupSoda', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80' },
    { id: 'cat-6', name: 'Snacks & Munchies', slug: 'snacks', icon: 'Cookie', image: 'https://images.unsplash.com/photo-1599490659213-e2b9527b0876?w=600&auto=format&fit=crop&q=80' },
    { id: 'cat-7', name: 'Personal Care', slug: 'personal-care', icon: 'Sparkles', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80' },
    { id: 'cat-8', name: 'Cleaning Essentials', slug: 'household-essentials', icon: 'Home', image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600&auto=format&fit=crop&q=80' },
    { id: 'cat-9', name: 'Paan Corner', slug: 'paan-corner', icon: 'Leaf', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80' },
    { id: 'cat-10', name: 'Breakfast & Instant Food', slug: 'breakfast-instant-food', icon: 'Flame', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80' },
    { id: 'cat-11', name: 'Sweet Tooth', slug: 'sweet-tooth', icon: 'Candy', image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&auto=format&fit=crop&q=80' },
    { id: 'cat-12', name: 'Tea, Coffee & Milk Drinks', slug: 'tea-coffee-milk-drinks', icon: 'Coffee', image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=80' },
    { id: 'cat-13', name: 'Masala, Oil & More', slug: 'masala-oil-more', icon: 'MortarPestle', image: 'https://images.unsplash.com/photo-1596790011462-8408f657a82b?w=600&auto=format&fit=crop&q=80' },
    { id: 'cat-14', name: 'Sauces & Spreads', slug: 'sauces-spreads', icon: 'GlassWater', image: 'https://images.unsplash.com/photo-1471253730640-6614e7127b3b?w=600&auto=format&fit=crop&q=80' },
    { id: 'cat-15', name: 'Chicken, Meat & Fish', slug: 'chicken-meat-fish', icon: 'Fish', image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=600&auto=format&fit=crop&q=80' },
    { id: 'cat-16', name: 'Baby Care', slug: 'baby-care', icon: 'Baby', image: 'https://images.unsplash.com/photo-1519689680058-324335c77ebe?w=600&auto=format&fit=crop&q=80' },
    { id: 'cat-17', name: 'Pharma & Wellness', slug: 'pharma-wellness', icon: 'Activity', image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=80' },
    { id: 'cat-18', name: 'Home & Office', slug: 'home-office', icon: 'Laptop', image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&auto=format&fit=crop&q=80' },
    { id: 'cat-19', name: 'Pet Care', slug: 'pet-care', icon: 'Dog', image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=600&auto=format&fit=crop&q=80' },
    { id: 'cat-20', name: 'Organic & Healthy Living', slug: 'organic-healthy-living', icon: 'Heart', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80' }
  ],
  products: [
    {
      id: 'prod-1',
      name: 'Red Apple',
      description: 'Crisp, sweet, and locally grown organic red delicious apples. Perfect for a healthy snack or baking pies.',
      price: 149.0,
      unit: '1kg',
      category: 'fruits-vegetables',
      image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80',
      stock: 45,
      rating: 4.8,
      reviewsCount: 120,
      featured: true
    },
    {
      id: 'prod-2',
      name: 'Banana',
      description: 'Rich in potassium, these organic yellow bananas are perfectly sweet, creamy, and ready to eat.',
      price: 48.0,
      unit: '1kg',
      category: 'fruits-vegetables',
      image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80',
      stock: 60,
      rating: 4.6,
      reviewsCount: 85,
      featured: true
    },
    {
      id: 'prod-3',
      name: 'Orange',
      description: 'Fresh, juicy seedless oranges loaded with vitamin C. Perfect for juicing or peeling and eating.',
      price: 89.0,
      unit: '1kg',
      category: 'fruits-vegetables',
      image: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=600&auto=format&fit=crop&q=80',
      stock: 40,
      rating: 4.4,
      reviewsCount: 50,
      featured: true
    },
    {
      id: 'prod-4',
      name: 'Grapes',
      description: 'Sweet, seedless fresh green grapes harvested from select vineyards.',
      price: 69.0,
      unit: '500g',
      category: 'fruits-vegetables',
      image: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=600&auto=format&fit=crop&q=80',
      stock: 35,
      rating: 4.5,
      reviewsCount: 62,
      featured: true
    },
    {
      id: 'prod-5',
      name: 'Tomato',
      description: 'Plump, juicy red tomatoes loaded with antioxidants. Essential for subzis, curries, and salads.',
      price: 30.0,
      unit: '1kg',
      category: 'fruits-vegetables',
      image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
      stock: 30,
      rating: 4.7,
      reviewsCount: 68,
      featured: true
    },
    {
      id: 'prod-6',
      name: 'Potato',
      description: 'Fresh farm potatoes. Perfect for boiling, baking, frying, or adding to your curry dishes.',
      price: 28.0,
      unit: '1kg',
      category: 'fruits-vegetables',
      image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80',
      stock: 55,
      rating: 4.5,
      reviewsCount: 74,
      featured: true
    },
    {
      id: 'prod-7',
      name: 'Onion',
      description: 'Fresh pink onions with thin skins. A fundamental aromatic base for all savory recipes.',
      price: 25.0,
      unit: '1kg',
      category: 'fruits-vegetables',
      image: 'https://images.unsplash.com/photo-1508747705-3de10787a74e?w=600&auto=format&fit=crop&q=80',
      stock: 50,
      rating: 4.4,
      reviewsCount: 92,
      featured: true
    },
    {
      id: 'prod-8',
      name: 'Cucumber',
      description: 'Cool and crunchy hybrid cucumber. Excellent source of hydration, perfect for healthy summer salads.',
      price: 26.0,
      unit: '1kg',
      category: 'fruits-vegetables',
      image: 'https://images.unsplash.com/photo-1449339854873-750e6dfc3140?w=600&auto=format&fit=crop&q=80',
      stock: 25,
      rating: 4.6,
      reviewsCount: 38,
      featured: true
    },
    {
      id: 'prod-9',
      name: 'Carrot',
      description: 'Sweet, bright orange fresh carrots. Great for munching raw, making halwa, or adding to salads.',
      price: 35.0,
      unit: '1kg',
      category: 'fruits-vegetables',
      image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&auto=format&fit=crop&q=80',
      stock: 45,
      rating: 4.7,
      reviewsCount: 52,
      featured: true
    },
    {
      id: 'prod-10',
      name: 'Capsicum',
      description: 'Crisp green bell peppers. Adds a crunch and sweet pepper flavor to stir-fries, pastas, and pizzas.',
      price: 45.0,
      unit: '500g',
      category: 'fruits-vegetables',
      image: 'https://images.unsplash.com/photo-1563565312-3b328a6fcf7c?w=600&auto=format&fit=crop&q=80',
      stock: 30,
      rating: 4.5,
      reviewsCount: 40,
      featured: true
    },
    {
      id: 'prod-11',
      name: 'Spinach',
      description: 'Fresh green spinach leaves packed with iron and calcium. Thoroughly washed and trimmed.',
      price: 20.0,
      unit: '250g',
      category: 'fruits-vegetables',
      image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80',
      stock: 20,
      rating: 4.8,
      reviewsCount: 65,
      featured: true
    },
    {
      id: 'prod-12',
      name: 'Cauliflower',
      description: 'Fresh, clean white cauliflower head. Great for roasting, steaming, or making Gobi Masala.',
      price: 32.0,
      unit: '1pc',
      category: 'fruits-vegetables',
      image: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ec3?w=600&auto=format&fit=crop&q=80',
      stock: 18,
      rating: 4.6,
      reviewsCount: 30,
      featured: true
    },
    {
      id: 'prod-13',
      name: 'Amul Taaza Milk',
      description: 'Homogenized toned fresh milk. Fits all cooking and baking requirements, high calcium content.',
      price: 54.0,
      unit: '1L',
      category: 'dairy-eggs',
      image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&auto=format&fit=crop&q=80',
      stock: 30,
      rating: 4.8,
      reviewsCount: 154,
      featured: true
    },
    {
      id: 'prod-14',
      name: 'Aashirvaad Atta',
      description: 'Whole wheat flour made with premium heavy grains. Gives soft, nutritious rotis every time.',
      price: 220.0,
      unit: '5kg',
      category: 'grocery-staples',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
      stock: 25,
      rating: 4.9,
      reviewsCount: 220,
      featured: true
    }
  ],
  orders: []
};

async function initDb() {
  try {
    await fs.access(dbPath);
  } catch (error) {
    // If db file doesn't exist, create it with seed data
    await fs.writeFile(dbPath, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

export async function readDb() {
  await initDb();
  const fileContent = await fs.readFile(dbPath, 'utf-8');
  return JSON.parse(fileContent);
}

export async function writeDb(data) {
  // Chain write promises to avoid multiple concurrent writes corrupting data.json
  writePromise = writePromise.then(async () => {
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf-8');
  });
  return writePromise;
}
