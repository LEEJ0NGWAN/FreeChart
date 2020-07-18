import React, { Component } from 'react';
import { NavLink, Route, Switch } from 'react-router-dom';
import Home from './Home';

// TODO: 사용자 컴포넌트 및 로그인 구현
// import Login from '../containers/Login';

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
                        {/* <li><NavLink to="/login">로그인</NavLink></li> */}
                    </ul>
                    <switch>
                        <Route exact path="/" component={Home}/>
                        {/* <Route exact path="/login" component={Login}/> */}
                    </switch>
                </div>
            </div>
        );
    }
}

export default App;

