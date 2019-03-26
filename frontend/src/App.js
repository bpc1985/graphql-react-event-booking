import React, { Component } from 'react';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom';
import { ApolloProvider } from 'react-apollo';
import ApolloClient from 'apollo-boost';

import AuthPage from './pages/Auth';
import BookingsPage from './pages/Bookings';
import EventsPage from './pages/Events';
import MainNavigation from './components/Navigation/MainNavigation';

import './App.css';

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

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <ApolloProvider client={createClient()}>
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
