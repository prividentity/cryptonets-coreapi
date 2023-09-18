import * as fs from "fs";
import path from "path";
import * as process from "process";

import request from "request-promise";

import logger from "../helpers/logger";

import {decrypt, encrypt} from "./privid_crypto";

export const encryptPrivateData = (
  payloadData: string,
  encryptionVersion: number,
  parseJson: boolean = true
): any | boolean => {
  try {
    const encryptedData: string | boolean = encrypt(
      process.env.API_KEY,
      parseJson ? JSON.stringify(payloadData) : payloadData,
      encryptionVersion
    );
    if (typeof encryptedData == "boolean") {
      return false;
    }
    return encryptedData;
  } catch (e) {
    return false;
  }
};

export const decryptPrivateData = (
  apiKey: string,
  encryptedData: string,
  encryptionVersion: number = 2,
  parseJson = true
): any | boolean => {
  try {
    const decryptedData: string | boolean = decrypt(
      apiKey,
      encryptedData,
      encryptionVersion
    );
    if (typeof decryptedData == "boolean") {
      return false;
    }
    if (!parseJson) return decryptedData;
    return JSON.parse(decryptedData);
  } catch (e) {
    return false;
  }
};

export const callServer = async (
  requestPayload: any,
  mode: string
): Promise<any> => {
  try {
    return await request({
      method: "post",
      uri: `${process.env.API_URL}/${mode}`,
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": process.env.API_KEY,
        "x-encryption-version": 2
      },
      body: JSON.stringify(requestPayload),
    });
  } catch (e) {
    console.log(e);
    return false;
  }
};

export const processOriginalImage = async (
  originalImageJSON: any,
  apiKey: string,
  encryptionVersion: number,
  mode: string
): Promise<void> => {
  // Logic for handling the original image from the payload
  try {
    const decryptedData: string | boolean = decrypt(
      apiKey,
      originalImageJSON.data,
      encryptionVersion
    );
    if (typeof decryptedData === "boolean") {
      logger.info("Image decryption failed.");
      return;
    }
    const binaryImage: Buffer = Buffer.from(decryptedData, "base64");
    const timestampNow: number = Date.parse(new Date().toString());
    fs.writeFileSync(`${path.resolve(
            process.cwd(),
            "src/images"
          )}/${mode}_${timestampNow}.png`, binaryImage);
  } catch (e) {
    console.log(e);
  }
};
