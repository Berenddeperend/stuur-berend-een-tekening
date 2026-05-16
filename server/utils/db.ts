import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";

const DB_PATH = resolve("./.data/db.sqlite");

let db: DatabaseSync | undefined;

export function useDb() {
  if (db) return db;

  mkdirSync(dirname(DB_PATH), { recursive: true });

  db = new DatabaseSync(DB_PATH);
  db.exec("PRAGMA journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS drawings (
      id      INTEGER PRIMARY KEY AUTOINCREMENT,
      drawing TEXT NOT NULL,
      artist  TEXT NOT NULL DEFAULT '',
      printed INTEGER NOT NULL DEFAULT 0
    )
  `);

  return db;
}
