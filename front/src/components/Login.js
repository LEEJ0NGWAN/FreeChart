import React, { Component } from 'react';
import { connect } from 'react-redux';
import { login } from '../actions/api';

class Login extends Component {
    componentDidMount() {
        const {logged} = this.props;
        if (logged) return;

        this.props.login('aaa6400','6400');
    }

    componentDidUpdate() {
        const {history} = this.props;

        if (this.props.logged){
            localStorage.setItem(
                'user',
                JSON.stringify(this.props.user)
            );
            history.push('/'); // 루트 페이지로 이동
        }
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
      user: state.userReducer.user,
      logged: state.userReducer.logged
    };
  }, { login })(Login);

