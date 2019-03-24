const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Event = require('../models/event');
const Booking = require('../models/booking');
const User = require('../models/user');

const { transformBooking, transformEvent } = require('./merge');

const queries = {
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
  },
  login: async (parent, { email, password }) => {
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error('User does not exist!');
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      throw new Error('Password is incorrect!');
    }
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      'somesupersecretkey',
      {
        expiresIn: '1h'
      }
    );
    return { userId: user.id, token: token, tokenExpiration: 1 };
  }
};

module.exports = queries;