let cart = [];
let products = [];

// Load products when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    updateCartUI();
    
    // Add click event to cart icon
    document.querySelector('.cart-icon').addEventListener('click', toggleCart);
    
    // Add card number formatting
    const cardNumberInput = document.getElementById('card-number');
    const expiryInput = document.getElementById('expiry');

    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default behavior
            showCheckout();
        });
    }

    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            if (formattedValue.length > 19) formattedValue = formattedValue.substring(0, 19);
            e.target.value = formattedValue;
        });
    }
    
    if (expiryInput) {
        expiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
    }
});

// Load products from API
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
        // Fallback to sample data if API fails
        displayProducts([
            {
                id: 1,
                name: "Premium Headphones",
                price: 199.99,
                image: "https://via.placeholder.com/300x300/667eea/ffffff?text=Headphones",
                description: "High-quality wireless headphones"
            },
            {
                id: 2,
                name: "Smart Watch",
                price: 299.99,
                image: "https://via.placeholder.com/300x300/764ba2/ffffff?text=Smart+Watch",
                description: "Advanced fitness tracking"
            }
        ]);
    }
}

// Display products in grid
function displayProducts(products) {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = '';
    
    products.forEach(product => {
        const productCard = createProductCard(product);
        grid.appendChild(productCard);
    });
}

// Create product card element
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    card.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="product-image">
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-price">$${product.price.toFixed(2)}</div>
            <button class="add-to-cart" onclick="addToCart(${product.id})">
                Add to Cart
            </button>
        </div>
    `;
    
    return card;
}

// Add product to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    updateCartUI();
    showCartAnimation();
}

function removeFromCart(productId) {
    const existingItem = cart.find(item => item.id === productId);
    if (!existingItem) return;

    if (existingItem.quantity > 1) {
        existingItem.quantity -= 1;
    } else {
        cart = cart.filter(item => item.id !== productId);
    }

    updateCartUI();
}


// Update cart UI
function updateCartUI() {
    const cartCount = document.querySelector('.cart-count');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Update cart items
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align:center; color: #999;">Your cart is empty.</p>';
    } else {
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-price">
                    $${item.price.toFixed(2)} x ${item.quantity}
                    <button type="button" class="remove-item-btn" onclick="removeFromCart(${item.id})">−</button>
                </div>

            `;
            cartItems.appendChild(cartItem);
        });
    }
    
    // Update total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = total.toFixed(2);
}

// Toggle cart sidebar
function toggleCart() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('overlay');
    
    sidebar.classList.toggle('open');
    overlay.classList.toggle('show');
}

// Show cart animation
function showCartAnimation() {
    const cartIcon = document.querySelector('.cart-icon');
    cartIcon.style.animation = 'bounce 0.5s ease';
    
    setTimeout(() => {
        cartIcon.style.animation = '';
    }, 500);
}

// Show About modal
function showAbout() {
    const modal = document.getElementById('about-modal');
    const overlay = document.getElementById('overlay');
    
    modal.classList.add('show');
    overlay.classList.add('show');
}

// Show Login modal
function showLogin() {
    const modal = document.getElementById('login-modal');
    const overlay = document.getElementById('overlay');
    
    modal.classList.add('show');
    overlay.classList.add('show');
}

// Show Signup modal
function showSignup() {
    const modal = document.getElementById('signup-modal');
    const overlay = document.getElementById('overlay');
    
    modal.classList.add('show');
    overlay.classList.add('show');
}

// Show Checkout modal
function showCheckout() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('checkout-total').textContent = total.toFixed(2);
    
    const modal = document.getElementById('checkout-modal');
    const overlay = document.getElementById('overlay');
    
    // Close cart first
    document.getElementById('cart-sidebar').classList.remove('open');
    
    modal.classList.add('show');
    overlay.classList.add('show');
}

// Close specific modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    const overlay = document.getElementById('overlay');
    
    modal.classList.remove('show');
    overlay.classList.remove('show');
}

// Close all modals
function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    const overlay = document.getElementById('overlay');
    const cartSidebar = document.getElementById('cart-sidebar');
    
    modals.forEach(modal => modal.classList.remove('show'));
    overlay.classList.remove('show');
    cartSidebar.classList.remove('open');
}

// Switch between auth modals
function switchToSignup() {
    closeModal('login-modal');
    setTimeout(() => showSignup(), 100);
}

function switchToLogin() {
    closeModal('signup-modal');
    setTimeout(() => showLogin(), 100);
}

// Handle Login
function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Simulate login process
    alert(`Login successful!\nEmail: ${email}`);
    closeModal('login-modal');
    
    // Clear form
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
}

// Handle Signup
function handleSignup(event) {
    event.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm').value;
    
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    // Simulate signup process
    alert(`Account created successfully!\nName: ${name}\nEmail: ${email}`);
    closeModal('signup-modal');
    
    // Clear form
    document.getElementById('signup-name').value = '';
    document.getElementById('signup-email').value = '';
    document.getElementById('signup-password').value = '';
    document.getElementById('signup-confirm').value = '';
}

// Handle Checkout
function handleCheckout(event) {
    event.preventDefault();
    const cardNumber = document.getElementById('card-number').value;
    const expiry = document.getElementById('expiry').value;
    const cvv = document.getElementById('cvv').value;
    const cardholder = document.getElementById('cardholder').value;
    
    // Simulate payment process
    const total = document.getElementById('checkout-total').textContent;
    alert(`Payment successful!\nAmount: ${total}\nCard: **** **** **** ${cardNumber.slice(-4)}\nCardholder: ${cardholder}`);
    
    // Clear cart and close modal
    cart = [];
    updateCartUI();
    closeModal('checkout-modal');
    
    // Clear form
    document.getElementById('card-number').value = '';
    document.getElementById('expiry').value = '';
    document.getElementById('cvv').value = '';
    document.getElementById('cardholder').value = '';
}

// Show Checkout modal
function showCheckout() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('checkout-total').textContent = total.toFixed(2);
    
    const modal = document.getElementById('checkout-modal');
    const overlay = document.getElementById('overlay');
    
    // Close cart first
    document.getElementById('cart-sidebar').classList.remove('open');
    
    modal.classList.add('show');
    overlay.classList.add('show');
}

// Add bounce animation to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes bounce {
        0%, 20%, 60%, 100% {
            transform: translateY(0);
        }
        40% {
            transform: translateY(-10px);
        }
        80% {
            transform: translateY(-5px);
        }
    }
`;
document.head.appendChild(style);