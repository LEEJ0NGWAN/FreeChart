import React, { Component } from 'react';
import { connect } from 'react-redux';
import { logout } from '../actions/api';
import { deleteCookie } from '../utils';

class Logout extends Component {
    componentDidMount() {
        const {logged, history} = this.props;
        if (!logged) return;

        deleteCookie('boardId');
        deleteCookie('sheetId');
        
        this.props.logout();
        history.push('/login');
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

