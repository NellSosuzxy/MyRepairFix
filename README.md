# MyRepairFix

**Diploma In Information Technology - Final Project - Kolej Poly-Tech MARA (KPTM)**

## Introduction
MyRepairFix was developed as a Final Diploma Project for a student at Kolej Poly-Tech MARA. This system is a booking and maintenance management application that makes it easy for customers to book device repair slots, check their repair status, and allows admins and staff to manage workflow operations more systematically.

## Key Features
- **Customer Booking System:** Customers can easily book repair slots.
- **Status Tracking:** Customers can track the repair status of their devices from reception to completion.
- **Admin & Staff Dashboard:** Security control, repair management, work logs, and overall system access.
- **Image Upload Management:** Uploading pictures of the physical condition of the devices (received condition, before service, after service).
- **Managed Security:** Equipped with an authentication system, rate limiter, and data security measures.

## Technologies Used
- **Backend:** Node.js, Express.js
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Configuration & Database:** (Defined in `config/db.js`)
- **Other Modules:** Image processing middleware, error handler, JWT (auth management).

## Installation & Setup

1. Ensure [Node.js](https://nodejs.org/) is installed on your computer.
2. Open a terminal (command prompt/powershell) in the project directory.
   ```bash
   cd MyRepairFix
   ```
3. Install all required dependencies:
   ```bash
   npm install
   ```
4. Set up the database and `.env` file if necessary (for port and secret keys according to `config/app.config.js` requirements).
5. Run the web application:
   ```bash
   node server.js
   ```
6. Open a web browser and visit `http://localhost:<PORT>` (usually displayed in the terminal after the server starts).

## Copyright & Disclaimer
This system was produced specifically to fulfill the academic requirements for the Diploma Final Project at Kolej Poly-Tech MARA (KPTM). All rights reserved to the developer (student).
