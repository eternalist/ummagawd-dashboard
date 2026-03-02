// Simple server for Ummagawd Dashboard API
// This creates a local API for the dashboard to work interactively

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Sample data file path
const DATA_FILE = path.join(__dirname, 'data', 'products.json');

// Ensure data directory exists
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize with default data if file doesn't exist
if (!fs.existsSync(DATA_FILE)) {
    const defaultData = {
        dashboard: {
            totalProducts: 12,
            activeProducts: 5,
            totalInvestment: 104500,
            totalUnitsSold: 3375
        },
        products: [
            {"id":"sidekick-001","name":"Sidekick","status":"In Development","category":"Drone Frame","description":"Folding drone frame with interchangeable radio compatibility - 10mm carbon arms, 5in/8in/10in arm options","targetRelease":"2026-Q1","retailPrice":120,"wholesalePrice":80,"productCost":65,"developmentBudget":15000,"marketingBudget":5000,"progress":75,"currentPhase":"Final Testing","unitsSold":0,"unitsInProduction":0,"inventoryStatus":"Pre-order","projectedDemand":200,"createdDate":"2024-01-15"},
            {"id":"grinderino-001","name":"Grinderino","status":"In Production","category":"Drone Frame","description":"3.5\" and 5\" freestyle drone frame, lightweight and durable - DJI O3/O4 compatible, <250g AUW","targetRelease":"2024-Q2","retailPrice":44.95,"wholesalePrice":30,"productCost":22,"developmentBudget":8000,"marketingBudget":3000,"progress":100,"currentPhase":"Production","unitsSold":150,"unitsInProduction":50,"inventoryStatus":"In Stock","projectedDemand":300,"createdDate":"2023-12-01"},
            {"id":"demibot-001","name":"Demibot Frame","status":"In Production","category":"Drone Frame","description":"5\" freestyle drone frame - proven design, military-grade construction","targetRelease":"2024-Q1","retailPrice":89.99,"wholesalePrice":60,"productCost":35,"developmentBudget":15000,"marketingBudget":5000,"progress":100,"currentPhase":"Production","unitsSold":500,"unitsInProduction":100,"inventoryStatus":"Low Stock","projectedDemand":800,"createdDate":"2023-10-01"},
            {"id":"remix-v2-001","name":"Remix V2","status":"Discontinued","category":"Drone Frame","description":"Remix V2 FPV Freestyle Frame - WarraGP Blue edition","targetRelease":"2023-Q1","retailPrice":79.99,"wholesalePrice":50,"productCost":30,"developmentBudget":12000,"marketingBudget":4000,"progress":100,"currentPhase":"Completed","unitsSold":250,"unitsInProduction":0,"inventoryStatus":"Discontinued","projectedDemand":0,"createdDate":"2022-10-01"},
            {"id":"2fiddy-001","name":"2Fiddy","status":"Concept","category":"Drone Frame","description":"Lightweight 2.5\" micro drone frame for indoor and tight spaces","targetRelease":"2025-Q3","retailPrice":35,"wholesalePrice":22,"productCost":18,"developmentBudget":6000,"marketingBudget":2000,"progress":25,"currentPhase":"Concept Design","unitsSold":0,"unitsInProduction":0,"inventoryStatus":"Development","projectedDemand":150,"createdDate":"2024-06-01"},
            {"id":"acrobrat-001","name":"Acrobrat","status":"In Development","category":"Drone Frame","description":"Acrobatic freestyle frame with unique design for advanced maneuvers","targetRelease":"2025-Q1","retailPrice":69.99,"wholesalePrice":45,"productCost":28,"developmentBudget":10000,"marketingBudget":3500,"progress":60,"currentPhase":"Prototype Testing","unitsSold":0,"unitsInProduction":0,"inventoryStatus":"Development","projectedDemand":180,"createdDate":"2024-03-01"},
            {"id":"acrobrat-duo-001","name":"Acrobrat Duo","status":"Concept","category":"Drone Frame","description":"Dual configuration acrobatic frame variant","targetRelease":"2025-Q2","retailPrice":89.99,"wholesalePrice":55,"productCost":35,"developmentBudget":12000,"marketingBudget":4000,"progress":15,"currentPhase":"Initial Design","unitsSold":0,"unitsInProduction":0,"inventoryStatus":"Development","projectedDemand":120,"createdDate":"2024-04-01"},
            {"id":"moongoat-001","name":"Moongoat","status":"Discontinued","category":"Drone Frame","description":"Special edition frame - discontinued model","targetRelease":"2022-Q4","retailPrice":95,"wholesalePrice":60,"productCost":40,"developmentBudget":15000,"marketingBudget":5000,"progress":100,"currentPhase":"Completed","unitsSold":75,"unitsInProduction":0,"inventoryStatus":"Discontinued","projectedDemand":0,"createdDate":"2022-07-01"},
            {"id":"ummagrip-001","name":"Ummagrip Battery Pad","status":"In Production","category":"Accessories","description":"High-grip battery pad for secure mounting during aggressive flight","targetRelease":"2023-Q1","retailPrice":12.99,"wholesalePrice":8,"productCost":4.5,"developmentBudget":2000,"marketingBudget":800,"progress":100,"currentPhase":"Production","unitsSold":800,"unitsInProduction":200,"inventoryStatus":"In Stock","projectedDemand":1500,"createdDate":"2022-11-01"},
            {"id":"battery-straps-001","name":"Battery Straps","status":"In Production","category":"Accessories","description":"Durable battery straps for secure battery mounting","targetRelease":"2023-Q1","retailPrice":8.99,"wholesalePrice":5.5,"productCost":3,"developmentBudget":1500,"marketingBudget":500,"progress":100,"currentPhase":"Production","unitsSold":1200,"unitsInProduction":300,"inventoryStatus":"In Stock","projectedDemand":2000,"createdDate":"2022-10-01"},
            {"id":"whoop-001","name":"Whoop Frame","status":"Concept","category":"Drone Frame","description":"Micro whoop-style frame for indoor flying and tight spaces","targetRelease":"2025-Q4","retailPrice":25,"wholesalePrice":15,"productCost":12,"developmentBudget":3000,"marketingBudget":1000,"progress":10,"currentPhase":"Concept","unitsSold":0,"unitsInProduction":0,"inventoryStatus":"Development","projectedDemand":500,"createdDate":"2024-08-01"},
            {"id":"aerolite-motors-001","name":"Aerolite Motors","status":"In Production","category":"Motors","description":"Ummagawd Aerolite 1605 3600kv motors - lightweight and powerful","targetRelease":"2023-Q2","retailPrice":19.99,"wholesalePrice":12,"productCost":8,"developmentBudget":5000,"marketingBudget":1500,"progress":100,"currentPhase":"Production","unitsSold":400,"unitsInProduction":150,"inventoryStatus":"In Stock","projectedDemand":800,"createdDate":"2023-01-01"}
        ]
    };
    
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2));
}

// Read data from file
function readData() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading data:', error);
        return { dashboard: {}, products: [] };
    }
}

// Write data to file
function writeData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing data:', error);
        return false;
    }
}

// API Routes

// Get dashboard data
app.get('/api/dashboard', (req, res) => {
    const data = readData();
    res.json(data.dashboard);
});

// Get all products
app.get('/api/products', (req, res) => {
    const data = readData();
    res.json(data.products);
});

// Get single product
app.get('/api/products/:id', (req, res) => {
    const data = readData();
    const product = data.products.find(p => p.id === req.params.id);
    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ error: 'Product not found' });
    }
});

// Create new product
app.post('/api/products', (req, res) => {
    const data = readData();
    const newProduct = {
        ...req.body,
        id: `${req.body.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        createdDate: new Date().toISOString().split('T')[0]
    };
    
    data.products.push(newProduct);
    
    // Update dashboard stats
    data.dashboard.totalProducts = data.products.length;
    data.dashboard.activeProducts = data.products.filter(p => p.status === 'In Production').length;
    data.dashboard.totalInvestment = data.products.reduce((sum, p) => sum + (p.developmentBudget || 0), 0);
    data.dashboard.totalUnitsSold = data.products.reduce((sum, p) => sum + (p.unitsSold || 0), 0);
    
    if (writeData(data)) {
        res.status(201).json(newProduct);
    } else {
        res.status(500).json({ error: 'Failed to save product' });
    }
});

// Update product
app.put('/api/products/:id', (req, res) => {
    const data = readData();
    const index = data.products.findIndex(p => p.id === req.params.id);
    
    if (index === -1) {
        return res.status(404).json({ error: 'Product not found' });
    }
    
    data.products[index] = { ...data.products[index], ...req.body };
    
    // Update dashboard stats
    data.dashboard.totalProducts = data.products.length;
    data.dashboard.activeProducts = data.products.filter(p => p.status === 'In Production').length;
    data.dashboard.totalInvestment = data.products.reduce((sum, p) => sum + (p.developmentBudget || 0), 0);
    data.dashboard.totalUnitsSold = data.products.reduce((sum, p) => sum + (p.unitsSold || 0), 0);
    
    if (writeData(data)) {
        res.json(data.products[index]);
    } else {
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// Delete product
app.delete('/api/products/:id', (req, res) => {
    const data = readData();
    const index = data.products.findIndex(p => p.id === req.params.id);
    
    if (index === -1) {
        return res.status(404).json({ error: 'Product not found' });
    }
    
    data.products.splice(index, 1);
    
    // Update dashboard stats
    data.dashboard.totalProducts = data.products.length;
    data.dashboard.activeProducts = data.products.filter(p => p.status === 'In Production').length;
    data.dashboard.totalInvestment = data.products.reduce((sum, p) => sum + (p.developmentBudget || 0), 0);
    data.dashboard.totalUnitsSold = data.products.reduce((sum, p) => sum + (p.unitsSold || 0), 0);
    
    if (writeData(data)) {
        res.status(204).send();
    } else {
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

// Product expenses
app.get('/api/products/:id/expenses', (req, res) => {
    // Return empty array for now - can be extended
    res.json([]);
});

app.post('/api/products/:id/expenses', (req, res) => {
    // Accept expense data - can be extended
    res.status(201).json(req.body);
});

app.delete('/api/products/:id/expenses/:expenseId', (req, res) => {
    // Delete expense - can be extended
    res.status(204).send();
});

// Product timeline
app.get('/api/products/:id/timeline', (req, res) => {
    // Return empty array for now - can be extended
    res.json([]);
});

app.post('/api/products/:id/timeline', (req, res) => {
    // Accept timeline event - can be extended
    res.status(201).json(req.body);
});

// Serve the dashboard
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚁 Ummagawd Dashboard Server running on http://localhost:${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}`);
    console.log(`📋 API Base: http://localhost:${PORT}/api`);
});