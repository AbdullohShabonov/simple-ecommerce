const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
app.use('/media', express.static('media'));

// Sample products data (replace with your actual products)
const products = [
  {
    id: 1,
    name: "Model Z",
    price: 399.99,
    image: "/media/model-z.png",
    description: "Your premium Model Z product with exceptional quality"
  },
  {
    id: 2,
    name: "MODEL Z + premium massger",
    price: 599.99,
    image: "/media/premium.jpg",
    description: "Advanced fitness tracking and smart notifications"
  },
  {
    id: 3,
    name: "Model X Pro",
    price: 779.99,
    image: "/media/model-x.png",
    description: "Ergonomic aluminum laptop stand for better posture"
  },
];

// Routes
app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json(product);
});

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});