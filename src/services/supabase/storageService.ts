import { isSupabaseConfigured, supabase } from './client';
import { getCurrentUser } from './authService';

export interface StorageUploadResult {
  path: string;
  storageType: 'supabase_storage' | 'local_storage';
  fileSize: number;
}

export async function uploadPrivateDocument(
  fileName: string,
  fileBytes: Buffer | Uint8Array,
  mimeType: string
): Promise<StorageUploadResult> {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('User must be authenticated to upload private documents.');
  }

  // Enforce user folder path: {user_id}/{unique_prefix}_{fileName}
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const isolatedPath = `${user.id}/${Date.now()}_${sanitizedName}`;

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(isolatedPath, fileBytes, {
        contentType: mimeType,
        upsert: false
      });

    if (error) {
      throw new Error(`Failed to upload private document to Supabase storage: ${error.message}`);
    }

    return {
      path: data.path,
      storageType: 'supabase_storage',
      fileSize: fileBytes.length
    };
  }

  // Offline / local storage mock
  return {
    path: `local_private://${isolatedPath}`,
    storageType: 'local_storage',
    fileSize: fileBytes.length
  };
}
