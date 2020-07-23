import React, { Component } from 'react';
import { connect } from 'react-redux';
import { clearError } from '../actions/common';
import { check, passwordReset } from '../actions/api';
import { NavLink } from 'react-router-dom';

function checkEmail(email) {
    let regExp = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;

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
            nextState.email_msg = "이메일 형식을 확인해주세요! [ ex: abc@abc.com ]";
        }

        this.setState(nextState);
    }

    processor = async (event) => {
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
        this.props.clearError();
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
                    className="password"
                    onChange={this.pattern_checker}
                    value={this.state.email}/>
                    {this.state.email_msg}<br/>
                </div>
            </div>
        );
        const submitButton = (
            <button 
            className="submit-button"
            onClick={this.processor}>확인</button>
        )
        return (
            <div className="passwordView">
                <div className="row">
                    {inputs}
                    {!this.state.processed &&
                    this.state.email_pattern_validity &&
                    submitButton}<br/>
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
      email_validity: state.checkReducer.email_validity,
      error_msg: state.commonReducer.error_msg,
      error_code: state.commonReducer.error_code,
    };
}, { check, passwordReset, clearError })(Password);

