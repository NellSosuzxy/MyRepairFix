// ===============================================
// 📝 BOOKING PAGE LOGIC
// ===============================================
// This script runs when the user is on the Booking Page.
// It handles:
// 1. Image previews (showing photos before upload)
// 2. Checking if form fields are valid (Validation)
// 3. Sending the booking data to the server

// --- 1. SETUP ON PAGE LOAD ---
document.addEventListener('DOMContentLoaded', () => {
    // Find the image upload input field
    const imageInput = document.getElementById('before_service_images');
    
    // When user selects files, show previews
    if (imageInput) {
        imageInput.addEventListener('change', (e) => {
            const files = e.target.files;
            // Calls a helper function from image-component.js to show thumbnails
            displayImagePreviews(files, 'image-preview-container');
        });
    }
    
    // Turn on live validation (check fields as user types/leaves)
    setupFormValidation();
});

// --- 2. FORM VALIDATION LOGIC ---
/**
 * Turns on 'blur' and 'input' listeners for all fields
 */
function setupFormValidation() {
    const form = document.getElementById('bookingForm');
    if (!form) return;
    
    // Find all inputs, textareas, and dropdowns
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        // 'blur' = when user clicks OUTSIDE the field
        input.addEventListener('blur', () => validateField(input));
        
        // 'input' = when user is TYPING (clear errors immediately)
        input.addEventListener('input', () => clearFieldError(input));
    });
}

/**
 * Checks a single field to see if it's correct
 * Returns true if valid, false if invalid
 */
function validateField(input) {
    const name = input.name;
    const value = input.value.trim();
    let error = '';
    
    // Specific rules for each field type
    switch (name) {
        case 'customer_name':
            if (!value) error = 'Name is required';
            else if (value.length < 2) error = 'Name must be at least 2 characters';
            break;
            
        case 'email':
            if (!value) error = 'Email is required';
            // Regex pattern to check standard email format
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Please enter a valid email';
            break;
            
        case 'phone':
            if (!value) error = 'Phone number is required';
            // Regex: Allows numbers, spaces, dots, dashes, parentheses
            else if (!/^[\d\s\-+()]{8,20}$/.test(value)) error = 'Please enter a valid phone number';
            break;
            
        case 'device_type':
            if (!value) error = 'Please select a device type';
            break;
            
        case 'device_model':
            if (!value) error = 'Device model is required';
            break;
            
        case 'issue_category':
            if (!value) error = 'Please select an issue category';
            break;
            
        case 'issue_desc':
            if (!value) error = 'Issue description is required';
            else if (value.length > 1000) error = 'Description is too long (max 1000 characters)';
            break;
    }
    
    // If we found an error, show it
    if (error) {
        showFieldError(input, error);
        return false;
    }
    return true; // No error
}

/**
 * Visually shows an error message below the input
 */
function showFieldError(input, message) {
    // Remove any existing error first
    clearFieldError(input);
    
    // Add red border class
    input.classList.add('input-error');
    
    // Create error text element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = 'color: #ef4444; font-size: 0.85rem; margin-top: 0.25rem;';
    
    // Insert error message AFTER the input field in the HTML
    input.parentNode.insertBefore(errorDiv, input.nextSibling);
}

/**
 * Hides the error message
 */
function clearFieldError(input) {
    input.classList.remove('input-error');
    const errorDiv = input.parentNode.querySelector('.field-error');
    if (errorDiv) errorDiv.remove();
}

/**
 * Validation check for ALL fields at once (when Submit is clicked)
 */
function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        // If any field returns false, the whole form is invalid
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    return isValid;
}

// --- 3. SUBMISSION HANDLER ---
/**
 * What happens when the "Book Now" button is clicked
 */
document.getElementById('bookingForm').addEventListener('submit', async (e) => {
    // STOP the browser from reloading the page (default behavior)
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Run full validation check
    if (!validateForm(form)) {
        if (typeof showToast === 'function') {
            showToast('Please fill in all required fields correctly', 'error');
        }
        return; // Stop here if invalid
    }

    // ========== PREPARE DATA ==========
    // FormData is a special object for sending files + text
    const formData = new FormData(form);
    
    // Get image files
    const imageFiles = document.getElementById('before_service_images').files;
    
    // Validate images if any were selected
    if (imageFiles.length > 0) {
        const validation = validateImageFiles(imageFiles, 5, 5);
        if (!validation.valid) {
            if (typeof showToast === 'function') {
                showToast(validation.message, 'error');
            } else {
                alert(validation.message);
            }
            return;
        }
    }
    
    // Add stage information
    formData.append('stage', 'before-service');

    // ========== STEP 2: Show loading state ==========
    if (typeof setButtonLoading === 'function') {
        setButtonLoading(submitBtn, true, 'Submitting...');
    } else {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
    }

    // ========== STEP 3: Send to Backend API with Images ==========
    try {
        const response = await fetch('/api/bookings', {
            method: 'POST',
            body: formData // Send as FormData (not JSON) to support file uploads
        });

        // Parse JSON response from server
        const result = await response.json();
        
        // ========== STEP 4: Handle Response ==========
        if (result.success) {
            // Booking successful! Show success message if images were uploaded
            if (result.uploaded_images && result.uploaded_images.length > 0) {
                console.log(`✅ Uploaded ${result.uploaded_images.length} images`);
            }
            
            // Redirect to confirmation page
            window.location.href = `confirmation.html?ref=${result.reference_code}`;
        } else {
            // Booking failed - show error message
            if (typeof showToast === 'function') {
                showToast('Error: ' + result.message, 'error');
            } else {
                alert('Error: ' + result.message);
            }
        }
    } catch (error) {
        console.error('❌ Booking error:', error);
        if (typeof showToast === 'function') {
            showToast('Error submitting booking. Please try again.', 'error');
        } else {
            alert('Error submitting booking. Please try again.');
        }
    } finally {
        // ========== STEP 5: Reset loading state ==========
        if (typeof setButtonLoading === 'function') {
            setButtonLoading(submitBtn, false);
        } else {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Booking';
        }
    }
});