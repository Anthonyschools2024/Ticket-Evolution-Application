// server.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// const multer = require('multer'); // Keep commented out for diagnostics
const fs = require('fs');
const helmet = require('helmet');

console.log("Server script starting...");
const app = express();
const PORT = process.env.PORT || 3000;
const YOUR_DOMAIN = process.env.YOUR_DOMAIN || `http://localhost:${PORT}`;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
console.log("Constants defined. PORT:", PORT);

// File Upload Setup (Keep commented out)
// const UPLOAD_DIR = path.join(__dirname, 'public', 'uploads', 'images');
// try { if (!fs.existsSync(UPLOAD_DIR)){ fs.mkdirSync(UPLOAD_DIR, { recursive: true }); console.log(`Created upload directory: ${UPLOAD_DIR}`); } else { console.log(`Upload directory already exists: ${UPLOAD_DIR}`); }} catch (err) { console.error("!!! CRITICAL ERROR CREATING UPLOAD DIRECTORY:", err); }
// const storage = multer.diskStorage({ /* ... */ });
// const imageFileFilter = (req, file, cb) => { /* ... */ };
// const upload = multer({ storage: storage, fileFilter: imageFileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
console.log("Multer remains disabled for diagnostics.");

// Database Setup
const dbPath = path.join(__dirname, 'database', 'events.db');
let db;
console.log("Attempting to connect to database:", dbPath);
db = new sqlite3.Database(dbPath, (err) => {
    if (err) { console.error("!!! DATABASE CONNECTION FAILED !!!", err); db = null; return; }
    else { console.log("--> Database connection successful."); }
    db.run(`CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, date TEXT NOT NULL, time TEXT NOT NULL, venue TEXT NOT NULL, city TEXT NOT NULL, state TEXT NOT NULL, description TEXT, imageUrl TEXT, ticketPrice REAL DEFAULT 0.00, ticketsAvailable INTEGER DEFAULT 0, hostName TEXT, hostEmail TEXT NOT NULL )`, (tableErr) => { if (tableErr) { console.error("!!! DATABASE TABLE CREATION ERROR:", tableErr.message); } else { console.log("--> 'events' table checked/created successfully."); } });
});

// Middleware
console.log("Configuring middleware...");
app.post('/stripe-webhook', express.raw({type: 'application/json'}), (req, res) => {
    const sig = req.headers['stripe-signature'];
    if (!STRIPE_WEBHOOK_SECRET) { console.error("Webhook secret missing!"); return res.status(400).send('Webhook secret not configured.');}
    let event;
    try { event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET); }
    catch (err) { console.error(`Webhook verify failed: ${err.message}`); return res.status(400).send(`Webhook Error: ${err.message}`); }
    switch (event.type) { case 'checkout.session.completed': const session = event.data.object; console.log('Webhook: Checkout Session Completed:', session.id); console.log('Webhook: Metadata:', session.metadata); console.log(`Webhook TODO: Fulfill order...`); break; default: console.log(`Webhook: Unhandled event type ${event.type}`); }
    res.json({received: true});
});
console.log("Webhook middleware configured.");
app.use( helmet({ contentSecurityPolicy: { directives: { "default-src": ["'self'"], "script-src": ["'self'", "https://js.stripe.com"], "style-src": ["'self'", "'unsafe-inline'"], "frame-src": ["'self'", "https://js.stripe.com", "https://hooks.stripe.com"], "connect-src": ["'self'", "https://*.stripe.com"], "img-src": ["'self'", "data:", "https://*.placeholder.com", "https://picsum.photos", "https://via.placeholder.com"], "object-src": ["'none'"], "upgrade-insecure-requests": [], }, }, }) );
console.log("Helmet middleware configured with CORRECT CSP.");
app.use(express.json());
console.log("JSON middleware configured.");
app.use(express.urlencoded({ extended: true }));
console.log("URLencoded middleware configured.");
app.use(express.static(path.join(__dirname, 'public')));
console.log("Static middleware configured for 'public' directory.");

// HTML Page Routes
console.log("Configuring HTML routes...");
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views', 'index.html')));
app.get('/apply', (req, res) => res.sendFile(path.join(__dirname, 'views', 'apply.html')));
app.get('/events/:id', (req, res) => res.sendFile(path.join(__dirname, 'views', 'event.html')));
app.get('/purchase-success.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'purchase-success.html')));
app.get('/search', (req, res) => { res.sendFile(path.join(__dirname, 'views', 'search-results.html')); });
console.log("HTML routes configured.");

// API Endpoints
console.log("Configuring API routes...");
const checkDb = (req, res, next) => { if (!db) { console.error("API request: DB unavailable."); return res.status(503).json({ error: "Service unavailable." }); } console.log("checkDb middleware passed for", req.path); next(); };

// POST /apply - Reverted to expect imageUrl from req.body
app.post('/apply', checkDb, /* upload.single('eventImage'), -- Keep removed */ (req, res) => {
    console.log('--- Received /apply POST request (Multer Disabled) ---'); console.log('Request Body:', req.body);
    const imageUrlPath = null; // Force null as multer is disabled
    const { eventName, eventDate, eventTime, venueName, city, state, description, imageUrl, ticketPrice, ticketsAvailable, hostName, hostEmail } = req.body; // Expect imageUrl in body
    if (!eventName || !eventDate || !eventTime || !venueName || !city || !state || !hostEmail) { console.warn("/apply Validation Failed: Missing required text fields."); return res.status(400).send('Validation Error: Missing required fields.'); }
    const sql = `INSERT INTO events (name, date, time, venue, city, state, description, imageUrl, ticketPrice, ticketsAvailable, hostName, hostEmail) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [ eventName, eventDate, eventTime, venueName, city, state, description || null, imageUrl || null, isNaN(parseFloat(ticketPrice)) ? 0.00 : parseFloat(ticketPrice), isNaN(parseInt(ticketsAvailable)) ? 0 : parseInt(ticketsAvailable), hostName || null, hostEmail ]; // Use imageUrl from body
    console.log('SQL Parameters for /apply:', params);
    db.run(sql, params, function(err) { if (err) { console.error("Database Error inserting event in /apply:", err.message); return res.status(500).send('Database error.'); } console.log(`Success: New event added with ID: ${this.lastID}`); res.redirect('/?status=applied'); });
});

app.post('/create-checkout-session', checkDb, async (req, res) => { /* ... */ });

// GET /api/events - Fetch all events (Restored original query + logging)
app.get('/api/events', checkDb, (req, res) => {
    const sql = "SELECT * FROM events ORDER BY date ASC, time ASC";
    console.log(`API: /api/events trying to execute SQL: ${sql}`);
    try {
        if (!db || typeof db.all !== 'function') { console.error("API Error /api/events: DB object invalid before query!"); return res.status(500).json({ error: 'Database unavailable.' }); }
        db.all(sql, [], (err, rows) => {
            if (res.headersSent) { console.error("API Error /api/events: Response headers sent before DB callback."); return; }
            if (err) { console.error("!!! API Error DURING db.all in /api/events:", err); return res.status(500).json({ error: 'Failed to retrieve events due to database query error.' }); }
            else { const results = rows || []; console.log(`API: /api/events query successful. Found ${results.length} events.`); console.log("API: /api/events attempting to send data..."); try { res.json(results); console.log("API: /api/events successfully sent response."); } catch (sendErr) { console.error("API Error /api/events: Error sending JSON response:", sendErr); } }
        });
    } catch (syncErr) { console.error("!!! API Error BEFORE db.all in /api/events (sync):", syncErr); if (!res.headersSent) { return res.status(500).json({ error: 'Failed to query events due to server error.' }); } }
});

// GET /api/events/:id - Fetch single event (With diagnostic logging)
app.get('/api/events/:id', checkDb, (req, res) => {
     const eventIdParam = req.params.id; console.log(`--- Received API request for /api/events/${eventIdParam} ---`); if (isNaN(parseInt(eventIdParam))) { console.warn(`API: Invalid event ID: ${eventIdParam}`); return res.status(400).json({ error: 'Invalid event ID.' }); }
     const sql = "SELECT * FROM events WHERE id = ?"; console.log(`API: Executing SQL: ${sql} with ID: ${eventIdParam}`);
     try { if (!db || typeof db.get !== 'function') { console.error(`API Error /api/events/${eventIdParam}: DB object invalid before query!`); return res.status(500).json({ error: 'Database unavailable.' }); }
        db.get(sql, [eventIdParam], (err, row) => { if (res.headersSent) { console.error(`API Error /api/events/${eventIdParam}: Response headers sent before DB callback.`); return; } if (err) { console.error(`API Error fetching event ${eventIdParam}:`, err); return res.status(500).json({ error: 'DB query error.' }); } if (row) { console.log(`API: Found event ${eventIdParam}.`); res.json(row); } else { console.log(`API: Event ${eventIdParam} not found.`); res.status(404).json({ error: 'Event not found.' }); } });
     } catch(syncErr) { console.error(`API Sync Error BEFORE db.get for event ${eventIdParam}:`, syncErr); if (!res.headersSent) { return res.status(500).json({ error: 'Server error.' }); } }
});

// GET /api/events/search - Search events (With diagnostic logging)
app.get('/api/events/search', checkDb, (req, res) => {
    const query = req.query.q; console.log(`--- Received API request for /api/events/search?q=${query} ---`); if (!query) { return res.status(400).json({ error: 'Query parameter "q" required.' }); }
    const searchTerm = `%${query.toLowerCase()}%`; const sql = `SELECT * FROM events WHERE LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR LOWER(venue) LIKE ? OR LOWER(city) LIKE ? OR LOWER(state) LIKE ? ORDER BY date ASC, time ASC`; const params = [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm]; console.log(`API: Executing SQL: ${sql} with term: ${searchTerm}`);
    try { if (!db || typeof db.all !== 'function') { console.error(`API Error /api/events/search: DB object invalid before query!`); return res.status(500).json({ error: 'Database unavailable.' }); }
        db.all(sql, params, (err, rows) => { if (res.headersSent) { console.error(`API Error /api/events/search: Response headers sent before DB callback.`); return; } if (err) { console.error(`API Error searching events for query "${query}":`, err); return res.status(500).json({ error: 'Failed to search events.' }); } const results = rows || []; console.log(`API: Found ${results.length} events for query "${query}"`); res.json(results); });
    } catch(syncErr) { console.error(`API Sync Error BEFORE db.all for search query "${query}":`, syncErr); if (!res.headersSent) { return res.status(500).json({ error: 'Server error during search.' }); } }
});

console.log("API routes configured.");

// Start Server
console.log('Checking db object state before listen:', db ? 'Exists' : 'Does NOT exist or failed');
console.log("Attempting to start server listening on PORT:", PORT);
app.listen(PORT, () => { console.log(`--> SERVER LISTENING on port ${PORT}`); });

// Graceful shutdown & Error Handlers
process.on('SIGINT', () => { console.log('\nShutting down...'); db.close((err) => { if (err) { console.error('Error closing DB:', err.message); } else { console.log('DB closed.'); } process.exit(0); }); });
process.on('unhandledRejection', (reason, promise) => { console.error('!!! UNHANDLED REJECTION:', reason, promise); });
process.on('uncaughtException', (error) => { console.error('!!! UNCAUGHT EXCEPTION:', error); process.exit(1); });
