import React, { Component } from 'react';
import { connect } from 'react-redux';
import { NavLink, Route, Switch, Redirect } from 'react-router-dom';
import Home from './Home';
import Login from './Login';
import Logout from './Logout';
import Register from './Register';
import Password from './Password';
import { fetch } from '../actions/common';
import { checkSession } from '../actions/api';
import './App.css';

class App extends Component {
    componentDidMount() {
        this.props.checkSession();
        const {logged, history} = this.props;
        if (!logged){
            history.push('/login');
            return;
        }
    }

    renderUser() {
        const {user} = this.props;
        if (!user)
            return;
        return user.username;
    }

    render() {
        const user = (
            <div className="user-menu">
            {this.renderUser()}
            <button className="item" style={{position:"absolute", right:"1%"}}>
            <NavLink to="/logout" 
            style={{textDecoration:'none'}}>로그아웃</NavLink>
            </button>
            </div>
        )
        return (
            <div className="App">
                {!this.props.logged &&
                <div className="App-header">
                    <h1>FreeList</h1>
                </div>}
                <div className="content-wrapper">
                    {this.props.logged && user}
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

