// ===============================================
// OWNER CONTROLS (Staff Management)
// ===============================================

document.addEventListener('DOMContentLoaded', () => {
    const addStaffBtn = document.getElementById('addStaffBtn');
    if(addStaffBtn) addStaffBtn.addEventListener('click', addNewStaff);

    const resetStaffBtn = document.getElementById('resetStaffBtn');
    if(resetStaffBtn) resetStaffBtn.addEventListener('click', resetStaffPassword);

    const refreshStaffBtn = document.getElementById('refreshStaffBtn');
    if(refreshStaffBtn) refreshStaffBtn.addEventListener('click', loadStaffList);

    // Load staff list on page load if owner panel exists
    const ownerPanel = document.getElementById('owner-panel');
    if(ownerPanel) {
        // Small delay to ensure auth check completes first
        setTimeout(() => {
            if(ownerPanel.style.display !== 'none') {
                loadStaffList();
            }
        }, 500);
    }
    
    // Event delegation for delete staff buttons
    const staffTableBody = document.getElementById('staff-table-body');
    if (staffTableBody) {
        staffTableBody.addEventListener('click', function(e) {
            const btn = e.target.closest('.delete-staff-btn');
            if (btn) {
                const staffId = btn.getAttribute('data-staff-id');
                const username = btn.getAttribute('data-staff-username');
                deleteStaff(staffId, username);
            }
        });
    }
});


// Expose loadStaffList globally so it can be called after login
window.loadStaffList = loadStaffList;

async function loadStaffList() {
    const tableBody = document.getElementById('staff-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">Loading...</td></tr>';

    try {
        const data = await apiGet('/api/staff-list');
        
        if (!data.success) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px; color: red;">Failed to load staff list</td></tr>';
            return;
        }

        if (data.staff.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">No staff found</td></tr>';
            return;
        }

        tableBody.innerHTML = data.staff.map(staff => {
            const createdDate = new Date(staff.created_at).toLocaleDateString('en-MY', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            const roleStyle = staff.role === 'owner' 
                ? 'display: inline-block; background: #fbbf24; color: #000; padding: 3px 12px; border-radius: 10px; font-weight: 600; min-width: 60px; text-align: center;'
                : 'display: inline-block; background: #60a5fa; color: #fff; padding: 3px 12px; border-radius: 10px; min-width: 60px; text-align: center;';
            
            const deleteBtn = staff.role === 'owner' 
                ? '<span style="color: #888;">-</span>'
                : `<button class="btn-danger delete-staff-btn" data-staff-id="${staff.id}" data-staff-username="${staff.username}" data-i18n="staff_delete_btn" style="padding: 5px 10px; font-size: 0.8rem;">Delete</button>`;

            return `
                <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 10px; text-align: center;">${staff.id}</td>
                    <td style="padding: 10px; text-align: center; font-weight: 500;">${staff.username}</td>
                    <td style="padding: 10px; text-align: center;"><span style="${roleStyle}">${staff.role.toUpperCase()}</span></td>
                    <td style="padding: 10px; text-align: center;">${createdDate}</td>
                    <td style="padding: 10px; text-align: center;">${deleteBtn}</td>
                </tr>
            `;
        }).join('');

        // Apply language translations to new content
        if (typeof applyLanguage === 'function') {
            applyLanguage();
        }

    } catch (e) {
        console.error('Error loading staff list:', e);
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px; color: red;">Error loading staff list</td></tr>';
    }
}

async function deleteStaff(staffId, username) {
    if (!confirm(`Are you sure you want to delete staff "${username}"? This cannot be undone!`)) {
        return;
    }

    try {
        const response = await fetch(`/api/delete-staff/${staffId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        const data = await response.json();

        if (data.success) {
            alert('✅ ' + data.message);
            loadStaffList(); // Refresh list
        } else {
            alert('❌ ' + data.message);
        }
    } catch (e) {
        console.error('Error deleting staff:', e);
        alert('Error deleting staff');
    }
}

// Expose deleteStaff globally for onclick handler - REMOVED for CSP
// window.deleteStaff = deleteStaff;

async function addNewStaff() {
    const user = document.getElementById('new-staff-user').value;
    const pass = document.getElementById('new-staff-pass').value;

    if (!user || !pass) {
        alert("Please fill in both fields!");
        return;
    }

    try {
        const data = await apiPost('/api/register-staff', { newUsername: user, newPassword: pass });
        const msgLabel = document.getElementById('add-msg');
        if (msgLabel) {
            msgLabel.innerText = data.message;
            msgLabel.style.color = data.success ? 'green' : 'red';
        }
        if (data.success) {
            document.getElementById('new-staff-user').value = '';
            document.getElementById('new-staff-pass').value = '';
        }
    } catch (e) {
        alert("Error adding staff");
    }
}

async function resetStaffPassword() {
    const user = document.getElementById('reset-target-user').value;
    const pass = document.getElementById('reset-new-pass').value;

    if (!user || !pass) {
        alert("Please fill in both fields (Username and New Password)!");
        return;
    }

    if (!confirm(`Are you sure you want to change the password for '${user}'?`)) {
        return;
    }

    try {
        const data = await apiPost('/api/reset-staff-password', { targetUsername: user, newPassword: pass });
        const msgLabel = document.getElementById('reset-msg');
        if (msgLabel) {
            msgLabel.innerText = data.message;
            msgLabel.style.color = data.success ? 'green' : 'red';
        }
        if (data.success) {
            document.getElementById('reset-target-user').value = '';
            document.getElementById('reset-new-pass').value = '';
        }
    } catch (e) {
        alert("Error resetting password");
    }
}
