/* New Admin Tab Logic */

// Tab Switching
function switchTab(tabName) {
    // Hide all contents
    document.querySelectorAll('.tab-content').forEach(el => {
        el.style.display = 'none';
        el.classList.remove('active');
    });
    
    // Show selected
    document.getElementById(`tab-${tabName}`).style.display = 'block';
    document.getElementById(`tab-${tabName}`).classList.add('active');
    
    // Update buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Load data if needed
    if (tabName === 'logs') {
        loadAuditLogs();
    }
}

// Load Audit Logs
async function loadAuditLogs() {
    const tbody = document.getElementById('logsTableBody');
    tbody.innerHTML = '<tr><td colspan="5" class="text-center">Loading...</td></tr>';

    try {
        const response = await apiRequest('/api/admin/bookings/logs'); // Correct path via adminRoutes mounted at /api/admin/bookings ?! Wait.
        // In server.js: app.use('/api/admin/bookings', adminRoutes);
        // So routes are /api/admin/bookings/logs. 
        // This is a bit weird naming (bookings/logs), but that's how server.js is set up. 
        // Ideally should be /api/admin/logs but changing server.js mounts might break other things.
        // Let's stick to the existing mount point.
        
        if (response.success && response.logs) {
            if (response.logs.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center">No logs found</td></tr>';
                return;
            }

            tbody.innerHTML = response.logs.map(log => `
                <tr>
                    <td class="text-sm text-gray">${new Date(log.created_at).toLocaleString()}</td>
                    <td><span class="badge" style="background:#e0e7ff; color:#3730a3;">${log.username || 'System'}</span></td>
                    <td class="font-medium">${log.action}</td>
                    <td class="text-sm">${log.details}</td>
                    <td class="text-mono text-xs">${log.ip_address || '-'}</td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error("Log error", error);
        tbody.innerHTML = `<tr><td colspan="5" class="text-danger">Error loading logs. Are you the Owner?</td></tr>`;
    }
}

// Load Online Staff Count
async function loadOnlineStatus() {
    try {
        // Mounted at /api/admin/bookings/stats
        const response = await apiRequest('/api/admin/bookings/stats');
        if (response.success && response.stats) {
            const countSpan = document.getElementById('online-count');
            const badge = document.getElementById('online-staff-badge');
            
            if (countSpan) countSpan.textContent = response.stats.online_staff;
            
            // Add Pointer Cursor Explicitly
            if (badge) badge.style.cursor = 'pointer'; 

            // Populate staff names if hovering or click
            if (localStorage.getItem('userRole') === 'owner' && document.getElementById('staff-list-modal')) {
                // Pre-load staff list for the modal
                loadStaffList();
            }
        }
    } catch (e) {
        console.log("Status load error", e);
    }
}

// NEW: Load Detailed Staff List
async function loadStaffList() {
    try {
        const response = await apiRequest('/api/admin/bookings/users/online');
        if (response.success && response.users) {
            const listContainer = document.getElementById('online-staff-list');
            if (listContainer) {
                if (response.users.length === 0) {
                     listContainer.innerHTML = '<li class="dropdown-item text-muted">No one else is online</li>';
                     return;
                }
                
                listContainer.innerHTML = response.users.map(user => `
                    <li class="dropdown-item" style="padding: 8px 12px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
                        <span>
                            <strong>${user.username}</strong> 
                            <span class="text-muted text-xs">(${user.role})</span>
                        </span>
                        <span class="status-dot online" style="background:var(--success-color); width:8px; height:8px; border-radius:50%;"></span>
                    </li>
                `).join('');
            }
        }
    } catch (e) {
        console.log("Staff list error", e);
    }
}

// Toggle Staff Dropdown
window.toggleStaffDropdown = function() {
    console.log("Toggle dropdown clicked"); // Debug check
    const dropdown = document.getElementById('staff-dropdown');
    if (dropdown) {
        const isHidden = dropdown.style.display === 'none';
        dropdown.style.display = isHidden ? 'block' : 'none';
        if (isHidden) loadStaffList(); // meaningful refresh on open
    } else {
        console.error("Dropdown element not found!");
    }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    // Refresh online status every 30 seconds
    setInterval(loadOnlineStatus, 30000);
    setTimeout(loadOnlineStatus, 1000); // Initial load
    
    // Attach click listener to online badge (replaces inline onclick)
    const onlineBadge = document.getElementById('online-staff-badge');
    if (onlineBadge) {
        onlineBadge.addEventListener('click', toggleStaffDropdown);
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        const badge = document.getElementById('online-staff-badge');
        const dropdown = document.getElementById('staff-dropdown');
        if (badge && !badge.contains(e.target) && dropdown && !dropdown.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });
});
