import initSqlJs from "sql.js";

let db = null;
let sqlPromise = null;

// Convert Uint8Array to Base64 string for localStorage
function uint8ArrayToBase64(arr) {
  let binary = "";
  const len = arr.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(arr[i]);
  }
  return window.btoa(binary);
}

// Convert Base64 string from localStorage back to Uint8Array
function base64ToUint8Array(base64) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function getDB() {
  if (db) return db;
  if (sqlPromise) return sqlPromise;

  sqlPromise = (async () => {
    const SQL = await initSqlJs({
      // // Fetch the WebAssembly file from cdnjs for reliability and performance
      // locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
      // Vite serves files from the /public directory at the root
      locateFile: (file) => `/${file}`,
    });

    const savedDbBase64 = localStorage.getItem("budget_tracker_db");
    if (savedDbBase64) {
      try {
        const binaryDb = base64ToUint8Array(savedDbBase64);
        db = new SQL.Database(binaryDb);
      } catch (err) {
        console.error(
          "Failed to load database from localStorage. Creating new DB.",
          err,
        );
        db = new SQL.Database();
      }
    } else {
      db = new SQL.Database();
    }

    // Create table if not exists with constraints
    db.run(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
        category TEXT NOT NULL,
        amount REAL NOT NULL CHECK(amount > 0),
        date TEXT NOT NULL, -- YYYY-MM-DD
        description TEXT DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Migration: add description column if database was created before this change
    try {
      db.run("ALTER TABLE transactions ADD COLUMN description TEXT DEFAULT '';");
    } catch (e) {
      // Column already exists, ignore error
    }

    // Index on date and type for fast queries
    db.run(
      `CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);`,
    );

    persistDB();
    return db;
  })();

  return sqlPromise;
}

export function persistDB() {
  if (!db) return;
  const binaryDb = db.export();
  const base64Db = uint8ArrayToBase64(binaryDb);
  localStorage.setItem("budget_tracker_db", base64Db);
}
