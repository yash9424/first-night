const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const { auth, adminAuth } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory:', uploadsDir);
}

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        console.log('Saving file to:', uploadsDir);
        cb(null, uploadsDir);
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = uniqueSuffix + path.extname(file.originalname);
        console.log('Generated filename:', filename);
        cb(null, filename);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        console.log('Received file:', file.originalname, 'with extension:', ext);
        if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});

// Get all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        console.log('Fetched products:', products.map(p => ({
            id: p._id,
            name: p.name,
            mainImage: p.mainImage,
            hoverImage: p.hoverImage
        })));
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: error.message });
    }
});

// Search products - MUST be before /:id route
router.get('/search', async (req, res) => {
    try {
        const { query, category, minPrice, maxPrice } = req.query;
        
        // Build search criteria
        const searchCriteria = {};
        
        if (query) {
            const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
            const searchableFields = [
                product.name,
                product.category,
                product.description,
                product.tags,
                product.brand
            ].filter(Boolean).map(field => field.toLowerCase());

            return searchTerms.every(term => 
                searchableFields.some(field => field.includes(term))
            );
        }
        
        if (category) {
            searchCriteria.category = { $regex: category, $options: 'i' };
        }
        
        if (minPrice !== undefined || maxPrice !== undefined) {
            searchCriteria.price = {};
            if (minPrice !== undefined) searchCriteria.price.$gte = Number(minPrice);
            if (maxPrice !== undefined) searchCriteria.price.$lte = Number(maxPrice);
        }

        const products = await Product.find(searchCriteria);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error searching products', error: error.message });
    }
});

// Get single product
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create product (admin only)
router.post('/', auth, adminAuth, upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'hoverImage', maxCount: 1 }
]), async (req, res) => {
    try {
        console.log('Received files:', req.files);
        console.log('Received body:', req.body);

        const {
            name,
            description,
            priceINR,
            priceUSD,
            category,
            stock,
            discountedPriceINR,
            discountedPriceUSD,
            discountPercentageINR,
            discountPercentageUSD
        } = req.body;
        
        if (!name || !description || !priceINR || !priceUSD || !category) {
            return res.status(400).json({
                message: 'Missing required fields',
                required: ['name', 'description', 'priceINR', 'priceUSD', 'category'],
                received: req.body
            });
        }

        if (!req.files || !req.files.mainImage) {
            return res.status(400).json({
                message: 'Main image is required',
                receivedFiles: req.files
            });
        }

        const productData = {
            name: name.trim(),
            description: description.trim(),
            priceINR: Number(priceINR),
            priceUSD: Number(priceUSD),
            category: category.trim(),
            stock: Number(stock) || 0,
            mainImage: '/uploads/' + req.files.mainImage[0].filename
        };

        if (req.files.hoverImage) {
            productData.hoverImage = '/uploads/' + req.files.hoverImage[0].filename;
        }

        // Add discount fields if they exist
        if (discountedPriceINR) productData.discountedPriceINR = Number(discountedPriceINR);
        if (discountedPriceUSD) productData.discountedPriceUSD = Number(discountedPriceUSD);
        if (discountPercentageINR) productData.discountPercentageINR = Number(discountPercentageINR);
        if (discountPercentageUSD) productData.discountPercentageUSD = Number(discountPercentageUSD);

        console.log('Creating product with data:', productData);

        const product = new Product(productData);
        const newProduct = await product.save();
        console.log('Product created successfully:', newProduct);
        res.status(201).json(newProduct);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(400).json({
            message: error.message,
            details: error.errors ? Object.keys(error.errors).map(key => ({
                field: key,
                message: error.errors[key].message
            })) : undefined
        });
    }
});

// Update product (admin only)
router.put('/:id', auth, adminAuth, upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'hoverImage', maxCount: 1 }
]), async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const {
            name,
            description,
            priceINR,
            priceUSD,
            category,
            stock,
            discountedPriceINR,
            discountedPriceUSD,
            discountPercentageINR,
            discountPercentageUSD
        } = req.body;
        
        // Update basic fields
        if (name) product.name = name.trim();
        if (description) product.description = description.trim();
        if (category) product.category = category.trim();
        if (stock !== undefined) product.stock = Number(stock);

        // Update prices
        if (priceINR) product.priceINR = Number(priceINR);
        if (priceUSD) product.priceUSD = Number(priceUSD);

        // Update discounted prices
        if (discountedPriceINR !== undefined) {
            product.discountedPriceINR = discountedPriceINR ? Number(discountedPriceINR) : undefined;
        }
        if (discountedPriceUSD !== undefined) {
            product.discountedPriceUSD = discountedPriceUSD ? Number(discountedPriceUSD) : undefined;
        }

        // Update discount percentages
        if (discountPercentageINR !== undefined) {
            product.discountPercentageINR = discountPercentageINR ? Number(discountPercentageINR) : undefined;
        }
        if (discountPercentageUSD !== undefined) {
            product.discountPercentageUSD = discountPercentageUSD ? Number(discountPercentageUSD) : undefined;
        }

        // Handle image uploads
        if (req.files) {
            // If new main image is uploaded, update it
            if (req.files.mainImage) {
                // Delete old image if it exists
                if (product.mainImage) {
                    const oldPath = path.join(__dirname, '..', product.mainImage);
                    if (fs.existsSync(oldPath)) {
                        fs.unlinkSync(oldPath);
                    }
                }
                product.mainImage = '/uploads/' + req.files.mainImage[0].filename;
            }

            // If new hover image is uploaded, update it
            if (req.files.hoverImage) {
                // Delete old hover image if it exists
                if (product.hoverImage) {
                    const oldPath = path.join(__dirname, '..', product.hoverImage);
                    if (fs.existsSync(oldPath)) {
                        fs.unlinkSync(oldPath);
                    }
                }
                product.hoverImage = '/uploads/' + req.files.hoverImage[0].filename;
            }
        }

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(400).json({
            message: error.message,
            details: error.errors ? Object.keys(error.errors).map(key => ({
                field: key,
                message: error.errors[key].message
            })) : undefined
        });
    }
});

// Delete product (admin only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 