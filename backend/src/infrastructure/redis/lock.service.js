const redis = require("./redis.client");

class LockService {

  async lockSeat({ trainId, seatNo, userId }) {
    const key = `lock:train:${trainId}:seat:${seatNo}`;

    const result = await redis.set(
      key,
      userId,
      "NX",
      "EX",
      300 // 5 minutes
    );

    return result === "OK";
  }

  async unlockSeat({ trainId, seatNo }) {
    const key = `lock:train:${trainId}:seat:${seatNo}`;
    await redis.del(key);
  }

  async getLockOwner({ trainId, seatNo }) {
    const key = `lock:train:${trainId}:seat:${seatNo}`;
    return await redis.get(key);
  }

  // ✅ YOUR FUNCTION (FIXED + SAFE)
  async lockMultipleSeats({ trainId, seats, userId }) {
    const lockedSeats = [];

    for (let seat of seats) {
      const isLocked = await this.lockSeat({
        trainId,
        seatNo: seat,
        userId,
      });

      if (!isLocked) {
        // rollback ONLY previously locked seats
        for (let s of lockedSeats) {
          await this.unlockSeat({ trainId, seatNo: s });
        }
        return false;
      }

      lockedSeats.push(seat);
    }

    return true;
  }
}

module.exports = LockService;