import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/google", async (req, res) => {
  const { uid, displayName } = req.body; // For MVP assume verified
  const token = jwt.sign({ uid, displayName }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.json({ token });
});

export default router;
