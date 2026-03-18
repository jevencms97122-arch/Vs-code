import PocketBase from 'pocketbase';

export const pb = new PocketBase('http://188.115.125.74:8090/');

// --- Authentication ---

export function checkSession(): boolean {
  return localStorage.getItem('jux_session') === 'email';
}

export function clearSession(): void {
  localStorage.removeItem('jux_session');
}

// --- Email Authentication ---

export async function loginWithEmail(email: string, password: string): Promise<boolean> {
  try {
    const authData = await pb.collection('users').authWithPassword(email, password);
    localStorage.setItem('jux_session', 'email');
    return true;
  } catch (error) {
    console.error('Email login error:', error);
    return false;
  }
}


// --- Quick Code Authentication ---

export async function authenticateWithQuickCode(code: string): Promise<boolean> {
  try {
    // Vérifier si le code existe dans la collection codes
    const quickCode = await pb.collection('codes').getFirstListItem(`code_number="${code}"`);
    
    if (quickCode) {
      // Stocker l'authentification en session
      sessionStorage.setItem('jux_quick_auth', 'true');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Quick code authentication error:', error);
    return false;
  }
}

export function checkQuickAuth(): boolean {
  return sessionStorage.getItem('jux_quick_auth') === 'true';
}

export function clearQuickAuth(): void {
  sessionStorage.removeItem('jux_quick_auth');
}

// --- Folders ---

export interface PBFolder {
  id: string;
  name: string;
  parent_id: string;
  created: string;
  updated: string;
}

export async function getFolders(parentId?: string): Promise<PBFolder[]> {
  const filter = parentId ? `parent_id="${parentId}"` : 'parent_id=""';
  const records = await pb.collection('folders').getFullList<PBFolder>({
    filter,
    sort: 'name',
  });
  return records;
}

export async function getAllFolders(): Promise<PBFolder[]> {
  const records = await pb.collection('folders').getFullList<PBFolder>({
    sort: 'name',
  });
  return records;
}

export async function createFolder(name: string, parentId?: string): Promise<PBFolder> {
  return await pb.collection('folders').create<PBFolder>({
    name,
    parent_id: parentId || '',
  });
}

export async function deleteFolder(id: string): Promise<void> {
  // Delete child files and folders recursively
  const childFolders = await pb.collection('folders').getFullList({ filter: `parent_id="${id}"` });
  for (const folder of childFolders) {
    await deleteFolder(folder.id);
  }
  const childFiles = await pb.collection('files').getFullList({ filter: `folder_id="${id}"` });
  for (const file of childFiles) {
    await pb.collection('files').delete(file.id);
  }
  await pb.collection('folders').delete(id);
}

// --- Files ---

export interface PBFile {
  id: string;
  name: string;
  file_blob: string;
  folder_id: string;
  size: number;
  type: string;
  save_location?: string;
  favorite?: boolean;
  created: string;
  updated: string;
}

export async function getFiles(folderId?: string): Promise<PBFile[]> {
  const filter = folderId ? `folder_id="${folderId}"` : 'folder_id=""';
  const records = await pb.collection('files').getFullList<PBFile>({
    filter,
    sort: '-created',
  });
  return records;
}

export async function uploadFile(
  file: File,
  folderId?: string,
  onProgress?: (percent: number) => void
): Promise<PBFile> {
  const formData = new FormData();
  formData.append('file_blob', file);
  formData.append('name', file.name);
  formData.append('size', String(file.size));
  formData.append('type', file.type);
  if (folderId) formData.append('folder_id', folderId);

  // PocketBase SDK doesn't support progress natively, simulate
  if (onProgress) onProgress(30);
  const record = await pb.collection('files').create<PBFile>(formData);
  if (onProgress) onProgress(100);
  return record;
}

export async function deleteFile(id: string): Promise<void> {
  await pb.collection('files').delete(id);
}

export async function getFile(id: string): Promise<PBFile> {
  return await pb.collection('files').getOne<PBFile>(id);
}

export function getFileUrl(record: PBFile): string {
  return pb.files.getURL(record, record.file_blob);
}

export async function getFileContent(record: PBFile): Promise<string> {
  const url = getFileUrl(record);
  const response = await fetch(url);
  return await response.text();
}

export async function getAllImageFiles(): Promise<PBFile[]> {
  const records = await pb.collection('files').getFullList<PBFile>({
    filter: 'type~"image/"',
    sort: '-created',
  });
  return records;
}

export async function getRecentFiles(limit: number = 10): Promise<PBFile[]> {
  const records = await pb.collection('files').getList<PBFile>(1, limit, {
    sort: '-updated',
  });
  return records.items;
}

// --- Favorites ---

export async function getFavoriteFiles(): Promise<PBFile[]> {
  const records = await pb.collection('files').getFullList<PBFile>({
    filter: 'favorite=true',
    sort: '-updated',
  });
  return records;
}

export async function toggleFavorite(fileId: string): Promise<void> {
  try {
    const file = await pb.collection('files').getOne<PBFile>(fileId);
    await pb.collection('files').update(fileId, {
      favorite: !file.favorite,
    });
  } catch (err) {
    console.error('Error toggling favorite:', err);
    throw err;
  }
}

// --- Save Location (stored as plain text field in files collection) ---

export async function getFileSaveLocation(fileName: string): Promise<string | null> {
  try {
    const records = await pb.collection('files').getFullList<PBFile>({
      filter: `name="${fileName}"`,
      sort: '-updated',
    });
    return records.length > 0 ? records[0].save_location || null : null;
  } catch {
    return null;
  }
}

export async function setFileSaveLocation(fileName: string, fullPath: string): Promise<void> {
  try {
    const records = await pb.collection('files').getFullList<PBFile>({
      filter: `name="${fileName}"`,
      sort: '-updated',
    });
    
    if (records.length > 0) {
      // Update the save_location field with the full path
      await pb.collection('files').update(records[0].id, {
        save_location: fullPath,
      });
    }
  } catch (err) {
    console.error('Error setting save location:', err);
  }
}

export async function getFolderPathById(folderId: string): Promise<string> {
  if (!folderId || folderId === '__root__') return '/Racine';
  
  try {
    const path = await getFolderPath(folderId);
    return '/' + path.map(f => f.name).join('/');
  } catch {
    return '/Dossier inconnu';
  }
}

// --- Folder path (breadcrumbs) ---

export async function getFolderPath(folderId: string): Promise<PBFolder[]> {
  const path: PBFolder[] = [];
  let currentId = folderId;
  while (currentId) {
    try {
      const folder = await pb.collection('folders').getOne<PBFolder>(currentId);
      path.unshift(folder);
      currentId = folder.parent_id;
    } catch {
      break;
    }
  }
  return path;
}
