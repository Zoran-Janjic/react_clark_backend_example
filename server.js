import express from "express";
import dotenv from "dotenv";

import { Webhook } from "svix";
import bodyParser from "body-parser";
import DBConnectionClass from "./db/connectDB";

dotenv.config({ path: "./config.env" });

const expressApp = express();
const port = process.env.PORT || 7000;

const DatabaseConnection = new DBConnectionClass(
  process.env.ATLAS_DB_DEVELOPMENT_URI,
  process.env.ATLAS_DB_DEVELOPMENT_PASSWORD
);

expressApp.post(
  "/api/webhooks",
  bodyParser.raw({ type: "application/json" }),
  (req, res) => {
    try {
      const payloadString = req.body.toString();
      const svixHeaders = req.headers;

      const WEBHOOK_SECRET = process.env.CLERK_SIGNING_SECRET;
      if (!WEBHOOK_SECRET) {
        throw new Error("You need a WEBHOOK_SECRET in your .env");
      }

      const webhook = new Webhook(WEBHOOK_SECRET);

      const event = webhook.verify(payloadString, svixHeaders);

      const eventData = event.data;

      const {
        email_addresses,
        first_name,
        id,
        image_url,
        last_name,
        profile_image_url,
      } = eventData;

      const eventType = event.type;

      if (event.type === "user.created") {
        console.log(`Event data is: ${evtData}`);
      }

      res.status(200).json({
        success: true,
        message: "Webhook verified",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

expressApp.listen(port, () => {
  console.log(`Listening on: ${port}`);
});
