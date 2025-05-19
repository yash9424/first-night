// Database initialization script
db = db.getSiblingDB('technovatech');

print('Setting up database indexes and initial data...');

// Drop existing collections to ensure clean setup
print('Cleaning existing collections...');
db.users.drop();
db.categories.drop();
db.products.drop();
db.orders.drop();
db.carts.drop();
db.contacts.drop();

// Create collections with validation
print('Creating collections with validation...');

db.createCollection('users', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['name', 'email', 'password', 'role'],
            properties: {
                name: { bsonType: 'string' },
                email: { bsonType: 'string' },
                password: { bsonType: 'string' },
                role: { enum: ['user', 'admin'] },
                createdAt: { bsonType: 'date' },
                updatedAt: { bsonType: 'date' }
            }
        }
    }
});

db.createCollection('categories', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['name'],
            properties: {
                name: { bsonType: 'string' },
                description: { bsonType: 'string' }
            }
        }
    }
});

db.createCollection('products', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['name', 'price', 'category'],
            properties: {
                name: { bsonType: 'string' },
                description: { bsonType: 'string' },
                price: { bsonType: 'number' },
                category: { bsonType: 'objectId' },
                image: { bsonType: 'string' },
                stock: { bsonType: 'number' }
            }
        }
    }
});

db.createCollection('orders', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['user', 'items', 'total', 'status'],
            properties: {
                user: { bsonType: 'objectId' },
                items: {
                    bsonType: 'array',
                    items: {
                        bsonType: 'object',
                        required: ['product', 'quantity', 'price'],
                        properties: {
                            product: { bsonType: 'objectId' },
                            quantity: { bsonType: 'number' },
                            price: { bsonType: 'number' }
                        }
                    }
                },
                total: { bsonType: 'number' },
                status: { enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] },
                shippingAddress: { bsonType: 'object' },
                paymentStatus: { enum: ['pending', 'paid', 'failed'] }
            }
        }
    }
});

// Create indexes
print('Creating indexes...');

// Users indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });

// Categories indexes
db.categories.createIndex({ name: 1 }, { unique: true });

// Products indexes
db.products.createIndex({ name: 1 });
db.products.createIndex({ category: 1 });
db.products.createIndex({ price: 1 });
db.products.createIndex({ 
    name: 'text', 
    description: 'text' 
}, {
    weights: {
        name: 10,
        description: 5
    }
});

// Orders indexes
db.orders.createIndex({ user: 1 });
db.orders.createIndex({ status: 1 });
db.orders.createIndex({ createdAt: 1 });
db.orders.createIndex({ "items.product": 1 });

// Contacts indexes
db.contacts.createIndex({ email: 1 });
db.contacts.createIndex({ createdAt: 1 });

// Create initial categories
print('Creating initial categories...');
db.categories.insertMany([
    { name: 'Electronics', description: 'Electronic devices and accessories' },
    { name: 'Clothing', description: 'Fashion and apparel' },
    { name: 'Books', description: 'Books and publications' },
    { name: 'Home & Living', description: 'Home decor and furniture' }
]);

// Create admin user
print('Creating admin user...');
db.users.insertOne({
    name: 'Admin',
    email: 'admin@technovatechnologies.in',
    // Default password: Admin@123 (change this immediately after setup)
    password: '$2b$10$YuJ7LmHjhQZgEQf6CXFXWOsqUq9qQQwNqF7QrKoYfVp.zytxzJ1Hy',
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date()
});

// Create test product
print('Creating test product...');
const sampleCategory = db.categories.findOne({ name: 'Electronics' });
if (sampleCategory) {
    db.products.insertOne({
        name: 'Sample Product',
        description: 'This is a sample product',
        price: 999,
        category: sampleCategory._id,
        image: '/uploads/sample-product.jpg',
        stock: 100,
        createdAt: new Date(),
        updatedAt: new Date()
    });
}

print('Database setup completed successfully!');
print('Default admin credentials:');
print('Email: admin@technovatechnologies.in');
print('Password: Admin@123');
print('IMPORTANT: Please change the admin password immediately after first login!'); 