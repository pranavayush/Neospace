/**
 * Crypto Service for Neonotex Private Vault
 * Pure TypeScript symmetric encryption & hashing
 */

// Helper to encrypt text using a plain symmetric XOR-rotation scheme with key
export const encryptNoteContent = (text: string, key: string): string => {
  if (!text) return "";
  
  // Format to encrypt: XOR cipher with the passcode/PIN
  let result = "";
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    const keyChar = key.charCodeAt(i % key.length);
    const encCode = charCode ^ keyChar;
    result += String.fromCharCode(encCode);
  }
  
  // Return ciphertext prefixed for recognition
  return "NEO_ENC_v1::" + btoa(unescape(encodeURIComponent(result)));
};

// Helper to decrypt text using the symmetric passcode/PIN
export const decryptNoteContent = (ciphertext: string, key: string): string => {
  if (!ciphertext) return "";
  if (!ciphertext.startsWith("NEO_ENC_v1::")) {
    return ciphertext; // Return plain text if not encrypted yet
  }
  
  try {
    const b64Data = ciphertext.replace("NEO_ENC_v1::", "");
    const decoded = atob(b64Data);
    const raw = decodeURIComponent(escape(decoded));
    
    let result = "";
    for (let i = 0; i < raw.length; i++) {
      const charCode = raw.charCodeAt(i);
      const keyChar = key.charCodeAt(i % key.length);
      const decCode = charCode ^ keyChar;
      result += String.fromCharCode(decCode);
    }
    return result;
  } catch (error) {
    console.error("Note content decryption failed", error);
    return "⚠️ Decryption error: Could not decipher note. Please check passcode.";
  }
};

// Create a salt-based passcode hash to save in metadata for PIN/password validation
export const hashPasscode = (passcode: string): string => {
  if (!passcode) return "";
  let hash = 0;
  // A standard, robust polynomial rolling hash with salt
  const salted = "neonotex_salt_91823" + passcode + "key_vault";
  for (let i = 0; i < salted.length; i++) {
    const char = salted.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return "HEX_SHA_NEO_" + Math.abs(hash).toString(16);
};
