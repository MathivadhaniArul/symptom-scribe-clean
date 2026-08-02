import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from "vitest";
import {
  setKeys,
  getKey,
  getSearchKey,
  whenKeysReady,
  encryptText,
  decryptText,
  deriveKeyFromToken,
  tokenizeText,
  deriveSeedFromPassword,
  getP2PSigningKeys,
  signPayload,
  verifyPayload,
} from "./encryption";

describe("Encryption Key Persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Seed/salt keys are namespaced per-user (SEED_KEY_PREFIX / SALT_KEY_PREFIX
    // in encryption.ts), so we can't know the exact key name ahead of time.
    // Sweep anything matching the real prefixes instead of guessing a fixed
    // key name.
    Object.keys(localStorage).forEach((key) => {
      if (
        key.startsWith("symptom_scribe_master_seed_") ||
        key.startsWith("symptom_scribe_pbkdf2_salt_")
      ) {
        localStorage.removeItem(key);
      }
    });

    localStorage.removeItem("symptom_scribe_p2p_private_key");
    localStorage.removeItem("symptom_scribe_p2p_public_key");
  });

  it("successfully encrypts and decrypts text using derived keys", async () => {
    const key = await deriveKeyFromToken("stable-master-seed", "user-123");
    const plaintext = "Sensitive health note";

    const ciphertext = await encryptText(plaintext, key);
    expect(ciphertext).toBeDefined();
    expect(ciphertext).toContain(":");

    const decrypted = await decryptText(ciphertext, key);
    expect(decrypted).toBe(plaintext);
  });

  it("resolves whenKeysReady when active keys are set", async () => {
    const key = await deriveKeyFromToken("stable-master-seed", "user-123");
    setKeys(key, key);

    const keys = await whenKeysReady();

    expect(keys.encryptionKey).toBe(key);
    expect(keys.searchKey).toBe(key);
    expect(getKey()).toBe(key);
    expect(getSearchKey()).toBe(key);
  });

  it("throws a descriptive error for malformed encrypted payloads", async () => {
    const key = await deriveKeyFromToken("stable-master-seed", "user-123");

    await expect(decryptText("not-a-valid-payload", key)).rejects.toThrow(
      "Invalid encrypted text format"
    );
  });

  it("encrypts and decrypts unicode payloads", async () => {
    const key = await deriveKeyFromToken("stable-master-seed", "user-123");
    const plaintext = "Café ☕ — 你好 — 🩺";

    const ciphertext = await encryptText(plaintext, key);
    const decrypted = await decryptText(ciphertext, key);

    expect(decrypted).toBe(plaintext);
  });

  it("fails to decrypt with the wrong key", async () => {
    const key1 = await deriveKeyFromToken("seed-a", "user-1");
    const key2 = await deriveKeyFromToken("seed-b", "user-2");

    const ciphertext = await encryptText("secret note", key1);

    await expect(decryptText(ciphertext, key2)).rejects.toThrow();
  });

  it("handles empty string roundtrip", async () => {
    const key = await deriveKeyFromToken("stable-master-seed", "user-123");

    const ciphertext = await encryptText("", key);
    const decrypted = await decryptText(ciphertext, key);

    expect(decrypted).toBe("");
  });

  it("handles large payloads", async () => {
    const key = await deriveKeyFromToken("stable-master-seed", "user-123");
    const largeText = "x".repeat(50000);

    const ciphertext = await encryptText(largeText, key);
    const decrypted = await decryptText(ciphertext, key);

    expect(decrypted).toBe(largeText);
  });

  it("tokenizes text into lowercase words, stripping punctuation", () => {
    expect(tokenizeText("Fever, Cough! and Headache.")).toEqual([
      "fever",
      "cough",
      "and",
      "headache",
    ]);

    expect(tokenizeText("")).toEqual([]);
  });

  it("derives the same seed for the same password and email regardless of email case", async () => {
    const seed1 = await deriveSeedFromPassword(
      "myPassword123",
      "User@Example.com"
    );

    const seed2 = await deriveSeedFromPassword(
      "myPassword123",
      "user@example.com"
    );

    expect(seed1).toBe(seed2);
  });

  it("signs and verifies P2P payloads, rejecting tampered ones", async () => {
    const { privateKey, publicKey } = await getP2PSigningKeys();

    const publicJwk = await crypto.subtle.exportKey("jwk", publicKey);

    const signature = await signPayload(
      "emergency-alert-data",
      privateKey
    );

    const valid = await verifyPayload(
      "emergency-alert-data",
      signature,
      publicJwk
    );

    expect(valid).toBe(true);

    const tampered = await verifyPayload(
      "tampered-data",
      signature,
      publicJwk
    );

    expect(tampered).toBe(false);
  });
});