const Booking = require("./booking.model");

class BookingRepository {
  async create(data) {
    return Booking.create(data);
  }

  async findById(id) {
    return Booking.findById(id);
  }

  async findByUser(userId) {
    return Booking.find({ userId })
      .sort({ createdAt: -1 })
      .lean();
  }

  async update(id, data) {
    return Booking.findByIdAndUpdate(id, data, { new: true });
  }
}

module.exports = BookingRepository;