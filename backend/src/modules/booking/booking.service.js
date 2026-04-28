const { v4: uuidv4 } = require("uuid");

class BookingService {
  constructor({ lockService, bookingRepository }) {
    this.lockService = lockService;
    this.bookingRepository = bookingRepository;
  }

  // =====================
  // HOLD
  // =====================
  async holdBooking({ userId, trainId, date, classCode, passengers }) {
    const seats = passengers.map((_, i) => `S${i + 1}`);

    const locked = await this.lockService.lockMultipleSeats({
      trainId,
      seats,
      userId,
    });

    if (!locked) {
      throw {
        status: 409,
        message: "Seats are no longer available in this class",
      };
    }

    const passengersWithSeats = passengers.map((p, i) => ({
      ...p,
      seatNo: seats[i],
    }));

    const totalFare = passengers.length * 500;

    const holdExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const booking = await this.bookingRepository.create({
      userId,
      trainId,
      trainName: "Demo Train", // TODO: fetch from train module
      date,
      departure: "16:00", // TODO
      classCode,
      passengers: passengersWithSeats,
      totalFare,
      status: "SEAT_HELD",
      holdExpiresAt,
    });

    return {
      holdId: booking._id,
      totalFare,
      ttl: holdExpiresAt.toISOString(),
    };
  }

  // =====================
  // CONFIRM (PAYMENT INIT)
  // =====================
  async initiatePayment({ holdId, userId }) {
    const booking = await this.bookingRepository.findById(holdId);

    if (!booking) {
      throw { status: 404, message: "Booking not found" };
    }

    if (booking.userId.toString() !== userId) {
      throw { status: 403, message: "Unauthorized" };
    }

    if (new Date() > booking.holdExpiresAt) {
      throw { status: 410, message: "Seat hold has expired" };
    }

    await this.bookingRepository.update(holdId, {
      status: "PAYMENT_PENDING",
    });

    return {
      paymentUrl: `https://rzp.io/l/mock_${holdId}`,
    };
  }

  // =====================
  // GET BOOKING
  // =====================
  async getBooking(id, userId) {
    const booking = await this.bookingRepository.findById(id);

    if (!booking) {
      throw { status: 404, message: "Booking not found" };
    }

    if (booking.userId.toString() !== userId) {
      throw { status: 403, message: "Unauthorized" };
    }

    return this.mapToTicket(booking);
  }

  // =====================
  // HISTORY
  // =====================
  async getHistory(userId) {
    const bookings = await this.bookingRepository.findByUser(userId);
    return bookings.map(this.mapToTicket);
  }

  // =====================
  // CANCEL
  // =====================
  async cancelBooking({ id, userId }) {
    const booking = await this.bookingRepository.findById(id);

    if (!booking) {
      throw { status: 404, message: "Booking not found" };
    }

    if (booking.status !== "CONFIRMED") {
      throw {
        status: 400,
        message: "Booking cannot be cancelled at this time",
      };
    }

    await this.bookingRepository.update(id, {
      status: "CANCELLED",
    });

    return {
      success: true,
      message: "Booking cancelled successfully",
    };
  }

  // =====================
  // RESPONSE MAPPER (VERY IMPORTANT)
  // =====================
  mapToTicket(booking) {
    return {
      id: booking._id,
      trainId: booking.trainId,
      trainName: booking.trainName,
      seatId: booking.passengers?.[0]?.seatNo || "",
      date: booking.date,
      departure: booking.departure,
      classCode: booking.classCode,
      passengers: booking.passengers,
      totalFare: booking.totalFare,
      status: booking.status,
      pnr: booking.pnr,
      ttl:
        booking.status === "SEAT_HELD"
          ? booking.holdExpiresAt?.toISOString()
          : undefined,
    };
  }
}

module.exports = BookingService;