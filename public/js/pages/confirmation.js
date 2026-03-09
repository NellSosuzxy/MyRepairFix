// ======================================
// CONFIRMATION.JS - Reference Code Display
// ======================================
// Purpose: Extracts and displays booking reference code from URL
// Usage: Loaded on confirmation.html after successful booking
// Flow: booking.js → redirects to confirmation.html?ref=XXX → this script displays it
// ======================================

/**
 * Extract reference code from URL query parameter
 * Example URL: confirmation.html?ref=REF1234567890
 * URLSearchParams parses the query string (?ref=XXX)
 */
const params = new URLSearchParams(window.location.search);
const ref = params.get('ref'); // Get the 'ref' parameter value

/**
 * Display the reference code or error message
 * Updates the #displayRef element in confirmation.html
 */
if (ref) {
    // Reference code found - display it to the customer
    document.getElementById('displayRef').innerText = ref;
    
    // Also populate for print invoice
    const printCodeElements = document.querySelectorAll('.print-ref-code');
    printCodeElements.forEach(el => el.textContent = ref);
    
    // Set date and year for print
    const now = new Date();
    // Assuming currentLang is available globally (from global.js)
    const locale = (typeof currentLang !== 'undefined' && currentLang === 'ms') ? 'ms-MY' : 'en-US';
    const dateStr = now.toLocaleDateString(locale);
    const yearStr = now.getFullYear();
    
    const printDate = document.getElementById('print-date');
    if (printDate) printDate.textContent = dateStr;
    
    const printYear = document.getElementById('print-year');
    if (printYear) printYear.textContent = yearStr;

} else {
    // No reference code in URL - something went wrong
    document.getElementById('displayRef').innerText = "Error: No Code Found";
}
   