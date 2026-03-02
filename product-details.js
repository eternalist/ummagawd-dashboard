// Product Details Page JavaScript

let currentProduct = {};
let expenses = [];
let productTimeline = [];

// Initialize product details page
document.addEventListener('DOMContentLoaded', () => {
  const productId = new URLSearchParams(window.location.search).get('id');
  if (productId) {
    loadProductDetails(productId);
    loadExpenses(productId);
    loadProductTimeline(productId);
    setupEventListeners();
  } else {
    showNotification('No product ID provided', 'error');
    setTimeout(() => window.location.href = '/', 2000);
  }
});

// Load product details
async function loadProductDetails(productId) {
  try {
    const response = await fetch(`/api/products/${productId}`);
    if (!response.ok) throw new Error('Product not found');
    
    currentProduct = await response.json();
    displayProductDetails();
    updatePageTitle();
  } catch (error) {
    console.error('Error loading product:', error);
    showNotification('Error loading product details', 'error');
  }
}

// Display product details
function displayProductDetails() {
  // Header info
  document.getElementById('productName').textContent = currentProduct.name;
  document.getElementById('productStatus').textContent = currentProduct.status;
  document.getElementById('productStatus').className = `status-badge status-${currentProduct.status.toLowerCase().replace(' ', '-')}`;
  document.getElementById('productDescription').textContent = currentProduct.description;
  
  // Financial info
  document.getElementById('retailPrice').textContent = formatCurrency(currentProduct.retailPrice);
  document.getElementById('wholesalePrice').textContent = formatCurrency(currentProduct.wholesalePrice);
  document.getElementById('productCost').textContent = formatCurrency(currentProduct.productCost);
  document.getElementById('profitMargin').textContent = calculateProfitMargin(currentProduct.retailPrice, currentProduct.productCost) + '%';
  document.getElementById('devBudget').textContent = formatCurrency(currentProduct.developmentBudget);
  document.getElementById('marketingBudget').textContent = formatCurrency(currentProduct.marketingBudget);
  
  // Sales info
  document.getElementById('unitsSold').textContent = currentProduct.unitsSold.toLocaleString();
  document.getElementById('unitsInProduction').textContent = currentProduct.unitsInProduction.toLocaleString();
  document.getElementById('projectedDemand').textContent = currentProduct.projectedDemand.toLocaleString();
  document.getElementById('inventoryStatus').textContent = currentProduct.inventoryStatus;
  
  // Progress
  document.getElementById('progressBar').style.width = currentProduct.progress + '%';
  document.getElementById('progressText').textContent = currentProduct.progress + '%';
  document.getElementById('currentPhase').textContent = currentProduct.currentPhase;
  document.getElementById('targetRelease').textContent = currentProduct.targetRelease;
  
  // Update status based on progress
  if (currentProduct.progress >= 90) {
    document.getElementById('progressBar').className = 'progress-fill progress-complete';
  } else if (currentProduct.progress >= 50) {
    document.getElementById('progressBar').className = 'progress-fill progress-in-progress';
  } else {
    document.getElementById('progressBar').className = 'progress-fill progress-early';
  }
  
  // Display specs, BOM, and features
  displaySpecs();
  displayBOM();
  displayFeatures();
}

// Load expenses
async function loadExpenses(productId) {
  try {
    const response = await fetch(`/api/products/${productId}/expenses`);
    if (response.ok) {
      expenses = await response.json();
      displayExpenses();
      updateExpenseSummary();
    }
  } catch (error) {
    console.error('Error loading expenses:', error);
  }
}

// Display expenses
function displayExpenses() {
  const tbody = document.getElementById('expenseTableBody');
  tbody.innerHTML = '';
  
  expenses.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(expense => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${formatDate(expense.date)}</td>
      <td>${expense.category}</td>
      <td>${expense.description}</td>
      <td>${formatCurrency(expense.amount)}</td>
      <td>${expense.vendor || '-'}</td>
      <td>
        <button class="btn btn-danger btn-small" onclick="deleteExpense('${expense.id}')">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Update expense summary
function updateExpenseSummary() {
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const budget = currentProduct.developmentBudget + currentProduct.marketingBudget;
  const remaining = budget - totalSpent;
  const percentage = (totalSpent / budget * 100).toFixed(1);
  
  document.getElementById('totalSpent').textContent = formatCurrency(totalSpent);
  document.getElementById('remainingBudget').textContent = formatCurrency(remaining);
  document.getElementById('budgetPercentage').textContent = percentage + '%';
  
  // Update budget progress bar
  const budgetProgress = Math.min(percentage, 100);
  document.getElementById('budgetProgressBar').style.width = budgetProgress + '%';
  
  if (percentage >= 90) {
    document.getElementById('budgetProgressBar').className = 'progress-fill budget-warning';
  } else if (percentage >= 70) {
    document.getElementById('budgetProgressBar').className = 'progress-fill budget-caution';
  } else {
    document.getElementById('budgetProgressBar').className = 'progress-fill budget-ok';
  }
}

// Load product timeline
async function loadProductTimeline(productId) {
  try {
    // Generate timeline from product data
    productTimeline = generateTimeline(currentProduct);
    displayTimeline();
    
    // Also load from API if available
    const response = await fetch(`/api/products/${productId}/timeline`);
    if (response.ok) {
      const apiTimeline = await response.json();
      productTimeline = [...productTimeline, ...apiTimeline].sort((a, b) => new Date(a.date) - new Date(b.date));
      displayTimeline();
    }
  } catch (error) {
    console.error('Error loading timeline:', error);
    // Display generated timeline even if API fails
    displayTimeline();
  }
}

// Generate timeline from product milestones and dates
function generateTimeline(product) {
  const timeline = [];
  
  // Add key dates
  if (product.createdDate) {
    timeline.push({
      id: 'created',
      date: product.createdDate,
      title: 'Project Created',
      description: 'Initial project concept and planning began',
      type: 'milestone',
      status: 'completed'
    });
  }
  
  // Add target release
  if (product.targetRelease) {
    const releaseYear = product.targetRelease.split('-')[0];
    const releaseQuarter = product.targetRelease.split('-')[1];
    const quarterMonths = { 'Q1': '03', 'Q2': '06', 'Q3': '09', 'Q4': '12' };
    const releaseDate = `${releaseYear}-${quarterMonths[releaseQuarter]}-15`;
    
    timeline.push({
      id: 'target-release',
      date: releaseDate,
      title: 'Target Release',
      description: `Scheduled release for ${product.targetRelease}`,
      type: 'milestone',
      status: product.progress >= 100 ? 'completed' : 'planned'
    });
  }
  
  // Add current phase
  if (product.currentPhase) {
    const phaseDate = new Date();
    phaseDate.setDate(phaseDate.getDate() - Math.floor((100 - product.progress) * 2));
    
    timeline.push({
      id: 'current-phase',
      date: phaseDate.toISOString().split('T')[0],
      title: product.currentPhase,
      description: `Currently in ${product.currentPhase} phase (${product.progress}% complete)`,
      type: 'phase',
      status: 'current'
    });
  }
  
  return timeline;
}

// Display timeline
function displayTimeline() {
  const container = document.getElementById('timelineContainer');
  container.innerHTML = '';
  
  if (productTimeline.length === 0) {
    container.innerHTML = '<p class="no-data">No timeline events available</p>';
    return;
  }
  
  productTimeline.forEach((event, index) => {
    const eventEl = document.createElement('div');
    eventEl.className = `timeline-event ${event.status}`;
    
    const isPast = new Date(event.date) < new Date();
    const statusIcon = event.status === 'completed' ? '✅' : 
                      event.status === 'current' ? '🔄' : '📅';
    
    eventEl.innerHTML = `
      <div class="timeline-date">${formatDate(event.date)}</div>
      <div class="timeline-content">
        <div class="timeline-title">${statusIcon} ${event.title}</div>
        <div class="timeline-description">${event.description}</div>
        <div class="timeline-type">${event.type}</div>
      </div>
    `;
    
    container.appendChild(eventEl);
  });
}

// Setup event listeners
function setupEventListeners() {
  // Add expense form
  document.getElementById('addExpenseForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await addExpense();
  });
  
  // Cancel button
  document.getElementById('cancelBtn').addEventListener('click', () => {
    document.getElementById('addExpenseForm').reset();
  });
  
  // Back to dashboard
  document.getElementById('backToDashboard').addEventListener('click', () => {
    window.location.href = '/';
  });
  
  // Edit product button
  document.getElementById('editProductBtn').addEventListener('click', () => {
    document.getElementById('editModal').style.display = 'block';
    populateEditForm();
  });
  
  // Image upload
  document.getElementById('imageUpload').addEventListener('change', handleImageUpload);
  
  // Tab switching
  document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', (e) => {
      const tabName = e.target.dataset.tab;
      switchTab(tabName);
    });
  });
}

// Add expense
async function addExpense() {
  const formData = {
    productId: currentProduct.id,
    date: document.getElementById('expenseDate').value,
    category: document.getElementById('expenseCategory').value,
    description: document.getElementById('expenseDescription').value,
    amount: parseFloat(document.getElementById('expenseAmount').value),
    vendor: document.getElementById('expenseVendor').value
  };
  
  try {
    const response = await fetch(`/api/products/${currentProduct.id}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    if (response.ok) {
      showNotification('Expense added successfully', 'success');
      document.getElementById('addExpenseForm').reset();
      loadExpenses(currentProduct.id);
    } else {
      throw new Error('Failed to add expense');
    }
  } catch (error) {
    console.error('Error adding expense:', error);
    showNotification('Error adding expense', 'error');
  }
}

// Delete expense
async function deleteExpense(expenseId) {
  if (!confirm('Are you sure you want to delete this expense?')) return;
  
  try {
    const response = await fetch(`/api/products/${currentProduct.id}/expenses/${expenseId}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      showNotification('Expense deleted successfully', 'success');
      loadExpenses(currentProduct.id);
    } else {
      throw new Error('Failed to delete expense');
    }
  } catch (error) {
    console.error('Error deleting expense:', error);
    showNotification('Error deleting expense', 'error');
  }
}

// Handle image upload
function handleImageUpload(event) {
  const files = event.target.files;
  if (files.length === 0) return;
  
  // In a real implementation, you would upload to a server
  // For now, we'll create preview URLs
  Array.from(files).forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      addImageToGallery(e.target.result, file.name);
    };
    reader.readAsDataURL(file);
  });
}

// Add image to gallery
function addImageToGallery(imageSrc, imageName) {
  const gallery = document.getElementById('imageGallery');
  const imageItem = document.createElement('div');
  imageItem.className = 'gallery-item';
  imageItem.innerHTML = `
    <img src="${imageSrc}" alt="${imageName}" loading="lazy">
    <div class="gallery-item-overlay">
      <button class="btn btn-danger btn-small" onclick="removeImage(this)">Delete</button>
    </div>
  `;
  gallery.appendChild(imageItem);
}

// Remove image
function removeImage(button) {
  if (confirm('Are you sure you want to delete this image?')) {
    button.closest('.gallery-item').remove();
  }
}

// Switch tabs
function switchTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.style.display = 'none';
  });
  
  // Remove active class from all buttons
  document.querySelectorAll('.tab-button').forEach(button => {
    button.classList.remove('active');
  });
  
  // Show selected tab
  document.getElementById(`${tabName}Tab`).style.display = 'block';
  
  // Add active class to button
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
}

// Utility functions
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function calculateProfitMargin(retailPrice, productCost) {
  return ((retailPrice - productCost) / retailPrice * 100).toFixed(1);
}

function updatePageTitle() {
  document.title = `${currentProduct.name} - Ummagawd Product Dashboard`;
}

function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Modal functions
function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

function addSpec() {
  document.getElementById('specModal').style.display = 'block';
}

function addBomItem() {
  document.getElementById('bomModal').style.display = 'block';
}

function addFeature() {
  const feature = prompt('Enter feature description:');
  if (feature) {
    // Save to product specs
    if (!currentProduct.features) currentProduct.features = [];
    currentProduct.features.push(feature);
    saveProductUpdate();
    displayFeatures();
  }
}

function addTimelineEvent() {
  document.getElementById('timelineModal').style.display = 'block';
  document.getElementById('eventDate').value = new Date().toISOString().split('T')[0];
}

// Display functions for specs, BOM, features
function displaySpecs() {
  const container = document.getElementById('specsContainer');
  if (!currentProduct.specs || currentProduct.specs.length === 0) {
    container.innerHTML = '<p class="no-data">No specifications added yet</p>';
    return;
  }
  
  container.innerHTML = currentProduct.specs.map(spec => `
    <div class="spec-item">
      <label>${spec.name}:</label>
      <span>${spec.value}</span>
    </div>
  `).join('');
}

function displayBOM() {
  const container = document.getElementById('bomContainer');
  const totalEl = document.getElementById('bomTotal');
  
  if (!currentProduct.bom || currentProduct.bom.length === 0) {
    container.innerHTML = '<p class="no-data">No BOM items added yet</p>';
    totalEl.style.display = 'none';
    return;
  }
  
  let total = 0;
  container.innerHTML = currentProduct.bom.map(item => {
    total += item.cost || 0;
    return `
      <div class="bom-item">
        <span class="bom-component">${item.component}</span>
        <span class="bom-supplier">${item.supplier || '-'}</span>
        <span class="bom-quantity">${item.quantity || '-'}</span>
        <span class="bom-cost">${formatCurrency(item.cost)}</span>
      </div>
    `;
  }).join('');
  
  document.getElementById('bomTotalAmount').textContent = formatCurrency(total);
  totalEl.style.display = 'block';
}

function displayFeatures() {
  const container = document.getElementById('featuresContainer');
  if (!currentProduct.features || currentProduct.features.length === 0) {
    container.innerHTML = '<p class="no-data">No features added yet</p>';
    return;
  }
  
  const icons = ['🪶', '🔧', '📡', '💪', '⚡', '🛡️', '🎯', '✨'];
  container.innerHTML = currentProduct.features.map((feature, i) => `
    <div class="feature-item">
      <span class="feature-icon">${icons[i % icons.length]}</span>
      <span class="feature-text">${feature}</span>
    </div>
  `).join('');
}

// Save product updates
async function saveProductUpdate() {
  try {
    const response = await fetch(`/api/products/${currentProduct.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentProduct)
    });
    
    if (!response.ok) throw new Error('Failed to save');
  } catch (error) {
    console.error('Error saving product:', error);
    showNotification('Error saving changes', 'error');
  }
}

// Form handlers
document.addEventListener('DOMContentLoaded', () => {
  // Spec form
  document.getElementById('specForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const spec = {
      name: document.getElementById('specName').value,
      value: document.getElementById('specValue').value
    };
    
    if (!currentProduct.specs) currentProduct.specs = [];
    currentProduct.specs.push(spec);
    await saveProductUpdate();
    displaySpecs();
    closeModal('specModal');
    document.getElementById('specForm').reset();
    showNotification('Specification added', 'success');
  });
  
  // BOM form
  document.getElementById('bomForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const bomItem = {
      component: document.getElementById('bomComponent').value,
      supplier: document.getElementById('bomSupplier').value,
      quantity: document.getElementById('bomQuantity').value,
      cost: parseFloat(document.getElementById('bomCost').value)
    };
    
    if (!currentProduct.bom) currentProduct.bom = [];
    currentProduct.bom.push(bomItem);
    await saveProductUpdate();
    displayBOM();
    closeModal('bomModal');
    document.getElementById('bomForm').reset();
    showNotification('BOM item added', 'success');
  });
  
  // Timeline form
  document.getElementById('timelineForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const event = {
      date: document.getElementById('eventDate').value,
      title: document.getElementById('eventTitle').value,
      description: document.getElementById('eventDescription').value,
      type: document.getElementById('eventType').value,
      status: new Date(document.getElementById('eventDate').value) < new Date() ? 'completed' : 'planned'
    };
    
    try {
      const response = await fetch(`/api/products/${currentProduct.id}/timeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
      
      if (response.ok) {
        loadProductTimeline(currentProduct.id);
        closeModal('timelineModal');
        document.getElementById('timelineForm').reset();
        showNotification('Timeline event added', 'success');
      }
    } catch (error) {
      console.error('Error adding event:', error);
      showNotification('Error adding event', 'error');
    }
  });
});

// Close modals when clicking outside
window.onclick = function(event) {
  if (event.target.classList.contains('modal')) {
    event.target.style.display = 'none';
  }
}