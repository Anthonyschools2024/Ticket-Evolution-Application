# Ticket Evolution - Event Ticketing Platform (v1.2)

**Developed by Anthony Kimble**

## I. Overview

Ticket Evolution is a full-stack web application designed to provide a streamlined platform for discovering events, purchasing tickets securely, and allowing organizers to submit their events for listing. This project demonstrates core concepts in modern web development, including backend API creation, database interaction, dynamic frontend rendering, payment gateway integration structure, and essential security practices.

The platform aims to offer an intuitive experience for both event attendees searching for their next experience and hosts looking to manage their event visibility and ticketing.

**Current Core Features:**

* Dynamic display of upcoming events on the homepage.
* Detailed view for individual events.
* Event search functionality (by name, description, location, etc.).
* Event application form for hosts (currently accepts public image URLs).
* Integration structure for secure payments using Stripe Checkout (session creation and redirect).
* Backend API for managing event data.
* Responsive design implemented with Tailwind CSS.
* Basic security headers configured via Helmet, including Content Security Policy.

## II. Technology Stack

This project leverages a robust and efficient technology stack:

* **Backend:** Node.js, Express.js
* **Database:** SQLite3 (File-based, easy setup for development)
* **Frontend:** HTML, Vanilla JavaScript (for DOM manipulation and API calls)
* **Styling:** Tailwind CSS (Utility-first framework with PostCSS build process for optimization)
* **Payments:** Stripe API (Node.js library for backend, Stripe.js for frontend Checkout redirect)
* **Security:** Helmet (Middleware for setting various security headers like CSP)
* **Environment:** dotenv (for managing environment variables like API keys)

## III. Project Structure




ticket-evolution/ ├── database/ │ └── events.db # SQLite database file (created on first run if deleted) ├── node_modules/ # Node.js dependencies (created by npm install) ├── public/ # Static assets served to the client │ ├── css/ │ │ └── output.css # Generated Tailwind CSS (DO NOT EDIT MANUALLY) │ ├── uploads/ # Directory for image uploads (if feature re-enabled) │ │ └── images/ │ ├── purchase-success.html # Static success page after payment redirect │ └── script.js # Client-side JavaScript logic ├── src/ │ └── input.css # Source CSS file for Tailwind directives & custom CSS ├── views/ # HTML page templates served by Express │ ├── index.html # Homepage │ ├── apply.html # Event Application Form page │ ├── event.html # Event Details page │ └── search-results.html # Search Results page ├── .env # Local environment variables (MUST BE CREATED MANUALLY) ├── .gitignore # Specifies intentionally untracked files ├── package-lock.json # Records dependency tree versions ├── package.json # Project manifest, dependencies, scripts ├── server.js # Main Express application server logic ├── tailwind.config.js # Tailwind configuration file ├── postcss.config.js # PostCSS configuration file └── README.md # This documentation file































## IV. Setup and Installation Follow these steps to set up and run the project locally: 1. **Prerequisites:** * Node.js (includes npm) installed (v18.x recommended). * A Stripe Account to obtain API keys. * (Optional but Recommended for Testing Payments) Stripe CLI installed ([https://stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)). 2. **Clone or Download:** Get the project files onto your local machine. 3. **Navigate to Project Directory:** Open your terminal or command prompt and `cd` into the project's root directory (`ticket-evolution/`). 4. **Create `.env` File:** Create a new file named exactly `.env` in the project root. Copy the following structure and **replace the placeholders with your actual Stripe keys**: ```dotenv # Stripe API Keys - Get from your Stripe Dashboard (Developers -> API Keys) STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_SECRET_KEY_HERE STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_PUBLISHABLE_KEY_HERE # Stripe Webhook Signing Secret - Get from 'stripe listen' command (see Running section) STRIPE_WEBHOOK_SECRET=whsec_YOUR_ACTUAL_WEBHOOK_SIGNING_SECRET_HERE # Domain for redirects (use 3001 for local dev with current settings) YOUR_DOMAIN=http://localhost:3001 ``` **IMPORTANT:** Add `.env` to your `.gitignore` file (it's already included in the provided `.gitignore`). **Never commit your secret keys!** 5. **Install Dependencies:** Run the following command to install all necessary packages listed in `package.json`: ```bash npm install ``` *(If you encounter issues, try removing `node_modules` and `package-lock.json` first: `rm -rf node_modules package-lock.json && npm install`)* 6. **Database Setup:** The SQLite database file (`database/events.db`) and the `events` table will be created automatically the first time you successfully start the server if they don't exist. Ensure the `database` directory exists or the script has permission to create it (it should by default). 7. **Build CSS:** The application uses Tailwind CSS via a build step. You need to generate the `public/css/output.css` file. * **For Development (Recommended):** Open a **separate, dedicated terminal window**, navigate to the project root, and run: ```bash npm run watch:css ``` Leave this terminal running. It will build the CSS initially and automatically rebuild it whenever you modify HTML classes or `src/input.css`. * **For Single Build:** Alternatively, run `npm run build:css` once. You'll need to re-run it manually after making style-related changes. ## V. Running the Application 1. **Start the Server:** Open your main terminal window (ensure dependencies are installed and CSS build is running) in the project root and run: ```bash npm start ``` The server should start successfully. Look for the following output in the terminal: ``` --> Database connection successful. --> 'events' table checked/created successfully. --> SERVER LISTENING on port 3001 Access application at: http://localhost:3001 ``` *(Note: The application now defaults to **port 3001** to avoid common conflicts with port 3000).* 2. **Access in Browser:** Open your web browser and navigate to: **`http://localhost:3001`** 3. **Testing Stripe Payments (Local):** Stripe Checkout redirects to Stripe's site, but to receive confirmation events back to your local server (for fulfillment logic later), you need to use the Stripe CLI: * Install Stripe CLI and log in (`stripe login`). * Open a **third terminal window** in your project root and run: ```bash stripe listen --forward-to localhost:3001/stripe-webhook ``` * This command will output a **Webhook Signing Secret** (starts with `whsec_...`). Copy this secret. * Paste the secret as the value for `STRIPE_WEBHOOK_SECRET` in your `.env` file. * **Restart your Node.js server (`npm start`)** after updating the `.env` file. Now, when payments are completed in Stripe's test environment, events should be forwarded to your local `/stripe-webhook` 
## IV. Setup and Installation Follow these steps to set up and run the project locally: 1. **Prerequisites:** * Node.js (includes npm) installed (v18.x recommended). * A Stripe Account to obtain API keys. * (Optional but Recommended for Testing Payments) Stripe CLI installed ([https://stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)). 2. **Clone or Download:** Get the project files onto your local machine. 3. **Navigate to Project Directory:** Open your terminal or command prompt and `cd` into the project's root directory (`ticket-evolution/`). 4. **Create `.env` File:** Create a new file named exactly `.env` in the project root. Copy the following structure and **replace the placeholders with your actual Stripe keys**: ```dotenv # Stripe API Keys - Get from your Stripe Dashboard (Developers -> API Keys) STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_SECRET_KEY_HERE STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_PUBLISHABLE_KEY_HERE # Stripe Webhook Signing Secret - Get from 'stripe listen' command (see Running section) STRIPE_WEBHOOK_SECRET=whsec_YOUR_ACTUAL_WEBHOOK_SIGNING_SECRET_HERE # Domain for redirects (use 3001 for local dev with current settings) YOUR_DOMAIN=http://localhost:3001 ``` **IMPORTANT:** Add `.env` to your `.gitignore` file (it's already included in the provided `.gitignore`). **Never commit your secret keys!** 5. **Install Dependencies:** Run the following command to install all necessary packages listed in `package.json`: ```bash npm install ``` *(If you encounter issues, try removing `node_modules` and `package-lock.json` first: `rm -rf node_modules package-lock.json && npm install`)* 6. **Database Setup:** The SQLite database file (`database/events.db`) and the `events` table will be created automatically the first time you successfully start the server if they don't exist. Ensure the `database` directory exists or the script has permission to create it (it should by default). 7. **Build CSS:** The application uses Tailwind CSS via a build step. You need to generate the `public/css/output.css` file. * **For Development (Recommended):** Open a **separate, dedicated terminal window**, navigate to the project root, and run: ```bash npm run watch:css ``` Leave this terminal running. It will build the CSS initially and automatically rebuild it whenever you modify HTML classes or `src/input.css`. * **For Single Build:** Alternatively, run `npm run build:css` once. You'll need to re-run it manually after making style-related changes. ## V. Running the Application 1. **Start the Server:** Open your main terminal window (ensure dependencies are installed and CSS build is running) in the project root and run: ```bash npm start ``` The server should start successfully. Look for the following output in the terminal: ``` --> Database connection successful. --> 'events' table checked/created successfully. --> SERVER LISTENING on port 3001 Access application at: http://localhost:3001 ``` *(Note: The application now defaults to **port 3001** to avoid common conflicts with port 3000).* 2. **Access in Browser:** Open your web browser and navigate to: **`http://localhost:3001`** 3. **Testing Stripe Payments (Local):** Stripe Checkout redirects to Stripe's site, but to receive confirmation events back to your local server (for fulfillment logic later), you need to use the Stripe CLI: * Install Stripe CLI and log in (`stripe login`). * Open a **third terminal window** in your project root and run: ```bash stripe listen --forward-to localhost:3001/stripe-webhook ``` * This command will output a **Webhook Signing Secret** (starts with `whsec_...`). Copy this secret. * Paste the secret as the value for `STRIPE_WEBHOOK_SECRET` in your `.env` file. * **Restart your Node.js server (`npm start`)** after updating the `.env` file. Now, when payments are completed in Stripe's test environment, events should be forwarded to your local `/stripe-webhook` endpoint. ## VI. API Endpoints (Brief Overview) * `GET /`: Serves the homepage (`index.html`). * `GET /apply`: Serves the event application form page (`apply.html`). * `GET /events/:id`: Serves the event details page (`event.html`). * `GET /search`: Serves the search results page (`search-results.html`). * `GET /api/events`: Returns JSON array of all events. * `GET /api/events/:id`: Returns JSON object for a single event. * `GET /api/events/search?q=...`: Returns JSON array of events matching the query. * `POST /apply`: Handles event application form submission (expects URL-encoded data, including `imageUrl`). *(Image file upload currently disabled).* * `POST /create-checkout-session`: Creates a Stripe Checkout session and returns the session ID for redirect. * `POST /stripe-webhook`: Receives events from Stripe (e.g., `checkout.session.completed`). *(Needs fulfillment logic implementation)*. ## VII. Current Status & Known Issues * **Actively Under Development:** This application serves as a demonstration platform. * **Core Features Implemented:** Event viewing, searching, application submission (using image URLs), Stripe Checkout session creation, and security headers are in place. * **Image Handling:** Currently configured to accept **Image URLs** via the application form. The `multer`-based file upload functionality structure exists in `server.js` but is **temporarily disabled** for ongoing debugging of core features. Re-enabling requires code changes in `server.js`, `package.json`, and `apply.html`. * **Event Data Persistence:** Ongoing testing and debugging related to ensuring consistent saving (`/apply`) and rendering (`/`, `/events/:id`) of event data. Diagnostic logging is currently active in `server.js` and `script.js`. * **Payment Fulfillment:** The `/stripe-webhook` endpoint structure exists but requires implementation of the database logic (decrementing ticket counts, creating purchase records) upon receiving the `checkout.session.completed` event from Stripe. ## VIII. Future Enhancements * Re-enable and finalize robust image file upload functionality (using Multer and potentially cloud storage like S3). * Implement full payment fulfillment logic in the Stripe webhook handler. * Add user authentication and roles (attendee, host, admin). * Implement pagination for event lists. * Refine UI/UX based on user feedback. * Add comprehensive automated testing. * Tighten Content Security Policy further for production. * Consider migrating from SQLite to a more scalable database (e.g., PostgreSQL) for production. ## IX. License ISC License. See `package.json`. --- This README should provide a solid overview for your presentation. Remember to tailor the "Challenges & Solutions" part during your actual pitch based on the narrative you want to present about overcoming development hurdles! Good luck!
