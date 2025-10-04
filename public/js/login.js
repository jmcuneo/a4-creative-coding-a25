const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get('username');
const password = urlParams.get('password');

const usernameInput = document.getElementById('login-username');
const passwordInput = document.getElementById('login-password');
const loginForm = document.getElementById('login-form');
const errorDiv = document.getElementById('login-error');

if (username) usernameInput.value = username;
if (password) passwordInput.value = password;

if (username && password) {
  console.log('URL parameters detected, auto-submitting login form');
  setTimeout(() => {
    loginForm.dispatchEvent(new Event('submit'));
  }, 500);
}

loginForm.onsubmit = async (e) => {
  e.preventDefault();
  errorDiv.textContent = '';

  const payload = {
    username: usernameInput.value.trim(),
    password: passwordInput.value
  };

  try {
    const res = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      if (data.newAccount) alert('You are now logged in.');
      location.href = '/storage.html';
    } else {
      errorDiv.textContent = data.error || 'Login failed';
    }
  } catch (err) {
    console.error('Login request failed:', err);
    errorDiv.textContent = 'Network error. Please try again.';
  }
};
