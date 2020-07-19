import React, { Component } from 'react';
import { connect } from 'react-redux';
import { login } from '../actions/api';

class Login extends Component {
    componentDidMount() {
        this.props.login('aaa6400','6400');
    }
  
    renderUser() {
        return JSON.stringify(this.props.user);
    }
  
    render() {
        return (
            <div>
            <h2>login</h2>
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
  }, { login })(Login);

