import { openDB, type DBSchema } from "idb";
import type { PhotoRecord } from "./types";

const DB_NAME = "frameguide";
const STORE = "photos" as const;

interface FrameGuideDB extends DBSchema {
  photos: {
    key: string;
    value: PhotoRecord;
    indexes: { createdAt: number };
  };
}

async function db() {
  return openDB<FrameGuideDB>(DB_NAME, 1, {
    upgrade(database: any) {
      if (!database.objectStoreNames.contains(STORE)) {
        const store = database.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("createdAt", "createdAt");
      }
    },
  });
}

export async function savePhoto(photo: PhotoRecord) {
  return (await db()).put(STORE, photo);
}

export async function listPhotos(): Promise<PhotoRecord[]> {
  const items = await (await db()).getAll(STORE);
  return items.sort((a: PhotoRecord, b: PhotoRecord) => b.createdAt - a.createdAt);
}

export async function deletePhoto(id: string) {
  return (await db()).delete(STORE, id);
}

export async function updateAiReview(id: string, aiReview: string) {
  const database = await db();
  const photo = await database.get(STORE, id);
  if (!photo) return;
  photo.aiReview = aiReview;
  await database.put(STORE, photo);
}
