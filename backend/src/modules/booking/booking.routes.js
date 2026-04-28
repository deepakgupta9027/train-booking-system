const express = require("express");
const router = express.Router();

const container = require("../../container");
const { bookingService } = container();

const BookingController = require("./booking.controller");
const authMiddleware = require("../../shared/middlewares/auth.middleware");

const controller = new BookingController(bookingService);

router.post("/hold", authMiddleware, controller.holdBooking);
router.post("/:holdId/confirm", authMiddleware, controller.confirmBooking);
router.get("/:id", authMiddleware, controller.getBooking);
router.get("/history", authMiddleware, controller.getHistory);
router.post("/:id/cancel", authMiddleware, controller.cancelBooking);

module.exports = router;