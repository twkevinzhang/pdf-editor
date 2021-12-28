import { openDB, DBSchema } from 'idb';

const IMAGES_TABLE_NAME = 'images';
interface MyDB extends DBSchema {
  [IMAGES_TABLE_NAME]: {
    key: string;
    value: File;
  };
}

const dbPromise = openDB<MyDB>('MY_DB', 2, {
  upgrade(db, oldVersion, newVersion, transaction) {
    db.createObjectStore(IMAGES_TABLE_NAME);
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

export async function saveFile(file: File, name: string) {
  const db = await dbPromise;
  await db.put(IMAGES_TABLE_NAME, file, name);
}

export async function getAllFile() {
  const db = await dbPromise;
  return await db.getAll(IMAGES_TABLE_NAME);
}
