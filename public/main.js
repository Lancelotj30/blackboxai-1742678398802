// Initialize socket connection with explicit URL
const socket = io(window.location.origin);

// DOM Elements
const statusDot = document.querySelector('.status-dot');
const statusText = document.querySelector('.status-text');
const totalOtpsElement = document.getElementById('totalOtps');
const lastReceivedElement = document.getElementById('lastReceived');
const otpTableBody = document.getElementById('otpTableBody');

// Track total OTPs
let totalOtps = 0;

// Update connection status
socket.on('connect', () => {
    statusDot.classList.add('connected');
    statusText.textContent = 'Connected';
});

socket.on('disconnect', () => {
    statusDot.classList.remove('connected');
    statusText.textContent = 'Disconnected';
});

// Handle new OTP messages
socket.on('newOTP', (data) => {
    // Update stats
    totalOtps++;
    totalOtpsElement.textContent = totalOtps;
    lastReceivedElement.textContent = formatDate(data.timestamp);

    // Create new table row
    const tr = document.createElement('tr');
    tr.classList.add('new-entry');
    
    tr.innerHTML = `
        <td>${formatDate(data.timestamp)}</td>
        <td>${escapeHtml(data.sender)}</td>
        <td>${escapeHtml(data.message)}</td>
        <td><strong>${escapeHtml(data.otp)}</strong></td>
    `;

    // Add to table
    otpTableBody.insertBefore(tr, otpTableBody.firstChild);

    // Remove highlight class after animation
    setTimeout(() => {
        tr.classList.remove('new-entry');
    }, 2000);

    // Keep only last 100 entries
    if (otpTableBody.children.length > 100) {
        otpTableBody.removeChild(otpTableBody.lastChild);
    }
});

// Helper function to format dates
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).format(date);
}

// Helper function to escape HTML and prevent XSS
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Add error handling for socket connection
socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
    statusDot.classList.remove('connected');
    statusText.textContent = 'Connection Error';
});

socket.on('error', (error) => {
    console.error('Socket error:', error);
    statusDot.classList.remove('connected');
    statusText.textContent = 'Error';
});