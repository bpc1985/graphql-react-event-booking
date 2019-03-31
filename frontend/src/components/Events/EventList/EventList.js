import React from 'react';
import PropTypes from 'prop-types';

import EventItem from './EventItem/EventItem';
import './EventList.css';

const EventList = props => {
  const {events, currentUser, onViewDetail} = props;
  const eventList = events.map(event => {
    return (
      <EventItem
        key={event._id}
        currentUser={currentUser}
        event={event}
        onDetail={onViewDetail}
      />
    );
  });

  return <ul className="event__list">{eventList}</ul>;
};

EventList.propTypes = {
  events: PropTypes.array,
  currentUser: PropTypes.object,
  onViewDetail: PropTypes.func.isRequired
}

export default EventList;
