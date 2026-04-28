const UserRepository = require("./modules/user/user.repository");
const UserService = require("./modules/user/user.service");

const LockService = require("./infrastructure/redis/lock.service");

const BookingService = require("./modules/booking/booking.service");

const container = () => {
  // ======================
  // User Module
  // ======================
  const userRepository = new UserRepository();

  const userService = new UserService({
    userRepository,
  });

  // ======================
  // Redis Layer
  // ======================
  const lockService = new LockService();

  // ======================
  // Booking Module
  // ======================
  const bookingService = new BookingService({
    lockService,
  });

  return {
    userService,
    bookingService,
  };
};

module.exports = container;