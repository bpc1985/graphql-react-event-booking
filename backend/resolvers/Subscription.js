const {
  EVENT_ADDED_TOPIC,
  EVENT_DELETED_TOPIC,
  BOOKING_ADDED_TOPIC
} = require('./constants');

const subscriptions = {
  subscriptionEventAdded: {
    subscribe: (parent, args, { pubsub }) => {
      return pubsub.asyncIterator(EVENT_ADDED_TOPIC);
    }
  },
  subscriptionEventDeleted: {
    subscribe: (parent, args, { pubsub }) => {
      return pubsub.asyncIterator(EVENT_DELETED_TOPIC);
    }
  },
  subscriptionBookingAdded: {
    subscribe: (parent, args, { pubsub }) => {
      return pubsub.asyncIterator(BOOKING_ADDED_TOPIC);
    }
  }
};

module.exports = subscriptions;