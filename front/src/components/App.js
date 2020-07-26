import React, { Component } from 'react';
import { connect } from 'react-redux';
import { NavLink, Route, Switch, Redirect } from 'react-router-dom';
import Home from './Home';
import Login from './Login';
import Logout from './Logout';
import Register from './Register';
import Password from './Password';
import { USER, fetch } from '../actions/common';
import { checkSession } from '../actions/api';

class App extends Component {
    checkSessionInfo = async () => {
        await this.props.checkSession();

        if (this.props.expired){
            localStorage.removeItem('user');
            localStorage.removeItem('root');
        }
    }

    initializeUserInfo = async () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if(!user) return;

        await this.props.fetch(USER, user);
    }

    componentDidMount() {
        this.checkSessionInfo();
        this.initializeUserInfo();
    }

    render() {
        const logout = (
            <button className="waves-effect waves-light btn">
            <NavLink to="/logout" 
            style={{textDecoration:'none'}}>로그아웃</NavLink>
            </button>
        )
        return (
            <div className="App">
                <div className="App-header">
                    <h1>FreeList</h1>
                </div>
                <div className="content-wrapper">
                    {this.props.logged && logout}
                    <Switch>
                        <Route exact path="/" component={Home}/>
                        <Route exact path="/login" component={Login}/>
                        <Route exact path="/logout" component={Logout}/>
                        <Route exact path="/register" component={Register}/>
                        <Route exact path="/password" component={Password}/>
                        <Redirect path="*" to="/" />
                    </Switch>
                </div>
            </div>
        );
    }
}

export default connect((state) => {
    return {
      user: state.userReducer.user,
      logged: state.userReducer.logged,
      expired: state.userReducer.expired
    };
}, { fetch, checkSession })(App);

