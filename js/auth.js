document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const signinForm = document.getElementById('signin-form');

    // Handle Auth redirects early
    if (signupForm || signinForm) {
        redirectIfAuth();
    }

    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            const users = Storage.getUsers();
            if (users.find(u => u.email === email)) {
                alert('User with this email already exists!');
                return;
            }

            const newUser = { id: Date.now(), name, email, password };
            users.push(newUser);
            Storage.saveUsers(users);
            Storage.setCurrentUser(newUser);
            window.location.href = 'dashboard.html';
        });
    }

    if (signinForm) {
        signinForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            const users = Storage.getUsers();
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                Storage.setCurrentUser(user);
                window.location.href = 'dashboard.html';
            } else {
                alert('Invalid email or password!');
            }
        });
    }
});