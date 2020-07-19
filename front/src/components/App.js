import React, { Component } from 'react';
import { NavLink, Route, Switch } from 'react-router-dom';
import Home from './Home';
import Login from './Login';
import Logout from './Logout';

class App extends Component {
    render() {
        return (
            <div className="App">
                <div className="App-header">
                    <h1>자유로운 필기! FreeList!</h1>
                </div>
                <div className="content-wrapper">
                    <ul>
                        <li><NavLink exact to="/">홈</NavLink></li>
                        <li><NavLink to="/login">로그인</NavLink></li>
                        <li><NavLink to="/logout">로그아웃</NavLink></li>
                    </ul>
                    <switch>
                        <Route exact path="/" component={Home}/>
                        <Route exact path="/login" component={Login}/>
                        <Route exact path="/logout" component={Logout}/>
                    </switch>
                </div>
            </div>
        );
    }
}

export default App;

