import React, { Component } from 'react';
import { connect } from 'react-redux';
import { logout } from '../actions/api';

class Logout extends Component {
    componentDidMount() {
        this.props.logout();
    }
  
    renderUser() {
        return JSON.stringify(this.props.user);
    }
  
    render() {
        return (
            <div>
            <h2>logout</h2>
            <ul>
                {this.renderUser()}
            </ul>
            </div>
        );
    }
}

export default connect((state) => {
    return {
      user: state.userReducer.user
    };
  }, { logout })(Logout);

