import React, { Component } from 'react';
import { connect } from 'react-redux';
import { login } from '../actions/api';
import { clearError } from '../actions/common';
import { NavLink } from 'react-router-dom';
import Sheet from './Sheet';

class Login extends Component {
    state = {
        email: "",
        password: "",
        error: null,
        testMode: false
    };

    changer = (event) => {
        let nextState = {};
        nextState[event.target.name] = event.target.value;
        this.setState(nextState);
    }

    processor = () => {
        const {email, password} = this.state;

        if (!email.length || !password.length) {
            this.setState({
                error: "입력을 확인해주세요!"
            });
            return;
        }

        this.props.login(email, password);
        this.setState({password:""});
    }

    testor = () => {
        this.props.toggleLogo();
        this.setState({
            testMode: true
        });
    }

    escape = () => {
        this.props.toggleLogo();
        this.setState({
            testMode: false
        });
    }

    componentDidMount() {
        this.props.clearError();
        const {logged, history} = this.props;
        if (logged) history.push('/');
    }

    componentDidUpdate(prevProps, prevStates) {
        const {history, error_msg, error_code} = this.props;

        if (!prevProps.logged && this.props.logged){
            localStorage.setItem(
                'user',
                JSON.stringify(this.props.user)
            );
            history.push('/'); // 루트 페이지로 이동
        }
        if (error_code){
            let error;
            switch (error_code) {
                case 400:
                    if (error_msg === 'email or password error')
                        error = "이메일 또는 비밀번호 에러!";
                    else
                        error = "비밀번호가 틀렸습니다!"
                    break;
                case 404:
                    error = "가입되지 않는 이메일입니다!"; break;
                default:
                    error = "[ERROR CODE] "+error_code;
            }
            this.setState({
                error: error
            });
            this.props.clearError();
        }
    }
    render() {
        const error = (
            <div className="error-box">
                <b>{this.state.error}</b>
            </div>
        );
        const input = (
            <div className="input-box">
                <input
                name="email"
                type="text"
                className="login-input"
                placeholder="email"
                onChange={this.changer}
                value={this.state.email}/>
                <input
                name="password"
                type="password"
                className="login-input"
                placeholder="password"
                onChange={this.changer}
                onKeyPress={(e)=>{
                    if (e.key === "Enter")
                        this.processor();
                }}
                autoComplete="off"
                value={this.state.password}/>
            </div>
        )
        const loginPanel = (
            <div className="content-wrapper">
                {input}
                {error}
                <div className="button-box">
                    <p className="button-item"
                        onClick={this.processor}>로그인</p>
                    <NavLink 
                    className="button-link"
                    to="/password">비밀번호 찾기</NavLink>
                    <NavLink 
                    className="button-link"
                    to="/register">회원가입</NavLink>
                    <p
                    className="button-item"
                    style={{backgroundColor:'aliceblue'}}
                    onClick={this.testor}>체험하기</p>
                </div>
            </div>    
        )
        const testSheet = (
            <Sheet
            pwd={"체험하기"}
            testMode={true}
            escape={this.escape.bind(this)}/>
        )
        return this.state.testMode? testSheet: loginPanel;
    }
}

export default connect((state) => {
    return {
      user: state.userReducer.user,
      logged: state.userReducer.logged,
      error_msg: state.commonReducer.error_msg,
      error_code: state.commonReducer.error_code,
    };
}, { login, clearError })(Login);

