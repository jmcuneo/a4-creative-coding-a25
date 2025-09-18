// Handle login form
document.querySelector('#login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.querySelector('#username').value;
    const password = document.querySelector('#password').value;

    const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    if (res.ok) {
        alert('Login successful!');
        loadShifts();
    } else {
        alert('Login failed');
    }
});

// Fetch and display shifts for logged in user
async function loadShifts() {
    const res = await fetch('/api/shifts');
    const shifts = await res.json();

    const table = document.querySelector('#shifts-table tbody');
    table.innerHTML = '';
    shifts.forEach(shift => {
        const row = document.createElement('tr');
        row.innerHTML = `
      <td>${shift.date}</td>
      <td>${shift.hours}</td>
      <td>${shift.tips}</td>
      <td>
        <button onclick="deleteShift('${shift._id}')">Delete</button>
      </td>
    `;
        table.appendChild(row);
    });
}

// Add shift form
document.querySelector('#shift-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const date = document.querySelector('#date').value;
    const hours = document.querySelector('#hours').value;
    const tips = document.querySelector('#tips').value;

    const res = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, hours, tips })
    });

    if (res.ok) {
        loadShifts();
    }
});

// Delete shift
async function deleteShift(id) {
    await fetch(`/api/shifts/${id}`, { method: 'DELETE' });
    loadShifts();
}
