import express from "express";

async function checkApikeyValidRoute(req: any, res: any) {
  // Code logic for handling your authentication here
  return res.json({
    message: "API Key is valid",
    status: 0,
  });
}
export default express.Router().post("/", checkApikeyValidRoute);
