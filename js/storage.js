// Storage utility for LocalStorage
const Storage = {
    // Auth
    setCurrentUser: (user) => localStorage.setItem('currentUser', JSON.stringify(user)),
    getCurrentUser: () => JSON.parse(localStorage.getItem('currentUser')),
    removeCurrentUser: () => localStorage.removeItem('currentUser'),
    
    // Users DB
    getUsers: () => JSON.parse(localStorage.getItem('users')) || [],
    saveUsers: (users) => localStorage.setItem('users', JSON.stringify(users)),
    
    // Images DB
    getImages: () => JSON.parse(localStorage.getItem('images')) || [],
    saveImages: (images) => localStorage.setItem('images', JSON.stringify(images))
};

// Protect Routes
function requireAuth() {
    if (!Storage.getCurrentUser()) {
        window.location.href = 'signin.html';
    }
}

function redirectIfAuth() {
    if (Storage.getCurrentUser()) {
        window.location.href = 'dashboard.html';
    }
}

// Global Logout Handler
document.addEventListener('click', (e) => {
    const logoutBtn = e.target.closest('#logout-btn');
    if (logoutBtn) {
        e.preventDefault();
        Storage.removeCurrentUser();
        window.location.replace('index.html');
    }
});