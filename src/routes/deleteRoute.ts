import express from "express";
import request from "request-promise";

import {decryptPrivateData, encryptPrivateData} from "../utils/helperUtils";

async function deleteRoute(req: any, res: any) {
  try {
    if (!req.body.api_key) {
      return res.status(400).json({ status: -1, message: "Missing api key" });
    }
    if (!req.body.puid) {
      return res.status(400).json({ status: -1, message: "Missing PUID" });
    }
    const decryptedData = decryptPrivateData(
      req.body.api_key,
      req.body.puid,
      req.headers["x-encryption-version"],
      false
    );
    if (typeof decryptedData === "boolean") {
      return res.status(400).json({ status: -1, message: "Encryption Failed" });
    }
    const payloadData = encryptPrivateData(decryptedData, req.headers["x-encryption-version"], false);
    if (typeof payloadData === "boolean") {
        return res.status(400).json({status: -1, message: "Encryption Failed"});
    }
    const result: any = await request({
      method: "post",
      uri: `${process.env.API_URL}/deleteUser`,
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": process.env.API_KEY,
        "x-encryption-version": 2
      },
      body: JSON.stringify({
        api_key: process.env.API_KEY,
        puid: payloadData,
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
