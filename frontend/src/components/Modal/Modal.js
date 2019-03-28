import React from 'react';

import './Modal.css';

const isEventOwner = (me, event) => me && event && (me._id === event.creator._id);

const modal = props => {
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

export default modal;
