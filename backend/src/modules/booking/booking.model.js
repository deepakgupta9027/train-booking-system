const mongoose = require("mongoose");

const passengerSchema = new mongoose.Schema({
  name: String,
  age: Number,
  gender: String,
  seatNo: String,
});

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },

    trainId: { type: String, required: true },
    trainName: String,

    date: String,
    departure: String,

    classCode: String,

    passengers: [passengerSchema],

    totalFare: Number,

    status: {
      type: String,
      enum: [
        "SEAT_HELD",
        "PAYMENT_PENDING",
        "CONFIRMED",
        "RAC",
        "WAITLISTED",
        "CANCELLED",
      ],
      default: "SEAT_HELD",
    },

    holdExpiresAt: Date,
    pnr: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);