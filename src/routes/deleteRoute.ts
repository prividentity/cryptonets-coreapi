import express from "express";
import request from "request-promise";

import { decryptNativeEmbedding } from "../utils/helperUtils";

async function deleteRoute(req: any, res: any) {
  try {
    if (!req.body.api_key) {
      return res.status(400).json({ status: -1, message: "Missing api key" });
    }
    if (!req.body.uuid) {
      return res.status(400).json({ status: -1, message: "Missing UUID" });
    }
    const decryptedData = decryptNativeEmbedding(
      req.body.api_key,
      req.body.uuid,
      req.headers["x-encryption-version"],
      false
    );
    if (typeof decryptedData === "boolean") {
      return res.status(400).json({ status: -1, message: "Encryption Failed" });
    }
    const result: any = await request({
      method: "post",
      uri: `${process.env.PI_SERVER_1FA}/delete_subject`,
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": process.env.API_KEY,
      },
      body: JSON.stringify({
        api_key: process.env.API_KEY,
        uuid: decryptedData,
      }),
    });
    const resultParsed: any = JSON.parse(result);
    if ("status" in resultParsed && resultParsed.status.toString() === "0") {
      return res.json(resultParsed);
    }
    return res.status(400).json({ status: -1, message: "Delete Failed" });
  } catch (e) {
    console.log(e);
    return res
      .status(400)
      .json({ status: -1, message: "Failed to check api key" });
  }
}
export default express.Router().post("/", deleteRoute);
