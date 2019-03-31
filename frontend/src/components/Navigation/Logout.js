import React from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import {CURRENT_USER_QUERY} from './User';

const LOGOUT_MUTATION = gql`
  mutation LOGOUT_MUTATION {
    logout {
      message
    }
  }
`;

const Logout = () => (
  <Mutation
    mutation={LOGOUT_MUTATION}
    refetchQueries={[
      {query: CURRENT_USER_QUERY}
    ]}>
    {(callLogOutFn, {error, loading}) => (
      <button onClick={callLogOutFn}>Logout</button>
    )}
  </Mutation>
);

export default Logout;