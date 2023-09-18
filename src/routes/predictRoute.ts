import express from "express";

import logger from "../helpers/logger";
import {callServer, decryptPrivateData, encryptPrivateData, processOriginalImage,} from "../utils/helperUtils";

type payload = {
    api_key: string;
    features: boolean | object[];
};
function processResponse(serverResponse: any): any {
    try {
        const response = JSON.parse(serverResponse);
        if (response.PI_list && response.PI_list.length) {
            if (response.PI_list[0].PI.uuid.toString() === "-1") {
                const message = "User not enrolled";
                return {message, status: -1};
            }
            response.PI = response.PI_list[0].PI;
        }
        return response;
    } catch (e) {
        console.log(e);
        return {message: "Predict Error", status: -1};
    }
}

async function predictRoute(req: any, res: any) {
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
                "predict"
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
        const serverResponse: any = await callServer(requestPayload, "predict");
        if (!serverResponse) {
            return res.status(400).json({status: -1, message: "Server Error"});
        }
        const predictResponse: any = processResponse(serverResponse);
        if (predictResponse.status && predictResponse.status !== 0) {
            if (predictResponse.message) {
                return res.status(500).json({
                    message: predictResponse.message,
                    status: predictResponse.status,
                });
            }
            return res
                .status(500)
                .json({message: "Invalid Data", status: predictResponse.status});
        }
        // Process Code logic for handling PI data
        const guid = decryptPrivateData(process.env.API_KEY, predictResponse.guid, 2, false);
        const puid = decryptPrivateData(process.env.API_KEY, predictResponse.puid, 2, false);
        // enrollJsonData.PI.uuid
        console.log(guid, puid);
        return res.send({status: 0, message: "Success"});
    } catch (e) {
        console.log(e);
        return res
            .status(400)
            .json({status: -1, message: "Server Error on predict"});
    }
}

export default express.Router().post("/", predictRoute);
