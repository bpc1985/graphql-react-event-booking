import React, { Component } from 'react';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';

import Modal from '../components/Modal/Modal';
import Backdrop from '../components/Backdrop/Backdrop';
import EventList from '../components/Events/EventList/EventList';
import Spinner from '../components/Spinner/Spinner';
import User from '../components/Navigation/User';
import './Events.css';

const ALL_EVENTS_QUERY = gql`
  query ALL_EVENTS_QUERY {
    events {
      _id
      title
      description
      date
      price
      creator {
        _id
        email
      }
    }
  }
`;

const BOOK_EVENT_MUTATION = gql`
  mutation BOOK_EVENT_MUTATION ($id: ID!) {
    bookEvent(eventId: $id) {
      _id
      createdAt
      updatedAt
    }
  }
`;

const CREATE_EVENT_MUTATION = gql`
  mutation CREATE_EVENT_MUTATION ($title: String!, $description: String!, $price: Float!, $date: String!) {
    createEvent(eventInput: {title: $title, description: $description, price: $price, date: $date}) {
      _id
      title
      description
      date
      price
    }
  }
`;

class EventsPage extends Component {
  state = {
    creating: false,
    selectedEvent: null
  };

  constructor(props) {
    super(props);
    this.titleElRef = React.createRef();
    this.priceElRef = React.createRef();
    this.dateElRef = React.createRef();
    this.descriptionElRef = React.createRef();
  }

  startCreateEventHandler = () => {
    this.setState({ creating: true });
  };

  modalConfirmHandler = async (callCreateEventFn) => {
    this.setState({ creating: false });
    const title = this.titleElRef.current.value;
    const price = +this.priceElRef.current.value;
    const date = this.dateElRef.current.value;
    const description = this.descriptionElRef.current.value;

    if (
      title.trim().length === 0 ||
      price <= 0 ||
      date.trim().length === 0 ||
      description.trim().length === 0
    ) {
      return;
    }

    try {
      await callCreateEventFn({
        variables: {
          title,
          description,
          price,
          date
        }
      });
    } catch (err) {
      console.log(err);
    }
  };

  modalCancelHandler = () => {
    this.setState({ creating: false, selectedEvent: null });
  };

  showDetailHandler = event => {
    this.setState({ selectedEvent: event });
  };

  bookEventHandler = async (callBookEventFn, me) => {
    if (!me || !me._id) {
      this.setState({ selectedEvent: null });
      return;
    }
    try {
      await callBookEventFn();
      this.setState({ selectedEvent: null });
    } catch (err) {
      console.log(err);
    }
  };

  render() {
    return (
      <Query query={ALL_EVENTS_QUERY}>
        {({ data, error, loading }) => {
          if (loading) return <Spinner />;
          if (error) return <p>Error: {error.message}</p>;
          return (
            <User>
              {({data: {me}}) => (
                <React.Fragment>
                  {(this.state.creating || this.state.selectedEvent) && <Backdrop />}
                  {this.state.creating && (
                    <Mutation
                      mutation={CREATE_EVENT_MUTATION}
                      refetchQueries={[
                        {query: ALL_EVENTS_QUERY}
                      ]}>
                      {(callCreateEventFn, {loading, error}) => (
                        <Modal
                          title="Add Event"
                          canCancel
                          canConfirm
                          onCancel={this.modalCancelHandler}
                          onConfirm={() => this.modalConfirmHandler(callCreateEventFn)}
                          confirmText="Confirm"
                        >
                          <form>
                            <div className="form-control">
                              <label htmlFor="title">Title</label>
                              <input type="text" id="title" ref={this.titleElRef} />
                            </div>
                            <div className="form-control">
                              <label htmlFor="price">Price</label>
                              <input type="number" id="price" ref={this.priceElRef} />
                            </div>
                            <div className="form-control">
                              <label htmlFor="date">Date</label>
                              <input type="datetime-local" id="date" ref={this.dateElRef} />
                            </div>
                            <div className="form-control">
                              <label htmlFor="description">Description</label>
                              <textarea
                                id="description"
                                rows="4"
                                ref={this.descriptionElRef}
                              />
                            </div>
                          </form>
                        </Modal>
                      )}
                    </Mutation>
                  )}
                  {this.state.selectedEvent && (
                    <Mutation mutation={BOOK_EVENT_MUTATION} variables={{id: this.state.selectedEvent._id}}>
                      {(callBookEventFn, {loading, error}) => (
                        <Modal
                          title={this.state.selectedEvent.title}
                          canCancel
                          canConfirm
                          onCancel={this.modalCancelHandler}
                          onConfirm={() => {this.bookEventHandler(callBookEventFn, me)}}
                          confirmText={!!me ? 'Book' : 'Confirm'}
                        >
                          <h1>{this.state.selectedEvent.title}</h1>
                          <h2>
                            ${this.state.selectedEvent.price} -{' '}
                            {new Date(this.state.selectedEvent.date).toLocaleDateString()}
                          </h2>
                          <p>{this.state.selectedEvent.description}</p>
                        </Modal>
                      )}
                    </Mutation>
                  )}
                  {me
                    ? <div className="events-control">
                        <p>Share your own Events!</p>
                        <button className="btn" onClick={this.startCreateEventHandler}>
                          Create Event
                        </button>
                      </div>
                    : null}
                  <EventList
                    events={data.events}
                    currentUser={me}
                    onViewDetail={this.showDetailHandler}
                  />
                </React.Fragment>
              )}
            </User>
          );
        }}
      </Query>
    );
  }
}

export default EventsPage;
