// Settings Page JavaScript

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadUserProfile();
    loadCurrentAvatar();
    setupEventListeners();
});

// Load user profile data
function loadUserProfile() {
    const userData = JSON.parse(localStorage.getItem('userData')) || {};
    const userName = userData.name || 'User';
    const userEmail = userData.email || 'user@wealthease.com';
    
    document.getElementById('profileName').textContent = userName;
    document.getElementById('profileEmail').textContent = userEmail;
}

// Load current avatar
function loadCurrentAvatar() {
    const savedAvatar = localStorage.getItem('userAvatar') || '🐶';
    const currentAvatarEl = document.querySelector('#currentAvatar .avatar-emoji');
    currentAvatarEl.textContent = savedAvatar;
    
    // Mark the selected avatar in the grid
    const avatarOptions = document.querySelectorAll('.avatar-option');
    avatarOptions.forEach(option => {
        if (option.dataset.avatar === savedAvatar) {
            option.classList.add('selected');
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    // Avatar selection
    const avatarOptions = document.querySelectorAll('.avatar-option');
    avatarOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove selected class from all options
            avatarOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Add selected class to clicked option
            this.classList.add('selected');
            
            // Update preview
            const selectedAvatar = this.dataset.avatar;
            const currentAvatarEl = document.querySelector('#currentAvatar .avatar-emoji');
            currentAvatarEl.textContent = selectedAvatar;
        });
    });
    
    // Save avatar button
    document.getElementById('saveAvatarBtn').addEventListener('click', saveAvatar);
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    // Clear data button
    document.getElementById('clearDataBtn').addEventListener('click', handleClearData);
    
    // Toggle switches
    document.getElementById('twoFactorToggle').addEventListener('change', function() {
        localStorage.setItem('twoFactorEnabled', this.checked);
        showSuccessMessage('Two-factor authentication ' + (this.checked ? 'enabled' : 'disabled'));
    });
    
    document.getElementById('emailNotifToggle').addEventListener('change', function() {
        localStorage.setItem('emailNotifications', this.checked);
        showSuccessMessage('Email notifications ' + (this.checked ? 'enabled' : 'disabled'));
    });
    
    // Load toggle states
    const twoFactorEnabled = localStorage.getItem('twoFactorEnabled') === 'true';
    const emailNotifEnabled = localStorage.getItem('emailNotifications') !== 'false'; // Default true
    document.getElementById('twoFactorToggle').checked = twoFactorEnabled;
    document.getElementById('emailNotifToggle').checked = emailNotifEnabled;
}

// Save avatar
function saveAvatar() {
    const selectedAvatar = document.querySelector('.avatar-option.selected');
    if (!selectedAvatar) {
        alert('Please select an avatar first!');
        return;
    }
    
    const avatar = selectedAvatar.dataset.avatar;
    localStorage.setItem('userAvatar', avatar);
    
    showSuccessMessage('✨ Avatar saved successfully!');
    
    // Update avatar in navbar if on dashboard
    updateNavbarAvatar(avatar);
}

// Update navbar avatar across the app
function updateNavbarAvatar(avatar) {
    // This will be used when we add avatar display to navbar
    const event = new CustomEvent('avatarChanged', { detail: { avatar } });
    window.dispatchEvent(event);
}

// Handle logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        // Show loading state
        const logoutBtn = document.getElementById('logoutBtn');
        const originalText = logoutBtn.innerHTML;
        logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging out...';
        logoutBtn.disabled = true;
        
        // Simulate logout delay
        setTimeout(() => {
            // Clear session but keep user data and avatar
            localStorage.removeItem('isLoggedIn');
            sessionStorage.clear();
            
            // Show success message
            showSuccessMessage('👋 Logged out successfully!');
            
            // Redirect to login page
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        }, 800);
    }
}

// Handle clear data
function handleClearData() {
    const confirmed = confirm('⚠️ WARNING: This will delete ALL your transactions and data. This action cannot be undone!\n\nAre you sure you want to continue?');
    
    if (confirmed) {
        const doubleCheck = confirm('This is your last chance! All data will be permanently deleted. Continue?');
        
        if (doubleCheck) {
            console.log('🗑️ Clearing all data...');
            
            // Save user settings before clearing
            const userAvatar = localStorage.getItem('userAvatar');
            const userData = localStorage.getItem('userData');
            const user = localStorage.getItem('user');
            const isLoggedIn = localStorage.getItem('isLoggedIn');
            const twoFactorEnabled = localStorage.getItem('twoFactorEnabled');
            const emailNotifications = localStorage.getItem('emailNotifications');
            
            // Get all localStorage keys
            const allKeys = Object.keys(localStorage);
            console.log('📋 All localStorage keys:', allKeys);
            
            // Clear ALL transaction-related data
            localStorage.removeItem('transactions');
            localStorage.removeItem('bills');
            localStorage.removeItem('budgets');
            localStorage.removeItem('categories');
            localStorage.removeItem('wealthease_transactions');
            localStorage.removeItem('wealthease_budgets');
            localStorage.removeItem('wealthease_bills');
            
            // Clear any other transaction keys that might exist
            allKeys.forEach(key => {
                if (key.includes('transaction') || 
                    key.includes('bill') || 
                    key.includes('budget') || 
                    key.includes('category')) {
                    console.log('🗑️ Removing key:', key);
                    localStorage.removeItem(key);
                }
            });
            
            // Restore user settings and login state
            if (userAvatar) localStorage.setItem('userAvatar', userAvatar);
            if (userData) localStorage.setItem('userData', userData);
            if (user) localStorage.setItem('user', user);
            if (isLoggedIn) localStorage.setItem('isLoggedIn', isLoggedIn);
            if (twoFactorEnabled) localStorage.setItem('twoFactorEnabled', twoFactorEnabled);
            if (emailNotifications) localStorage.setItem('emailNotifications', emailNotifications);
            
            console.log('✅ Data cleared successfully!');
            showSuccessMessage('🗑️ All transaction data cleared successfully!');
            
            // Redirect to dashboard after 1.5 seconds
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        }
    }
}

// Show success message
function showSuccessMessage(message) {
    // Remove existing message if any
    const existingMessage = document.querySelector('.success-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create new message
    const messageEl = document.createElement('div');
    messageEl.className = 'success-message';
    messageEl.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(messageEl);
    
    // Remove after 3 seconds
    setTimeout(() => {
        messageEl.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            messageEl.remove();
        }, 300);
    }, 3000);
}

// Add slideOut animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
