class BookingController {
  constructor(bookingService) {
    this.bookingService = bookingService;
  }

  holdBooking = async (req, res, next) => {
    try {
      const result = await this.bookingService.holdBooking({
        userId: req.user.id,
        ...req.body,
      });

      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  confirmBooking = async (req, res, next) => {
    try {
      const result = await this.bookingService.initiatePayment({
        holdId: req.params.holdId,
        userId: req.user.id,
      });

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  getBooking = async (req, res, next) => {
    try {
      const data = await this.bookingService.getBooking(
        req.params.id,
        req.user.id
      );

      res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  };

  getHistory = async (req, res, next) => {
    try {
      const data = await this.bookingService.getHistory(req.user.id);
      res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  };

  cancelBooking = async (req, res, next) => {
    try {
      const result = await this.bookingService.cancelBooking({
        id: req.params.id,
        userId: req.user.id,
      });

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };
}

module.exports = BookingController;