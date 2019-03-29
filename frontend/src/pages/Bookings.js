import React, { Component } from 'react';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';

import PleaseSignIn from '../components/Navigation/PleaseSignIn';
import Spinner from '../components/Spinner/Spinner';
import BookingList from '../components/Bookings/BookingList/BookingList';
import BookingsChart from '../components/Bookings/BookingsChart/BookingsChart';
import BookingsControls from '../components/Bookings/BookingsControls/BookingsControls';

const ALL_BOOKINGS_QUERY = gql`
  query ALL_BOOKINGS_QUERY {
    bookings {
      _id
      createdAt
      event {
        _id
        title
        date
        price
      }
    }
  }
`;

const CANCEL_BOOKING_MUTATION = gql`
  mutation CANCEL_BOOKING_MUTATION($id: ID!) {
    cancelBooking(bookingId: $id) {
      _id
      title
    }
  }
`;

const CREATE_BOOKING_SUBSCRIPTION = gql`
  subscription CREATE_BOOKING_SUBSCRIPTION {
    subscriptionBookingAdded {
      _id,
      createdAt
      event {
        _id
        title
        date
        price
      }
      user {
        _id
        email
      }
    }
  }
`;

const DELETED_BOOKING_SUBSCRIPTION = gql`
  subscription DELETED_BOOKING_SUBSCRIPTION {
    subscriptionBookingsDeleted {
      _id
    }
  }
`;

class BookingsPage extends Component {
  state = {
    outputType: 'list'
  };

  deleteBookingHandler = async (callCancelBookingFn, bookingId) => {
    try {
      await callCancelBookingFn({
        variables: {
          id: bookingId
        }
      })
    } catch (err) {
      console.log(err);
    }
  };

  changeOutputTypeHandler = outputType => {
    if (outputType === 'list') {
      this.setState({ outputType: 'list' });
    } else {
      this.setState({ outputType: 'chart' });
    }
  };

  _subscribeToNewBooking = subscribeToMore => {
    subscribeToMore({
      document: CREATE_BOOKING_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev;
        }
        const newBooking = subscriptionData.data.subscriptionBookingAdded;
        const exists = prev.bookings.find(booking => booking._id === newBooking._id);
        if (exists) {
          return prev;
        }
        return Object.assign({}, prev, {
          bookings: prev.bookings.concat(newBooking)
        });
      }
    });
  }

  _subscribeToDeletedBookings = subscribeToMore => {
    subscribeToMore({
      document: DELETED_BOOKING_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev;
        }
        const deletedBookingIds = subscriptionData.data.subscriptionBookingsDeleted;
        if (deletedBookingIds === undefined || deletedBookingIds.length === 0) {
          return prev;
        }
        const ids = deletedBookingIds.map(b => b._id);
        return Object.assign({}, prev, {
          bookings: prev.bookings.filter(booking => !ids.includes(booking._id))
        });
      }
    });
  }

  render() {
    return (
      <PleaseSignIn>
        <Query query={ALL_BOOKINGS_QUERY}>
          {({data, loading, error, subscribeToMore}) => {
            if (loading) return <Spinner />;
            if (error) return <p>Error: {error.message}</p>;
            this._subscribeToNewBooking(subscribeToMore);
            this._subscribeToDeletedBookings(subscribeToMore);

            return (
              <Mutation
                mutation={CANCEL_BOOKING_MUTATION}
                refetchQueries={[
                  {query: ALL_BOOKINGS_QUERY}
                ]}>
                {(callCancelBookingFn, {loading, error}) => (
                  <React.Fragment>
                    <BookingsControls
                      activeOutputType={this.state.outputType}
                      onChange={this.changeOutputTypeHandler}
                    />
                    <div>
                      {this.state.outputType === 'list' ? (
                        <BookingList
                          bookings={data.bookings}
                          onDelete={(bookingId) => this.deleteBookingHandler(callCancelBookingFn, bookingId)}
                        />
                      ) : (
                        <BookingsChart bookings={data.bookings} />
                      )}
                    </div>
                  </React.Fragment>
                )}
              </Mutation>
            );
          }}
        </Query>
      </PleaseSignIn>
    );
  }
}

export default BookingsPage;
