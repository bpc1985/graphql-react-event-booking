const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Event = require('../models/event');
const Booking = require('../models/booking');
const User = require('../models/user');

const { transformBooking, transformEvent } = require('./merge');
const {
  EVENT_ADDED_TOPIC,
  EVENT_DELETED_TOPIC,
  BOOKING_ADDED_TOPIC,
  BOOKINGS_DELETED_TOPIC
} = require('./constants');

const mutations = {
  login: async (parent, { email, password }, context) => {
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
      { expiresIn: '7d' }
    );
    // set JWT as a cookie on the response
    context.response.cookie('token', token, {
      httpOnly: true, // flags the cookie to be accessible only by web server
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 year cookie
    });
    return { userId: user.id, token: token, tokenExpiration: 1 };
  },
  logout(parent, args, context, info) {
    context.response.clearCookie('token');
    return {
      message: 'Logged out!'
    };
  },
  createUser: async (parent, args, context) => {
    try {
      const existingUser = await User.findOne({ email: args.userInput.email });
      if (existingUser) {
        throw new Error('User exists already.');
      }
      const hashedPassword = await bcrypt.hash(args.userInput.password, 12);

      const user = new User({
        email: args.userInput.email,
        password: hashedPassword
      });

      const result = await user.save();
      // create JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        'somesupersecretkey',
        { expiresIn: '7d' }
      );
      // set JWT as a cookie on the response
      context.response.cookie('token', token, {
        httpOnly: true, // flags the cookie to be accessible only by web server
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days cookie
      });
      return { ...result._doc, password: null, _id: result.id };
    } catch (err) {
      throw err;
    }
  },
  createEvent: async (parent, args, context) => {
    if (!context.request.isAuth) {
      throw new Error('Unauthenticated!');
    }
    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date),
      creator: context.request.userId
    });
    let createdEvent;
    try {
      const result = await event.save();
      createdEvent = transformEvent(result);
      const creator = await User.findById(context.request.userId);

      if (!creator) {
        throw new Error('User not found.');
      }
      creator.createdEvents.push(event);
      await creator.save();
      context.pubsub.publish(EVENT_ADDED_TOPIC, {subscriptionEventAdded: createdEvent});
      return createdEvent;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  deleteEvent: async (parent, args, context) => {
    if (!context.request.isAuth) {
      throw new Error('Unauthenticated!');
    }

    const creator = await User.findById(context.request.userId);
    creator.createdEvents = creator.createdEvents.filter(eventId => eventId != args.eventId);
    await creator.save();

    const fetchedEvent = await Event.findById(args.eventId);
    await fetchedEvent.remove();

    const bookings = await Booking.find({event: fetchedEvent});
    const bookingIDs = bookings.map(booking => booking._id);
    await Booking.deleteMany({ _id: { $in: bookingIDs }});

    context.pubsub.publish(EVENT_DELETED_TOPIC, {subscriptionEventDeleted: fetchedEvent});
    context.pubsub.publish(BOOKINGS_DELETED_TOPIC, {subscriptionBookingsDeleted: bookings});

    return {
      message: `Event ${args.eventId} has been deleted!`
    };
  },
  bookEvent: async (parent, args, context) => {
    if (!context.request.isAuth) {
      throw new Error('Unauthenticated!');
    }
    const fetchedEvent = await Event.findOne({ _id: args.eventId });
    const booking = new Booking({
      user: context.request.userId,
      event: fetchedEvent._id
    });
    const result = await booking.save();
    const createdBooking = transformBooking(result);
    context.pubsub.publish(BOOKING_ADDED_TOPIC, {subscriptionBookingAdded: createdBooking});
    return createdBooking;
  },
  cancelBooking: async (parent, args, context) => {
    if (!context.request.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const booking = await Booking.findById(args.bookingId).populate('event');
      const event = transformEvent(booking.event);
      await Booking.deleteOne({ _id: args.bookingId });
      return event;
    } catch (err) {
      throw err;
    }
  }
};

module.exports = mutations;