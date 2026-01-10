document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const user = document.getElementById('user').value.trim();
  const password = document.getElementById('password').value.trim();
  const error = document.getElementById('loginError');

  error.textContent = '';

  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user, password })
  });

  if (!res.ok) {
    error.textContent = 'Credenciales incorrectas';
    return;
  }

  const data = await res.json();

  localStorage.setItem('token', data.token);
  localStorage.setItem('role', data.role);

  window.location.href = '/index.html';
});
