// ======================================
// STATUS.JS - Booking Status Checker
// ======================================
// Purpose: Allows customers to check repair status using reference code
// API Endpoint: GET /api/bookings/:ref?email=xxx
// Security: Requires email verification to prevent unauthorized access
// ======================================

/**
 * Status Check Form Submission Handler
 * Listens for form submit on #statusForm (in status.html)
 * Requires both reference code AND email for security
 */
document.getElementById('statusForm').addEventListener('submit', async (e) => {
    // Prevent default form submission
    e.preventDefault();
    
    // ========== STEP 1: Get Form Input Values ==========
    const ref = e.target.ref_code.value;    // Reference code (e.g., REF1234567890)
    const email = e.target.email.value;      // Email for verification

    // ========== STEP 2: Call Backend API ==========
    /**
     * GET request to fetch booking status
     * Email is sent as query parameter for verification
     * Server will check if email matches the booking record
     * This prevents random people from checking status with just the ref code
     */
    const response = await fetch(`/api/bookings/${ref}?email=${email}`);
    const data = await response.json();

    // Get the results display container
    const resultDiv = document.getElementById('result');

    // ========== STEP 3: Display Results or Error ==========
    if (data.success) {
        /**
         * Booking found and email verified!
         * Display booking information to the customer
         */
        resultDiv.style.display = 'block'; // Show the hidden results div
        
        // Show the print button
        document.getElementById('printBtn').style.display = 'inline-flex';
        
        // Populate device information
        document.getElementById('resDevice').innerText = data.booking.device_model;
        
        // Populate Print fields
        const now = new Date();
        const dateStr = now.toLocaleDateString(currentLang === 'ms' ? 'ms-MY' : 'en-US');
        const yearStr = now.getFullYear();
        const updateStr = new Date(data.booking.updated_at).toLocaleString(currentLang === 'ms' ? 'ms-MY' : 'en-US');
        
        document.getElementById('print-date').innerText = dateStr;

        document.getElementById('print-year').innerText = yearStr;
        document.getElementById('print-device').innerText = data.booking.device_model;
        document.getElementById('print-status').innerText = data.booking.status;
        document.getElementById('print-updated').innerText = updateStr;
        
        // Set reference code for print
        const printRefCodes = document.querySelectorAll('.print-ref-code');
        printRefCodes.forEach(el => el.innerText = ref);
        
        // Handle Status Translation
        const statusSpan = document.getElementById('resStatus');
        let statusKey = 'status_pending'; // Default fallback
        
        // Map DB status to translation key
        if (data.booking.status === 'In-Progress') {
            statusKey = 'status_in_progress';
        } else if (data.booking.status === 'Completed') {
            statusKey = 'status_completed';
        } else if (data.booking.status === 'Confirmed') {
            statusKey = 'status_confirmed';
        } else if (data.booking.status === 'Ready') {
            statusKey = 'status_ready';
        } else if (data.booking.status === 'Canceled') {
            statusKey = 'status_canceled';
        } else {
            statusKey = 'status_pending';
        }

        // Set data-i18n attribute so it updates when language is toggled
        statusSpan.setAttribute('data-i18n', statusKey);
        
        // Update print status with data-i18n too so it toggles
        const printStatus = document.getElementById('print-status');
        if(printStatus) {
            printStatus.setAttribute('data-i18n', statusKey);
        }

        // Apply initial text immediately based on current global language

        // Check if translations object exists (from global.js)
        if (typeof translations !== 'undefined' && typeof currentLang !== 'undefined') {
            document.getElementById('print-status').innerText = translations[currentLang][statusKey]; // Translate for print
            statusSpan.innerText = translations[currentLang][statusKey];
        } else {
            // Fallback if globals not ready
             statusSpan.innerText = data.booking.status.toUpperCase();
        }
        
        // Format and display last update timestamp
        // toLocaleString() converts to readable format (e.g., "1/20/2026, 2:30:00 PM")
        document.getElementById('resDate').innerText = new Date(data.booking.updated_at).toLocaleString();

        /**
         * Color-code the status badge for visual clarity
         * Green = Completed (repair done)
         * Orange = Pending (waiting to start)
         * Blue = In-Progress/Confirmed/Ready (actively working)
         */
        if (data.booking.status === 'Completed') {
            statusSpan.style.background = 'green';
        } else if (data.booking.status === 'Pending') {
            statusSpan.style.background = 'orange';
        } else if (data.booking.status === 'Canceled') {
            statusSpan.style.background = '#dc3545'; // Red for cancelled
        } else {
            statusSpan.style.background = '#007bff'; // Blue for other statuses
        }

        // ========== STEP 4: Display Images (if available) ==========
        const receivedContainer = document.getElementById('received-images-container');
        const afterContainer = document.getElementById('after-images-container');
        
        // Handle Received Condition Images
        if (data.booking.received_condition_images && data.booking.received_condition_images.length > 0) {
            receivedContainer.style.display = 'block';
            displayUploadedImages(
                data.booking.received_condition_images, 
                'received-condition', 
                'received-images-display', 
                true // Read only
            );
        } else {
            receivedContainer.style.display = 'none';
        }

        // Handle After Service Images
        if (data.booking.after_service_images && data.booking.after_service_images.length > 0) {
            afterContainer.style.display = 'block';
            displayUploadedImages(
                data.booking.after_service_images, 
                'after-service', 
                'after-images-display', 
                true // Read only
            );
        } else {
            afterContainer.style.display = 'none';
        }

    } else {
        /**
         * Error occurred (booking not found or email doesn't match)
         * Show error message and hide results
         */
        alert('Error: ' + data.message);
        resultDiv.style.display = 'none';
    }
});

// ==================== PRINT BUTTON HANDLER ====================
document.getElementById('printBtn').addEventListener('click', () => {
    window.print();
});