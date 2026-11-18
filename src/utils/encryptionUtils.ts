function stringToArrayBuffer(str: string): ArrayBuffer {
  return new TextEncoder().encode(str);
}

// Generate a secure, user-specific encryption key
async function generateEncryptionKey(userId: string): Promise<CryptoKey> {
  const passphrase = `your-app-encryption-${userId}`; // Use unique app-specific salt
  const salt = stringToArrayBuffer("your-supabase-app-salt");
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    stringToArrayBuffer(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// Encrypt sensitive data
export async function encryptData(
  data: string,
  userId: string
): Promise<string> {
  const key = await generateEncryptionKey(userId);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    stringToArrayBuffer(data)
  );
  const combinedBuffer = new Uint8Array(
    iv.byteLength + encryptedBuffer.byteLength
  );
  combinedBuffer.set(iv);
  combinedBuffer.set(new Uint8Array(encryptedBuffer), iv.byteLength);
  return btoa(String.fromCharCode(...combinedBuffer));
}

// Decrypt sensitive data
export async function decryptData(
  encryptedData: string,
  userId: string
): Promise<string> {
  const key = await generateEncryptionKey(userId);
  const combinedBuffer = Uint8Array.from(atob(encryptedData), (char) =>
    char.charCodeAt(0)
  );
  const iv = combinedBuffer.slice(0, 12);
  const encryptedBytes = combinedBuffer.slice(12);
  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    encryptedBytes
  );
  return new TextDecoder().decode(decryptedBuffer);
}
