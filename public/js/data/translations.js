// ===============================================
// TRANSLATIONS.JS - Multilingual Content
// ===============================================

const translations = {
    // --- ENGLISH TRANSLATIONS ---
    en: {
        // Navigation
        nav_home: "Home",
        nav_book: "Book Now",
        nav_status: "Check Status",
        
        // Hero Section
        hero_title: "FAST & RELIABLE GADGET REPAIR!",
        hero_sub: "Expert fixes for smartphones and laptops.",
        cta_btn: "BOOK APPOINTMENT NOW",
        
        // Sections
        section_services: "OUR SERVICES",
        section_about: "ABOUT US",
        section_gallery: "PROJECT GALLERY",
        section_news: "LATEST TECH NEWS",
        follow_us: "FOLLOW US",

        about_text: `MyRepairFix is a trusted local repair service specializing in smartphones, laptops, and computers. We help individuals, students, and small businesses restore their devices efficiently without unnecessary delays or hidden costs.<br><br>
        
        Our technicians handle everything from cracked screens and battery issues to hardware upgrades, system repairs, and in-depth diagnostics. Every repair is performed using proper tools, tested procedures, and quality parts to ensure long-term reliability not temporary fixes.<br><br>
        
        We understand that your device holds important data and daily productivity. That’s why we prioritize transparency, data privacy, and clear communication throughout the repair process. You’ll know what’s wrong, what needs to be fixed, and why.<br><br>
        
        At MyRepairFix, our goal is simple: accurate diagnosis, honest repair, and dependable results.`,
        
        // Services
        srv_phone_title: "Smartphone Repair",
        srv_phone_intro: "We provide professional repair for Apple, Samsung, Xiaomi, Oppo, Vivo, Huawei, and more.",
        srv_phone_note: "We use proper tools and quality parts to ensure safe repairs.",
        srv_pc_title: "Laptop & Computer Repair",
        srv_pc_intro: "Repair services suitable for students, office users, and small businesses.",
        srv_pc_note: "Every repair is handled carefully for long-term stability.",
        
        // Booking Page
        booking_title: "Book a Repair",
        form_name: "Full Name",
        form_email: "Email",
        form_phone: "Phone Number",
        form_device_type: "Device Type",
        device_smartphone: "Smartphone",
        device_laptop: "Laptop",
        form_device_model: "Device Model (e.g. iPhone 13, Dell XPS)",
        form_issue_category: "Issue Category",
        issue_screen: "Screen",
        issue_battery: "Battery",
        issue_water: "Water Damage",
        issue_keyboard: "Keyboard",
        issue_software: "OS/Software",
        issue_other: "Other",
        form_issue_desc: "Description of Problem",
        form_preferred_date: "Preferred Date & Time",
        form_submit: "Submit Booking",
        
        // Status Page
        status_title: "Check Repair Status",
        status_ref_label: "Reference Code",
        status_email_label: "Email (for verification)",
        status_check_btn: "Check Status",
        status_result_title: "Status Result:",
        status_device: "Device:",
        status_current: "Current Status:",
        status_updated: "Last Updated:",
        status_pending: "PENDING",
        status_confirmed: "CONFIRMED",
        status_in_progress: "IN PROGRESS",
        status_ready: "READY",
        status_completed: "COMPLETED",
        status_canceled: "CANCELED",
        status_ref_placeholder: "e.g. REF1234",
        status_email_placeholder: "Enter your email",
        
        // Confirmation Page
        confirm_title: "Booking Received!",
        confirm_ticket_title: "MyRepairFix Ticket",
        confirm_save_code: "Please save this code to check your status:",
        confirm_keep_safe: "Keep this ticket safe!",
        confirm_print: "Print Ticket",
        confirm_back_home: "Back to Home",
        confirm_check_status: "Check Status",
        
        // Admin Page
        admin_login_title: "Admin Login",
        admin_password_placeholder: "Enter Admin Password",
        admin_login_btn: "Login",
        admin_dashboard_title: "Admin Dashboard",
        admin_manage_repairs: "Manage incoming repairs here.",
        staff_dashboard_title: "Staff Dashboard",
        admin_table_id: "ID",
        admin_table_date: "Date",
        admin_table_customer: "Customer",
        admin_table_device: "Device",
        admin_table_issue: "Issue",
        admin_table_status: "Status",
        admin_table_action: "Action",
        admin_table_images: "Upload",
        admin_update_btn: "Update",
        
        // Owner Control Panel
        owner_panel_title: "Owner Control Panel",
        owner_add_staff_label: "Add new staff member:",
        owner_new_username_placeholder: "New Username",
        owner_new_password_placeholder: "New Password",
        owner_add_staff_btn: "Add Staff",
        owner_reset_pass_label: "Reset Staff Password:",
        owner_staff_username_placeholder: "Staff Username",
        owner_reset_btn: "Reset Pass",

        // Staff List
        staff_list_title: "Staff List",
        refresh_btn: "Refresh",
        staff_col_id: "ID",
        staff_col_username: "Username",
        staff_col_role: "Role",
        staff_col_created: "Created",
        staff_col_action: "Action",
        staff_delete_btn: "Delete",
        staff_no_found: "No staff found",
        staff_loading: "Loading...",
        staff_delete_confirm: "Are you sure you want to delete staff",

        // Image Upload & Gallery
        form_before_images: "Upload Before-Service Images",
        form_before_images_help: "Upload up to 5 photos of your device damage (max 5MB each)",
        modal_manage_images: "Manage Images",
        stage_before_service: "Before Service",
        stage_received_condition: "Received Condition",
        stage_after_service: "After Service",
        no_images_uploaded: "No images uploaded yet",
        btn_upload_images: "Upload Images",
        readonly_label: "Read Only",
        
        // Chatbot
        chatbot_title: "MyRepairFix Helper",
        chatbot_greeting: "Hello! How can I help you today?",
        chatbot_placeholder: "Ask about hours, price...",
        chatbot_send: "Send",
        chatbot_you: "You",
        chatbot_bot: "Bot",
        
        // Gallery Captions
        gallery_screen: "Screen Replacement",
        gallery_battery: "Battery Replacement",
        gallery_water: "Water Damage",
        gallery_keyboard: "Keyboard Fix",
        gallery_port: "Charging Port",
        gallery_os: "OS Installation",
        gallery_iphone: "iPhone 13 Pro",
        gallery_samsung: "Samsung Galaxy",
        gallery_macbook: "MacBook Pro",
        gallery_dell: "Dell XPS",
        gallery_pixel: "Google Pixel",
        gallery_windows: "Windows 11",
        
        // Print Ticket (English)
        print_service_ticket: "SERVICE TICKET",
        print_date: "Date:",
        print_ticket_no: "Ticket #:",
        print_booking_conf: "Booking Confirmation",
        print_conf_msg: "Thank you for choosing MyRepairFix. Your service request has been received.",
        print_ref_code: "Reference Code:",
        print_keep_ticket: "Please keep this ticket for your records. You will need the reference code above to check the status of your repair.",
        print_next_steps: "Next Steps",
        print_step_1: "Bring your device to our service center.",
        print_step_2: "Show this ticket or reference code to our staff.",
        print_step_3_pre: "Track your repair status online at",
        print_thanks: "Thank you for your business!",
        print_service_status: "SERVICE STATUS",
        print_service_details: "Service Details",
        print_device: "Device:",
        print_status: "Status:",
        print_last_updated: "Last Updated:",
        print_track_future: "To track future updates, please visit",
        print_track_future_end: "and use the reference code above."
    },
    
    // --- MALAY TRANSLATIONS (BAHASA MELAYU) ---
    ms: {
        // Navigation
        nav_home: "Utama",
        nav_book: "Tempah Sekarang",
        nav_status: "Semak Status",
        
        // Hero Section
        hero_title: "BAIKI GADGET PANTAS & DIPERCAYAI!",
        hero_sub: "Pakar membaiki telefon pintar dan komputer riba.",
        cta_btn: "TEMPAH TEMU JANJI SEKARANG",
        
        // Sections
        section_services: "PERKHIDMATAN KAMI",
        section_about: "TENTANG KAMI",
        section_gallery: "GALERI PROJEK",
        section_news: "BERITA TECH TERKINI",
        follow_us: "IKUTI KAMI",

        about_text: `MyRepairFix adalah perkhidmatan pembaikan tempatan yang dipercayai, pakar dalam telefon pintar, komputer riba, dan komputer. Kami membantu individu, pelajar, dan perniagaan kecil memulihkan peranti mereka dengan cekap tanpa penangguhan atau kos tersembunyi.<br><br>
        
        Juruteknik kami mengendalikan segalanya bermula daripada skrin retak dan masalah bateri hingga ke penambahbaikan perkakasan, pembaikan sistem, dan diagnosis mendalam. Setiap pembaikan dilakukan menggunakan alat yang betul, prosedur yang teruji, dan komponen berkualiti untuk memastikan ketahanan jangka panjang—bukan sekadar penyelesaian sementara.<br><br>
        
        Kami memahami bahawa peranti anda menyimpan data penting. Oleh itu, kami mengutamakan ketelusan, privasi data, dan komunikasi yang jelas sepanjang proses pembaikan. Anda akan tahu apa yang salah, apa yang perlu dibaiki, dan mengapa.<br><br>
        
        Di MyRepairFix, matlamat kami mudah: diagnosis yang tepat, pembaikan yang jujur, dan hasil yang boleh dipercayai.`,
        
        // Services
        srv_phone_title: "Pembaikan Telefon Pintar",
        srv_phone_intro: "Kami menyediakan servis untuk Apple, Samsung, Xiaomi, Oppo, Vivo, Huawei dan lain-lain.",
        srv_phone_note: "Menggunakan alat selamat dan komponen berkualiti.",
        srv_pc_title: "Pembaikan Laptop & Komputer",
        srv_pc_intro: "Servis untuk pelajar, pekerja pejabat dan perniagaan kecil.",
        srv_pc_note: "Setiap pembaikan dilakukan dengan teliti untuk kestabilan.",
        
        // Booking Page
        booking_title: "Tempah Pembaikan",
        form_name: "Nama Penuh",
        form_email: "Emel",
        form_phone: "Nombor Telefon",
        form_device_type: "Jenis Peranti",
        device_smartphone: "Telefon Pintar",
        device_laptop: "Komputer Riba",
        form_device_model: "Model Peranti (cth: iPhone 13, Dell XPS)",
        form_issue_category: "Kategori Masalah",
        issue_screen: "Skrin",
        issue_battery: "Bateri",
        issue_water: "Kerosakan Air",
        issue_keyboard: "Papan Kekunci",
        issue_software: "OS/Perisian",
        issue_other: "Lain-lain",
        form_issue_desc: "Keterangan Masalah",
        form_preferred_date: "Tarikh & Masa Pilihan",
        form_submit: "Hantar Tempahan",
        
        // Status Page
        status_title: "Semak Status Pembaikan",
        status_ref_label: "Kod Rujukan",
        status_email_label: "Emel (untuk pengesahan)",
        status_check_btn: "Semak Status",
        status_result_title: "Keputusan Status:",
        status_device: "Peranti:",
        status_current: "Status Semasa:",
        status_updated: "Kemaskini Terakhir:",
        status_pending: "MENUNGGU",
        status_confirmed: "DISAHKAN",
        status_in_progress: "SEDANG DIBAIKI",
        status_ready: "SEDIA",
        status_completed: "SIAP",
        status_canceled: "DIBATALKAN",
        status_ref_placeholder: "cth. REF1234",
        status_email_placeholder: "Masukkan emel anda",
        
        // Confirmation Page
        confirm_title: "Tempahan Diterima!",
        confirm_ticket_title: "Tiket MyRepairFix",
        confirm_save_code: "Sila simpan kod ini untuk semak status anda:",
        confirm_keep_safe: "Simpan tiket ini dengan selamat!",
        confirm_print: "Cetak Tiket",
        confirm_back_home: "Kembali ke Utama",
        confirm_check_status: "Semak Status",
        
        // Admin Page
        admin_login_title: "Log Masuk Admin",
        admin_password_placeholder: "Masukkan Kata Laluan Admin",
        admin_login_btn: "Log Masuk",
        admin_dashboard_title: "Papan Pemuka Admin",
        admin_manage_repairs: "Urus pembaikan yang masuk di sini.",
        staff_dashboard_title: "Papan Pemuka Kakitangan",
        admin_table_id: "ID",
        admin_table_date: "Tarikh",
        admin_table_customer: "Pelanggan",
        admin_table_device: "Peranti",
        admin_table_issue: "Masalah",
        admin_table_status: "Status",
        admin_table_action: "Tindakan",
        admin_table_images: "Muat Naik",
        admin_update_btn: "Kemaskini",
        
        // Owner Control Panel
        owner_panel_title: "Panel Kawalan Pemilik",
        owner_add_staff_label: "Tambah staf baharu:",
        owner_new_username_placeholder: "Nama Pengguna Baharu",
        owner_new_password_placeholder: "Kata Laluan Baharu",
        owner_add_staff_btn: "Tambah Staf",
        owner_reset_pass_label: "Tetapkan Semula Kata Laluan Staf:",
        owner_staff_username_placeholder: "Nama Pengguna Staf",
        owner_reset_btn: "Tetapkan Semula",

        // Staff List
        staff_list_title: "Senarai Staf",
        refresh_btn: "Muat Semula",
        staff_col_id: "ID",
        staff_col_username: "Nama Pengguna",
        staff_col_role: "Peranan",
        staff_col_created: "Dicipta",
        staff_col_action: "Tindakan",
        staff_delete_btn: "Padam",
        staff_no_found: "Tiada staf dijumpai",
        staff_loading: "Memuatkan...",
        staff_delete_confirm: "Adakah anda pasti mahu memadam staf",

        // Image Upload & Gallery
        form_before_images: "Muat Naik Gambar Sebelum Servis",
        form_before_images_help: "Muat naik sehingga 5 gambar kerosakan peranti (maksimum 5MB setiap satu)",
        modal_manage_images: "Urus Gambar",
        stage_before_service: "Sebelum Servis",
        stage_received_condition: "Keadaan Diterima",
        stage_after_service: "Selepas Servis",
        no_images_uploaded: "Tiada gambar dimuat naik lagi",
        btn_upload_images: "Muat Naik Gambar",
        readonly_label: "Baca Sahaja",
        
        // Chatbot
        chatbot_title: "Pembantu MyRepairFix",
        chatbot_greeting: "Hello! Apa yang boleh saya bantu hari ini?",
        chatbot_placeholder: "Tanya tentang waktu, harga...",
        chatbot_send: "Hantar",
        chatbot_you: "Anda",
        chatbot_bot: "Bot",
        
        // Print Ticket (Malay)
        print_service_ticket: "TIKET SERVIS",
        print_date: "Tarikh:",
        print_ticket_no: "No. Tiket:",
        print_booking_conf: "Pengesahan Tempahan",
        print_conf_msg: "Terima kasih kerana memilih MyRepairFix. Permintaan servis anda telah diterima.",
        print_ref_code: "Kod Rujukan:",
        print_keep_ticket: "Sila simpan tiket ini untuk rekod anda. Anda memerlukan kod rujukan di atas untuk menyemak status pembaikan anda.",
        print_next_steps: "Langkah Seterusnya",
        print_step_1: "Bawa peranti anda ke pusat servis kami.",
        print_step_2: "Tunjukkan tiket atau kod rujukan ini kepada kakitangan kami.",
        print_step_3_pre: "Semak status pembaikan anda dalam talian di",
        print_thanks: "Terima kasih atas sokongan anda!",
        print_service_status: "STATUS SERVIS",
        print_service_details: "Butiran Servis",
        print_device: "Peranti:",
        print_status: "Status:",
        print_last_updated: "Kemaskini Terakhir:",
        print_track_future: "Untuk semak status terkini, sila layari",
        print_track_future_end: "dan gunakan kod rujukan di atas.",
        
        // Gallery Captions
        gallery_screen: "Penggantian Skrin",
        gallery_battery: "Penggantian Bateri",
        gallery_water: "Kerosakan Air",
        gallery_keyboard: "Pembaikan Papan Kekunci",
        gallery_port: "Port Pengecasan",
        gallery_os: "Pemasangan OS",
        gallery_iphone: "iPhone 13 Pro",
        gallery_samsung: "Samsung Galaxy",
        gallery_macbook: "MacBook Pro",
        gallery_dell: "Dell XPS",
        gallery_pixel: "Google Pixel",
        gallery_windows: "Windows 11"
    }
};
