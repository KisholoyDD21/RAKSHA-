// Minimal file-backed JSON "database".
//
// Why not a real DB engine? For a hackathon-scale demo this keeps the stack
// dependency-free (no native bindings, nothing to install beyond Node),
// while still giving genuine on-disk persistence that survives a restart
// and can be inspected directly (open the .json file and read it).
//
// Swap-out path for production: the public methods below (readAll, insert,
// update, remove, find) are the only surface the rest of the app touches.
// Re-implement this file against Postgres/Mongo and nothing else changes.

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', '..', 'data');

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

function fileFor(collection) {
  return path.join(DATA_DIR, `${collection}.json`);
}

// Serialize writes per-collection so two concurrent requests can't
// interleave a read-modify-write and clobber each other. Good enough for a
// single-process demo server; a real DB would handle this for us.
const writeLocks = new Map();
async function withLock(collection, fn) {
  const prev = writeLocks.get(collection) || Promise.resolve();
  let release;
  const next = new Promise((resolve) => { release = resolve; });
  writeLocks.set(collection, prev.then(() => next));
  await prev;
  try {
    return await fn();
  } finally {
    release();
  }
}

export async function readAll(collection, defaultValue = []) {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(fileFor(collection), 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await writeAll(collection, defaultValue);
      return defaultValue;
    }
    throw err;
  }
}

export async function writeAll(collection, data) {
  await ensureDataDir();
  const tmpPath = fileFor(collection) + '.tmp';
  await fs.writeFile(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
  await fs.rename(tmpPath, fileFor(collection)); // atomic on POSIX
}

export async function insert(collection, record) {
  return withLock(collection, async () => {
    const all = await readAll(collection);
    all.push(record);
    await writeAll(collection, all);
    return record;
  });
}

export async function update(collection, id, patch) {
  return withLock(collection, async () => {
    const all = await readAll(collection);
    const idx = all.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...patch, id: all[idx].id, updatedAt: new Date().toISOString() };
    await writeAll(collection, all);
    return all[idx];
  });
}

export async function remove(collection, id) {
  return withLock(collection, async () => {
    const all = await readAll(collection);
    const next = all.filter((r) => r.id !== id);
    await writeAll(collection, next);
    return next.length !== all.length;
  });
}

export async function find(collection, predicate) {
  const all = await readAll(collection);
  return all.find(predicate) || null;
}

export async function seedIfEmpty(collection, seedData) {
  const all = await readAll(collection, []);
  if (all.length === 0 && seedData.length > 0) {
    await writeAll(collection, seedData);
    return seedData;
  }
  return all;
}
