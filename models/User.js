import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  first_name: { type: String, unique: true },
  last_name: { type: String, unique: false },
  email_address: { type: String, unique: true },
  username: { type: String, unique: true },
  clerkUserId: { type: String, required: true, unique: true },
  image_url: { type: String },
  email_verified: { type: String },
});

const User = mongoose.model("User", userSchema);

export default User;
