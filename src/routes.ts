import addBillingRoute from "./routes/addBillingRoute";
import checkApikeyValidRoute from "./routes/checkApikeyValidRoute";
import deleteRoute from "./routes/deleteRoute";
import enrollRoute from "./routes/enrollRoute";
import predictRoute from "./routes/predictRoute";

export default function (app: any) {
  app.use("/api-key/checkApiKeyValid", checkApikeyValidRoute);
  app.use("/addbillingrecord", addBillingRoute);
  app.use("/enroll", enrollRoute);
  app.use("/predict", predictRoute);
  app.use("/deleteUser", deleteRoute);
}
