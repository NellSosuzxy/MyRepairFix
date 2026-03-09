// ===============================================
// AUTHENTICATION & SESSION MANAGEMENT
// ===============================================

// Check if we are on staff page but not logged in or wrong role
document.addEventListener('DOMContentLoaded', () => {
    // --- Login/Logout Listeners ---
    const loginBtn = document.getElementById('loginBtn');
    if(loginBtn) loginBtn.addEventListener('click', checkPass);

    const logoutBtn = document.getElementById('logoutBtn');
    if(logoutBtn) logoutBtn.addEventListener('click', logout);

    // Enter key for login
    const adminPass = document.getElementById('adminPass');
    if (adminPass) {
        adminPass.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') checkPass();
        });
    }

    // --- Role & Redirect Logic ---
    const role = sessionStorage.getItem('userRole');
    const isStaffPage = window.location.pathname.includes('staff.html');
    const isAdminPage = window.location.pathname.includes('admin.html');

    if (isStaffPage) {
        if (!role) {
            // Not logged in, redirect to login (admin.html)
            window.location.href = 'admin.html';
        } else if (role !== 'staff' && role !== 'owner') {
             window.location.href = 'admin.html';
        } else {
            // Logged in as staff or owner on staff page
             const overlay = document.getElementById('loginOverlay');
             if(overlay) overlay.style.display = 'none';
             if (typeof fetchBookings === 'function') fetchBookings();
        }
    } else if (isAdminPage && role === 'owner') {
        // Already logged in as owner on admin page
         const overlay = document.getElementById('loginOverlay');
         if(overlay) overlay.style.display = 'none';
         const ownerPanel = document.getElementById('owner-panel');
         if (ownerPanel) ownerPanel.style.display = 'block';
         if (typeof fetchBookings === 'function') fetchBookings();
         // Load staff list for owner
         if (typeof loadStaffList === 'function') loadStaffList();
    }
});

/**
 * Login Function & Role Validator
 */
async function checkPass() {
    const user = document.getElementById('adminUser').value;
    const pass = document.getElementById('adminPass').value;
    
    if (!user || !pass) {
        alert("Please enter username and password");
        return;
    }

    try {
        const data = await apiPost('/api/login', { username: user, password: pass });
        
        if (data.success) {
            sessionStorage.setItem('userRole', data.role);
            
            if (data.role === 'staff') {
                window.location.href = 'staff.html';
                return;
            } else if (data.role === 'owner') {
                if (window.location.pathname.includes('staff.html')) {
                    window.location.href = 'admin.html';
                    return;
                }
            }

            document.getElementById('loginOverlay').style.display = 'none';
            
            if (data.role === 'owner') {
                const ownerPanel = document.getElementById('owner-panel');
                if (ownerPanel) ownerPanel.style.display = 'block';
                // Load staff list for owner
                if (typeof loadStaffList === 'function') loadStaffList();
            }

            if (typeof fetchBookings === 'function') fetchBookings();
        } else {
            alert('Login Failed: ' + data.message);
        }
    } catch (e) {
        console.error(e);
        alert('Server connection error');
    }
}

/**
 * Logout Function
 */
async function logout() {
    try {
        await apiPost('/api/logout');
        sessionStorage.removeItem('userRole');
        window.location.reload();
    } catch (e) {
        console.error('Logout failed', e);
        window.location.reload();
    }
}

// Global Exports
window.checkPass = checkPass;
window.logout = logout;
