import React from 'react';
import PropTypes from 'prop-types';

import './BookingList.css';

const BookingList = props => (
  <ul className="bookings__list">
    {props.bookings.map(booking => {
      return (
        <li key={booking._id} className="bookings__item">
          <div className="bookings__item-data">
            {booking.event.title} -{' '}
            {new Date(booking.createdAt).toLocaleDateString()}
          </div>
          <div className="bookings__item-actions">
            <button className="btn" onClick={() => props.onDelete(booking._id)}>Cancel</button>
          </div>
        </li>
      );
    })}
  </ul>
);

BookingList.propTypes = {
  bookings: PropTypes.array,
  onDelete: PropTypes.func.isRequired
}

export default BookingList;
