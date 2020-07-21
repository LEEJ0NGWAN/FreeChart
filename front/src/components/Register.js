import React, { Component } from 'react';
import { connect } from 'react-redux';
import { check } from '../actions/api';

class Register extends Component {
    state = {
        email: "",
        password: "",
        username: "",
        error: "",
        email_msg: "",
        password_msg: "",
        username_msg: "",
    };

    changer = (event) => {
        let nextState = {};
        nextState[event.target.name] = event.target.value;
        this.setState(nextState);
    }

    checker = (event) => {
        const {email, username} = this.state;
        if (!email.length && !username.length) return;
        if (event.target.name == 'email' && email.length)
            this.props.check(email);

        if (event.target.name == 'username' && username.length)
            this.props.check(null,username);
    }

    componentDidMount() {
        const {logged, history} = this.props;
        if (logged) history.push('/');
    }

    componentDidUpdate(prevProps, prevStates) {
        const { error, password } = this.state;
        const {
            history, error_msg, error_code,
            email_validity, username_validity, } = this.props;

        // if (!prevProps.logged && this.props.logged){
        //     localStorage.setItem(
        //         'user',
        //         JSON.stringify(this.props.user)
        //     );
        //     history.push('/'); // 루트 페이지로 이동
        // }

        let nextState = {};
        if (!error && error_code) {
            nextState.error = error_msg?
                error_msg: "[ERROR] "+ error_code;
        }
        // todo checker로 뺴기
        if (email_validity != null && !email_validity)
            nextState.email_msg = "이미 존재하는 이메일입니다!";
        else if (!prevProps.email_validity && email_validity)
            nextState.email_msg = "가능한 이메일 입니다!";

        if (username_validity != null && !username_validity)
            nextState.username_msg = "이미 존재하는 닉네임입니다!";
        else if (!prevProps.username_validity && username_validity)
            nextState.username_msg = "가능한 닉네임 입니다!";

        if (password.length && password.length < 8)
            nextState.password_msg = "8자리 이상이어야 합니다!";
        else if (prevStates.password.length < 8 && password.length >= 8)
            nextState.password_msg = "";

        console.log(nextState);
        // if (Object.keys(nextState).length)
        //     this.setState(nextState);
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
                    <label>email</label><br/>
                    <input
                    name="email"
                    type="text"
                    className="register"
                    onChange={this.changer}
                    value={this.state.email}/>
                    <button
                    name="email"
                    onClick={this.checker}>중복 검사</button>
                    {this.state.email_msg}<br/>
                </div>
                <div className="input-field username">
                    <label>username</label><br/>
                    <input
                    name="username"
                    type="text"
                    className="register"
                    onChange={this.changer}
                    value={this.state.username}/>
                    <button
                    name="username"
                    onClick={this.checker}>중복 검사</button>
                    {this.state.username_msg}<br/>
                </div>
                <div className="input-field password">
                    <label>password</label><br/>
                    <input
                    name="password"
                    type="password"
                    className="register"
                    onChange={this.changer}
                    value={this.state.password}/>
                    {this.state.password_msg}<br/>
                </div>
            </div>
        );

        return (
            <div className="loginView">
                <div className="row">
                    {inputs}
                    {/* <button className="waves-effect waves-light btn"
                        onClick={this.processer}>로그인</button> */}
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
      email_validity: state.checkReducer.email_validity,
      username_validity: state.checkReducer.username_validity,
      error_msg: state.commonReducer.error_msg,
      error_code: state.commonReducer.error_code,
    };
  }, { check })(Register);

