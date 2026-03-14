import express from 'express';
import Database from 'better-sqlite3';
import { createServer as createViteServer } from 'vite';
import path from 'path';

const app = express();
app.use(express.json());

// --- Auth ---

const USERS: Record<string, { password: string; role: string }> = {
  user:       { password: '123123', role: 'user' },
  foodvendor: { password: '123123', role: 'foodvendor' },
  admin:      { password: '123123', role: 'admin' },
};

function getRoleFromRequest(req: express.Request): string | null {
  const token = req.headers['x-role-token'] as string | undefined;
  if (!token) return null;
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const [role] = decoded.split(':');
    if (['user', 'foodvendor', 'admin'].includes(role)) return role;
    return null;
  } catch {
    return null;
  }
}

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  const entry = USERS[username];
  if (!entry || entry.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = Buffer.from(`${entry.role}:${username}`).toString('base64');
  res.json({ username, role: entry.role, token });
});

// --- Database Setup ---
const db = new Database('app.db');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS streets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    description TEXT
  );
  CREATE TABLE IF NOT EXISTS vendors (
    id TEXT PRIMARY KEY,
    street_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    rating REAL,
    reviews INTEGER,
    x REAL,
    y REAL,
    type TEXT,
    address TEXT,
    images TEXT,
    FOREIGN KEY (street_id) REFERENCES streets (id) ON DELETE CASCADE
  );
`);

// Seed initial data if empty
const stmt = db.prepare('SELECT COUNT(*) as count FROM streets');
const { count } = stmt.get() as { count: number };
if (count === 0) {
  const insertStreet = db.prepare('INSERT INTO streets (id, name, city, description) VALUES (?, ?, ?, ?)');
  insertStreet.run('1', 'Khao San Road', 'Bangkok', 'Famous backpacker street');
  insertStreet.run('2', 'Jemaa el-Fnaa', 'Marrakech', 'Bustling square and market place');

  const insertVendor = db.prepare('INSERT INTO vendors (id, street_id, name, description, rating, reviews, x, y, type, address, images) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  insertVendor.run('v1', '1', 'Pad Thai Master', 'Best pad thai', 4.8, 120, 30, 40, 'noodle', '123 Noodle St, Alley 4', JSON.stringify(['https://picsum.photos/seed/padthai1/400/300', 'https://picsum.photos/seed/padthai2/400/300']));
  insertVendor.run('v2', '1', 'Mango Sticky Rice', 'Sweet dessert', 4.9, 85, 70, 20, 'dessert', '45 Sweet Ave, Corner Shop', JSON.stringify(['https://picsum.photos/seed/mango1/400/300']));
}

// --- API Endpoints ---

// GET /api/streets — require any authenticated user
app.get('/api/streets', (req, res) => {
  if (!getRoleFromRequest(req)) return res.status(401).json({ error: 'Unauthorized' });
  const streets = db.prepare('SELECT * FROM streets').all();
  const streetsWithCounts = streets.map((s: any) => {
    const countObj = db.prepare('SELECT COUNT(*) as count FROM vendors WHERE street_id = ?').get(s.id) as { count: number };
    return { ...s, vendors_count: countObj.count };
  });
  res.json(streetsWithCounts);
});

// POST /api/streets — admin only
app.post('/api/streets', (req, res) => {
  if (getRoleFromRequest(req) !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { id, name, city, description } = req.body;
  db.prepare('INSERT INTO streets (id, name, city, description) VALUES (?, ?, ?, ?)').run(id, name, city, description);
  res.json({ success: true });
});

// PUT /api/streets/:id — admin only
app.put('/api/streets/:id', (req, res) => {
  if (getRoleFromRequest(req) !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { name, city, description } = req.body;
  db.prepare('UPDATE streets SET name = ?, city = ?, description = ? WHERE id = ?').run(name, city, description, req.params.id);
  res.json({ success: true });
});

// DELETE /api/streets/:id — admin only
app.delete('/api/streets/:id', (req, res) => {
  if (getRoleFromRequest(req) !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  db.prepare('DELETE FROM streets WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// GET /api/streets/:id/vendors — require any authenticated user
app.get('/api/streets/:id/vendors', (req, res) => {
  if (!getRoleFromRequest(req)) return res.status(401).json({ error: 'Unauthorized' });
  const vendors = db.prepare('SELECT * FROM vendors WHERE street_id = ?').all(req.params.id);
  const parsedVendors = vendors.map((v: any) => ({
    ...v,
    images: JSON.parse(v.images || '[]')
  }));
  res.json(parsedVendors);
});

// POST /api/streets/:id/vendors — admin or foodvendor
app.post('/api/streets/:id/vendors', (req, res) => {
  const role = getRoleFromRequest(req);
  if (role !== 'admin' && role !== 'foodvendor') return res.status(403).json({ error: 'Forbidden' });
  const { id, name, description, rating, reviews, x, y, type, address, images } = req.body;
  db.prepare('INSERT INTO vendors (id, street_id, name, description, rating, reviews, x, y, type, address, images) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id, req.params.id, name, description, rating, reviews, x, y, type, address, JSON.stringify(images || []));
  res.status(201).json({ success: true });
});

// --- Vite Middleware ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
  app.listen(3000, '0.0.0.0', () => {
    console.log('Server running on http://localhost:3000');
  });
}

startServer();
