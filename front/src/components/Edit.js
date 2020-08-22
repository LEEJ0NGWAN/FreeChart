import React, { Component } from 'react';
import { connect } from 'react-redux';
import { action } from '../actions/common';
import { createSheet, modifySheet, deleteSheet } from '../actions/sheet_api';
import { createBoard, modifyBoard, deleteBoard } from '../actions/board_api';

class Edit extends Component {
    state = {
        value: "",
        mode: false,
        deleteChild: true,
    }

    componentDidMount() {
        this.labelInput.focus();
        this.setState({
            value: this.props.value
        });
    }

    changer = (event) => {
        let nextState = {};
        nextState[event.target.name] = event.target.value;
        this.setState(nextState);
    }

    processor = async (mode) => {
        switch(mode) {
            case 'create':
                if (this.state.value) {
                    if (this.props.type)
                        await this.props.createSheet(
                            this.state.value, this.props.parentId);
                    else
                        await this.props.createBoard(
                            this.state.value, this.props.parentId);
                }
                break;
            case 'modify':
                if (this.state.value !== this.props.value) {
                    if (!this.state.value.length)
                        return;
                    if (this.props.type)
                        await this.props.modifySheet(
                            this.props.id, this.props.key_, 
                            this.state.value, this.props.parentId);
                    else
                        await this.props.modifyBoard(
                            this.props.id, 
                            this.props.key_, this.state.value);
                }
                break;
            case 'delete':
                if (this.props.type)
                    await this.props.deleteSheet(
                        this.props.id, this.props.key_);
                else
                    await this.props.deleteBoard(
                        this.props.id, this.props.key_,
                        !this.state.deleteChild);
                break;
            default:
                break;
        }
        this.props.escape();
    }

    renderSaveIcon() {
        return(<svg className="board-modal-icon"
        onClick={()=>{
            let option = (this.props.id)? 'modify': 'create';
            this.processor(option);}}
        width="24" height="24" viewBox="0 0 24 24">
        <path d="M13 3h2.996v5h-2.996v-5zm11 
        1v20h-24v-24h20l4 4zm-17 
        5h10v-7h-10v7zm15-4.171l-2.828-2.829h-.172v9h-14v-9h-3v20h20v-17.171z"/>
        </svg>);
    }

    renderDeleteIcon() {
        return(<svg className="board-modal-icon"
        onClick={()=>this.setState({mode: true})}
        width="24" height="24" viewBox="0 0 24 24">
        <path d="M9 19c0 .552-.448 1-1 
        1s-1-.448-1-1v-10c0-.552.448-1 
        1-1s1 .448 1 1v10zm4 0c0 .552-.448 
        1-1 1s-1-.448-1-1v-10c0-.552.448-1 
        1-1s1 .448 1 1v10zm4 0c0 .552-.448 
        1-1 1s-1-.448-1-1v-10c0-.552.448-1 
        1-1s1 .448 1 1v10zm5-17v2h-20v-2h5.711c.9 0 
        1.631-1.099 1.631-2h5.315c0 .901.73 2 
        1.631 2h5.712zm-3 4v16h-14v-16h-2v18h18v-18h-2z"/></svg>);
    }

    renderCheckIcon() {
        return(<svg className="board-modal-icon"
        onClick={()=>this.processor('delete')}
        width="24" height="24" viewBox="0 0 24 24">
        <path d="M20.285 2l-11.285 11.567-5.286
        -5.011-3.714 3.716 9 8.728 15-15.285z"/></svg>);
    }

    renderCancelIcon() {
        return(<svg className="board-modal-icon"
        onClick={()=>this.setState({mode: false})}
        width="24" height="24" viewBox="0 0 24 24">
        <path d="M24 20.188l-8.315-8.209 
        8.2-8.282-3.697-3.697-8.212 8.318
        -8.31-8.203-3.666 3.666 8.321 8.24
        -8.206 8.313 3.666 3.666 8.237-8.318 
        8.285 8.203z"/></svg>);
    }

    renderMoveIcon() {
        return (<svg className="board-modal-icon"
        onClick={()=>this.props.move(true)}
        width="24" height="24" viewBox="0 0 24 24">
        <path d="M24 12l-6-5v4h-5v-5h4l-5-6-5 
        6h4v5h-5v-4l-6 5 6 5v-4h5v5h-4l5 6 
        5-6h-4v-5h5v4z"/></svg>);
    }

    render() {
        const inputMode = (
            <div
            className="board-modal-content"
            onClick={(e)=>{e.stopPropagation();}}>
                <input
                className="board-modal-edit-input"
                name="value" 
                type="text"
                autoComplete="off"
                value={this.state.value}
                onChange={this.changer}
                onKeyPress={(e)=>{
                    if (e.key === "Enter") {
                        let option = (this.props.id)? 'modify': 'create';
                        this.processor(option);
                    }
                }}
                onKeyDown={(e)=>{
                    if (e.key === "Escape")
                        this.props.escape();
                }}
                ref={(input)=>{this.labelInput = input}}/>
                {this.renderSaveIcon()}
                {this.props.id && this.renderMoveIcon()}
                {this.props.id && this.renderDeleteIcon()}
            </div>);
        const deleteMode = (
            <div
            className="board-modal-content"
            onClick={(e)=>{e.stopPropagation();}}>
                <p className="delete-label">삭제하시겠습니까?</p>
                <div className="delete-select-box">
                {this.renderCheckIcon()}
                {this.renderCancelIcon()}
                </div>
                {!this.props.type &&
                <label className="delete-option">
                    <input name="deleteChild"
                    onChange={
                        ()=>this.setState({
                            deleteChild:!this.state.deleteChild})}
                    type="checkbox" defaultChecked="true"/>
                    폴더 내부 파일 제거
                </label>}
            </div>);
        return(
            <div 
            className="board-modal" 
            onClick={()=>{this.props.escape();}}>
                {this.state.mode? deleteMode: inputMode}
            </div>
        );
    }
}

export default connect((state) => {
    return {
        board: state.boardReducer.board,
        success: state.boardReducer.success
    };
}, { action, createBoard, modifyBoard, deleteBoard, 
    createSheet, modifySheet, deleteSheet })(Edit);

