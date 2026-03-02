// Client-side dashboard JavaScript using localStorage
// Works with GitHub Pages - no server required

let products = [];
let chartInstances = {};

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
    setupEventListeners();
    setupDataManagement();
});

// Load dashboard data from localStorage
function loadDashboard() {
    try {
        // Load products from localStorage or use default data
        const savedProducts = localStorage.getItem('ummagawdProducts');
        const savedDashboard = localStorage.getItem('ummagawdDashboard');
        
        if (savedProducts) {
            products = JSON.parse(savedProducts);
        } else {
            // Use default data if nothing saved
            products = getDefaultProducts();
            saveProducts();
        }
        
        let dashboardData;
        if (savedDashboard) {
            dashboardData = JSON.parse(savedDashboard);
        } else {
            dashboardData = calculateDashboardData();
            saveDashboard(dashboardData);
        }
        
        updateStats(dashboardData);
        updateProductsTable();
        createCharts(products);
    } catch (error) {
        console.error('Error loading dashboard:', error);
        // Fallback to default data
        products = getDefaultProducts();
        const dashboardData = calculateDashboardData();
        updateStats(dashboardData);
        updateProductsTable();
        createCharts(products);
    }
}

// Get default product data
function getDefaultProducts() {
    return [
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
    ];
}

// Calculate dashboard statistics
function calculateDashboardData() {
    return {
        totalProducts: products.length,
        activeProducts: products.filter(p => p.status === 'In Production').length,
        totalInvestment: products.reduce((sum, p) => sum + (p.developmentBudget || 0), 0),
        totalUnitsSold: products.reduce((sum, p) => sum + (p.unitsSold || 0), 0)
    };
}

// Save products to localStorage
function saveProducts() {
    localStorage.setItem('ummagawdProducts', JSON.stringify(products));
}

// Save dashboard data to localStorage
function saveDashboard(data) {
    localStorage.setItem('ummagawdDashboard', JSON.stringify(data));
}

// Update statistics
function updateStats(data) {
    document.getElementById('totalProducts').textContent = data.totalProducts;
    document.getElementById('activeProducts').textContent = data.activeProducts;
    document.getElementById('totalInvestment').textContent = formatCurrency(data.totalInvestment);
    document.getElementById('totalUnitsSold').textContent = data.totalUnitsSold.toLocaleString();
}

// Create charts
function createCharts(productsData) {
    // Status distribution chart
    const statusCtx = document.getElementById('statusChart').getContext('2d');
    const statusCounts = {};
    productsData.forEach(p => {
        statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
    });
    
    if (chartInstances.status) chartInstances.status.destroy();
    chartInstances.status = new Chart(statusCtx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(statusCounts),
            datasets: [{
                data: Object.values(statusCounts),
                backgroundColor: ['#3742fa', '#ffa502', '#00d2a0', '#ff4757']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { 
                        color: '#e8e8f0',
                        font: { size: 12 }
                    }
                }
            }
        }
    });
    
    // Financial overview chart
    const financialCtx = document.getElementById('financialChart').getContext('2d');
    const chartData = productsData.map(p => ({
        name: p.name,
        investment: p.developmentBudget || 0,
        profit: (p.retailPrice - p.productCost) * (p.unitsSold || 0)
    }));
    
    if (chartInstances.financial) chartInstances.financial.destroy();
    chartInstances.financial = new Chart(financialCtx, {
        type: 'bar',
        data: {
            labels: chartData.map(d => d.name),
            datasets: [
                {
                    label: 'Investment',
                    data: chartData.map(d => d.investment),
                    backgroundColor: '#ff4757'
                },
                {
                    label: 'Profit',
                    data: chartData.map(d => d.profit),
                    backgroundColor: '#00d2a0'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { 
                        color: '#8888aa',
                        font: { size: 11 },
                        callback: function(value) {
                            return '$' + (value / 1000) + 'k';
                        }
                    },
                    grid: { color: '#2a2a3a' }
                },
                x: {
                    ticks: { 
                        color: '#8888aa',
                        font: { size: 11 }
                    },
                    grid: { display: false }
                }
            },
            plugins: {
                legend: {
                    labels: { 
                        color: '#e8e8f0',
                        font: { size: 12 }
                    }
                }
            }
        }
    });
}

// Update products table
function updateProductsTable() {
    const tbody = document.getElementById('productsTableBody');
    tbody.innerHTML = '';
    
    products.forEach(product => {
        const row = document.createElement('tr');
        const profitMargin = ((product.retailPrice - product.productCost) / product.retailPrice * 100).toFixed(1);
        const statusClass = `status-${product.status.toLowerCase().replace(' ', '-')}`;
        
        row.innerHTML = `
            <td><strong>${product.name}</strong></td>
            <td><span class="status-badge ${statusClass}">${product.status}</span></td>
            <td>${formatCurrency(product.retailPrice)}</td>
            <td>${formatCurrency(product.productCost)}</td>
            <td>${profitMargin}%</td>
            <td>${product.unitsSold.toLocaleString()}</td>
            <td>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${product.progress}%"></div>
                </div>
                <small>${product.progress}%</small>
            </td>
            <td>
                <button class="btn btn-secondary btn-small" onclick="editProduct('${product.id}')">Edit</button>
                <button class="btn btn-danger btn-small" onclick="deleteProduct('${product.id}')">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Setup event listeners
function setupEventListeners() {
    const modal = document.getElementById('productModal');
    const addBtn = document.getElementById('addProductBtn');
    const closeBtn = document.querySelector('.close');
    const cancelBtn = document.getElementById('cancelBtn');
    const form = document.getElementById('productForm');
    
    addBtn.onclick = () => openModal();
    closeBtn.onclick = () => closeModal();
    cancelBtn.onclick = () => closeModal();
    
    window.onclick = (event) => {
        if (event.target === modal) closeModal();
    };
    
    form.onsubmit = async (e) => {
        e.preventDefault();
        await saveProduct();
    };
}

// Setup data management (export/import)
function setupDataManagement() {
    document.getElementById('exportBtn').onclick = exportData;
    document.getElementById('importBtn').onclick = () => {
        document.getElementById('importFile').click();
    };
    document.getElementById('importFile').onchange = importData;
}

// Modal functions
function openModal(productId = null) {
    const modal = document.getElementById('productModal');
    const form = document.getElementById('productForm');
    const title = document.getElementById('modalTitle');
    
    form.reset();
    
    if (productId) {
        const product = products.find(p => p.id === productId);
        if (product) {
            title.textContent = 'Edit Product';
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productStatus').value = product.status;
            document.getElementById('retailPrice').value = product.retailPrice;
            document.getElementById('productCost').value = product.productCost;
            document.getElementById('developmentBudget').value = product.developmentBudget;
            document.getElementById('marketingBudget').value = product.marketingBudget;
            document.getElementById('unitsSold').value = product.unitsSold;
            document.getElementById('productDescription').value = product.description || '';
        }
    } else {
        title.textContent = 'Add Product';
    }
    
    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('productModal').style.display = 'none';
}

// Product functions
function saveProduct() {
    const formData = {
        name: document.getElementById('productName').value,
        status: document.getElementById('productStatus').value,
        retailPrice: parseFloat(document.getElementById('retailPrice').value) || 0,
        productCost: parseFloat(document.getElementById('productCost').value) || 0,
        developmentBudget: parseFloat(document.getElementById('developmentBudget').value) || 0,
        marketingBudget: parseFloat(document.getElementById('marketingBudget').value) || 0,
        unitsSold: parseInt(document.getElementById('unitsSold').value) || 0,
        description: document.getElementById('productDescription').value,
        progress: document.getElementById('productStatus').value === 'In Production' ? 100 : 
                  document.getElementById('productStatus').value === 'Discontinued' ? 100 : 75,
        currentPhase: document.getElementById('productStatus').value === 'In Production' ? 'Production' : 
                       document.getElementById('productStatus').value === 'Discontinued' ? 'Completed' : 'Development',
        wholesalePrice: (parseFloat(document.getElementById('retailPrice').value) || 0) * 0.67,
        unitsInProduction: 0,
        inventoryStatus: document.getElementById('productStatus').value === 'In Production' ? 'In Stock' : 
                          document.getElementById('productStatus').value === 'Discontinued' ? 'Discontinued' : 'Development',
        projectedDemand: parseInt(document.getElementById('projectedDemand').value) || 0,
        category: 'Drone Frame',
        targetRelease: '2025-Q1'
    };
    
    const productId = document.getElementById('productId').value;
    const isUpdate = productId !== '';
    
    if (isUpdate) {
        const index = products.findIndex(p => p.id === productId);
        if (index !== -1) {
            products[index] = { ...products[index], ...formData };
        }
    } else {
        formData.id = `${formData.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
        formData.createdDate = new Date().toISOString().split('T')[0];
        products.push(formData);
    }
    
    saveProducts();
    
    const dashboardData = calculateDashboardData();
    saveDashboard(dashboardData);
    
    updateStats(dashboardData);
    updateProductsTable();
    createCharts(products);
    
    closeModal();
    showNotification(isUpdate ? 'Product updated successfully' : 'Product created successfully', 'success');
}

function editProduct(productId) {
    openModal(productId);
}

function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    const index = products.findIndex(p => p.id === productId);
    if (index !== -1) {
        products.splice(index, 1);
        saveProducts();
        
        const dashboardData = calculateDashboardData();
        saveDashboard(dashboardData);
        
        updateStats(dashboardData);
        updateProductsTable();
        createCharts(products);
        
        showNotification('Product deleted successfully', 'success');
    }
}

// Data export/import functions
function exportData() {
    const data = {
        products: products,
        dashboard: calculateDashboardData(),
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ummagawd-dashboard-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Data exported successfully', 'success');
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data.products && Array.isArray(data.products)) {
                products = data.products;
                saveProducts();
                
                if (data.dashboard) {
                    saveDashboard(data.dashboard);
                }
                
                const dashboardData = calculateDashboardData();
                updateStats(dashboardData);
                updateProductsTable();
                createCharts(products);
                
                showNotification('Data imported successfully', 'success');
            } else {
                showNotification('Invalid file format', 'error');
            }
        } catch (error) {
            console.error('Error importing data:', error);
            showNotification('Error importing data', 'error');
        }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'error' ? '#ff4757' : '#00d2a0'};
        color: white;
        border-radius: 8px;
        z-index: 2000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}