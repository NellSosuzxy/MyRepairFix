// ===============================================
// DASHBOARD SHARED LOGIC (Table, Images, Status)
// ===============================================

document.addEventListener('DOMContentLoaded', () => {
    // Modal Close
    const closeImageModalBtn = document.getElementById('closeImageModalBtn');
    if(closeImageModalBtn) closeImageModalBtn.addEventListener('click', closeImageModal);

    // Upload Buttons
    const uploadReceivedBtn = document.getElementById('uploadReceivedBtn');
    if(uploadReceivedBtn) uploadReceivedBtn.addEventListener('click', () => uploadAdminImages('received-condition'));

    const uploadAfterBtn = document.getElementById('uploadAfterBtn');
    if(uploadAfterBtn) uploadAfterBtn.addEventListener('click', () => uploadAdminImages('after-service'));

    // File Input Previews
    const receivedUpload = document.getElementById('received-upload');
    if(receivedUpload) {
        receivedUpload.addEventListener('change', function() {
            displayImagePreviews(this.files, 'received-preview');
        });
    }

    const afterUpload = document.getElementById('after-upload');
    if(afterUpload) {
        afterUpload.addEventListener('change', function() {
            displayImagePreviews(this.files, 'after-preview');
        });
    }

    // Booking Table Event Delegation
    const bookingTable = document.getElementById('bookingTable');
    if (bookingTable) {
        bookingTable.addEventListener('click', function(e) {
            const btn = e.target.closest('button');
            if (!btn) return;

            if (btn.classList.contains('btn-delete')) {
                deleteBooking(btn.dataset.id);
            } else if (btn.classList.contains('btn-update')) {
                updateStatus(btn.dataset.id);
            } else if (btn.classList.contains('btn-images-modal')) {
                openImageModal(btn.dataset.id, btn.dataset.ref, btn.dataset.model);
            }
        });
    }
});

/**
 * Fetch All Bookings
 */
async function fetchBookings() {
    try {
        const data = await apiGet('/api/admin/bookings');

        if (data.success) {
            const tbody = document.getElementById('bookingTable');
            tbody.innerHTML = ''; 
            
            const currentRole = sessionStorage.getItem('userRole');

            data.bookings.forEach(booking => {
                let deleteButtonHTML = '';
                if (currentRole === 'owner') {
                    deleteButtonHTML = `<button class="btn-delete" data-id="${booking.id}" style="background-color: #ef4444; color: white; border: none; padding: 5px 10px; margin-left: 5px; cursor: pointer; border-radius: 4px;">Delete</button>`;
                }

                const row = `
                    <tr>
                        <td>${booking.reference_code}</td>
                        <td>${new Date(booking.created_at).toLocaleDateString()}</td>
                        <td>${booking.customer_name}<br><small>${booking.phone}</small></td>
                        <td>${booking.device_model} (${booking.device_type})</td>
                        <td><strong>${booking.issue_category}</strong><br>${booking.issue_desc}</td>
                        <td style="text-align: center;">
                            <select id="status-${booking.id}" class="status-select" style="margin: 0 auto;">
                                <option value="Pending" ${booking.status === 'Pending' ? 'selected' : ''} data-i18n="status_pending">Pending</option>
                                <option value="Confirmed" ${booking.status === 'Confirmed' ? 'selected' : ''} data-i18n="status_confirmed">Confirmed</option>
                                <option value="In-Progress" ${booking.status === 'In-Progress' ? 'selected' : ''} data-i18n="status_in_progress">In Progress</option>
                                <option value="Ready" ${booking.status === 'Ready' ? 'selected' : ''} data-i18n="status_ready">Ready</option>
                                <option value="Completed" ${booking.status === 'Completed' ? 'selected' : ''} data-i18n="status_completed">Completed</option>
                                <option value="Canceled" ${booking.status === 'Canceled' ? 'selected' : ''} data-i18n="status_canceled">Canceled</option>
                            </select>
                        </td>
                        <td style="text-align: center;">
                            <div style="display: flex; flex-direction: column; align-items: center; gap: 5px;">
                                <button class="btn-update" data-id="${booking.id}" data-i18n="admin_update_btn">Update</button>
                                ${deleteButtonHTML}
                            </div>
                        </td>
                        <td>
                            <button class="btn-images-modal" data-id="${booking.id}" data-ref="${booking.reference_code}" data-model="${booking.device_model}">
                                <span data-i18n="admin_table_images">Upload</span>
                            </button>
                        </td>
                    </tr>
                `;
                
                tbody.innerHTML += row;
            });
            
            if (typeof applyLanguage === 'function') {
                applyLanguage();
            }
        }
    } catch (error) {
        console.error('Error fetching bookings:', error);
    }
}

/**
 * Update Status
 */
async function updateStatus(id) {
    const newStatus = document.getElementById(`status-${id}`).value;
    try {
        const result = await apiRequest(`/api/admin/bookings/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status: newStatus })
        });
        
        if (result.success) {
            showToast('Status Updated!', 'success');
        } else {
            showToast('Error updating status: ' + (result.message || 'Unknown error'), 'error');
        }
    } catch (e) {
        showToast('Server error updating status', 'error');
    }
}

/**
 * Delete Booking (Owner Only)
 */
async function deleteBooking(id) {
    if (!confirm("Are you sure you want to delete this booking?")) return;
    try {
        const result = await apiDelete(`/api/admin/bookings/${id}`);
        if (result.success) {
            showToast('Booking deleted');
            fetchBookings();
        } else {
            showToast("Failed: " + result.message, 'error');
        }
    } catch (e) {
        showToast("Error deleting booking", 'error');
    }
}

// ========== IMAGE LOGIC ========== //

let currentBookingId = null;

async function openImageModal(bookingId, refCode, deviceModel) {
    currentBookingId = bookingId;
    document.getElementById('imageModal').style.display = 'flex';
    document.getElementById('modal-booking-info').innerHTML = `
        <strong>Ref:</strong> ${refCode} | <strong>Device:</strong> ${deviceModel}
    `;
    await loadBookingImages(bookingId);
}

function closeImageModal() {
    document.getElementById('imageModal').style.display = 'none';
    currentBookingId = null;
}

async function loadBookingImages(bookingId) {
    try {
        const result = await apiGet(`/api/admin/bookings/${bookingId}/images`);
        if (result.success) {
            displayUploadedImages(result.images.before, 'before-service', 'before-images-display', true);
            displayUploadedImages(result.images.received, 'received-condition', 'received-images-display', true);
            displayUploadedImages(result.images.after, 'after-service', 'after-images-display', true);
            toggleUploadSection('received-upload-section', result.images.received);
            toggleUploadSection('after-upload-section', result.images.after);
        }
    } catch (error) {
        console.error('Error loading images:', error);
    }
}

function toggleUploadSection(elementId, images) {
    const el = document.getElementById(elementId);
    if (!el) return;
    if (images && images.length > 0) {
        el.style.display = 'none';
    } else {
        el.style.display = 'flex';
    }
}

async function uploadAdminImages(stage) {
    if (!currentBookingId) {
        alert('No booking selected');
        return;
    }
    const inputId = stage === 'received-condition' ? 'received-upload' : 'after-upload';
    const fileInput = document.getElementById(inputId);
    const files = fileInput.files;
    
    if (files.length === 0) {
        alert('Please select images to upload');
        return;
    }
    const validation = validateImageFiles(files, 10, 5);
    if (!validation.valid) {
        alert(validation.message);
        return;
    }
    
    const formData = new FormData();
    formData.append('stage', stage);
    Array.from(files).forEach(file => {
        formData.append('admin_images', file);
    });
    
    // Get CSRF Token from cookie
    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    };
    const csrfToken = getCookie('X-CSRF-Token');

    try {
        const response = await fetch(`/api/admin/bookings/${currentBookingId}/images`, {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRF-Token': csrfToken
            }
        });
        const result = await response.json();
        if (result.success) {
            alert(`✅ Successfully uploaded ${result.uploaded_images.length} images`);
            fileInput.value = '';
            const previewId = stage === 'received-condition' ? 'received-preview' : 'after-preview';
            const previewEl = document.getElementById(previewId);
            if (previewEl) previewEl.innerHTML = '';
            await loadBookingImages(currentBookingId);
        } else {
            alert('Error uploading images: ' + result.message);
        }
    } catch (error) {
        console.error('Upload error:', error);
        alert('Error uploading images. Please try again.');
    }
}

// Global Exports
window.fetchBookings = fetchBookings;
window.updateStatus = updateStatus;
window.deleteBooking = deleteBooking;
window.openImageModal = openImageModal;
window.closeImageModal = closeImageModal;
window.uploadAdminImages = uploadAdminImages;
