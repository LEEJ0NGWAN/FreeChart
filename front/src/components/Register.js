import React, { Component } from 'react';
import { connect } from 'react-redux';
import { clear, clearError, action } from '../actions/common';
import { check, register_,
    CLEAR_EMAIL_VALIDITY, CLEAR_USERNAME_VALIDITY } from '../actions/api';
import { NavLink } from 'react-router-dom';

function checkEmail(email) {
    let regExp = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;

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
        let nextState = (this.state.username_msg)? {username_msg: ""}: {};
        nextState[event.target.name] = event.target.value;
        this.setState(nextState);
        this.props.action(CLEAR_USERNAME_VALIDITY);
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
            nextState.email_msg = "이메일 형식을 확인해주세요!";
        }

        this.setState(nextState);
        this.props.action(CLEAR_EMAIL_VALIDITY);
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

        const name = event.target.getAttribute('name');
        let nextState = {};
        
        if (name === 'email' && email.length){
            await this.props.check(email);

            if (!this.props.email_validity)
                nextState.email_msg = "이미 존재하는 이메일입니다!";
            else
                nextState.email_msg = "가능한 이메일 입니다!";
        }

        else if (name === 'username' && username.length){
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

    renderSearchIcon(name) {
        return (<svg className="register-icon"
        name={name}
        onClick={this.checker}
        width="24" height="24" viewBox="0 0 24 24">
        <path name={name}
        d="M23.822 20.88l-6.353-6.354c.93-1.465 
        1.467-3.2 1.467-5.059.001-5.219-4.247-9.467
        -9.468-9.467s-9.468 4.248-9.468 9.468c0 
        5.221 4.247 9.469 9.468 9.469 1.768 0 
        3.421-.487 4.839-1.333l6.396 6.396 3.119
        -3.12zm-20.294-11.412c0-3.273 2.665-5.938 
        5.939-5.938 3.275 0 5.94 2.664 5.94 5.938 0 
        3.275-2.665 5.939-5.94 5.939-3.274 0-5.939
        -2.664-5.939-5.939z"/></svg>);
    }

    renderCheckIcon() {
        return (<svg className="register-icon"
        width="24" height="24" viewBox="0 0 24 24">
        <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 
        10-10 10-10-4.486-10-10 4.486-10 10-10zm0
        -2c-6.627 0-12 5.373-12 12s5.373 12 12 12 
        12-5.373 12-12-5.373-12-12-12zm4.393 7.5l-5.643 
        5.784-2.644-2.506-1.856 1.858 4.5 4.364 
        7.5-7.643-1.857-1.857z"/></svg>);
    }
  
    render() {
        const inputs = (
            <div className="input-box">
                <div className="input-field email">
                    <input
                    name="email"
                    type="text"
                    className="register-input"
                    placeholder="[이메일] abc@abc.com"
                    onChange={this.email_checker}
                    value={this.state.email}/>
                    {(this.state.email_pattern_validity &&
                    !this.props.email_validity) && 
                    this.renderSearchIcon('email')}
                    {(this.state.email_pattern_validity &&
                    this.props.email_validity) && 
                    this.renderCheckIcon()}
                    {!this.props.email_validity && 
                    <label className="message-label">
                        {this.state.email_msg}
                    </label>}
                </div>
                <div className="input-field username">
                    <input
                    name="username"
                    type="text"
                    className="register-input"
                    placeholder="[닉네임] 깜순이"
                    onChange={this.changer}
                    value={this.state.username}/>
                    {(Boolean(this.state.username.length) &&
                    !this.props.username_validity) &&
                    this.renderSearchIcon('username')}
                    {(Boolean(this.state.username.length) &&
                    this.props.username_validity) &&
                    this.renderCheckIcon()}
                    {!this.props.username_validity && 
                    <label className="message-label">
                        {this.state.username_msg}
                    </label>}
                </div>
                <div className="input-field password">
                    <input
                    name="password"
                    type="password"
                    className="register-input"
                    placeholder="[비밀번호] 8자리 이상"
                    onChange={this.password_checker}
                    value={this.state.password}/>
                    {this.state.password_validity &&
                    this.renderCheckIcon()}
                    <label className="message-label">
                        {this.state.password_msg}
                    </label>
                </div>
            </div>
        );
        const buttons = (
            <div className="button-box">
                {this.state.email_pattern_validity &&
                this.props.email_validity && 
                this.props.username_validity &&
                this.state.password_validity &&
                <p 
                className="button-item"
                onClick={this.processor}>회원가입</p>}
                <span>
                <NavLink to="/login" 
                className="button-link">돌아가기</NavLink>
                </span>
            </div>
        );
        const error = (
            <div className="error-box">
                <b>{this.state.error}</b>
            </div>
        );
        return (
            <div className="view">
                {inputs}
                {buttons}
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
}, { check, register_, clearError, clear, action })(Register);

