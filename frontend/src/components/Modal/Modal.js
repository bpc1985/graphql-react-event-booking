import React from 'react';
import PropTypes from 'prop-types';

import './Modal.css';

const isEventOwner = (me, event) => me && event && (me._id === event.creator._id);

const Modal = props => {
  return (
    <div className="modal">
      <header className="modal__header">
        <h1>{props.title}</h1>
      </header>
      <section className="modal__content">{props.children}</section>
      <section className="modal__actions">
        {props.canCancel && (
          <button className="btn" onClick={props.onCancel}>
            Cancel
          </button>
        )}
        {props.canDelete && isEventOwner(props.me, props.event) && (
          <button className="btn" onClick={props.onDelete}>
            Delete
          </button>
        )}
        {props.canConfirm && props.me && !isEventOwner(props.me, props.event) && (
          <button className="btn" onClick={props.onConfirm}>
            {props.confirmText}
          </button>
        )}
      </section>
    </div>
  );
};

Modal.propTypes = {
  me: PropTypes.object,
  title: PropTypes.string,
  event: PropTypes.object,
  children: PropTypes.array.isRequired,
  canCancel: PropTypes.bool,
  onCancel: PropTypes.func,
  canDelete: PropTypes.bool,
  onDelete: PropTypes.func,
  canConfirm: PropTypes.bool,
  onConfirm: PropTypes.func,
  confirmText: PropTypes.string.isRequired
}

export default Modal;
