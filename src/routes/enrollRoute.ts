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
    const embeddingThreshold = 50;
    const featuresArray: object[] = [];
    const embeddingsArray: number[][] = [];
    for (let i = 0; i < decryptedData.embedding_vector.length; i += 128) {
      const newArray: number[] = decryptedData.embedding_vector.slice(
        i,
        i + 128
      );
      embeddingsArray.push(newArray);
    }

    if (embeddingsArray && embeddingsArray.length >= embeddingThreshold) {
      console.log(
        `Number of embeddings before sending it:\n${embeddingsArray.length}`
      );
      for (let i = 0; i < embeddingsArray.length; i++) {
        const organizedEmbeddingsArray: object = {
          type: decryptedData.type,
          embedding_vector: embeddingsArray[i],
          name: `${decryptedData.type}_file_${i}.data`,
        };
        featuresArray.push(organizedEmbeddingsArray);
        if (i === embeddingsArray.length - 1) {
          return featuresArray;
        }
      }
    } else if (embeddingsArray) {
      logger.info(
        `Failed:Number of embeddings before sending it\n${embeddingsArray.length}`
      );
      return false;
    }
  } catch (error) {
    logger.error(error);
    return false;
  }
}

async function enrollRoute(req: any, res: any) {
  try {
    let encryptedData: string = null;
    if (!req.body.api_key) {
      return res.status(400).json({ status: -1, message: "Missing api key" });
    }
    if (req.body.features) encryptedData = req.body.features;
    // Logic for handling the original image
    if (req.body.original_image) {
      await processOriginalImage(req.body.original_image, "enroll");
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
    const serverResponse: any = await callServer(requestPayload, "enroll");
    if (!serverResponse) {
      return res.status(400).json({ status: -1, message: "Server Error" });
    }
    const enrollJsonData: any = JSON.parse(serverResponse);
    if (enrollJsonData.status && enrollJsonData.status !== 0) {
      if (enrollJsonData.message) {
        return res.status(500).json({
          message: enrollJsonData.message,
          status: enrollJsonData.status,
        });
      }
      return res
        .status(500)
        .json({ message: "Invalid Data", status: enrollJsonData.status });
    }
    // Process Code logic for handling PI data
    // enrollJsonData.PI.guid
    // enrollJsonData.PI.uuid
    console.log(enrollJsonData.PI.guid, enrollJsonData.PI.uuid);
    return res.send({ status: 0, message: "Success" });
  } catch (e) {
    console.log(e);
    return res
      .status(400)
      .json({ status: -1, message: "Server Error on enroll" });
  }
}
export default express.Router().post("/", enrollRoute);
