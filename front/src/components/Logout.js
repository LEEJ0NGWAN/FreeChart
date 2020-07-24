import React, { Component } from 'react';
import { connect } from 'react-redux';
import { logout } from '../actions/api';

class Logout extends Component {
    componentDidMount() {
        const {logged} = this.props;
        if (!logged) return;

        this.props.logout();
    }

    componentDidUpdate() {
        const {history} = this.props;

        if (!this.props.logged){
            localStorage.removeItem('user');
            localStorage.removeItem('root');
            history.push('/');
        }
    }

    render() {
        return (
            <div>
            <h2>logout</h2>
            <ul>
                로그아웃
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
}, { logout })(Logout);

