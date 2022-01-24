import { openDB, DBSchema } from 'idb';
import { fileToImage } from '../hooks/useUploader';

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

const dbPromise = openDB<MyDB>('MY_DB', 10, {
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
  return await db.put(IMAGES_TABLE_NAME, value, key);
}

export async function getAllImages() {
  const db = await dbPromise;
  const keys = await db.getAllKeys(IMAGES_TABLE_NAME);
  return await Promise.all(
    keys.map(async key => {
      const file = await db.get(IMAGES_TABLE_NAME, key)
      return await fileToImage(file!, key);
    })
  );
}

export async function removeAllImageFiles() {
  const db = await dbPromise;
  const transaction = db.transaction([IMAGES_TABLE_NAME], 'readwrite');
  await transaction.objectStore(IMAGES_TABLE_NAME).clear();
}

export async function savePdfFile(value: File, key: string) {
  const db = await dbPromise;
  return await db.put(PDFS_TABLE_NAME, value, key);
}

export async function getAllPdfFiles() {
  const db = await dbPromise;
  return await db.getAll(PDFS_TABLE_NAME);
}
