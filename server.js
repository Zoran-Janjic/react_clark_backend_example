import express from "express";
import dotenv from "dotenv";

import { Webhook } from "svix";
import bodyParser from "body-parser";

dotenv.config();
const expressApp = express();
const port = process.env.PORT || 7000;

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

      const { id, ...otherAttributes } = event.data;

      if (event.type === "user.created") {
        console.log(`User is ${id} is ${event.type}`);
        console.log(`Other attributes int the event ${otherAttributes}`);
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
