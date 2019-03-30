import React, { Component } from 'react';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';

import Modal from '../components/Modal/Modal';
import Backdrop from '../components/Backdrop/Backdrop';
import EventList from '../components/Events/EventList/EventList';
import Spinner from '../components/Spinner/Spinner';
import User from '../components/Navigation/User';
import ImageUpload from '../components/ImageUpload/ImageUpload';
import './Events.css';

const ALL_EVENTS_QUERY = gql`
  query ALL_EVENTS_QUERY {
    events {
      _id
      title
      description
      date
      price
      image
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
  mutation CREATE_EVENT_MUTATION ($title: String!, $description: String!, $price: Float!, $date: String!, $image: String) {
    createEvent(eventInput: {title: $title, description: $description, price: $price, date: $date, image: $image}) {
      _id
      title
      description
      date
      price
      image
    }
  }
`;

const DELETE_EVENT_MUTATION = gql`
  mutation DELETE_EVENT_MUTATION ($id: ID!) {
    deleteEvent(eventId: $id) {
      message
    }
  }
`;

const CREATE_EVENT_SUBSCRIPTION = gql`
  subscription CREATE_EVENT_SUBSCRIPTION {
    subscriptionEventAdded {
      _id
      title
      description
      date
      price
      image
      creator {
        _id
        email
      }
    }
  }
`;

const DELETE_EVENT_SUBSCRIPTION = gql`
  subscription DELETE_EVENT_SUBSCRIPTION {
    subscriptionEventDeleted {
      _id
    }
  }
`;

class EventsPage extends Component {
  state = {
    creating: false,
    selectedEvent: null,
  };

  constructor(props) {
    super(props);
    this.titleElRef = React.createRef();
    this.priceElRef = React.createRef();
    this.dateElRef = React.createRef();
    this.descriptionElRef = React.createRef();
    this.selectedPhoto = null;
  }

  _setSelectedPhoto = photoFile => {
    this.selectedPhoto = photoFile;
  }

  _uploadPhoto = async (file) => {
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', 'easyevent');

    const res = await fetch('https://api.cloudinary.com/v1_1/bpc1985/image/upload', {
      method: 'POST',
      body: data
    });
    const uploadedFile = await res.json();
    return uploadedFile.secure_url;
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
    let photoUrl = undefined;

    if (
      title.trim().length === 0 ||
      price <= 0 ||
      date.trim().length === 0 ||
      description.trim().length === 0
    ) {
      return;
    }

    if (this.selectedPhoto) {
      photoUrl = await this._uploadPhoto(this.selectedPhoto);
      console.log('photoUrl: ', photoUrl);
    }

    try {
      await callCreateEventFn({
        variables: {
          title,
          description,
          price,
          date,
          image: photoUrl
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

  deleteEventHandler = async (callDeleteEventFn, me) => {
    if (!me || !me._id) {
      this.setState({ selectedEvent: null });
      return;
    }
    try {
      await callDeleteEventFn();
      this.setState({ selectedEvent: null });
    } catch (err) {
      console.log(err);
    }
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

  _subscribeToNewEvent = subscribeToMore => {
    subscribeToMore({
      document: CREATE_EVENT_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev;
        }
        const newEvent = subscriptionData.data.subscriptionEventAdded;
        const exists = prev.events.find(event => event._id === newEvent._id);
        if (exists) {
          return prev;
        }
        return Object.assign({}, prev, {
          events: prev.events.concat(newEvent)
        });
      }
    });
  }

  _subscribeToDeletedEvent = subscribeToMore => {
    subscribeToMore({
      document: DELETE_EVENT_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev;
        }
        const deletedEventId = subscriptionData.data.subscriptionEventDeleted._id;
        const exists = prev.events.find(event => event._id === deletedEventId);
        if (exists) {
          return Object.assign({}, prev, {
            events: prev.events.filter(event => event._id !== deletedEventId)
          });
        }
        return prev;
      }
    });
  }

  render() {
    return (
      <Query query={ALL_EVENTS_QUERY}>
        {({ data, error, loading, subscribeToMore }) => {
          if (loading) return <Spinner />;
          if (error) return <p>Error: {error.message}</p>;
          this._subscribeToNewEvent(subscribeToMore);
          this._subscribeToDeletedEvent(subscribeToMore);

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
                          me={me}
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
                            <div className="form-control">
                              <label htmlFor="file">Photo</label>
                              <ImageUpload
                                id="photo"
                                setSelectedPhoto={this._setSelectedPhoto} />
                            </div>
                          </form>
                        </Modal>
                      )}
                    </Mutation>
                  )}
                  {this.state.selectedEvent && (
                    <Mutation mutation={BOOK_EVENT_MUTATION} variables={{id: this.state.selectedEvent._id}}>
                      {(callBookEventFn) => (
                        <Mutation
                          mutation={DELETE_EVENT_MUTATION}
                          variables={{id: this.state.selectedEvent._id}}
                          refetchQueries={[
                            {query: ALL_EVENTS_QUERY}
                          ]}>
                          {(callDeleteEventFn) => (
                            <Modal
                              me={me}
                              title={this.state.selectedEvent.title}
                              event={this.state.selectedEvent}
                              canCancel
                              canDelete
                              canConfirm
                              onCancel={this.modalCancelHandler}
                              onDelete={() => this.deleteEventHandler(callDeleteEventFn, me)}
                              onConfirm={() => {this.bookEventHandler(callBookEventFn, me)}}
                              confirmText={!!me ? 'Book' : 'Confirm'}
                            >
                              <h1>{this.state.selectedEvent.title}</h1>
                              <h2>
                                ${this.state.selectedEvent.price} -{' '}
                                {new Date(this.state.selectedEvent.date).toLocaleDateString()}
                              </h2>
                              <p>{this.state.selectedEvent.description}</p>
                              {this.state.selectedEvent.image &&
                                <img src={this.state.selectedEvent.image} width="450px" height="200px" alt="Preview" />}
                            </Modal>
                          )}
                        </Mutation>
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
