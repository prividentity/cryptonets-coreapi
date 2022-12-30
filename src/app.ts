import * as process from "process";

import bodyParser from "body-parser";
import dotenv from "dotenv";
import express, { Express } from "express";

import logger from "./helpers/logger";
import routes from "./routes";

/** Express App */
const app: Express = express();

/** dot env file  */
dotenv.config();
app.use((req: any, res: any, next: any) => {
  const requestHeaderOrigin = req.header("Origin");
  res.header(
    "Access-Control-Allow-Methods",
    "GET,PUT,POST,DELETE,PATCH,OPTIONS"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Cache-Control, X-Requested-With, x-api-key, x-encryption-version"
  );
  res.header("Access-Control-Allow-Origin", requestHeaderOrigin);
  next();
});
app.use(bodyParser.json({ limit: "200mb" }));
app.use(bodyParser.urlencoded({ limit: "200mb", extended: true }));

routes(app);

app.get("/", (req: any, res: any) => {
  res.send("Express + TypeScript Server");
});

app.listen(process.env.SERVER_PORT, () => {
  logger.info(
    `[server]: Server is running at http://localhost:${process.env.SERVER_PORT}`
  );
});
