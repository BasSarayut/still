import { restoreDraft, type Draft } from './model';

let database: Promise<IDBDatabase> | undefined;
let writes: Promise<void> = Promise.resolve();
const imageBuffers = new WeakMap<Blob, Promise<ArrayBuffer>>();

function openDatabase() {
  if (!database) database = new Promise((resolve, reject) => {
    const request = indexedDB.open('still-wallpaper', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('drafts');
    request.onsuccess = () => {
      request.result.onversionchange = () => { request.result.close(); database = undefined; };
      resolve(request.result);
    };
    request.onerror = () => { database = undefined; reject(request.error); };
    request.onblocked = () => { database = undefined; reject(new Error('Storage blocked')); };
  });
  return database;
}

export async function loadDraft() {
  const database = await openDatabase();
  return new Promise<Draft>((resolve, reject) => {
    const request = database.transaction('drafts').objectStore('drafts').get('latest');
    request.onsuccess = () => {
      const saved = request.result;
      if (saved && typeof saved === 'object' && saved.imageBytes instanceof ArrayBuffer) {
        saved.image = new Blob([saved.imageBytes], { type: 'image/png' });
      }
      resolve(restoreDraft(saved));
    };
    request.onerror = () => reject(request.error);
  });
}

async function persistDraft(draft: Draft) {
  const database = await openDatabase();
  let imageBytes: ArrayBuffer | null = null;
  if (draft.image) {
    let buffer = imageBuffers.get(draft.image);
    if (!buffer) { buffer = draft.image.arrayBuffer(); imageBuffers.set(draft.image, buffer); }
    imageBytes = await buffer;
  }
  return new Promise<void>((resolve, reject) => {
    const transaction = database.transaction('drafts', 'readwrite');
    const request = transaction.objectStore('drafts').put({ ...draft, image: null, imageBytes }, 'latest');
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? request.error ?? new Error('บันทึกงานไม่สำเร็จ'));
    transaction.onabort = () => reject(transaction.error ?? request.error ?? new Error('การบันทึกงานถูกยกเลิก'));
  });
}

export function saveDraft(draft: Draft) {
  const pending = writes.catch(() => {}).then(() => persistDraft(draft));
  writes = pending;
  return pending;
}
