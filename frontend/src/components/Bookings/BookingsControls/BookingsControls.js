import React from 'react';
import PropTypes from 'prop-types';

import './BookingsControls.css';

const BookingsControl = props => {
  return (
    <div className="bookings-control">
      <button
        className={props.activeOutputType === 'list' ? 'active' : ''}
        onClick={props.onChange.bind(this, 'list')}
      >
        List
      </button>
      <button
        className={props.activeOutputType === 'chart' ? 'active' : ''}
        onClick={props.onChange.bind(this, 'chart')}
      >
        Chart
      </button>
    </div>
  );
};

BookingsControl.propTypes = {
  activeOutputType: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
}

export default BookingsControl;
