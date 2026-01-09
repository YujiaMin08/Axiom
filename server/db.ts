import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 初始化数据库
const dbPath = path.join(__dirname, '../data/axiom.db');

// 确保目录存在
const dbDir = dirname(dbPath);
import fs from 'fs';
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// 启用外键约束
db.pragma('foreign_keys = ON');

// 创建表
export function initDatabase() {
  // Canvas 表
  db.exec(`
    CREATE TABLE IF NOT EXISTS canvases (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      domain TEXT NOT NULL CHECK(domain IN ('LANGUAGE', 'SCIENCE', 'LIBERAL_ARTS')),
      status TEXT NOT NULL CHECK(status IN ('active', 'archived')) DEFAULT 'active',
      created_at INTEGER NOT NULL
    )
  `);

  // Module 表
  db.exec(`
    CREATE TABLE IF NOT EXISTS modules (
      id TEXT PRIMARY KEY,
      canvas_id TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('generating', 'ready', 'error')) DEFAULT 'generating',
      order_index INTEGER NOT NULL,
      width INTEGER DEFAULT 800,
      height INTEGER DEFAULT 400,
      FOREIGN KEY (canvas_id) REFERENCES canvases(id) ON DELETE CASCADE
    )
  `);

  // ModuleVersion 表
  db.exec(`
    CREATE TABLE IF NOT EXISTS module_versions (
      id TEXT PRIMARY KEY,
      module_id TEXT NOT NULL,
      prompt TEXT NOT NULL,
      content_json TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
    )
  `);

  // 创建索引
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_modules_canvas_id ON modules(canvas_id);
    CREATE INDEX IF NOT EXISTS idx_modules_order ON modules(canvas_id, order_index);
    CREATE INDEX IF NOT EXISTS idx_versions_module_id ON module_versions(module_id);
    CREATE INDEX IF NOT EXISTS idx_versions_created ON module_versions(module_id, created_at DESC);
  `);

  console.log('✅ Database initialized successfully');
}

// Canvas CRUD
export const canvasDB = {
  create: (id: string, title: string, domain: string) => {
    const stmt = db.prepare(`
      INSERT INTO canvases (id, title, domain, status, created_at)
      VALUES (?, ?, ?, 'active', ?)
    `);
    return stmt.run(id, title, domain, Date.now());
  },

  findById: (id: string) => {
    const stmt = db.prepare('SELECT * FROM canvases WHERE id = ?');
    return stmt.get(id);
  },

  findAll: () => {
    const stmt = db.prepare('SELECT * FROM canvases ORDER BY created_at DESC');
    return stmt.all();
  },

  archive: (id: string) => {
    const stmt = db.prepare('UPDATE canvases SET status = ? WHERE id = ?');
    return stmt.run('archived', id);
  },

  delete: (id: string) => {
    const stmt = db.prepare('DELETE FROM canvases WHERE id = ?');
    return stmt.run(id);
  }
};

// Module CRUD
export const moduleDB = {
  create: (id: string, canvas_id: string, type: string, order_index: number, width: number = 800, height: number = 400) => {
    const stmt = db.prepare(`
      INSERT INTO modules (id, canvas_id, type, status, order_index, width, height)
      VALUES (?, ?, ?, 'generating', ?, ?, ?)
    `);
    return stmt.run(id, canvas_id, type, order_index, width, height);
  },

  findById: (id: string) => {
    const stmt = db.prepare('SELECT * FROM modules WHERE id = ?');
    return stmt.get(id);
  },

  findByCanvasId: (canvas_id: string) => {
    const stmt = db.prepare(`
      SELECT * FROM modules 
      WHERE canvas_id = ? 
      ORDER BY order_index ASC
    `);
    return stmt.all(canvas_id);
  },

  updateStatus: (id: string, status: string) => {
    const stmt = db.prepare('UPDATE modules SET status = ? WHERE id = ?');
    return stmt.run(status, id);
  },

  updateOrderIndex: (id: string, order_index: number) => {
    const stmt = db.prepare('UPDATE modules SET order_index = ? WHERE id = ?');
    return stmt.run(order_index, id);
  },

  updateSize: (id: string, width: number, height: number) => {
    const stmt = db.prepare('UPDATE modules SET width = ?, height = ? WHERE id = ?');
    return stmt.run(width, height, id);
  },

  delete: (id: string) => {
    const stmt = db.prepare('DELETE FROM modules WHERE id = ?');
    return stmt.run(id);
  }
};

// ModuleVersion CRUD
export const versionDB = {
  create: (id: string, module_id: string, prompt: string, content_json: string) => {
    const stmt = db.prepare(`
      INSERT INTO module_versions (id, module_id, prompt, content_json, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    return stmt.run(id, module_id, prompt, content_json, Date.now());
  },

  findLatestByModuleId: (module_id: string) => {
    const stmt = db.prepare(`
      SELECT * FROM module_versions 
      WHERE module_id = ? 
      ORDER BY created_at DESC 
      LIMIT 1
    `);
    return stmt.get(module_id);
  },

  findAllByModuleId: (module_id: string) => {
    const stmt = db.prepare(`
      SELECT * FROM module_versions 
      WHERE module_id = ? 
      ORDER BY created_at DESC
    `);
    return stmt.all(module_id);
  }
};

export default db;

