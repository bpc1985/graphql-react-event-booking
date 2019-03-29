import React from 'react';
import { NavLink } from 'react-router-dom';
import Logout from './Logout';
import User from './User';
import './MainNavigation.css';

const mainNavigation = props => (
  <header className="main-navigation">
    <div className="main-navigation__logo">
      <h1>EasyEvent</h1>
    </div>
    <nav className="main-navigation__items">
      <User>
      {({data: {me}}) => (
        <ul>
          <li>
            { me && <span>{me.email}</span> }
            <NavLink to="/events">Events</NavLink>
          </li>
          {!me
            ? <React.Fragment>
                <li>
                  <NavLink to="/auth">Authenticate</NavLink>
                </li>
              </React.Fragment>
            : <React.Fragment>
                <li>
                  <NavLink to="/bookings">Bookings</NavLink>
                </li>
                <li>
                  <Logout />
                </li>
              </React.Fragment>
          }
        </ul>
      )}
      </User>
    </nav>
  </header>
);

export default mainNavigation;
