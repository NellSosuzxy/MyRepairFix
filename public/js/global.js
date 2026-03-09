// ===============================================
// GLOBAL.JS - Shared Functionality Across All Pages
// ===============================================
// This file contains features used on multiple pages:
// 1. Dark Mode / Light Mode Toggle
// 2. Language Toggle (English ↔ Malay)
// 3. Chatbot Functionality
// 4. Animated Preloader/Logo
// 5. Service List Language Updater
// 6. Mobile Hamburger Menu
// 7. Service Worker Registration (PWA)
// 8. Loading State Utilities
// ===============================================

// ===============================================
// 0. SERVICE WORKER REGISTRATION (PWA)
// ===============================================

/**
 * Register Service Worker for offline support
 * This makes the app installable as a PWA
 */
/* 
// DISABLED FOR DEVELOPMENT - PREVENTS CACHING ISSUES
// We also explicitly UNREGISTER any existing service workers to ensure
// users don't get stuck with an old cached version.
*/
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for(let registration of registrations) {
            console.log('Unregistering Service Worker to clear cache:', registration);
            registration.unregister();
        }
    }); 
}
/*
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('✅ Service Worker registered:', registration.scope);
                
                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New version available
                            showUpdateNotification();
                        }
                    });
                });
            })
            .catch((error) => {
                console.log('❌ Service Worker registration failed:', error);
            });
    });
}
*/

/**
 * Show notification when a new version is available
 */
function showUpdateNotification() {
    if (typeof showToast === 'function') {
        showToast('New version available! Refresh to update.', 'info', 10000);
    }
}

// ===============================================
// LOADING STATE UTILITIES
// ===============================================

/**
 * Set loading state on a button
 * @param {HTMLElement} button - The button element
 * @param {boolean} isLoading - Whether to show loading state
 * @param {string} loadingText - Text to show while loading
 */
function setButtonLoading(button, isLoading, loadingText = 'Loading...') {
    if (!button) return;
    
    if (isLoading) {
        button.dataset.originalText = button.textContent;
        button.textContent = loadingText;
        button.disabled = true;
        button.classList.add('loading');
    } else {
        button.textContent = button.dataset.originalText || button.textContent;
        button.disabled = false;
        button.classList.remove('loading');
    }
}

/**
 * Show/hide a loading spinner overlay
 * @param {boolean} show - Whether to show the overlay
 * @param {string} message - Optional message to display
 */
function showLoadingOverlay(show, message = 'Please wait...') {
    let overlay = document.getElementById('loading-overlay');
    
    if (show) {
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'loading-overlay';
            overlay.innerHTML = `
                <div class="loading-spinner"></div>
                <p class="loading-message">${message}</p>
            `;
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            `;
            document.body.appendChild(overlay);
        }
        overlay.style.display = 'flex';
        overlay.querySelector('.loading-message').textContent = message;
    } else if (overlay) {
        overlay.style.display = 'none';
    }
}

/**
 * Fetch with loading state
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @param {HTMLElement} button - Optional button to show loading state on
 * @returns {Promise} - The fetch response
 */
async function fetchWithLoading(url, options = {}, button = null) {
    if (button) {
        setButtonLoading(button, true, 'Submitting...');
    }
    
    try {
        const response = await fetch(url, options);
        return response;
    } finally {
        if (button) {
            setButtonLoading(button, false);
        }
    }
}

// ===============================================
// 1. MOBILE HAMBURGER MENU
// ===============================================

/**
 * Initialize mobile hamburger menu
 * Shows/hides navigation on mobile devices
 * Runs when DOM is fully loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const menuOverlay = document.getElementById('menuOverlay');
    
    // Only run if hamburger exists (not on all pages)
    if (!hamburger || !navMenu) return;
    
    /**
     * Toggle mobile menu open/closed
     * Triggered by clicking hamburger button
     */
    function toggleMenu() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        if (menuOverlay) {
            menuOverlay.classList.toggle('active');
        }
        
        // Prevent body scrolling when menu is open
        if (navMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }
    
    /**
     * Close mobile menu
     * Used when clicking overlay or navigation link
     */
    function closeMenu() {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        if (menuOverlay) {
            menuOverlay.classList.remove('active');
        }
        document.body.style.overflow = '';
    }
    
    // Event Listeners
    hamburger.addEventListener('click', toggleMenu);
    
    // Close menu when clicking overlay
    if (menuOverlay) {
        menuOverlay.addEventListener('click', closeMenu);
    }
    
    // Close menu when clicking any navigation link (but NOT toggle buttons)
    const navLinks = navMenu.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });
    
    // Close menu on window resize (if switching to desktop view)
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeMenu();
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // Toggle buttons (Theme & Language) - Attach listeners to ALL instances (Desktop/Mobile)
    document.querySelectorAll('.theme-toggle').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleTheme();
        });
    });

    document.querySelectorAll('.lang-toggle').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleLang();
        });
    });

    // Chatbot send buttons (class: chatbot-send-btn)
    document.querySelectorAll('.chatbot-send-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (typeof sendChat === 'function') sendChat();
        });
    });

    // Print button (confirmation page)
    const printBtn = document.getElementById('printBtn');
    if (printBtn) {
        printBtn.addEventListener('click', () => window.print());
    }
});

// ===============================================
// HELPER: Check if current page is Admin
// ===============================================
function isAdminPage() {
    return window.location.pathname.toLowerCase().includes('admin');
}

// ===============================================
// 2. DARK MODE / LIGHT MODE SYSTEM
// ===============================================

/**
 * Get the user's preferred theme
 * Priority: User's manual choice > System preference > Default (light)
 * @returns {string} 'dark' or 'light'
 */
function getPreferredTheme() {
    // Check if user manually selected a theme before (stored in localStorage)
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        console.log('✅ Using saved theme:', savedTheme);
        return savedTheme;
    }
    
    // If no manual choice, detect system preference (Windows/Mac dark mode setting)
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const detectedTheme = systemDark ? 'dark' : 'light';
    console.log('🔍 System prefers:', detectedTheme);
    return detectedTheme;
}

/**
 * Apply theme immediately on page load (before body renders)
 * This prevents "flash of unstyled content" (FOUC)
 */
(function applyThemeOnLoad() {
    const theme = getPreferredTheme();
    console.log('🎨 Applying theme:', theme);
    
    // Apply to <html> element (recommended for CSS variables)
    document.documentElement.setAttribute('data-theme', theme);
    
    // Also apply to <body> if it exists
    if (document.body) {
        document.body.setAttribute('data-theme', theme);
    }
})();

/**
 * Toggle between dark and light mode (called by 🌓 button)
 * Saves user's manual choice to localStorage
 * Adds spinning animation to moon emoji on click
 * 
 * EDUCATIONAL NOTE:
 * This function works by toggling a 'data-theme' attribute on the <html> tag.
 * CSS variables (e.g., --bg-color, --text-color) change based on this attribute.
 * We use localStorage to 'remember' the user's choice even after they refresh the page.
 */
function toggleTheme() {
    console.log('🔄 toggleTheme() called');
    
    // Get current theme from the HTML tag
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    console.log('📍 Current theme:', currentTheme);
    
    // Switch to opposite theme
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Apply new theme to HTML and BODY
    document.documentElement.setAttribute('data-theme', newTheme);
    if (document.body) {
        document.body.setAttribute('data-theme', newTheme);
    }
    
    // Save choice to localStorage (persists across page refreshes)
    localStorage.setItem('theme', newTheme);
    console.log('🔄 Theme switched to:', newTheme);
    

}

/**
 * Listen for system theme changes (e.g., user switches Windows to dark mode)
 * Only auto-updates if user hasn't manually chosen a theme
 */
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    // Only auto-update if user hasn't manually overridden
    if (!localStorage.getItem('theme')) {
        const newTheme = e.matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        if (document.body) {
            document.body.setAttribute('data-theme', newTheme);
        }
        console.log('🔄 System theme changed to:', newTheme);
    }
});
// ===============================================
// 2. LANGUAGE TOGGLE SYSTEM (English ↔ Malay)
// ===============================================

// Current language (stored in localStorage for persistence)
let currentLang = localStorage.getItem('lang') || 'en';

/**
 * Toggle between English and Malay (called by 🇲🇾/🇬🇧 button)
 * 
 * EDUCATIONAL NOTE:
 * This function switches the 'currentLang' variable and saves it.
 * Then it calls `applyLanguage()` which finds all elements with `data-i18n` attributes
 * and replaces their text with the translation from `translations.js`.
 */
function toggleLang() {
    console.log('🔄 toggleLang() called');
    console.log('📍 Current lang:', currentLang);
    
    // Switch language variable
    currentLang = currentLang === 'en' ? 'ms' : 'en';
    
    // Save to localStorage for persistence
    localStorage.setItem('lang', currentLang);
    
    // Update the UI text
    applyLanguage();
    
    console.log('🌐 Language switched to:', currentLang === 'en' ? 'English' : 'Malay');
    
    // Add bounce animation to language toggle button for feedback
    const langButtons = document.querySelectorAll('nav .btn-icon:not(.theme-toggle)');
    langButtons.forEach(btn => {
        btn.classList.add('clicked');
        // Remove clicked class after animation completes (0.2s)
        setTimeout(() => {
            btn.classList.remove('clicked');
        }, 200);
    });
}

/**
 * Apply current language to all page elements
 * Uses data-i18n attributes to identify translatable elements
 */
function applyLanguage() {
    // Update all elements with data-i18n attributes
    // Example: <h3 data-i18n="section_services">OUR SERVICES</h3>
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[currentLang][key]) {
            element.innerHTML = translations[currentLang][key];
        }
    });
    
    // Update all placeholder attributes with data-i18n-placeholder
    // Example: <input data-i18n-placeholder="chatbot_placeholder" placeholder="...">
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (translations[currentLang][key]) {
            element.placeholder = translations[currentLang][key];
        }
    });

    // Special handling for Hero Section (dynamic content)
    const heroTitle = document.querySelector('.hero h2');
    const heroSub = document.querySelector('.hero p');
    const ctaButton = document.querySelector('.cta-button');
    
    if (heroTitle) heroTitle.innerText = translations[currentLang].hero_title;
    if (heroSub) heroSub.innerText = translations[currentLang].hero_sub;
    if (ctaButton) ctaButton.innerText = translations[currentLang].cta_btn;

    // Update news widget title
    const newsWidget = document.querySelector('#news-widget h3');
    if (newsWidget) newsWidget.innerText = translations[currentLang].section_news;
    
    // Update service lists (detailed repair items)
    updateServiceLists(currentLang);
}

// Apply language on page load
applyLanguage();

// ===============================================
// 3. CHATBOT FUNCTIONALITY
// ===============================================

// Wait for DOM to be fully loaded before initializing chatbot
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔧 Chatbot: DOM loaded, initializing chatbot...');
    
    // Get chatbot DOM elements (with safety checks)
    const toggleBtn = document.getElementById('chatbot-toggle');
    const chatWindow = document.getElementById('chatbot-window');
    const chatMessages = document.getElementById('chatbot-messages');
    const chatInput = document.getElementById('chat-input');

    console.log('🔧 Chatbot elements found:', {
        toggleBtn: !!toggleBtn,
        chatWindow: !!chatWindow,
        chatMessages: !!chatMessages,
        chatInput: !!chatInput
    });

    // Only initialize chatbot if elements exist on the page
    if (toggleBtn && chatWindow && chatMessages) {
        console.log('✅ Chatbot: All elements found, setting up functionality...');
        /**
         * Toggle chatbot window visibility (called by 💬 button)
         */
        function toggleChatWindow() {
            console.log('🔧 Chatbot: Toggle button clicked');
            // Check if chatbot is currently hidden using computed style
            // This is safer than style.display which only checks inline styles
            const currentDisplay = window.getComputedStyle(chatWindow).display;
            const isHidden = currentDisplay === 'none';
            
            console.log('🔧 Chatbot: Current display:', currentDisplay, 'isHidden:', isHidden);
            
            // Toggle visibility (flex for proper layout when visible)
            chatWindow.style.display = isHidden ? 'flex' : 'none';
            
            console.log('🔧 Chatbot: New display set to:', isHidden ? 'flex' : 'none');
            
            // Focus on input when opening chat window on mobile
            if (isHidden && chatInput) {
                setTimeout(() => {
                    chatInput.focus();
                    console.log('🔧 Chatbot: Input focused');
                }, 100);
            }
        }
        
        // Add both click and touch events for better mobile support
        toggleBtn.addEventListener('click', function(e) {
            console.log('🔧 Chatbot: Toggle clicked (click event)');
            toggleChatWindow();
        });
        
        toggleBtn.addEventListener('touchend', function(e) {
            console.log('🔧 Chatbot: Toggle touched (touchend event)');
            e.preventDefault(); // Prevent double-firing on mobile
            toggleChatWindow();
        });
        
        console.log('✅ Chatbot: Toggle button events added');

        // Initialize close button if it exists (using ID 'chatbot-close-btn')
        const closeBtn = document.getElementById('chatbot-close-btn');
        if (closeBtn) {
            function closeChatWindow() {
                console.log('🔧 Chatbot: Close button activated');
                chatWindow.style.display = 'none';
            }
            closeBtn.addEventListener('click', closeChatWindow);
            closeBtn.addEventListener('touchend', function(e) {
                e.preventDefault();
                closeChatWindow();
            });
            console.log('✅ Chatbot: Close button events added');
        }
        
        // Add Enter key support for chat input
        if (chatInput) {
            chatInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter' || e.keyCode === 13) {
                    e.preventDefault();
                    sendChat();
                }
            });
            
            // Also handle mobile keyboards that might use 'keydown'
            chatInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.keyCode === 13) {
                    e.preventDefault();
                    sendChat();
                }
            });
        }
        
        // Add send button event listeners with both click and touch support
        const sendButton = document.querySelector('.chatbot-input-area button');
        console.log('🔧 Chatbot: Send button found:', !!sendButton);
        if (sendButton) {
            sendButton.addEventListener('click', function(e) {
                console.log('🔧 Chatbot: Send button clicked');
                sendChat();
            });
            sendButton.addEventListener('touchend', function(e) {
                console.log('🔧 Chatbot: Send button touched (touchend)');
                e.preventDefault();
                sendChat();
            });
            console.log('✅ Chatbot: Send button event listeners added');
        }
        
        /**
         * Send chat message and get bot response
         * Called when user clicks "Send" button or presses Enter
         */
        function sendChat() {
            console.log('🔧 Chatbot: sendChat() called');
            const inputField = document.getElementById('chat-input');
            if (!inputField) {
                console.error('❌ Chatbot: Input field not found');
                return;
            }
            
            const userText = inputField.value.toLowerCase();
            console.log('🔧 Chatbot: User text:', userText);
            
            // Don't send empty messages
            if (!userText.trim()) {
                console.log('🔧 Chatbot: Empty message, not sending');
                return;
            }

            // Display user's message
            appendMessage("You", inputField.value);
            inputField.value = ''; // Clear input

            // Simple keyword-based bot responses
            let botResponse = "I'm sorry, try asking about 'hours', 'price', or 'how to book'.";
            
            if (userText.includes("hour") || userText.includes("masa")) {
                botResponse = "We are open Mon-Fri 9 AM - 6 PM.";
            } else if (userText.includes("price") || userText.includes("harga")) {
                botResponse = "Prices depend on the issue. Screen repairs start from RM150.";
            } else if (userText.includes("book") || userText.includes("tempah")) {
                botResponse = "Click the 'Book Appointment Now' button above!";
            }
            
            console.log('🔧 Chatbot: Bot response:', botResponse);
            
            // Delay bot response for natural feel
            setTimeout(() => { 
                appendMessage("Bot", botResponse); 
            }, 500);
        }

        /**
         * Add message to chatbot window
         * @param {string} sender - "You" or "Bot"
         * @param {string} text - Message content
         */
        function appendMessage(sender, text) {
            const msg = document.createElement('p');
            msg.innerHTML = `<strong>${sender}:</strong> ${text}`;
            chatMessages.appendChild(msg);
            
            // Auto-scroll to bottom to show latest message
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
        
        // Make functions globally available for backwards compatibility
        window.sendChat = sendChat;
        window.appendMessage = appendMessage;
        
        // Add debug functions for manual testing
        window.testChatbot = function() {
            console.log('🧪 Testing chatbot functionality...');
            console.log('Elements:', {
                toggleBtn: document.getElementById('chatbot-toggle'),
                chatWindow: document.getElementById('chatbot-window'),
                chatMessages: document.getElementById('chatbot-messages'),
                chatInput: document.getElementById('chat-input'),
                sendButton: document.querySelector('.chatbot-input-area button')
            });
        };
        
        window.openChat = function() {
            console.log('🧪 Manually opening chat...');
            chatWindow.style.display = 'flex';
        };
        
        window.testSendMessage = function(message = 'test message') {
            console.log('🧪 Manually sending test message:', message);
            const input = document.getElementById('chat-input');
            if (input) {
                input.value = message;
                sendChat();
            }
        };
        
        console.log('✅ Chatbot: Initialization complete! Use testChatbot(), openChat(), testSendMessage() to debug.');
    } else {
        // Chatbot elements not found - this is normal for pages without chatbot (e.g., admin page)
        console.log('ℹ️ Chatbot: Elements not present on this page (chatbot disabled)');
    }
});



// ===============================================
// 4. ANIMATED PRELOADER / LOGO ANIMATION
// ===============================================

/**
 * Logo animation sequence on first page load:
 * 1. Logo drops from top to center
 * 2. Logo spins for 2 seconds
 * 3. Logo flies to header position
 * 4. Background fades out
 * 
 * Only plays ONCE per session (stored in sessionStorage)
 */
window.addEventListener('load', () => {
    const loaderBg = document.getElementById('preloader');
    
    // Exit if preloader doesn't exist (not on index page)
    if (!loaderBg) return; 
    
    const bigLogo = document.querySelector('.logo-animate');
    const targetLogo = document.getElementById('header-logo');

    // Check if user has already seen animation this session
    if (!sessionStorage.getItem('introShown')) {
        
        // === FIRST VISIT: Play Full Animation ===
        
        // Mark as shown (persists until browser tab is closed)
        sessionStorage.setItem('introShown', 'true');

        // Step 1: Logo drops from top to center (1 second)
        bigLogo.classList.add('drop-in');

        // Step 2: After drop, start spinning
        setTimeout(() => {
            bigLogo.classList.remove('drop-in');
            bigLogo.classList.add('spinning');

            // Step 3: Spin for 2 seconds, then fly to header
            setTimeout(() => {
                stopSpinAndFly();
            }, 2000); 

        }, 1000); 

    } else {
        
        // === RETURNING VISIT: Skip Animation ===
        
        // Hide preloader immediately
        loaderBg.style.display = 'none';
        
        // Show header logo immediately
        if(targetLogo) targetLogo.style.opacity = '1';
    }

    /**
     * Final animation step: Fly logo to header position
     * Calculates target position and animates logo movement
     */
    function stopSpinAndFly() {
        // Get header logo's exact position on screen
        const rect = targetLogo.getBoundingClientRect();
        
        // Set CSS custom properties for animation targets
        bigLogo.style.setProperty('--target-top', rect.top + 'px');
        bigLogo.style.setProperty('--target-left', rect.left + 'px');
        bigLogo.style.setProperty('--target-width', rect.width + 'px');

        // Start fly animation
        bigLogo.classList.remove('spinning');
        bigLogo.classList.add('fly-to-header');
        
        // Fade out background
        loaderBg.classList.add('fade-bg');

        // After 1 second (animation complete):
        setTimeout(() => {
            // Show real header logo
            targetLogo.style.opacity = '1';
            
            // Hide animated logo instantly
            bigLogo.style.transition = 'none';
            bigLogo.style.opacity = '0';
            
            // Remove preloader from DOM after short delay
            setTimeout(() => {
                loaderBg.style.display = 'none';
            }, 100);
        }, 1000); 
    }
});

// ===============================================
// 5. SERVICE LISTS LANGUAGE UPDATER
// ===============================================

/**
 * Update detailed service lists (HTML content) based on language
 * Called automatically when language changes
 * @param {string} lang - 'en' or 'ms' (Malay)
 */
function updateServiceLists(lang) {
    const phoneList = document.getElementById('srv_phone_list');
    const pcList = document.getElementById('srv_pc_list');
    
    // Exit if elements don't exist (not on index page)
    if (!phoneList || !pcList) return;

    if (lang === 'ms') {
        // === MALAY VERSION ===
        phoneList.innerHTML = `
            <li>Penggantian skrin (retak, pecah, sentuhan tidak responsif)</li>
            <li>Penukaran bateri (cepat habis, kembung, mati sendiri)</li>
            <li>Pembaikan port pengecasan & masalah cas</li>
            <li>Pembaikan kerosakan akibat air / kelembapan</li>
            <li>Masalah kamera, speaker, mikrofon & butang</li>
            <li>Perisian bermasalah (bootloop, stuck logo)</li>
            <li>Pemeriksaan dan diagnosis menyeluruh</li>
        `;
        pcList.innerHTML = `
            <li>Pemasangan & format sistem operasi (Windows / Linux)</li>
            <li>Upgrade perkakasan (SSD, RAM) untuk prestasi</li>
            <li>Pembersihan dalaman laptop (masalah panas)</li>
            <li>Pembaikan papan kekunci, touchpad & skrin</li>
            <li>Masalah laptop lambat, hang, atau tak hidup</li>
            <li>Pembuangan virus & malware</li>
            <li>Pemeriksaan motherboard & komponen dalaman</li>
        `;
    } else {
        // === ENGLISH VERSION ===
        phoneList.innerHTML = `
            <li>Screen replacement (cracked, broken, unresponsive touch)</li>
            <li>Battery replacement (fast drain, swollen, random shutdown)</li>
            <li>Charging port repair & charging issues</li>
            <li>Water damage inspection and repair</li>
            <li>Camera, speaker, microphone & button issues</li>
            <li>Software troubleshooting (bootloop, stuck logo)</li>
            <li>Full device inspection and diagnosis</li>
        `;
        pcList.innerHTML = `
            <li>Operating system installation (Windows / Linux)</li>
            <li>Hardware upgrades (SSD & RAM) to improve performance</li>
            <li>Internal cleaning to solve overheating problems</li>
            <li>Keyboard, touchpad & screen replacement</li>
            <li>Slow performance, freezing, or power issues</li>
            <li>Virus & malware removal</li>
            <li>Motherboard and internal hardware diagnostics</li>
        `;
    }
}

// Initialize service lists on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const lang = localStorage.getItem('lang') || 'en';
        updateServiceLists(lang);
    });
} else {
    // DOM already loaded
    const lang = localStorage.getItem('lang') || 'en';
    updateServiceLists(lang);
}

// ===============================================
// EXPOSE FUNCTIONS TO GLOBAL SCOPE
// ===============================================
// Ensure functions are available for backwards compatibility
window.toggleTheme = toggleTheme;
window.toggleLang = toggleLang;
window.applyLanguage = applyLanguage;
console.log('✅ Global functions exposed: toggleTheme, toggleLang, applyLanguage');

// END OF FILE