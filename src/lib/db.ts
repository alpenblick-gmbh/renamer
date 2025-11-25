
import { openDB, DBSchema } from 'idb';

interface DirectoryDB extends DBSchema {
  directories: {
    key: string;
    value: FileSystemDirectoryHandle;
  };
}

const DB_NAME = 'renamer-db';
const STORE_NAME = 'directories';

export async function initDB() {
  return openDB<DirectoryDB>(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME);
    },
  });
}

export async function saveDirectoryHandle(name: string, handle: FileSystemDirectoryHandle) {
  const db = await initDB();
  await db.put(STORE_NAME, handle, name);
}

export async function getDirectoryHandle(name: string): Promise<FileSystemDirectoryHandle | undefined> {
  const db = await initDB();
  return db.get(STORE_NAME, name);
}

export async function getAllDirectoryHandles(): Promise<{name: string, handle: FileSystemDirectoryHandle}[]> {
    const db = await initDB();
    const keys = await db.getAllKeys(STORE_NAME);
    const values = await db.getAll(STORE_NAME);
    return keys.map((key, index) => ({ name: key, handle: values[index] }));
}
