import mongoose from "mongoose";

const VisitSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      required: true,
    },
    visitorEmail: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    visitedEmail: {
      type: String,
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const Visit = mongoose.models?.Visit || mongoose.model("Visit", VisitSchema);

export default Visit;