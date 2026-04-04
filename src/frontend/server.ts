import 'dotenv/config';
import express from 'express';
import Database from 'better-sqlite3';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const execFileAsync = promisify(execFile);

const app = express();
app.use(express.json());

const SUPPORTED_LANGUAGES = ['en', 'vi', 'ko', 'ja', 'zh-CN', 'zh-TW', 'es'] as const;
type Language = typeof SUPPORTED_LANGUAGES[number];
type DescriptionTranslations = Partial<Record<Language, string>>;

function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && SUPPORTED_LANGUAGES.includes(value as Language);
}

function cleanText(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function normalizeDescriptionTranslations(value: unknown): DescriptionTranslations {
  const textValue = cleanText(value);
  if (!textValue) return {};

  try {
    const parsed = JSON.parse(textValue);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { en: textValue };
    }

    const normalized: DescriptionTranslations = {};
    for (const language of SUPPORTED_LANGUAGES) {
      const translated = cleanText((parsed as Record<string, unknown>)[language]);
      if (translated) normalized[language] = translated;
    }
    return normalized;
  } catch {
    return { en: textValue };
  }
}

function pickDisplayDescription(descriptions: DescriptionTranslations): string | null {
  const priority: Language[] = ['vi', 'en', 'ko', 'ja', 'zh-CN', 'zh-TW', 'es'];
  for (const language of priority) {
    const text = cleanText(descriptions[language]);
    if (text) return text;
  }
  for (const text of Object.values(descriptions)) {
    const normalized = cleanText(text);
    if (normalized) return normalized;
  }
  return null;
}

function serializeDescriptionTranslations(descriptions: DescriptionTranslations): string | null {
  const normalized: DescriptionTranslations = {};
  for (const language of SUPPORTED_LANGUAGES) {
    const text = cleanText(descriptions[language]);
    if (text) normalized[language] = text;
  }
  return Object.keys(normalized).length > 0 ? JSON.stringify(normalized) : null;
}

function normalizeVendorRecord(vendor: any) {
  const descriptionTranslations = normalizeDescriptionTranslations(vendor.description);
  return {
    ...vendor,
    description: pickDisplayDescription(descriptionTranslations),
    description_translations: descriptionTranslations,
    images: JSON.parse(vendor.images || '[]')
  };
}

async function translateVietnameseDescription(description: string): Promise<DescriptionTranslations> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured');

  const targetLanguages = SUPPORTED_LANGUAGES.filter((language) => language !== 'vi');
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'You translate Vietnamese vendor descriptions into other languages. Return JSON only. Preserve meaning, tone, and food-specific details. Keys must exactly match the requested language codes.',
        },
        {
          role: 'user',
          content: JSON.stringify({
            source_language: 'vi',
            source_text: description,
            target_languages: targetLanguages,
          }),
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI translation failed with status ${response.status}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  const parsed = typeof content === 'string' ? JSON.parse(content) : {};
  const translations: DescriptionTranslations = {};
  for (const language of targetLanguages) {
    const translated = cleanText(parsed?.[language]);
    if (translated) translations[language] = translated;
  }
  return translations;
}

async function buildDescriptionTranslations(
  existingValue: unknown,
  description: unknown,
  descriptionLanguage: unknown,
  providedTranslations?: unknown
): Promise<DescriptionTranslations> {
  if (providedTranslations && typeof providedTranslations === 'object' && !Array.isArray(providedTranslations)) {
    const normalized: DescriptionTranslations = {};
    for (const language of SUPPORTED_LANGUAGES) {
      const translated = cleanText((providedTranslations as Record<string, unknown>)[language]);
      if (translated) normalized[language] = translated;
    }
    return normalized;
  }

  const sourceLanguage: Language = isLanguage(descriptionLanguage) ? descriptionLanguage : 'en';
  const next = normalizeDescriptionTranslations(existingValue);
  const sourceText = cleanText(description);

  if (!sourceText) {
    delete next[sourceLanguage];
    return next;
  }

  next[sourceLanguage] = sourceText;

  if (sourceLanguage !== 'vi') {
    return next;
  }

  try {
    const translations = await translateVietnameseDescription(sourceText);
    for (const language of SUPPORTED_LANGUAGES) {
      if (language === 'vi') continue;
      const translated = cleanText(translations[language]);
      if (translated) {
        next[language] = translated;
      } else {
        delete next[language];
      }
    }
  } catch (error) {
    console.error('Vendor description translation failed:', error);
  }

  return next;
}

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
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    vendor_id TEXT NOT NULL,
    username TEXT NOT NULL,
    rating INTEGER NOT NULL,
    body TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (vendor_id) REFERENCES vendors (id) ON DELETE CASCADE
  );
`);

// Add owner_username column if not exists
try {
  db.exec('ALTER TABLE vendors ADD COLUMN owner_username TEXT');
} catch {
  // Column already exists
}

// Add bbox and map columns to streets
const newStreetColumns = [
  'ALTER TABLE streets ADD COLUMN lat_nw REAL',
  'ALTER TABLE streets ADD COLUMN lon_nw REAL',
  'ALTER TABLE streets ADD COLUMN lat_se REAL',
  'ALTER TABLE streets ADD COLUMN lon_se REAL',
  'ALTER TABLE streets ADD COLUMN map_image_path TEXT',
  'ALTER TABLE streets ADD COLUMN map_zoom INTEGER DEFAULT 19',
  'ALTER TABLE streets ADD COLUMN map_updated_at TEXT',
];
for (const sql of newStreetColumns) {
  try { db.exec(sql); } catch { /* column already exists */ }
}

// Add lat/lon columns to vendors
const newVendorColumns = [
  'ALTER TABLE vendors ADD COLUMN lat REAL',
  'ALTER TABLE vendors ADD COLUMN lon REAL',
];
for (const sql of newVendorColumns) {
  try { db.exec(sql); } catch { /* column already exists */ }
}

// Seed users table if empty
const userCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }).count;
if (userCount === 0) {
  const insertUser = db.prepare('INSERT INTO users (id, username, password, role, created_at) VALUES (?, ?, ?, ?, ?)');
  const now = new Date().toISOString();
  insertUser.run(crypto.randomUUID(), 'user', '123123', 'user', now);
  insertUser.run(crypto.randomUUID(), 'foodvendor', '123123', 'foodvendor', now);
  insertUser.run(crypto.randomUUID(), 'admin', '123123', 'admin', now);
}

// Seed initial streets/vendors if empty
const streetCount = (db.prepare('SELECT COUNT(*) as count FROM streets').get() as { count: number }).count;
if (streetCount === 0) {
  const insertStreet = db.prepare('INSERT INTO streets (id, name, city, description) VALUES (?, ?, ?, ?)');
  insertStreet.run('1', 'Khao San Road', 'Bangkok', 'Famous backpacker street');
  insertStreet.run('2', 'Jemaa el-Fnaa', 'Marrakech', 'Bustling square and market place');

  const insertVendor = db.prepare('INSERT INTO vendors (id, street_id, name, description, rating, reviews, x, y, type, address, images) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  insertVendor.run('v1', '1', 'Pad Thai Master', 'Best pad thai', 4.8, 120, 30, 40, 'noodle', '123 Noodle St, Alley 4', JSON.stringify(['https://picsum.photos/seed/padthai1/400/300', 'https://picsum.photos/seed/padthai2/400/300']));
  insertVendor.run('v2', '1', 'Mango Sticky Rice', 'Sweet dessert', 4.9, 85, 70, 20, 'dessert', '45 Sweet Ave, Corner Shop', JSON.stringify(['https://picsum.photos/seed/mango1/400/300']));
}

// --- Auth Helpers ---

function getUserFromToken(token: string): { role: string; username: string } | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const parts = decoded.split(':');
    const role = parts[0];
    const username = parts.slice(1).join(':');
    if (['user', 'foodvendor', 'admin'].includes(role)) return { role, username };
    return null;
  } catch {
    return null;
  }
}

function getRoleFromRequest(req: express.Request): string | null {
  const token = req.headers['x-role-token'] as string | undefined;
  if (!token) return null;
  const user = getUserFromToken(token);
  return user ? user.role : null;
}

function getUserFromRequest(req: express.Request): { role: string; username: string } | null {
  const token = req.headers['x-role-token'] as string | undefined;
  if (!token) return null;
  return getUserFromToken(token);
}

// --- Auth Endpoints ---

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  const entry = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;
  if (!entry || entry.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = Buffer.from(`${entry.role}:${username}`).toString('base64');
  res.json({ username, role: entry.role, token });
});

// POST /api/auth/register
app.post('/api/auth/register', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) {
    return res.status(409).json({ error: 'Username already taken' });
  }
  const id = crypto.randomUUID();
  const role = 'user';
  const now = new Date().toISOString();
  db.prepare('INSERT INTO users (id, username, password, role, created_at) VALUES (?, ?, ?, ?, ?)').run(id, username, password, role, now);
  const token = Buffer.from(`${role}:${username}`).toString('base64');
  res.status(201).json({ username, role, token });
});

// PUT /api/auth/change-password
app.put('/api/auth/change-password', (req, res) => {
  const authUser = getUserFromRequest(req);
  if (!authUser) return res.status(401).json({ error: 'Unauthorized' });
  const { old_password, new_password, confirm_password } = req.body || {};
  if (!old_password || !new_password || !confirm_password) {
    return res.status(400).json({ error: 'All fields required' });
  }
  if (new_password !== confirm_password) {
    return res.status(400).json({ error: 'New passwords do not match' });
  }
  const entry = db.prepare('SELECT * FROM users WHERE username = ?').get(authUser.username) as any;
  if (!entry || entry.password !== old_password) {
    return res.status(401).json({ error: 'Old password is incorrect' });
  }
  db.prepare('UPDATE users SET password = ? WHERE username = ?').run(new_password, authUser.username);
  res.json({ success: true });
});

// --- Streets Endpoints ---

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
app.post('/api/streets', async (req, res) => {
  if (getRoleFromRequest(req) !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { id, name, city, description, lat_nw, lon_nw, lat_se, lon_se, map_zoom } = req.body;
  const zoom = map_zoom ?? 19;
  db.prepare('INSERT INTO streets (id, name, city, description, lat_nw, lon_nw, lat_se, lon_se, map_zoom) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id, name, city, description, lat_nw ?? null, lon_nw ?? null, lat_se ?? null, lon_se ?? null, zoom);
  let map_image_path: string | null = null;
  let map_updated_at: string | null = null;
  if (lat_nw != null && lon_nw != null && lat_se != null && lon_se != null) {
    const outputPath = path.join(mapsDir, `${id}.png`);
    const success = await generateMapPng(lat_nw, lon_nw, lat_se, lon_se, zoom, outputPath);
    if (success) {
      map_image_path = `maps/${id}.png`;
      map_updated_at = new Date().toISOString();
      db.prepare('UPDATE streets SET map_image_path = ?, map_updated_at = ? WHERE id = ?').run(map_image_path, map_updated_at, id);
    }
  }
  res.json({ success: true });
});

// PUT /api/streets/:id — admin only
app.put('/api/streets/:id', async (req, res) => {
  if (getRoleFromRequest(req) !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { name, city, description, lat_nw, lon_nw, lat_se, lon_se, map_zoom } = req.body;
  const zoom = map_zoom ?? 19;
  db.prepare('UPDATE streets SET name = ?, city = ?, description = ?, lat_nw = ?, lon_nw = ?, lat_se = ?, lon_se = ?, map_zoom = ? WHERE id = ?')
    .run(name, city, description, lat_nw ?? null, lon_nw ?? null, lat_se ?? null, lon_se ?? null, zoom, req.params.id);
  let map_image_path: string | null = null;
  let map_updated_at: string | null = null;
  if (lat_nw != null && lon_nw != null && lat_se != null && lon_se != null) {
    const outputPath = path.join(mapsDir, `${req.params.id}.png`);
    const success = await generateMapPng(lat_nw, lon_nw, lat_se, lon_se, zoom, outputPath);
    if (success) {
      map_image_path = `maps/${req.params.id}.png`;
      map_updated_at = new Date().toISOString();
      db.prepare('UPDATE streets SET map_image_path = ?, map_updated_at = ? WHERE id = ?').run(map_image_path, map_updated_at, req.params.id);
    }
  }
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
  const parsedVendors = vendors.map((v: any) => normalizeVendorRecord(v));
  res.json(parsedVendors);
});

// POST /api/streets/:id/vendors — admin or foodvendor
app.post('/api/streets/:id/vendors', async (req, res) => {
  const authUser = getUserFromRequest(req);
  if (!authUser || (authUser.role !== 'admin' && authUser.role !== 'foodvendor')) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const { id, name, description, description_language, rating, reviews, x, y, type, address, images, lat, lon } = req.body;
  const owner_username = authUser.role === 'foodvendor' ? authUser.username : (req.body.owner_username || null);
  const descriptionTranslations = await buildDescriptionTranslations(null, description, description_language);
  db.prepare('INSERT INTO vendors (id, street_id, name, description, rating, reviews, x, y, type, address, images, owner_username, lat, lon) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id, req.params.id, name, serializeDescriptionTranslations(descriptionTranslations), rating, reviews, x, y, type, address, JSON.stringify(images || []), owner_username, lat ?? null, lon ?? null);
  const createdVendor = db.prepare('SELECT * FROM vendors WHERE id = ?').get(id) as any;
  res.status(201).json(normalizeVendorRecord(createdVendor));
});

// PUT /api/streets/:streetId/vendors/:vendorId — admin or owning foodvendor
app.put('/api/streets/:streetId/vendors/:vendorId', async (req, res) => {
  const authUser = getUserFromRequest(req);
  if (!authUser) return res.status(401).json({ error: 'Unauthorized' });

  const vendor = db.prepare('SELECT * FROM vendors WHERE id = ? AND street_id = ?').get(req.params.vendorId, req.params.streetId) as any;
  if (!vendor) return res.status(404).json({ error: 'Vendor not found' });

  if (authUser.role === 'admin') {
    const { name, description, description_language, description_translations, images, owner_username, rating, reviews, x, y, type, address, lat, lon } = req.body;
    const nextDescription = await buildDescriptionTranslations(vendor.description, description, description_language, description_translations);
    db.prepare('UPDATE vendors SET name = ?, description = ?, images = ?, owner_username = ?, rating = ?, reviews = ?, x = ?, y = ?, type = ?, address = ?, lat = ?, lon = ? WHERE id = ?')
      .run(name, serializeDescriptionTranslations(nextDescription), JSON.stringify(images || []), owner_username || null, rating, reviews, x, y, type, address, lat ?? null, lon ?? null, req.params.vendorId);
    const updatedVendor = db.prepare('SELECT * FROM vendors WHERE id = ?').get(req.params.vendorId) as any;
    return res.json(normalizeVendorRecord(updatedVendor));
  }

  if (authUser.role === 'foodvendor' && vendor.owner_username === authUser.username) {
    const { name, description, description_language, images } = req.body;
    const nextDescription = await buildDescriptionTranslations(vendor.description, description, description_language);
    db.prepare('UPDATE vendors SET name = ?, description = ?, images = ? WHERE id = ?')
      .run(name, serializeDescriptionTranslations(nextDescription), JSON.stringify(images || []), req.params.vendorId);
    const updatedVendor = db.prepare('SELECT * FROM vendors WHERE id = ?').get(req.params.vendorId) as any;
    return res.json(normalizeVendorRecord(updatedVendor));
  }

  return res.status(403).json({ error: 'Forbidden' });
});

// GET /api/vendors/mine — foodvendor only
app.get('/api/vendors/mine', (req, res) => {
  const authUser = getUserFromRequest(req);
  if (!authUser) return res.status(401).json({ error: 'Unauthorized' });
  if (authUser.role !== 'foodvendor') return res.status(403).json({ error: 'Forbidden' });
  const vendors = db.prepare('SELECT * FROM vendors WHERE owner_username = ?').all(authUser.username);
  const parsedVendors = vendors.map((v: any) => normalizeVendorRecord(v));
  res.json(parsedVendors);
});

// --- Comments Endpoints ---

function recalcVendorRating(vendorId: string) {
  const result = db.prepare('SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM comments WHERE vendor_id = ?').get(vendorId) as any;
  const avg = result.avg_rating ? Math.round(result.avg_rating * 10) / 10 : 0;
  db.prepare('UPDATE vendors SET rating = ?, reviews = ? WHERE id = ?').run(avg, result.count, vendorId);
}

// GET /api/vendors/:vendorId/comments — any auth
app.get('/api/vendors/:vendorId/comments', (req, res) => {
  if (!getRoleFromRequest(req)) return res.status(401).json({ error: 'Unauthorized' });
  const comments = db.prepare('SELECT * FROM comments WHERE vendor_id = ? ORDER BY created_at DESC').all(req.params.vendorId);
  res.json(comments);
});

// POST /api/vendors/:vendorId/comments — any auth
app.post('/api/vendors/:vendorId/comments', (req, res) => {
  const authUser = getUserFromRequest(req);
  if (!authUser) return res.status(401).json({ error: 'Unauthorized' });
  const { rating, body } = req.body || {};
  if (!rating || !body) return res.status(400).json({ error: 'rating and body required' });
  if (rating < 1 || rating > 5) return res.status(400).json({ error: 'rating must be 1-5' });
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  db.prepare('INSERT INTO comments (id, vendor_id, username, rating, body, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, req.params.vendorId, authUser.username, rating, body, now);
  recalcVendorRating(req.params.vendorId);
  res.status(201).json({ success: true });
});

// DELETE /api/vendors/:vendorId/comments/:commentId — admin only
app.delete('/api/vendors/:vendorId/comments/:commentId', (req, res) => {
  if (getRoleFromRequest(req) !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  db.prepare('DELETE FROM comments WHERE id = ? AND vendor_id = ?').run(req.params.commentId, req.params.vendorId);
  recalcVendorRating(req.params.vendorId);
  res.json({ success: true });
});

// --- Admin Endpoints ---

// GET /api/admin/stats
app.get('/api/admin/stats', (req, res) => {
  if (getRoleFromRequest(req) !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const streets = (db.prepare('SELECT COUNT(*) as count FROM streets').get() as any).count;
  const vendors = (db.prepare('SELECT COUNT(*) as count FROM vendors').get() as any).count;
  const users = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any).count;
  const comments = (db.prepare('SELECT COUNT(*) as count FROM comments').get() as any).count;
  res.json({ streets, vendors, users, comments });
});

// GET /api/admin/users
app.get('/api/admin/users', (req, res) => {
  if (getRoleFromRequest(req) !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const users = db.prepare('SELECT id, username, role, created_at FROM users').all();
  res.json(users);
});

// PUT /api/admin/users/:userId
app.put('/api/admin/users/:userId', (req, res) => {
  const authUser = getUserFromRequest(req);
  if (!authUser || authUser.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const target = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.userId) as any;
  if (!target) return res.status(404).json({ error: 'User not found' });
  if (target.username === authUser.username) return res.status(400).json({ error: 'Cannot change own role' });
  const { role } = req.body;
  if (!['user', 'foodvendor', 'admin'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, req.params.userId);
  res.json({ success: true });
});

// DELETE /api/admin/users/:userId
app.delete('/api/admin/users/:userId', (req, res) => {
  const authUser = getUserFromRequest(req);
  if (!authUser || authUser.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const target = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.userId) as any;
  if (!target) return res.status(404).json({ error: 'User not found' });
  if (target.username === authUser.username) return res.status(400).json({ error: 'Cannot delete self' });
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.userId);
  res.json({ success: true });
});

// GET /api/admin/vendors
app.get('/api/admin/vendors', (req, res) => {
  if (getRoleFromRequest(req) !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const vendors = db.prepare(`
    SELECT v.*, s.name as street_name
    FROM vendors v
    LEFT JOIN streets s ON v.street_id = s.id
  `).all();
  const parsed = vendors.map((v: any) => ({
    ...normalizeVendorRecord(v),
    street_name: v.street_name,
  }));
  res.json(parsed);
});

// GET /api/admin/comments
app.get('/api/admin/comments', (req, res) => {
  if (getRoleFromRequest(req) !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const comments = db.prepare(`
    SELECT c.*, v.name as vendor_name
    FROM comments c
    LEFT JOIN vendors v ON c.vendor_id = v.id
    ORDER BY c.created_at DESC
  `).all();
  res.json(comments);
});

// --- Static Map Serving ---
const mapsDir = path.join(process.cwd(), 'static', 'maps');
fs.mkdirSync(mapsDir, { recursive: true });
app.use('/maps', express.static(mapsDir));

// Prefer uv-managed venv python (has staticmap), fall back to system python3
const pythonExe = (() => {
  const venvPy = path.join(process.cwd(), '..', '..', '.venv', 'bin', 'python3');
  try {
    fs.accessSync(venvPy, fs.constants.X_OK);
    return venvPy;
  } catch {
    return 'python3';
  }
})();

async function generateMapPng(
  latNw: number, lonNw: number, latSe: number, lonSe: number,
  zoom: number, outputPath: string
): Promise<boolean> {
  try {
    await execFileAsync(pythonExe, [
      path.join(process.cwd(), '..', 'backend', 'gen_map.py'),
      String(latNw), String(lonNw), String(latSe), String(lonSe),
      String(zoom), outputPath
    ], { timeout: 30000 });
    return true;
  } catch {
    return false;
  }
}

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
