/**
 * RODY Store - E-commerce Application
 * Professional JavaScript Module
 * Author: BizSpire Team, INHA University
 * Year: 2025
 */

class RodyStore {
    constructor() {
        this.cart = [];
        this.products = [];
        this.isLoading = false;
        
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupEventListeners();
            this.loadProducts();
            this.updateCartUI();
            this.initializeFormValidation();
        });
    }

    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        // Cart functionality
        const cartIcon = document.querySelector('.cart-icon');
        if (cartIcon) {
            cartIcon.addEventListener('click', () => this.toggleCart());
        }

        // Checkout button
        const checkoutBtn = document.querySelector('.checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showCheckout();
            });
        }

        // Close modals when clicking overlay
        const overlay = document.getElementById('overlay');
        if (overlay) {
            overlay.addEventListener('click', () => this.closeAllModals());
        }

        // ESC key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    /**
     * Initialize form validation and formatting
     */
    initializeFormValidation() {
        // Card number formatting
        const cardNumberInput = document.getElementById('card-number');
        if (cardNumberInput) {
            cardNumberInput.addEventListener('input', this.formatCardNumber.bind(this));
        }

        // Expiry date formatting
        const expiryInput = document.getElementById('expiry');
        if (expiryInput) {
            expiryInput.addEventListener('input', this.formatExpiryDate.bind(this));
        }

        // CVV validation
        const cvvInput = document.getElementById('cvv');
        if (cvvInput) {
            cvvInput.addEventListener('input', this.formatCVV.bind(this));
        }
    }

    /**
     * Load products from API
     */
    async loadProducts() {
        try {
            this.isLoading = true;
            this.showLoader();

            const response = await fetch('/api/products');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.products = await response.json();
            this.displayProducts(this.products);
        } catch (error) {
            console.error('Error loading products:', error);
            this.handleLoadError();
        } finally {
            this.isLoading = false;
            this.hideLoader();
        }
    }

    /**
     * Handle product loading error with fallback
     */
    handleLoadError() {
        console.warn('Falling back to sample data');
        this.products = [
            {
                id: 1,
                name: "Model Z",
                price: 399.99,
                image: "/media/model-z.png",
                description: "Premium ergonomic back support system"
            },
            {
                id: 2,
                name: "Model Z Premium",
                price: 599.99,
                image: "/media/premium.jpg",
                description: "Advanced massage technology with smart features"
            }
        ];
        this.displayProducts(this.products);
    }

    /**
     * Display products in grid
     */
    displayProducts(products) {
        const grid = document.getElementById('products-grid');
        if (!grid) return;

        grid.innerHTML = '';
        
        products.forEach((product, index) => {
            const productCard = this.createProductCard(product, index);
            grid.appendChild(productCard);
        });
    }

    /**
     * Create individual product card
     */
    createProductCard(product, index) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.style.animationDelay = `${index * 0.1}s`;
        
        card.innerHTML = `
            <img src="${product.image}" 
                 alt="${product.name}" 
                 class="product-image"
                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y4ZjlmYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2Yjc0ODQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIwLjNlbSI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pjwvc3ZnPg=='">
            <div class="product-info">
                <h3 class="product-name">${this.escapeHtml(product.name)}</h3>
                <p class="product-description">${this.escapeHtml(product.description)}</p>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <button class="add-to-cart" 
                        onclick="rodyStore.addToCart(${product.id})"
                        aria-label="Add ${product.name} to cart">
                    Add to Cart
                </button>
            </div>
        `;
        
        return card;
    }

    /**
     * Add product to cart
     */
    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) {
            console.error(`Product with ID ${productId} not found`);
            return;
        }

        const existingItem = this.cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                ...product,
                quantity: 1
            });
        }

        this.updateCartUI();
        this.showCartAnimation();
        this.saveCartToStorage();
    }

    /**
     * Remove product from cart
     */
    removeFromCart(productId) {
        const existingItem = this.cart.find(item => item.id === productId);
        if (!existingItem) return;

        if (existingItem.quantity > 1) {
            existingItem.quantity -= 1;
        } else {
            this.cart = this.cart.filter(item => item.id !== productId);
        }

        this.updateCartUI();
        this.saveCartToStorage();
    }

    /**
     * Update cart UI elements
     */
    updateCartUI() {
        this.updateCartCount();
        this.updateCartItems();
        this.updateCartTotal();
    }

    /**
     * Update cart count badge
     */
    updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        if (!cartCount) return;

        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        
        // Add pulse animation for visual feedback
        cartCount.style.animation = 'pulse 0.3s ease';
        setTimeout(() => {
            cartCount.style.animation = '';
        }, 300);
    }

    /**
     * Update cart items display
     */
    updateCartItems() {
        const cartItems = document.getElementById('cart-items');
        if (!cartItems) return;

        cartItems.innerHTML = '';

        if (this.cart.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <p>Your cart is empty</p>
                    <small>Add some products to get started!</small>
                </div>
            `;
            return;
        }

        this.cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <img src="${item.image}" 
                     alt="${item.name}" 
                     class="cart-item-image">
                <div class="cart-item-info">
                    <div class="cart-item-name">${this.escapeHtml(item.name)}</div>
                    <div class="cart-item-details">
                        <span class="cart-item-price">$${item.price.toFixed(2)}</span>
                        <div class="quantity-controls">
                            <button type="button" 
                                    class="quantity-btn decrease" 
                                    onclick="rodyStore.removeFromCart(${item.id})"
                                    aria-label="Decrease quantity">−</button>
                            <span class="quantity">${item.quantity}</span>
                            <button type="button" 
                                    class="quantity-btn increase" 
                                    onclick="rodyStore.addToCart(${item.id})"
                                    aria-label="Increase quantity">+</button>
                        </div>
                    </div>
                </div>
            `;
            cartItems.appendChild(cartItem);
        });
    }

    /**
     * Update cart total
     */
    updateCartTotal() {
        const cartTotal = document.getElementById('cart-total');
        if (!cartTotal) return;

        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = total.toFixed(2);
    }

    /**
     * Toggle cart sidebar
     */
    toggleCart() {
        const sidebar = document.getElementById('cart-sidebar');
        const overlay = document.getElementById('overlay');
        
        if (!sidebar || !overlay) return;

        const isOpen = sidebar.classList.contains('open');
        
        if (isOpen) {
            this.closeCart();
        } else {
            this.openCart();
        }
    }

    /**
     * Open cart sidebar
     */
    openCart() {
        const sidebar = document.getElementById('cart-sidebar');
        const overlay = document.getElementById('overlay');
        
        sidebar.classList.add('open');
        overlay.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    /**
     * Close cart sidebar
     */
    closeCart() {
        const sidebar = document.getElementById('cart-sidebar');
        const overlay = document.getElementById('overlay');
        
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
        document.body.style.overflow = ''; // Restore scrolling
    }

    /**
     * Show cart animation
     */
    showCartAnimation() {
        const cartIcon = document.querySelector('.cart-icon');
        if (!cartIcon) return;

        cartIcon.style.animation = 'bounce 0.5s ease';
        setTimeout(() => {
            cartIcon.style.animation = '';
        }, 500);
    }

    /**
     * Modal Management
     */
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        const overlay = document.getElementById('overlay');
        
        if (!modal || !overlay) return;

        this.closeAllModals(); // Close any open modals first
        
        setTimeout(() => {
            modal.classList.add('show');
            overlay.classList.add('show');
            document.body.style.overflow = 'hidden';
        }, 100);
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        const overlay = document.getElementById('overlay');
        
        if (!modal || !overlay) return;

        modal.classList.remove('show');
        overlay.classList.remove('show');
        document.body.style.overflow = '';
    }

    closeAllModals() {
        const modals = document.querySelectorAll('.modal');
        const overlay = document.getElementById('overlay');
        const cartSidebar = document.getElementById('cart-sidebar');

        modals.forEach(modal => modal.classList.remove('show'));
        if (overlay) overlay.classList.remove('show');
        if (cartSidebar) cartSidebar.classList.remove('open');
        
        document.body.style.overflow = '';
    }

    /**
     * Specific modal show methods
     */
    showAbout() {
        this.showModal('about-modal');
    }

    showLogin() {
        this.showModal('login-modal');
    }

    showSignup() {
        this.showModal('signup-modal');
    }

    showCheckout() {
        if (this.cart.length === 0) {
            alert('Your cart is empty! Please add some products first.');
            return;
        }

        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const checkoutTotal = document.getElementById('checkout-total');
        if (checkoutTotal) {
            checkoutTotal.textContent = total.toFixed(2);
        }

        this.closeCart();
        this.showModal('checkout-modal');
    }

    /**
     * Modal switching
     */
    switchToSignup() {
        this.closeModal('login-modal');
        setTimeout(() => this.showSignup(), 150);
    }

    switchToLogin() {
        this.closeModal('signup-modal');
        setTimeout(() => this.showLogin(), 150);
    }

    /**
     * Form handlers
     */
    handleLogin(event) {
        event.preventDefault();
        
        const email = document.getElementById('login-email')?.value;
        const password = document.getElementById('login-password')?.value;
        
        if (!email || !password) {
            alert('Please fill in all fields');
            return;
        }

        if (!this.validateEmail(email)) {
            alert('Please enter a valid email address');
            return;
        }

        // Simulate login process
        this.showSuccessMessage(`Welcome back! Login successful for ${email}`);
        this.closeModal('login-modal');
        this.clearForm('login-modal');
    }

    handleSignup(event) {
        event.preventDefault();
        
        const name = document.getElementById('signup-name')?.value;
        const email = document.getElementById('signup-email')?.value;
        const password = document.getElementById('signup-password')?.value;
        const confirmPassword = document.getElementById('signup-confirm')?.value;
        
        if (!name || !email || !password || !confirmPassword) {
            alert('Please fill in all fields');
            return;
        }

        if (!this.validateEmail(email)) {
            alert('Please enter a valid email address');
            return;
        }

        if (password.length < 6) {
            alert('Password must be at least 6 characters long');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        // Simulate signup process
        this.showSuccessMessage(`Account created successfully for ${name}!`);
        this.closeModal('signup-modal');
        this.clearForm('signup-modal');
    }

    handleCheckout(event) {
        event.preventDefault();
        
        const cardNumber = document.getElementById('card-number')?.value;
        const expiry = document.getElementById('expiry')?.value;
        const cvv = document.getElementById('cvv')?.value;
        const cardholder = document.getElementById('cardholder')?.value;
        
        if (!cardNumber || !expiry || !cvv || !cardholder) {
            alert('Please fill in all payment details');
            return;
        }

        if (!this.validateCardNumber(cardNumber)) {
            alert('Please enter a valid card number');
            return;
        }

        if (!this.validateExpiry(expiry)) {
            alert('Please enter a valid expiry date');
            return;
        }

        const total = document.getElementById('checkout-total')?.textContent;
        
        // Simulate payment process
        this.showSuccessMessage(`Payment successful!\nAmount: $${total}\nCard: **** **** **** ${cardNumber.slice(-4)}\nThank you for your purchase!`);
        
        // Clear cart and close modal
        this.cart = [];
        this.updateCartUI();
        this.closeModal('checkout-modal');
        this.clearForm('checkout-modal');
        this.saveCartToStorage();
    }

    /**
     * Form formatting and validation
     */
    formatCardNumber(event) {
        let value = event.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
        let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
        if (formattedValue.length > 19) formattedValue = formattedValue.substring(0, 19);
        event.target.value = formattedValue;
    }

    formatExpiryDate(event) {
        let value = event.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        event.target.value = value;
    }

    formatCVV(event) {
        event.target.value = event.target.value.replace(/\D/g, '').substring(0, 3);
    }

    /**
     * Validation methods
     */
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validateCardNumber(cardNumber) {
        const cleaned = cardNumber.replace(/\s/g, '');
        return cleaned.length >= 13 && cleaned.length <= 19 && /^\d+$/.test(cleaned);
    }

    validateExpiry(expiry) {
        const match = expiry.match(/^(\d{2})\/(\d{2})$/);
        if (!match) return false;
        
        const month = parseInt(match[1]);
        const year = parseInt(match[2]) + 2000;
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        
        return month >= 1 && month <= 12 && 
               (year > currentYear || (year === currentYear && month >= currentMonth));
    }

    /**
     * Utility methods
     */
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    showSuccessMessage(message) {
        // Create a more elegant success notification
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    clearForm(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        const inputs = modal.querySelectorAll('input');
        inputs.forEach(input => input.value = '');
    }

    showLoader() {
        // Implementation for loading state
        console.log('Loading products...');
    }

    hideLoader() {
        // Implementation for hiding loading state
        console.log('Products loaded');
    }

    saveCartToStorage() {
        try {
            // Note: localStorage is not available in Claude artifacts
            // This would work in a real environment
            // localStorage.setItem('rody-cart', JSON.stringify(this.cart));
        } catch (error) {
            console.warn('Unable to save cart to storage');
        }
    }

    loadCartFromStorage() {
        try {
            // Note: localStorage is not available in Claude artifacts
            // This would work in a real environment
            // const saved = localStorage.getItem('rody-cart');
            // if (saved) this.cart = JSON.parse(saved);
        } catch (error) {
            console.warn('Unable to load cart from storage');
        }
    }
}

// Initialize the application
const rodyStore = new RodyStore();

// Global functions for HTML onclick handlers
window.showAbout = () => rodyStore.showAbout();
window.showLogin = () => rodyStore.showLogin();
window.showSignup = () => rodyStore.showSignup();
window.showCheckout = () => rodyStore.showCheckout();
window.closeModal = (modalId) => rodyStore.closeModal(modalId);
window.closeAllModals = () => rodyStore.closeAllModals();
window.switchToSignup = () => rodyStore.switchToSignup();
window.switchToLogin = () => rodyStore.switchToLogin();
window.handleLogin = (event) => rodyStore.handleLogin(event);
window.handleSignup = (event) => rodyStore.handleSignup(event);
window.handleCheckout = (event) => rodyStore.handleCheckout(event);
window.toggleCart = () => rodyStore.toggleCart();

// Add professional CSS animations
const professionalStyles = document.createElement('style');
professionalStyles.textContent = `
    @keyframes bounce {
        0%, 20%, 60%, 100% { transform: translateY(0); }
        40% { transform: translateY(-10px); }
        80% { transform: translateY(-5px); }
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }
    
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .empty-cart {
        text-align: center;
        padding: 2rem;
        color: #6b7280;
    }
    
    .quantity-controls {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-top: 0.5rem;
    }
    
    .quantity-btn {
        width: 24px;
        height: 24px;
        border: 1px solid #d1d5db;
        background: white;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
        font-weight: 600;
    }
    
    .quantity-btn:hover {
        background: #f3f4f6;
        border-color: #9ca3af;
    }
    
    .quantity {
        min-width: 20px;
        text-align: center;
        font-weight: 600;
    }
    
    .cart-item-details {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        width: 100%;
    }
`;
document.head.appendChild(professionalStyles);