import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    paid: { type: Boolean, default: false },
    cash: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
