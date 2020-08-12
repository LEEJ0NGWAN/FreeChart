import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Route, Switch, Redirect } from 'react-router-dom';
import Home from './Home';
import Login from './Login';
import Logout from './Logout';
import Register from './Register';
import Password from './Password';
import Profile from './Profile';
import { fetch } from '../actions/common';
import { checkSession } from '../actions/api';
import './App.css';

class App extends Component {
    state = {
        popped: false
    }

    componentDidMount() {
        this.props.checkSession();
        const {logged, history} = this.props;
        if (!logged){
            history.push('/login');
            return;
        }
    }

    togglePop = () => {
        this.setState({
            popped: !this.state.popped,
        });
    }

    renderProfileIcon() {
        return(<svg className="profile-icon"
        onClick={this.togglePop}
        width="24" height="24" viewBox="0 0 24 24">
        <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 
        12 12 12 12-5.373 12-12-5.373-12-12-12zm7.753 
        18.305c-.261-.586-.789-.991-1.871-1.241-2.293
        -.529-4.428-.993-3.393-2.945 3.145-5.942.833
        -9.119-2.489-9.119-3.388 0-5.644 3.299-2.489 
        9.119 1.066 1.964-1.148 2.427-3.393 2.945
        -1.084.25-1.608.658-1.867 1.246-1.405-1.723
        -2.251-3.919-2.251-6.31 0-5.514 4.486-10 
        10-10s10 4.486 10 10c0 2.389-.845 
        4.583-2.247 6.305z"/></svg>);
    }

    renderFreelistIcon() {
        return (<svg className="symbol"
        width="36" height="36" viewBox="0 0 24 24">
        <path d="M5 7c2.761 0 5 2.239 5 5s-2.239 
        5-5 5c-2.762 0-5-2.239-5-5s2.238-5 
        5-5zm15-4c0-1.657-1.344-3-3-3-1.657 
        0-3 1.343-3 3 0 .312.061.606.148.888l-4.209 
        3.157c.473.471.877 1.009 1.201 1.599l4.197
        -3.148c.477.317 1.048.504 1.663.504 1.656 0 
        3-1.343 3-3zm-5.852 17.112c-.087.282-.148.576
        -.148.888 0 1.657 1.343 3 3 3 1.656 0 3-1.343
        3-3s-1.344-3-3-3c-.615 0-1.186.187-1.662.504l
        -4.197-3.148c-.324.59-.729 1.128-1.201 
        1.599l4.208 3.157zm6.852-5.05c1.656 0 3-1.343 
        3-3s-1.344-3-3-3c-1.281 0-2.367.807-2.797 
        1.938h-6.283c.047.328.08.66.08 1s-.033.672-.08 
        1h6.244c.395 1.195 1.508 2.062 2.836 2.062z"/></svg>);
    }

    render() {
        return (
            <div className="App">
                {this.state.popped && 
                <Profile togglePop={this.togglePop}/>}
                {!this.props.logged &&
                <div className="App-header">
                    {this.renderFreelistIcon()}
                    <h1 style={{display: 'inline-block'}}>FreeList</h1>
                </div>}
                {this.props.logged && this.renderProfileIcon()}
                <Switch>
                    <Route exact path="/" component={Home}/>
                    <Route exact path="/login" component={Login}/>
                    <Route exact path="/logout" component={Logout}/>
                    <Route exact path="/register" component={Register}/>
                    <Route exact path="/password" component={Password}/>
                    <Redirect path="*" to="/" />
                </Switch>
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

