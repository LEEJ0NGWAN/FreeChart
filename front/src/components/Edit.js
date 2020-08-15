import React, { Component } from 'react';
import { connect } from 'react-redux';
import { action } from '../actions/common';
import { createSheet, modifySheet, deleteSheet } from '../actions/sheet_api';
import { createBoard, modifyBoard, deleteBoard } from '../actions/board_api';

class Edit extends Component {
    state = {
        value: "",
        ref: React.createRef()
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
                if(this.state.value) {
                    if (this.props.type)
                        await this.props.createSheet(
                            this.state.value, this.props.parentId);
                    else
                        await this.props.createBoard(
                            this.state.value, this.props.parentId);
                }
                break;
            case 'modify':
                if(this.state.value !== this.props.value) {
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
                        this.props.id, this.props.key_);
                break;
            default:
                break;
        }
        this.props.togglePop();
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
        onClick={()=>{this.processor('delete');}}
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

    render() {
        return(
            <div 
            className="board-modal" 
            onClick={()=>{this.props.togglePop();}}>
                <div
                className="board-modal-content"
                onClick={(e)=>{e.stopPropagation();}}
                ref={this.state.ref}>
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
                            this.props.togglePop();
                    }}
                    ref={(input)=>{this.labelInput = input}}/>
                    {this.renderSaveIcon()}
                    {this.props.id && this.renderDeleteIcon()}
                </div>
            </div>
        )
    }
}

export default connect((state) => {
    return {
        board: state.boardReducer.board,
        success: state.boardReducer.success
    };
}, { action, createBoard, modifyBoard, deleteBoard, 
    createSheet, modifySheet, deleteSheet })(Edit);

