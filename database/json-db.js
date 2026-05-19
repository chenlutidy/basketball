import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'basketball.json');

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 默认数据结构
const defaultData = {
  players: [],
  matches: [],
  rooms: [],
  equipment: [],
  draftRecords: [],
  friends: []
};

let dbData = { ...defaultData };

// 加载数据
export function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      dbData = JSON.parse(data);
      console.log('✅ Database loaded from JSON file');
    } else {
      dbData = { ...defaultData };
      saveDatabase();
      console.log('✅ New database created');
    }
    return dbData;
  } catch (error) {
    console.error('❌ Error loading database:', error);
    dbData = { ...defaultData };
    return dbData;
  }
}

// 保存数据
export function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Error saving database:', error);
    return false;
  }
}

// 获取数据
export function getDatabase() {
  return dbData;
}

// 自动保存（每60秒）
setInterval(() => {
  saveDatabase();
}, 60000);

// 进程退出时保存
process.on('exit', () => {
  saveDatabase();
});

process.on('SIGINT', () => {
  saveDatabase();
  process.exit();
});
