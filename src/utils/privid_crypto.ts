/* eslint-disable new-cap */
import ffi from "ffi-napi";

function is_hexadecimal(str) {
  const regexp = /^[0-9a-fA-F]+$/;
  return !!regexp.test(str);
}

const lib = ffi.Library(`${__dirname}/privid_crypto.so`, {
  privid_crypto_enc: [
    "int",
    ["char *", "int", "char *", "int", "char *", "int", "int"],
  ],
  privid_crypto_dec: [
    "int",
    ["char *", "int", "char *", "int", "char *", "int", "int"],
  ],
});

export const encrypt = (
  key: string,
  text: string,
  encryptionVersion = 2
): string | boolean => {
  if (!key || !key.length) {
    return false;
  }

  const keyBuffer: Buffer = Buffer.alloc(key.length, 0);
  keyBuffer.write(key, 0);

  const outputBuffer: Buffer = Buffer.alloc(text.length + 128);
  const input_text: Buffer = Buffer.from(text, "utf8");
  if (input_text.length <= 0) {
    return false;
  }

  const result: number = lib.privid_crypto_enc(
    keyBuffer,
    key.length,
    input_text,
    input_text.length,
    outputBuffer,
    outputBuffer.length,
    encryptionVersion
  );

  try {
    return outputBuffer.slice(0, result).toString("hex");
  } catch (e) {
    console.log("Error", e);
  }
  return false;
};

export const decrypt = (
  key: string,
  encrypted: string,
  encryptionVersion = 2
): string | boolean => {
  if (!key || !key.length) {
    return false;
  }

  const keyBuffer: Buffer = Buffer.alloc(key.length, 0);
  keyBuffer.write(key, 0);
  if (!is_hexadecimal(encrypted)) {
    return false;
  }

  const encryptedInput: Buffer = Buffer.from(encrypted, "hex");

  if (encryptedInput.length <= 0) {
    return false;
  }

  const outputBuffer: Buffer = Buffer.alloc(encryptedInput.length + 128);
  const result: number = lib.privid_crypto_dec(
    keyBuffer,
    key.length,
    encryptedInput,
    encryptedInput.length,
    outputBuffer,
    outputBuffer.length,
    encryptionVersion
  );

  try {
    return outputBuffer.slice(0, result).toString("utf8");
  } catch (e) {
    console.log("Error", e);
  }
  return false;
};
