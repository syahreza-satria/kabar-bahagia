import "server-only";
import { randomBytes } from "node:crypto";

// tanpa karakter yang mudah tertukar (0/o, 1/l/i)
const CODE_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

/** ID acak berbasis crypto (bukan Math.random). */
export function randomId(length: number, alphabet = CODE_ALPHABET) {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

/** Kode tamu pada link personal (`?to=kode`). */
export const generateGuestCode = () => randomId(8);

/** Token rahasia halaman rekap klien (`/r/{token}`). */
export const generateClientToken = () => randomId(24);
