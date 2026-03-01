import { KeyManagementServiceClient } from '@google-cloud/kms';

const PROJECT_ID = 'firestore-myadmin-ea6fb';
const LOCATION = 'europe-west1';
const KEYRING = 'fma-keyring';
const KEY_NAME = 'fma-credentials-key';

const kmsClient = new KeyManagementServiceClient();

const keyPath = kmsClient.cryptoKeyPath(PROJECT_ID, LOCATION, KEYRING, KEY_NAME);

/**
 * Encrypt plaintext using Google Cloud KMS.
 * @param {string} plaintext - Text to encrypt
 * @returns {Promise<string>} Base64-encoded ciphertext
 */
export async function encrypt(plaintext) {
  const [result] = await kmsClient.encrypt({
    name: keyPath,
    plaintext: Buffer.from(plaintext),
  });
  return Buffer.from(result.ciphertext).toString('base64');
}

/**
 * Decrypt ciphertext using Google Cloud KMS.
 * @param {string} ciphertextBase64 - Base64-encoded ciphertext
 * @returns {Promise<string>} Decrypted plaintext
 */
export async function decrypt(ciphertextBase64) {
  const [result] = await kmsClient.decrypt({
    name: keyPath,
    ciphertext: Buffer.from(ciphertextBase64, 'base64'),
  });
  return Buffer.from(result.plaintext).toString('utf8');
}
