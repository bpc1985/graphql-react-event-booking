import React from 'react';
import PropTypes from 'prop-types';

import './EventItem.css';

const EventItem = ({currentUser, event, onDetail}) => (
  <li key={event._id} className="events__list-item">
    <div>
      <h1>{event.title}</h1>
      <h2>
        ${event.price} - {new Date(event.date).toLocaleDateString()}
      </h2>
    </div>
    <div>
      {currentUser && (currentUser._id === event.creator._id) ? (
        <span>Owner of this event </span>
      ) : (
        null
      )}
      <button className="btn" onClick={() => {onDetail(event)}}>
        View Details
      </button>
    </div>
  </li>
);

EventItem.propTypes = {
  event: PropTypes.object.isRequired,
  currentUser: PropTypes.object,
  onDetail: PropTypes.func.isRequired
}

export default EventItem;
