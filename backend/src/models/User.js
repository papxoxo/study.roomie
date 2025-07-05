import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  displayName: String,
  photoURL: String,
});

export const User = mongoose.model("User", userSchema);
