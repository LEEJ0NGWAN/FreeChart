import React, { Component } from 'react';
import { connect } from 'react-redux';
import { clear, clearError } from '../actions/common';
import { check, passwordReset } from '../actions/api';
import { NavLink } from 'react-router-dom';

function checkEmail(email) {
    let regExp = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;

    return regExp.test(email);	
}

class Password extends Component {
    state = {
        processed: false,
        error: "",
        email: "",
        email_msg: "",
        email_pattern_validity: false,
    };

    pattern_checker = (event) => {
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
    }

    processor = async () => {
        const {email} = this.state;
        if (!email.length) return;

        let nextState = {};
        

        await this.props.check(email);

        if (this.props.email_validity)
            nextState.email_msg = "회원으로 등록되지 않은 메일입니다!";
        else{
            this.props.passwordReset(email);
            nextState.processed = true;
            nextState.email_msg = "인증 메일을 보냈습니다";
        }
        this.setState(nextState);
    }

    componentDidMount() {
        this.props.clear();
        const {logged, history} = this.props;
        if (logged) history.push('/');

        this.emailInput.focus();
    }

    componentDidUpdate() {
        const { error_msg, error_code } = this.props;
        
        if (error_code) {
            let nextState = {};
            nextState.error = error_msg?
                error_msg: "[ERROR] "+ error_code;
            this.props.clearError();
            this.setState(nextState);
        }
    }

    renderSearchIcon() {
        return (<svg className="password-icon"
        onClick={this.processor}
        width="24" height="24" viewBox="0 0 24 24">
        <path d="M23.822 20.88l-6.353-6.354c.93-1.465 
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
        return (<svg className="password-icon"
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
            <div className="input-field email">
                <input
                name="email"
                type="text"
                className="email-input"
                onChange={this.pattern_checker}
                placeholder="[이메일] abc@abc.com"
                autoComplete="off"
                ref={(input)=>{this.emailInput = input}}
                onKeyPress={(e)=>{
                    if (e.key === "Enter")
                        this.processor();
                }}
                value={this.state.email}/>
                {!this.state.processed &&
                this.state.email_pattern_validity &&
                this.renderSearchIcon()}
                {this.state.processed &&
                this.state.email_pattern_validity &&
                this.renderCheckIcon()}
                <label className="message-label">
                    {this.state.email_msg}
                </label>
            </div>
        );
        return (
            <div className="content-wrapper">
                {inputs}
                <div className="button-box">
                    <NavLink to="/login" 
                    className="button-link">돌아가기</NavLink>
                </div>
            </div>
        );
    }
}

export default connect((state) => {
    return {
      email_validity: state.checkReducer.email_validity,
      error_msg: state.commonReducer.error_msg,
      error_code: state.commonReducer.error_code,
    };
}, { check, passwordReset, clearError, clear })(Password);

