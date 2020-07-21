import React, { Component } from 'react';
import { connect } from 'react-redux';
import { NavLink, Route, Switch } from 'react-router-dom';
import Home from './Home';
import Login from './Login';
import Logout from './Logout';
import Register from './Register';
import { fetchUser } from '../actions/fetch';

class App extends Component {
    initializeUserInfo = async () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if(!user) return;

        await this.props.fetchUser(user);
    }
    componentDidMount() {
        this.initializeUserInfo();
    }
    render() {
        const login = (
            <li><NavLink to="/login">로그인</NavLink></li>
        )
        const logout = (
            <li><NavLink to="/logout">로그아웃</NavLink></li>
        )

        return (
            <div className="App">
                <div className="App-header">
                    <h1>자유로운 필기! FreeList!</h1>
                </div>
                <div className="content-wrapper">
                    <ul>
                        <li><NavLink exact to="/">홈</NavLink></li>
                        {this.props.logged? logout: login}
                        {!this.props.logged &&
                        <li><NavLink to="/register">회원가입</NavLink></li>
                        }
                    </ul>
                    <Switch>
                        <Route exact path="/" component={Home}/>
                        <Route exact path="/login" component={Login}/>
                        <Route exact path="/logout" component={Logout}/>
                        <Route exact path="/register" component={Register}/>
                    </Switch>
                </div>
            </div>
        );
    }
}

export default connect((state) => {
    return {
      user: state.userReducer.user,
      logged: state.userReducer.logged
    };
  }, { fetchUser })(App);

// export default App;

