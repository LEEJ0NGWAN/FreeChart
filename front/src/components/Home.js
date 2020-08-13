import React, { Component } from 'react';
import { connect } from 'react-redux';
import { clearError, fetch } from '../actions/common';
import { getChild } from '../actions/board_api';
import { getCookie, setCookie, deleteCookie } from '../utils';
import Sheet from './Sheet';
import Edit from './Edit';

class Home extends Component {
    state = {
        pwd: '/',
        error: null,
        popped: false,
        boardId: null,
        sheetId: null,
        targetId: null,
        targetKey: null,
        targetType: null,
        targetValue: null,
    }

    initialize = async (event) => {
        const boardId = getCookie('boardId');
        const sheetId = getCookie('sheetId');
        const sheetTitle = getCookie('sheetTitle');

        if (event){
            deleteCookie('boardId');
            deleteCookie('sheetId');
            this.props.getChild();
            this.setState({
                pwd: '/',
                boardId: null
            });
        }
        else {
            await this.props.getChild(boardId);

            let nextState = {
                boardId: boardId,
                sheetId: sheetId,
            };

            nextState.pwd = (boardId)? 
                `.../${this.props.parent.title}/`: '/';
            nextState.pwd += (sheetTitle)? sheetTitle: '';

            this.setState(nextState);
        }
    }

    componentDidMount() {
        const {logged, history} = this.props;
        if (!logged){
            history.push('/login');
            return;
        }
        this.initialize();
    }

    componentDidUpdate() {
        const {logged, history} = this.props;
        if (!logged){
            history.push('/login');
            return;
        }
    }

    back = async () => {
        await this.props.getChild(this.props.parent.parent_id);

        let nextState = {
            pwd: '/',
            boardId: null
        };
        
        if(this.props.parent){
            setCookie('boardId', this.props.parent.id);
            nextState.pwd = `.../${this.props.parent.title}/`;
            nextState.boardId = this.props.parent.id;
        }
        else
            deleteCookie('boardId');
        this.setState(nextState);
    }

    finder = async (event) => {
        const boardId = event.target.id;
        if (!boardId)
            return;
        
        const boardTitle = document
            .querySelector(`div.bs-item.board[id="${boardId}"]`)
            .getAttribute('title');

        await this.props.getChild(boardId);
        setCookie('boardId', boardId);
        this.setState({
            pwd: `.../${boardTitle}/`,
            boardId: boardId});
    }

    processer = (event) => {
        const sheetId = event.target.id;
        if (!sheetId)
            return;

        const sheetTitle = document
            .querySelector(`div.bs-item.sheet[id="${sheetId}"]`)
            .getAttribute('title');

        setCookie('sheetId', sheetId);
        setCookie('sheetTitle', sheetTitle);
        this.setState({
            pwd: this.state.pwd+sheetTitle,
            sheetId: sheetId});
    }

    togglePop = (id=null, key=null, type=null, value=null) => {
        this.setState({
            popped: !this.state.popped,
            targetId: (this.state.targetId)? null: id,
            targetKey: (this.state.targetKey)? null: key,
            targetType: (this.state.targetType)? null: type,
            targetValue: (value)? value: ""
        });
    }

    renderFolderIcon(boardId) {
        return (<svg id={boardId}
        width="24" height="24" viewBox="0 0 24 24">
        <path id={boardId}
        d="M0 10v12h24v-12h-24zm22 
        10h-20v-8h20v8zm-22-12v-6h7c1.695 
        1.942 2.371 3 4 3h13v3h-2v-1h-11c-2.34 
        0-3.537-1.388-4.916-3h-4.084v4h-2z"/></svg>);
    }

    renderNewFolderIcon() {
        return (<svg className="bs-item"
        onClick={()=>{this.togglePop(null,null,0);}}
        width="24" height="24" 
        fillRule="evenodd" clipRule="evenodd">
        <path d="M7 2c1.695 1.942 2.371 3 4 
        3h13v17h-24v-20h7zm4 5c-2.339 
        0-3.537-1.388-4.917-3h-4.083v16h20v-13h-11zm2 
        6h3v2h-3v3h-2v-3h-3v-2h3v-3h2v3z"/></svg>);
    }

    renderFileIcon(sheetId) {
        return(<svg id={sheetId}
        width="24" height="24" viewBox="0 0 24 24">
        <path id={sheetId} 
        d="M11.362 2c4.156 0 2.638 6 2.638 6s6-1.65 6 
        2.457v11.543h-16v-20h7.362zm.827-2h
        -10.189v24h20v-14.386c0-2.391-6.648
        -9.614-9.811-9.614zm4.811 13h-10v-1h10v1zm0 
        2h-10v1h10v-1zm0 3h-10v1h10v-1z"/></svg>);
    }

    renderNewFileIcon() {
        return (<svg className="bs-item"
        onClick={()=>{this.togglePop(null,null,1);}}
        width="24" height="24" viewBox="0 0 24 24">
        <path d="M23 17h-3v-3h-2v3h-3v2h3v3h2v-3h3v-2zm-7 
        5v2h-15v-24h10.189c3.163 0 9.811 7.223 9.811 
        9.614v2.386h-2v-1.543c0-4.107
        -6-2.457-6-2.457s1.518-6-2.638-6h-7.362v20h13z"/></svg>);
    }

    renderEditIcon(id, key, type, title, parentId) {
        return (<svg className="bs-item-edit" id={id}
        onClick={(e)=>{
            e.stopPropagation();
            this.togglePop(id, key, type, title, parentId);}}
        width="18" height="18" viewBox="0 0 24 24">
        <path id={id} d="M12 18c1.657 0 3 1.343 3 
        3s-1.343 3-3 3-3-1.343-3-3 1.343-3 3-3zm0-9c1.657 
        0 3 1.343 3 3s-1.343 3-3 3-3-1.343-3-3 
        1.343-3 3-3zm0-9c1.657 0 3 1.343 3 3s-1.343 
        3-3 3-3-1.343-3-3 1.343-3 3-3z"/></svg>);
    }

    renderBackIcon() {
        return(<svg className="bs-item"
        onClick={this.back}
        width="24" height="24" viewBox="0 0 24 24">
        <path d="M13.427 3.021h-7.427v-3.021l-6 5.39 6 
        5.61v-3h7.427c3.071 0 5.561 2.356 5.561 5.427 0 
        3.071-2.489 5.573-5.561 5.573h-7.427v5h7.427c5.84 0 
        10.573-4.734 10.573-10.573s-4.733-10.406-10.573-10.406z"/>
        </svg>);
    }

    renderHomeIcon() {
        return(<svg className="bs-item"
        onClick={this.initialize}
        width="24" height="24" viewBox="0 0 24 24">
        <path d="M20 7.093v-5.093h-3v2.093l3 3zm4 
        5.907l-12-12-12 12h3v10h7v-5h4v5h7v-10h3zm-5 
        8h-3v-5h-8v5h-3v-10.26l7-6.912 7 6.99v10.182z"/></svg>);
    }

    renderBoards() {
        const {boards} = this.props;
        if (!boards)
            return;
        
        let boardList = [];

        boards.forEach((board, key)=>{
            boardList.push(
                <div 
                className="bs-item board"
                onClick={this.finder} 
                title={board.title}
                key={board.id}
                id={board.id}>
                    {this.renderFolderIcon(board.id)}
                    <div className="bs-date-box">
                        <label id={board.id} className="bs-date-item">
                            생성: {board.create_date.substr(0,10)}
                        </label>
                        <label id={board.id} className="bs-date-item">
                            수정: {board.modify_date.substr(0,10)}
                        </label>
                    </div>
                    <label 
                    className="bs-title"
                    id={board.id}>{board.title}</label>
                    {this.renderEditIcon(
                        board.id, key, 0, board.title, board.parent_id)}
                </div>);
        });
        return boardList;
    }

    renderSheets() {
        const {sheets} = this.props;
        if (!sheets)
            return;

        let sheetList = [];

        sheets.forEach((sheet, key)=>{
            sheetList.push(
                <div
                className="bs-item sheet"
                onClick={this.processer}
                title={sheet.title}
                key={sheet.id}
                id={sheet.id}>
                    {this.renderFileIcon(sheet.id)}
                    <div className="bs-date-box">
                        <label id={sheet.id} className="bs-date-item">
                            생성: {sheet.create_date.substr(0,10)}
                        </label>
                        <label id={sheet.id} className="bs-date-item">
                            수정: {sheet.modify_date.substr(0,10)}
                        </label>
                    </div>
                    <label
                    className="bs-title"
                    id={sheet.id}>{sheet.title}</label>
                    {this.renderEditIcon(
                        sheet.id, key, 1, sheet.title, sheet.board_id)}
                </div>);
        });
        return sheetList;
    }

    escape() {
        const sheetTitle = getCookie('sheetTitle');
        const pivot = this.state.pwd.lastIndexOf(sheetTitle);
        const nextPwd = this.state.pwd.substring(0,pivot);

        deleteCookie('sheetId');
        deleteCookie('sheetTitle');
        this.setState({
            pwd: nextPwd,
            sheetId:null,
        });
    }

    render() {
        const pwd = (
            <label className="pwd">
                {(this.state.pwd.length <= 50)? this.state.pwd:
                `...`+this.state.pwd.substring(this.state.pwd.length-50)}
            </label>
        )
        const menu = (
            <div className="home-menu">
            {this.state.boardId && this.renderBackIcon()}
            {this.renderNewFolderIcon()}
            {this.renderNewFileIcon()}
            {this.state.boardId && this.renderHomeIcon()}
            </div> 
        )
        const boardList = (
            <div className="board-list">
                {this.renderBoards()}
            </div>
        )
        const sheetList = (
            <div className="sheet-list">
                {this.renderSheets()}
            </div>   
        )
        const selectPanel = (
            <div className="home">
                {this.state.popped &&
                <Edit 
                    togglePop={this.togglePop}
                    id={this.state.targetId}
                    key_={this.state.targetKey}
                    type={this.state.targetType}
                    value={this.state.targetValue}
                    parentId={this.state.boardId}/>}
                {menu}
                {pwd}
                {boardList}
                {sheetList}
            </div>
        )
        const sheet = (
            <Sheet
            pwd={this.state.pwd}
            sheetId={this.state.sheetId}
            escape={this.escape.bind(this)}/>
        )
        return (!this.state.sheetId? selectPanel: sheet);
    }
}

export default connect((state) => {
    return {
      user: state.userReducer.user,
      logged: state.userReducer.logged,
      parent: state.boardReducer.parent,
      boards: state.boardReducer.boards,
      sheets: state.sheetReducer.sheets,
    };
}, { clearError, fetch, getChild })(Home);

