import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  roomId: String,
  userId: String,
  focusMinutes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

sessionSchema.statics.recordFocusForRoom = async function (roomId, focus) {
  const users = await this.db.model("User").find(); // naive: add all users
  const ops = users.map(u => ({
    updateOne: {
      filter: { roomId, userId: u._id },
      update: { $inc: { focusMinutes: focus }},
      upsert: true
    }
  }));
  if (ops.length) await this.bulkWrite(ops);
};

export const Session = mongoose.model("Session", sessionSchema);
