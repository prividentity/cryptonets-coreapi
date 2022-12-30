import express from "express";

import logger from "../helpers/logger";
import {
  callServer,
  decryptNativeEmbedding,
  processOriginalImage,
} from "../utils/helperUtils";
type payload = {
  api_key: string;
  features: boolean | object[];
};
function preparePayload(decryptedData: any): object[] | boolean {
  try {
    const featuresArray: object[] = [];
    const embeddingsArray: number[][] = [];
    for (let i = 0; i < decryptedData.embedding_vector.length; i += 128) {
      const newArray: number[] = decryptedData.embedding_vector.slice(
        i,
        i + 128
      );
      embeddingsArray.push(newArray);
    }

    for (let i = 0; i < embeddingsArray.length; i++) {
      const organizedEmbeddingsArray: object = {
        type: decryptedData.type,
        embedding_vector: embeddingsArray[i],
        name: `${decryptedData.type}_file_${i}.data`,
      };
      featuresArray.push(organizedEmbeddingsArray);
    }
    return featuresArray;
  } catch (error) {
    logger.error(error);
    return false;
  }
}

function processResponse(serverResponse: any): any {
  try {
    const response = JSON.parse(serverResponse);
    if (response.PI_list && response.PI_list.length) {
      if (response.PI_list[0].PI.uuid.toString() === "-1") {
        const message = "User not enrolled";
        return { message, status: -1 };
      }
      response.PI = response.PI_list[0].PI;
    }
    return response;
  } catch (e) {
    console.log(e);
    return { message: "Predict Error", status: -1 };
  }
}

async function predictRoute(req: any, res: any) {
  try {
    let encryptedData: string = null;
    if (!req.body.api_key) {
      return res.status(400).json({ status: -1, message: "Missing api key" });
    }
    if (req.body.features) encryptedData = req.body.features;
    // Logic for handling the original image
    if (req.body.original_image) {
      await processOriginalImage(
        req.body.original_image,
        req.body.api_key,
        req.headers["x-encryption-version"],
        "predict"
      );
    }

    const decryptedData = decryptNativeEmbedding(
      req.body.api_key,
      encryptedData,
      req.headers["x-encryption-version"]
    );
    if (typeof decryptedData === "boolean") {
      return res.status(400).json({ status: -1, message: "Encryption Failed" });
    }
    const payloadData = preparePayload(decryptedData);
    if (typeof payloadData === "boolean") {
      return res.status(400).json({ status: -1, message: "Enroll Failed" });
    }
    const requestPayload: payload = {
      api_key: process.env.API_KEY,
      features: payloadData,
    };
    const serverResponse: any = await callServer(requestPayload, "predict");
    if (!serverResponse) {
      return res.status(400).json({ status: -1, message: "Server Error" });
    }
    const predictJsonData: any = processResponse(serverResponse);
    if (predictJsonData.status && predictJsonData.status !== 0) {
      if (predictJsonData.message) {
        return res.status(500).json({
          message: predictJsonData.message,
          status: predictJsonData.status,
        });
      }
      return res
        .status(500)
        .json({ message: "Invalid Data", status: predictJsonData.status });
    }
    // Process Code logic for handling PI data
    // predictJsonData.PI.guid
    // predictJsonData.PI.uuid
    console.log(predictJsonData.PI.guid, predictJsonData.PI.uuid);
    return res.send({ status: 0, message: "Success" });
  } catch (e) {
    console.log(e);
    return res
      .status(400)
      .json({ status: -1, message: "Server Error on predict" });
  }
}
export default express.Router().post("/", predictRoute);
