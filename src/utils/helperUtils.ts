import * as fs from "fs";
import path from "path";
import * as process from "process";

import { PNG } from "pngjs";
import request from "request-promise";

import { decrypt } from "./privid_crypto";

export const decryptNativeEmbedding = (
  apiKey: string,
  encryptedData: string,
  encryptionVersion: number,
  parseJson = true
): any | boolean => {
  const decryptedData: string | boolean = decrypt(apiKey, encryptedData);
  if (typeof decryptedData == "boolean") {
    return decryptedData;
  }

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
      uri: `${process.env.PI_SERVER_1FA}/${mode}`,
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": process.env.API_KEY,
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
  mode: string
): Promise<void> => {
  // Logic for handling the original image from the payload
  try {
    const binaryImage: Buffer = Buffer.from(originalImageJSON.data, "base64");
    const timestampNow: number = Date.parse(new Date().toString());
    const img_png: PNG = new PNG({
      width: originalImageJSON.width,
      height: originalImageJSON.height,
      inputColorType: 2,
    });
    img_png.data = Buffer.from(binaryImage);
    img_png
      .pack()
      .pipe(
        fs.createWriteStream(
          `${path.resolve(
            process.cwd(),
            "src/images"
          )}/${mode}_${timestampNow}.png`
        )
      );
  } catch (e) {
    console.log(e);
  }
};
