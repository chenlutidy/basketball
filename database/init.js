import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db = null;
let SQL = null;

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'basketball.db');

export async function initDatabase() {
  try {
    SQL = await initSqlJs();
    
    const dbDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    if (fs.existsSync(DB_PATH)) {
      const buffer = fs.readFileSync(DB_PATH);
      db = new SQL.Database(buffer);
      console.log('✅ Database loaded from file');
    } else {
      db = new SQL.Database();
      console.log('✅ New database created');
    }

    createTables();
    console.log('✅ Database tables initialized');
    
    return db;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

function createTables() {
  // 扩展 players 表，添加完整属性
  db.run(`
    CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      overall INTEGER DEFAULT 70,
      position TEXT DEFAULT 'PG',
      position_abbr TEXT DEFAULT 'PG',
      age INTEGER DEFAULT 18,
      height INTEGER DEFAULT 180,
      weight INTEGER DEFAULT 70,
      level INTEGER DEFAULT 1,
      exp INTEGER DEFAULT 0,
      potential INTEGER DEFAULT 70,
      potential_rank TEXT DEFAULT 'common',
      
      speed INTEGER DEFAULT 10,
      jump INTEGER DEFAULT 10,
      strength INTEGER DEFAULT 10,
      three_point INTEGER DEFAULT 10,
      inside INTEGER DEFAULT 10,
      defense INTEGER DEFAULT 10,
      dribble INTEGER DEFAULT 10,
      pass INTEGER DEFAULT 10,
      stamina_attr INTEGER DEFAULT 10,
      rebound INTEGER DEFAULT 10,
      morale INTEGER DEFAULT 10,
      pressure INTEGER DEFAULT 10,
      block_attr INTEGER DEFAULT 10,
      steal INTEGER DEFAULT 10,
      mid_range INTEGER DEFAULT 10,
      break_through INTEGER DEFAULT 10,
      
      clutch INTEGER DEFAULT 50,
      consistency INTEGER DEFAULT 50,
      basketball_iq INTEGER DEFAULT 50,
      work_ethic INTEGER DEFAULT 50,
      leadership INTEGER DEFAULT 50,
      adaptability INTEGER DEFAULT 50,
      injury_resistance INTEGER DEFAULT 50,
      mental_toughness INTEGER DEFAULT 50,
      
      current_stamina INTEGER DEFAULT 100,
      max_stamina INTEGER DEFAULT 100,
      street_games_today INTEGER DEFAULT 0,
      league INTEGER DEFAULT 0,
      season INTEGER DEFAULT 1,
      games_remaining INTEGER DEFAULT 30,
      playoffs_round INTEGER DEFAULT 0,
      
      wins INTEGER DEFAULT 0,
      losses INTEGER DEFAULT 0,
      streak INTEGER DEFAULT 0,
      rank TEXT DEFAULT 'bronze',
      gold INTEGER DEFAULT 0,
      
      games_played INTEGER DEFAULT 0,
      street_wins INTEGER DEFAULT 0,
      street_mvp INTEGER DEFAULT 0,
      mvp_count INTEGER DEFAULT 0,
      total_points INTEGER DEFAULT 0,
      total_rebounds INTEGER DEFAULT 0,
      total_assists INTEGER DEFAULT 0,
      total_steals INTEGER DEFAULT 0,
      total_blocks INTEGER DEFAULT 0,
      fame INTEGER DEFAULT 0,
      
      title TEXT DEFAULT '',
      jersey TEXT DEFAULT 'jersey_1',
      hair TEXT DEFAULT 'hair_1',
      skin TEXT DEFAULT 'skin_1',
      accessory TEXT DEFAULT 'acc_1',
      
      staff TEXT DEFAULT '[]',
      draft_remaining_daily_drafts INTEGER DEFAULT 2,
      draft_last_reset_at INTEGER DEFAULT 0,
      draft_applied_today INTEGER DEFAULT 0,
      draft_consecutive_failures INTEGER DEFAULT 0,
      draft_badge TEXT,
      draft_scouted_attributes TEXT DEFAULT '{}',
      
      created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
      updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS matches (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL,
      room_name TEXT,
      mode TEXT NOT NULL,
      team_a_score INTEGER DEFAULT 0,
      team_b_score INTEGER DEFAULT 0,
      winning_team TEXT,
      team_a_players TEXT,
      team_b_players TEXT,
      player_stats TEXT,
      duration INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      mode TEXT NOT NULL,
      required_players INTEGER DEFAULT 2,
      status TEXT DEFAULT 'waiting',
      team_a_players TEXT DEFAULT '[]',
      team_b_players TEXT DEFAULT '[]',
      created_by TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
      updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS draft_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      round INTEGER NOT NULL,
      player_id TEXT NOT NULL,
      player_name TEXT NOT NULL,
      player_overall INTEGER NOT NULL,
      target_overall INTEGER NOT NULL,
      draft_pick INTEGER,
      result TEXT,
      is_ai INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS equipment (
      id TEXT PRIMARY KEY,
      player_id TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      rarity TEXT NOT NULL,
      bonus TEXT,
      is_equipped INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS friends (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id TEXT NOT NULL,
      friend_id TEXT NOT NULL,
      created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
      UNIQUE(player_id, friend_id)
    )
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_matches_room_id ON matches(room_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_equipment_player_id ON equipment(player_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_draft_records_round ON draft_records(round)`);
}

export function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
    console.log('💾 Database saved to file');
  }
}

export function getDatabase() {
  return db;
}

export function runQuery(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  } catch (error) {
    console.error('❌ Query error:', error);
    throw error;
  }
}

export function runExec(sql, params = []) {
  try {
    if (params.length > 0) {
      const stmt = db.prepare(sql);
      stmt.bind(params);
      stmt.step();
      stmt.free();
    } else {
      db.run(sql);
    }
    saveDatabase();
    return true;
  } catch (error) {
    console.error('❌ Exec error:', error);
    throw error;
  }
}

export function getOne(sql, params = []) {
  const results = runQuery(sql, params);
  return results.length > 0 ? results[0] : null;
}

setInterval(() => {
  saveDatabase();
}, 60000);

process.on('exit', () => {
  saveDatabase();
});

process.on('SIGINT', () => {
  saveDatabase();
  process.exit();
});
