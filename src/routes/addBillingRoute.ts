import express from "express";

async function addBillingRecordRoute(req: any, res: any) {
  // Code logic for handling your cache billing here
  return res.json({
    message: "Success",
    status: 0,
  });
}
export default express.Router().post("/", addBillingRecordRoute);
