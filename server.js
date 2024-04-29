import express from "express";
import dotenv from "dotenv";
import colors from "colors/safe.js";
import { Webhook } from "svix";
import bodyParser from "body-parser";
import DBConnectionClass from "./db/connectDB.js";
import User from "./models/User.js";

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
        async (req, res) => {
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

            if (event.type === "user.created") {
              await createAndSaveNewUser(eventData);
            }

            res.status(200).json({
              success: true,
              message: "Webhook verified",
            });
          } catch (error) {
            console.log(colors.bgYellow.red.bold(`App error ${error.message}`));
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

async function createAndSaveNewUser(userData) {
  const newCreatedUser = new User({
    email_address: eventData.email_addresses[0].email_address,
    first_name: eventData.first_name,
    last_name: eventData.last_name,
    clerkUserId: eventData.id,
    image_url: eventData.image_url,
    username: eventData.username,
    email_verified: eventData.email_addresses[0].verification.status,
  });

  await newCreatedUser.save();

  console.log(colors.bgGreen.white.bold(`The new user is: ${newCreatedUser}`));
}
