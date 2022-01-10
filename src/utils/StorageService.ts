import { openDB, DBSchema } from 'idb';

const IMAGES_TABLE_NAME = 'imageFiles';
const PDFS_TABLE_NAME = 'pdfs';

interface MyDB extends DBSchema {
  [IMAGES_TABLE_NAME]: {
    key: string;
    value: File;
  };
  [PDFS_TABLE_NAME]: {
    key: string;
    value: File;
  };
}

const dbPromise = openDB<MyDB>('MY_DB', 3, {
  upgrade(db, oldVersion, newVersion, transaction) {
    db.createObjectStore(IMAGES_TABLE_NAME);
    db.createObjectStore(PDFS_TABLE_NAME);
  },
  blocked() {
    // …
  },
  blocking() {
    // …
  },
  terminated() {
    // …
  },
});

export async function saveImageFile(value: File, key: string) {
  const db = await dbPromise;
  await db.put(IMAGES_TABLE_NAME, value, key);
}

export async function getAllImageFiles() {
  const db = await dbPromise;
  return await db.getAll(IMAGES_TABLE_NAME);
}

export async function removeAllImageFiles() {
  const db = await dbPromise;
  await db.deleteObjectStore(IMAGES_TABLE_NAME);
  await db.createObjectStore(IMAGES_TABLE_NAME);
}

export async function savePdfFile(value: File, key: string) {
  const db = await dbPromise;
  await db.put(PDFS_TABLE_NAME, value, key);
}

export async function getAllPdfFiles() {
  const db = await dbPromise;
  return await db.getAll(PDFS_TABLE_NAME);
}

export async function removeAllPdfFiles() {
  const db = await dbPromise;
  await db.deleteObjectStore(PDFS_TABLE_NAME);
  await db.createObjectStore(PDFS_TABLE_NAME);
}
