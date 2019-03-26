import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';

import './Auth.css';
import {CURRENT_USER_QUERY} from '../components/Navigation/User';

const LOGIN_MUTATION = gql`
  mutation LOGIN_MUTATION ($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      userId
      token
      tokenExpiration
    }
  }
`;

const CREATE_USER_MUTATION = gql`
  mutation CREATE_USER_MUTATION ($email: String!, $password: String!) {
    createUser(userInput: {email: $email, password: $password}) {
      _id
      email
    }
  }
`;

class AuthPage extends Component {
  state = {
    isLogin: true
  };

  constructor(props) {
    super(props);
    this.emailEl = React.createRef();
    this.passwordEl = React.createRef();
  }

  switchModeHandler = () => {
    this.setState(prevState => {
      return { isLogin: !prevState.isLogin };
    });
  };

  submitHandler = async (event, callLoginFn, callCreateUserFn) => {
    event.preventDefault();
    const email = this.emailEl.current.value;
    const password = this.passwordEl.current.value;

    if (email.trim().length === 0 || password.trim().length === 0) {
      return;
    }

    try {
      const callFn = this.state.isLogin ? callLoginFn : callCreateUserFn;
      const res = await callFn({
        variables: {
          email,
          password
        }
      });
      if (res.data.createUser && res.data.createUser._id) {
        this.props.history.push('/');
      }
      else if (res.data.login.token) {
        if (this.props.location && this.props.location.pathname === '/auth') {
          this.props.history.push('/');
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  render() {
    return (
      <Mutation
        mutation={LOGIN_MUTATION}
        refetchQueries={[
          {query: CURRENT_USER_QUERY}
        ]}>
      {(callLoginFn) => (
        <Mutation
          mutation={CREATE_USER_MUTATION}
          refetchQueries={[
            {query: CURRENT_USER_QUERY}
          ]}>
          {(callCreateUserFn) => (
            <form className="auth-form" onSubmit={(e) => this.submitHandler(e, callLoginFn, callCreateUserFn)}>
              <div className="form-control">
                <label htmlFor="email">E-Mail</label>
                <input type="email" id="email" ref={this.emailEl} />
              </div>
              <div className="form-control">
                <label htmlFor="password">Password</label>
                <input type="password" id="password" ref={this.passwordEl} />
              </div>
              <div className="form-actions">
                <button type="submit">Submit</button>
                <button type="button" onClick={this.switchModeHandler}>
                  Switch to {this.state.isLogin ? 'Signup' : 'Login'}
                </button>
              </div>
            </form>
          )}
        </Mutation>
      )}
      </Mutation>
    );
  }
}

export default AuthPage;
