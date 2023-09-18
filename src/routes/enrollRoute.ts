import express from "express";
import {callServer, decryptPrivateData, encryptPrivateData, processOriginalImage,} from "../utils/helperUtils";

type payload = {
    api_key: string;
    features: boolean | object[];
};

async function enrollRoute(req: any, res: any) {
    try {
        let encryptedData: string = null;
        if (!req.body.api_key) {
            return res.status(400).json({status: -1, message: "Missing api key"});
        }
        if (req.body.features) encryptedData = req.body.features;
        // Logic for handling the original image
        if (req.body.original_image) {
            await processOriginalImage(
                req.body.original_image,
                req.body.api_key,
                req.headers["x-encryption-version"],
                "enroll"
            );
        }

        const decryptedData = decryptPrivateData(
            req.body.api_key,
            encryptedData,
            req.headers["x-encryption-version"]
        );
        if (typeof decryptedData === "boolean") {
            return res.status(400).json({status: -1, message: "Encryption Failed"});
        }
        const payloadData = encryptPrivateData(decryptedData, req.headers["x-encryption-version"]);
        if (typeof payloadData === "boolean") {
            return res.status(400).json({status: -1, message: "Encryption Failed"});
        }
        const requestPayload: payload = {
            api_key: process.env.API_KEY,
            features: payloadData,
        };
        const serverResponse: any = await callServer(requestPayload, "enroll");
        if (!serverResponse) {
            return res.status(400).json({status: -1, message: "Server Error"});
        }
        const enrollResponse: any = JSON.parse(serverResponse);
        if (enrollResponse.status && enrollResponse.status !== 0) {
            if (enrollResponse.message) {
                return res.status(500).json({
                    message: enrollResponse.message,
                    status: enrollResponse.status,
                });
            }
            return res
                .status(500)
                .json({message: "Invalid Data", status: enrollResponse.status});
        }
        // Process Code logic for handling PI data
        const guid = decryptPrivateData(process.env.API_KEY, enrollResponse.guid, 2, false);
        const puid = decryptPrivateData(process.env.API_KEY, enrollResponse.puid, 2, false);
        // enrollJsonData.PI.uuid
        console.log(guid, puid);
        return res.send({status: 0, message: "Success"});
    } catch (e) {
        console.log(e);
        return res
            .status(400)
            .json({status: -1, message: "Server Error on enroll"});
    }
}

export default express.Router().post("/", enrollRoute);
