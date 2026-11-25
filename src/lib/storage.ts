import { Files } from "files-sdk";
import { neon } from "files-sdk/neon";

export const UPLOADS_BUCKET = "uploads";

function getUploadsClient() {
  if (!process.env.AWS_ENDPOINT_URL_S3 || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error("Neon Object Storage env vars (AWS_ENDPOINT_URL_S3, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY) are missing");
  }

  return new Files({
    adapter: neon({
      bucket: UPLOADS_BUCKET,
      defaultUrlExpiresIn: 3600,
    }),
  });
}

export async function uploadJournalObject(
  key: string,
  body: Buffer | Uint8Array | string,
  contentType: string
): Promise<{ key: string }> {
  const files = getUploadsClient();
  await files.upload(key, body, { contentType });
  return { key };
}

export async function getJournalObjectUrl(key: string, expiresIn = 3600): Promise<string> {
  const files = getUploadsClient();
  return files.url(key, { expiresIn });
}

export async function getJournalObjectBytes(key: string): Promise<Uint8Array> {
  const files = getUploadsClient();
  const file = await files.download(key);
  return new Uint8Array(await file.arrayBuffer());
}

export async function journalObjectExists(key: string): Promise<boolean> {
  const files = getUploadsClient();
  return files.exists(key);
}

export async function deleteJournalObject(key: string): Promise<void> {
  const files = getUploadsClient();
  await files.delete(key);
}
