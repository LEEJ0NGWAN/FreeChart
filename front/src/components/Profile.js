import React, { Component } from 'react';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { clearError } from '../actions/common';
import { 
    modifyUsername, modifyPassword, deleteUser } from '../actions/api';
import { deleteCookie } from '../utils';

function checkUsername(username) {
    let regExp =  /^[\wㄱ-ㅎㅏ-ㅣ가-힣]+$/;

    return regExp.test(username);
}

function checkPassword(password) {
    let regExp = /^[\w!@#$%^*+=-]+$/;

    return regExp.test(password);
}

class Profile extends Component {
    state = {
        selectedEditOption: null,
        editValue: "",
        editMsg: "",
        readyToProcess: false,
        signOutSelected: false
    }

    componentDidUpdate(prevProps, prevStates) {
        if (!prevStates.selectedEditOption && 
            this.state.selectedEditOption) {
            this.editInput.focus();
        }

        if (!prevStates.signOutSelected && 
            this.state.signOutSelected) {
            this.editInput.focus();
        }

        if (!prevProps.error_msg && this.props.error_code) {
            this.setState({
                readyToProcess: false,
                editMsg: (this.props.error_msg === "password")?
                    "비밀번호가 틀렸습니다": "[ERROR CODE] " + this.props.error_code,
                editValue: ""
            });
            this.props.clearError();
        }

        if (prevProps.user && !this.props.user) {
            this.props.togglePop();
        }
    }

    escape = () => {
        if (this.state.selectedEditOption)
            return;
        this.props.togglePop();
    }

    escapeEdit = () => {
        this.setState({
            selectedEditOption: null,
            editValue: "",
            editMsg: "",
            readyToProcess: false
        });
    }

    escapeSignOut = () => {
        this.setState({
            editValue: "",
            editMsg: "",
            readyToProcess: false,
            signOutSelected: false });
    }
    
    changer = (event) => {
        const nextValue = event.target.value;
        let nextState = {
            editValue: nextValue
        };

        if (this.state.selectedEditOption === "1") {
            if (!nextValue.length) {
                nextState.readyToProcess = false;
                nextState.editMsg = "";
            }
            else if (checkUsername(nextValue)) {
                if (nextValue.length <= 9) {
                    nextState.readyToProcess = true;
                    nextState.editMsg = "";
                }
                else {
                    nextState.readyToProcess = false;
                    nextState.editMsg = "9자리 이하로 부탁드립니다!"
                }
            }
            else {
                nextState.readyToProcess = false;
                nextState.editMsg = "특수 문자는 안됩니다!";
            }
        }

        else {
            if (!nextValue.length) {
                nextState.readyToProcess = false;
                nextState.editMsg = "";
            }
            else if (checkPassword(nextValue)) {
                if (nextValue.length < 8) {
                    nextState.readyToProcess = false;
                    nextState.editMsg = "8자리 이상이어야 합니다!";
                }
                else if (nextValue.length <= 16) {
                    nextState.readyToProcess = true;
                    nextState.editMsg = "";
                }
                else {
                    nextState.readyToProcess = false;
                    nextState.editMsg = "16자리 이하로 부탁드립니다!";
                }
            }
            else {
                nextState.readyToProcess = false;
                nextState.editMsg = "영어,숫자,특수기호(!@#$%^*+=-)만 사용가능합니다";
            }
        }
        this.setState(nextState);
    }

    selector = (event) => {
        const id = event.target.id;
        if (!id)
            return;
        
        this.setState({selectedEditOption: id});
    }

    processor = async () => {
        if (this.state.selectedEditOption === "1") {
            if(this.state.editValue !== this.props.user.username) {
                await this.props.modifyUsername(this.state.editValue);
            }
        }

        else {
            await this.props.modifyPassword(this.state.editValue);
        }
        this.escapeEdit();
    }

    signOutProcessor = async () => {
        this.props.deleteUser(
            this.props.user.id, this.state.editValue);
        deleteCookie('boardId');
        deleteCookie('sheetId');
        deleteCookie('sheetTitle');
        deleteCookie('order');
        localStorage.clear();
    }

    renderUser() {
        if (!this.props.user){
            return;
        }

        const {username, email} = this.props.user;

        return (
            <div className="profile-user-box">
                <h3 className="profile-item">
                    {username}
                </h3>
                <label className="profile-item"
                style={{
                    fontSize: '70%',
                    color: 'darkgray'}}>
                    {email}
                </label>
            </div>
        );
    }

    renderOption() {
        return (
            <div onClick={this.selector}
            className="profile-option-box">
                <p id="1"
                className="profile-option-item">닉네임 변경</p>
                <p id="2"
                className="profile-option-item">비밀번호 변경</p>
                <p onClick={(e)=>{
                    e.stopPropagation();
                    this.setState({signOutSelected:true});}}
                className="profile-option-item">회원 탈퇴</p>
            </div>
        )
    }

    renderLogoutIcon() {
        return (<svg
        width="24" height="24" viewBox="0 0 24 24">
        <path d="M16 12.771h-3.091c-.542 0-.82-.188
        -1.055-.513l-1.244-1.674-2.029 2.199 1.008 
        1.562c.347.548.373.922.373 1.42v4.235h-1.962v
        -3.981c-.016-1.1-1.695-2.143-2.313-1.253l-1.176 
        1.659c-.261.372-.706.498-1.139.498h-3.372v
        -1.906l2.532-.001c.397 0 .741-.14.928-.586l1.126
        -2.75c.196-.41.46-.782.782-1.102l2.625-2.6
        -.741-.647c-.223-.195-.521-.277-.812-.227l
        -2.181.381-.342-1.599 2.992-.571c.561-.107 
        1.042.075 1.461.462l2.882 2.66c.456.414.924 
        1.136 1.654 2.215.135.199.323.477.766.477h2.328v1.642zm
        -2.982-5.042c1.02-.195 1.688-1.182 1.493
        -2.201-.172-.901-.96-1.528-1.845-1.528-1.186 
        0-2.07 1.078-1.85 2.234.196 1.021 1.181 1.69 
        2.202 1.495zm4.982-5.729v15l6 5v-20h-6z"/></svg>);
    }

    renderLogout() {
        return (
            <NavLink to="/logout"
            className="profile-logout"
            onClick={this.props.togglePop}>
                {this.renderLogoutIcon()}
                로그아웃
            </NavLink>
        );
    }

    renderSaveIcon() {
        return(<svg className="profile-edit-icon"
        onClick={this.processor}
        width="24" height="24" viewBox="0 0 24 24">
        <path d="M13 3h2.996v5h-2.996v-5zm11 
        1v20h-24v-24h20l4 4zm-17 
        5h10v-7h-10v7zm15-4.171l-2.828-2.829h-.172v9h-14v-9h-3v20h20v-17.171z"/>
        </svg>);
    }

    renderCheckIcon() {
        return (<svg className="profile-sign-out-icon"
        onClick={this.signOutProcessor}
        width="24" height="24" viewBox="0 0 24 24">
        <path d="M20.285 2l-11.285 11.567-5.286
        -5.011-3.714 3.716 9 8.728 15-15.285z"/></svg>);
    }

    renderEdit() {
        return (
            <div className="profile-edit-modal"
            onClick={this.escapeEdit}>
                <div className="profile-edit-box"
                onClick={e=>e.stopPropagation()}>
                    {(this.state.selectedEditOption === "1")?
                    "닉네임 변경": "비밀번호 변경"
                    }
                    <input 
                    name="editValue"
                    value={this.state.editValue}
                    autoComplete="off"
                    onChange={this.changer}
                    onKeyPress={(e)=>{
                        if (e.key === "Enter")
                            this.processor();
                    }}
                    onKeyDown={(e)=>{
                        if (e.key === "Escape")
                            this.escapeEdit();
                    }}
                    className="profile-edit-input"
                    ref={(input)=>{this.editInput = input}}/>
                    <label className="profile-edit-msg">
                        {this.state.editMsg}
                    </label>
                    {this.state.readyToProcess && this.renderSaveIcon()}
                </div>
            </div>
        )
    }

    renderSignOut() {
        return (
            <div className="profile-sign-out-modal"
            onClick={e=>{
                e.stopPropagation();
                this.escapeSignOut();}}>
                <div 
                className="profile-sign-out-box"
                onClick={e=>e.stopPropagation()}>
                    회원 탈퇴
                    <input 
                    name="editValue"
                    type="password"
                    value={this.state.editValue}
                    autoComplete="off"
                    onChange={this.changer}
                    onKeyPress={(e)=>{
                        if (e.key === "Enter")
                            this.signOutProcessor();
                    }}
                    onKeyDown={(e)=>{
                        if (e.key === "Escape")
                            this.escapeEdit();
                    }}
                    className="profile-edit-input"
                    placeholder="비밀번호를 입력해주세요"
                    ref={(input)=>{this.editInput = input}}/>
                    <label className="profile-edit-msg">
                        {this.state.editMsg}
                    </label>
                    {this.state.readyToProcess && this.renderCheckIcon()}
                </div>
            </div>
        );
    }

    render() {
        return(
            <div 
            className="profile-modal" 
            onClick={this.escape}>
                {this.state.signOutSelected && this.renderSignOut()}
                {this.state.selectedEditOption && this.renderEdit()}
                <div
                className="profile-modal-content"
                onClick={(e)=>{e.stopPropagation();}}>
                    {this.renderUser()}
                    {this.renderOption()}
                    {this.renderLogout()}
                </div>
            </div>
        )
    }
}

export default connect((state) => {
    return {
        user: state.userReducer.user,
        error_code: state.commonReducer.error_code,
        error_msg: state.commonReducer.error_msg
    };
}, { modifyUsername, modifyPassword, deleteUser, clearError })(Profile);

