// Polyfill para WebCrypto API no Node.js
if (!globalThis.crypto || !globalThis.crypto.subtle) {
  // @ts-ignore
  globalThis.crypto = new (require('@peculiar/webcrypto').Crypto)();
}
