import express from "express";
import dotenv from "dotenv";
import colors from "colors/safe.js";
import { Webhook } from "svix";
import bodyParser from "body-parser";
import DBConnectionClass from "./db/connectDB.js";

dotenv.config({ path: "./config.env" });

const expressApp = express();
const PORT = process.env.PORT || 7000;

const DatabaseConnection = new DBConnectionClass(
  process.env.ATLAS_DB_DEVELOPMENT_URI,
  process.env.ATLAS_DB_DEVELOPMENT_PASSWORD
);

// ? Catch error at startup
process.on("uncaughtException", (err) => {
  console.log(`Uncaught error occurred: ${(err.name, err.message)}`);
  console.log("Shutting down server.");
  process.exit(1);
});

DatabaseConnection.connect()
  .then(() =>
    expressApp.listen(PORT, () => {
      console.log(
        colors.bgGreen.white.bold(`App running on port ${PORT}...SERVER.JS`)
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
              console.log(
                `Event data is: Email Addresses: ${email_addresses}, First Name: ${first_name}, ID: ${id}, Image URL: ${image_url}, Last Name: ${last_name}, Profile Image URL: ${profile_image_url}`
              );
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
    })
  )
  .catch((err) => {
    console.log(
      colors.bgRed.white.bold(`Error connecting to database: ${err.message}`)
    );
  });
