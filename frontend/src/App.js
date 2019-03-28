import React, { Component } from 'react';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom';
import { ApolloProvider } from 'react-apollo';
// import ApolloClient from 'apollo-boost';

import { ApolloClient } from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloLink, concat, split } from 'apollo-link';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';

import AuthPage from './pages/Auth';
import BookingsPage from './pages/Bookings';
import EventsPage from './pages/Events';
import MainNavigation from './components/Navigation/MainNavigation';

import './App.css';

/*
const createClient = () => {
  return new ApolloClient({
    uri: 'http://localhost:4444',
    request: operation => {
      operation.setContext({
        credentials: 'include'
      });
    }
  });
}
const client = createClient();
*/

const httpLink = createHttpLink({
  uri: 'http://localhost:4444'
});


const wsLink = new WebSocketLink({
  uri: `ws://localhost:4444`,
  options: {
    reconnect: true
  }
});

const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === 'OperationDefinition' && operation === 'subscription';
  },
  wsLink,
  httpLink
);

const authMiddleware = new ApolloLink((operation, forward) => {
  // add the authorization to the headers
  operation.setContext({
    credentials: 'include'
  });
  return forward(operation);
})

const client = new ApolloClient({
  link: concat(authMiddleware, link),
  cache: new InMemoryCache()
});

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <ApolloProvider client={client}>
          <MainNavigation />
          <main className="main-content">
            <Switch>
              <Redirect from="/" to="/events" exact />}
              <Route path="/events" component={EventsPage} />
              <Route exact path="/bookings" component={BookingsPage} />
              <Route path="/auth" component={AuthPage} />
            </Switch>
          </main>
        </ApolloProvider>
      </BrowserRouter>
    );
  }
}

export default App;
