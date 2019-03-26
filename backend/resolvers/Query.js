const Event = require('../models/event');
const Booking = require('../models/booking');
const User = require('../models/user');

const { transformBooking, transformEvent } = require('./merge');

const queries = {
  me: async (parent, args, context, info) => {
    if (!context.request.userId) {
      return null;
    }
    const existingUser = await User.findOne({ _id: context.request.userId });
    return existingUser;
  },
  events: async () => {
    try {
      const events = await Event.find();
      return events.map(event => {
        return transformEvent(event);
      });
    } catch (err) {
      throw err;
    }
  },
  bookings: async (parent, args, context) => {
    if (!context.request.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const bookings = await Booking.find({user: context.request.userId});
      return bookings.map(booking => {
        return transformBooking(booking);
      });
    } catch (err) {
      throw err;
    }
  }
};

module.exports = queries;