// AES-GCM encryption using a key derived from an EVM address string

function hexToBytes(hex: string): Uint8Array {
  const n = hex.startsWith('0x') ? hex.slice(2) : hex;
  const bytes = new Uint8Array(n.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(n.substr(i * 2, 2), 16);
  }
  return bytes;
}

async function deriveKeyFromAddress(addr: string): Promise<CryptoKey> {
  // Use the 20-byte address as raw material; HKDF-like simple expansion with SHA-256
  const raw = hexToBytes(addr);
  const base = await crypto.subtle.importKey('raw', raw, 'HKDF', false, ['deriveKey']);
  const salt = new Uint8Array(16); // zeros, deterministic per session
  const info = new TextEncoder().encode('rememberpass-aes');
  const key = await crypto.subtle.deriveKey(
    { name: 'HKDF', hash: 'SHA-256', salt, info },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
  return key;
}

export async function encryptStringWithKey(plain: string, addr: string): Promise<string> {
  const key = await deriveKeyFromAddress(addr);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new TextEncoder().encode(plain);
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
  const buf = new Uint8Array(iv.length + new Uint8Array(ct).length);
  buf.set(iv, 0);
  buf.set(new Uint8Array(ct), iv.length);
  return btoa(String.fromCharCode(...buf));
}

export async function decryptStringWithKey(cipherB64: string, addr: string): Promise<string> {
  const key = await deriveKeyFromAddress(addr);
  const raw = Uint8Array.from(atob(cipherB64), (c) => c.charCodeAt(0));
  const iv = raw.slice(0, 12);
  const ct = raw.slice(12);
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
  return new TextDecoder().decode(pt);
}

