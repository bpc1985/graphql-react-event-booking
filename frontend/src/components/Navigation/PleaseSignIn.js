import React from 'react';
import {Query} from 'react-apollo';
import Auth from '../../pages/Auth';
import {CURRENT_USER_QUERY} from './User';

const PleaseSignIn = props => (
  <Query query={CURRENT_USER_QUERY}>
    {({data, loading}) => {
      if (loading) return <p>Loading...</p>
      if (!data.me) {
        return (
          <Auth />
        );
      }
      return props.children;
    }}
  </Query>
);

export default PleaseSignIn;