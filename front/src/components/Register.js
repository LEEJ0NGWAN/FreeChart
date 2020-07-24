import React, { Component } from 'react';
import { connect } from 'react-redux';
import { clear, clearError } from '../actions/common';
import { check, register_ } from '../actions/api';
import { NavLink } from 'react-router-dom';

function checkEmail(email) {
    let regExp = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;

    return regExp.test(email);	
}

class Register extends Component {
    state = {
        email: "",
        password: "",
        username: "",
        error: "",
        email_msg: "",
        password_msg: "",
        username_msg: "",
        password_validity: false,
        email_pattern_validity: false,
    };

    changer = (event) => {
        let nextState = {};
        nextState[event.target.name] = event.target.value;
        this.setState(nextState);
    }

    email_checker = (event) => {
        const email = event.target.value;
        let nextState = {
            email: email
        };

        if (checkEmail(email)) {
            nextState.email_pattern_validity = true;
            nextState.email_msg = "";
        }
        else {
            nextState.email_pattern_validity = false;
            nextState.email_msg = "이메일 형식을 확인해주세요! [ ex: abc@abc.com ]";
        }

        this.setState(nextState);
    }
    
    password_checker = (event) => {
        const password = event.target.value;
        let nextState = {
            password: password
        };

        if (!password.length) {
            nextState.password_msg = "";
            nextState.password_validity = false;
        }

        else if (password.length && password.length < 8){
            nextState.password_msg = "8자리 이상이어야 합니다!";
            nextState.password_validity = false;
        }
            
        else if (password.length >= 8){
            nextState.password_msg = "";
            nextState.password_validity = true;
        }

        this.setState(nextState);
    }

    checker = async (event) => {
        const {email, username} = this.state;
        if (!email.length && !username.length) return;
        let nextState = {};
        
        if (event.target.name == 'email' && email.length){
            await this.props.check(email);

            if (!this.props.email_validity)
                nextState.email_msg = "이미 존재하는 이메일입니다!";
            else
                nextState.email_msg = "가능한 이메일 입니다!";
        }

        else if (event.target.name == 'username' && username.length){
            await this.props.check(null,username);

            if (!this.props.username_validity)
            nextState.username_msg = "이미 존재하는 닉네임입니다!";
            else
                nextState.username_msg = "가능한 닉네임 입니다!";
        }

        this.setState(nextState);
    }

    processor = () => {
        const {email, username, password} = this.state;
        
        if (!email.length || !password.length) {
            this.setState({
                error: "입력을 확인해주세요!"
            });
            return;
        }
        this.props.register_(email,username,password);
    }

    componentDidMount() {
        this.props.clear();
        const {logged, history} = this.props;
        if (logged) history.push('/');
    }

    componentDidUpdate(prevProps, prevStates) {
        const { history, error_msg, error_code } = this.props;

        if (!prevProps.logged && this.props.logged){
            localStorage.setItem(
                'user',
                JSON.stringify(this.props.user)
            );
            history.push('/'); // 루트 페이지로 이동
        }
        
        if (error_code) {
            let nextState = {};
            nextState.error = error_msg?
                error_msg: "[ERROR] "+ error_code;
            this.props.clearError();
            this.setState(nextState);
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
                    <label>email</label><br/>
                    <input
                    name="email"
                    type="text"
                    className="register"
                    onChange={this.email_checker}
                    value={this.state.email}/>
                    {this.state.email_pattern_validity &&
                    <button
                    name="email"
                    onClick={this.checker}>중복 검사</button>
                    }
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
                    onChange={this.password_checker}
                    value={this.state.password}/>
                    {this.state.password_msg}<br/>
                </div>
            </div>
        );
        const submitButton = (
            <button 
            className="submit-button"
            onClick={this.processor}>회원가입</button>
        )
        return (
            <div className="registerView">
                <div className="row">
                    {inputs}
                    {(this.state.email_pattern_validity &&
                    this.props.email_validity && 
                    this.props.username_validity &&
                    this.state.password_validity) && submitButton}<br/>
                    <button>
                        <NavLink to="/login"
                        style={{textDecoration:'none'}}>돌아가기</NavLink>
                    </button>
                </div><br/>
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
}, { check, register_, clearError, clear })(Register);

