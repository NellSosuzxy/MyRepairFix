// ===============================================
// IMAGE COMPONENT - Reusable Image Display Functions
// ===============================================
// Purpose: Handle image preview, display, and upload UI across pages
// Features: Read-only display, timestamps, stage labels
// ===============================================

/**
 * Create an image card with label, timestamp, and read-only marker
 * @param {string} imagePath - Path to the image
 * @param {string} stage - Stage name ('before-service', 'received-condition', 'after-service')
 * @param {string} timestamp - Upload timestamp
 * @param {boolean} readonly - Whether image is read-only
 * @returns {HTMLElement} - Image card element
 */
function createImageCard(imagePath, stage, timestamp = null, readonly = true) {
    const card = document.createElement('div');
    card.className = 'image-card';
    if (readonly) card.classList.add('readonly');
    
    // Stage label with icon
    const stageIcons = {
        'before-service': '',
        'received-condition': '',
        'after-service': ''
    };
    
    const stageLabels = {
        'before-service': 'Before Service',
        'received-condition': 'Received Condition',
        'after-service': 'After Service'
    };
    
    const icon = stageIcons[stage] || '';
    const label = stageLabels[stage] || 'Image';
    
    // Create card HTML
    card.innerHTML = `
        <div class="image-card-header">
            <span class="stage-label">${label}</span>
            ${readonly ? '<span class="readonly-badge">Read-Only</span>' : ''}
        </div>
        <div class="image-wrapper">
            <img src="${imagePath}" alt="${label}" class="zoomable-img" style="cursor: pointer;">
        </div>
        ${timestamp ? `<div class="image-timestamp">${formatTimestamp(timestamp)}</div>` : ''}
    `;

    // Attach event listener (CSP compliant)
    const img = card.querySelector('.zoomable-img');
    if (img) {
        img.addEventListener('click', () => viewFullImage(imagePath, label));
    }
    
    return card;
}

/**
 * Format timestamp to readable date
 * @param {string} timestamp - ISO timestamp or Date string
 * @returns {string} - Formatted date string
 */
function formatTimestamp(timestamp) {
    if (!timestamp) return 'No timestamp';
    
    const date = new Date(timestamp);
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    return date.toLocaleDateString('en-US', options);
}

/**
 * View image in full-screen modal
 * @param {string} imagePath - Path to image
 * @param {string} label - Image label/description
 */
function viewFullImage(imagePath, label) {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'image-fullscreen-modal active'; // Added active class
    modal.innerHTML = `
        <div class="fullscreen-content">
            <span class="image-fullscreen-close">&times;</span>
            <img src="${imagePath}" alt="${label}">
            <h3 style="color: white; text-align: center; margin-top: 1rem;">${label}</h3>
        </div>
    `;

    // Attach close listener (CSP compliant)
    const closeBtn = modal.querySelector('.image-fullscreen-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => modal.remove());
    }
    
    // Close on click outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    document.body.appendChild(modal);
}

/**
 * Display image preview for file input (before upload)
 * @param {FileList} files - Selected files from input
 * @param {string} containerId - ID of preview container
 */
function displayImagePreviews(files, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = ''; // Clear existing previews
    
    if (files.length === 0) {
        container.innerHTML = '<p class="no-images">No images selected</p>';
        return;
    }
    
    Array.from(files).forEach((file, index) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            return;
        }
        
        // Create preview card
        const card = document.createElement('div');
        card.className = 'image-preview-card';
        
        // Read file and create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            card.innerHTML = `
                <div class="preview-wrapper">
                    <img src="${e.target.result}" alt="Preview ${index + 1}">
                    <div class="preview-info">
                        <span class="file-name">${file.name}</span>
                        <span class="file-size">${formatFileSize(file.size)}</span>
                    </div>
                </div>
            `;
        };
        reader.readAsDataURL(file);
        
        container.appendChild(card);
    });
}

/**
 * Format file size to readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted size (e.g., "2.5 MB")
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Display uploaded images in a container with stage labels and timestamps
 * @param {Array} images - Array of image objects {path, timestamp}
 * @param {string} stage - Stage name
 * @param {string} containerId - ID of display container
 * @param {boolean} readonly - Whether images are read-only
 */
function displayUploadedImages(images, stage, containerId, readonly = true) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = ''; // Clear existing content
    
    if (!images || images.length === 0) {
        container.innerHTML = '<p class="no-images">No images uploaded</p>';
        return;
    }
    
    images.forEach((image) => {
        const imagePath = typeof image === 'string' ? image : image.path;
        const timestamp = typeof image === 'object' ? image.timestamp : new Date().toISOString();
        
        const card = createImageCard(imagePath, stage, timestamp, readonly);
        container.appendChild(card);
    });
}

/**
 * Validate image files before upload
 * @param {FileList} files - Files to validate
 * @param {number} maxFiles - Maximum number of files
 * @param {number} maxSizeMB - Maximum size per file in MB
 * @returns {Object} - {valid: boolean, message: string}
 */
function validateImageFiles(files, maxFiles = 5, maxSizeMB = 5) {
    if (files.length === 0) {
        return { valid: false, message: 'Please select at least one image' };
    }
    
    if (files.length > maxFiles) {
        return { valid: false, message: `Maximum ${maxFiles} images allowed` };
    }
    
    const maxSize = maxSizeMB * 1024 * 1024; // Convert to bytes
    
    for (let file of files) {
        // Check file type
        if (!file.type.startsWith('image/')) {
            return { valid: false, message: `${file.name} is not an image file` };
        }
        
        // Check file size
        if (file.size > maxSize) {
            return { valid: false, message: `${file.name} exceeds ${maxSizeMB}MB limit` };
        }
    }
    
    return { valid: true, message: 'Validation passed' };
}

// Make functions globally available
if (typeof window !== 'undefined') {
    window.createImageCard = createImageCard;
    window.formatTimestamp = formatTimestamp;
    window.viewFullImage = viewFullImage;
    window.displayImagePreviews = displayImagePreviews;
    window.formatFileSize = formatFileSize;
    window.displayUploadedImages = displayUploadedImages;
    window.validateImageFiles = validateImageFiles;
}