import React, { Component } from 'react';
import { connect } from 'react-redux';
import { login } from '../actions/api';

class Login extends Component {
    state = {
        email: "",
        password: "",
        error: null,
    };

    changer = (event) => {
        let nextState = {};
        nextState[event.target.name] = event.target.value;
        this.setState(nextState);
    }

    processer = () => {
        const {email, password} = this.state;

        if (!email.length || !password.length) return;

        this.props.login(email, password);
        this.setState({password:""});
    }

    componentDidMount() {
        const {logged, history} = this.props;
        if (logged) history.push('/');
    }

    componentDidUpdate(prevProps, prevStates) {
        const {history, msg, code} = this.props;

        if (!prevProps.logged && this.props.logged){
            localStorage.setItem(
                'user',
                JSON.stringify(this.props.user)
            );
            history.push('/'); // 루트 페이지로 이동
        }

        if (!this.state.error && code){
            this.setState({
                error: msg? msg: "[ERROR] "+ code
            });
        }
    }
  
    render() {
        const error = (
            <label>
                <b>{this.state.error}</b>
            </label>
        );
        const inputs = (
            <div>
                <div className="input-field email">
                    <label>email</label>
                    <input
                    name="email"
                    type="text"
                    className="login"
                    onChange={this.changer}
                    value={this.state.email}/>
                </div>
                <div className="input-field password">
                    <label>password</label>
                    <input
                    name="password"
                    type="password"
                    className="login"
                    onChange={this.changer}
                    value={this.state.password}/>
                </div>
            </div>
        );

        return (
            <div className="loginView">
                <div className="row">
                    {inputs}
                    <button className="waves-effect waves-light btn"
                        onClick={this.processer}>로그인</button>
                </div>
                {error}
            </div>
        );
    }
}

export default connect((state) => {
    return {
      user: state.userReducer.user,
      logged: state.userReducer.logged,
      msg: state.userReducer.msg,
      code: state.userReducer.code
    };
  }, { login })(Login);

