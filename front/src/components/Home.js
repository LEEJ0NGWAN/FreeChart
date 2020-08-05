import React, { Component } from 'react';
import { connect } from 'react-redux';
import { clearError, fetch } from '../actions/common';
import { getBoard, getSheet } from '../actions/board_api';
import { getCookie, setCookie, deleteCookie } from '../utils';
import Sheet from './Sheet';
import BoardEdit from './BoardEdit';

class Home extends Component {
    state = {
        error: null,
        popped: false,
        boardId: null,
        sheetId: null,
        targetId: null,
        targetKey: null,
        targetValue: null
    }

    initialize = async (event) => {
        const boardId = getCookie('boardId');
        const sheetId = getCookie('sheetId');
        
        if (!boardId || event){
            deleteCookie('boardId');
            deleteCookie('sheetId');
            this.setState({boardId: null});
            this.props.getBoard();
        }
        else {
            this.setState({
                boardId: boardId,
                sheetId: sheetId
            });
            this.props.getSheet(null, boardId);
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

    finder = async (event) => {
        const board_id = event.target.id;
        if (!board_id)
            return;
        
        await this.props.getSheet(null, board_id);
        setCookie('boardId',board_id);
        this.setState({boardId: board_id});
    }

    processer = (event) => {
        const sheet_id = event.target.id;
        setCookie('sheetId',sheet_id);
        this.setState({sheetId:sheet_id});
    }

    togglePop = (id=null, key=null, value=null) => {
        this.setState({
            popped: !this.state.popped,
            targetId: (this.state.targetId)? null: id,
            targetKey: (this.state.targetKey)? null: key,
            targetValue: (value)? value: ""
        });
    }

    renderFolderIcon(boardId) {
        return (<svg id={boardId}
        width="24" height="24" viewBox="0 0 24 24">
        <path id={boardId} d="M0 10v12h24v-12h-24zm22 
        10h-20v-8h20v8zm-22-12v-6h7c1.695 
        1.942 2.371 3 4 3h13v3h-2v-1h-11c-2.34 
        0-3.537-1.388-4.916-3h-4.084v4h-2z"/></svg>);
    }

    renderNewFolderIcon() {
        return (<svg className="board-item"
        onClick={()=>{this.togglePop();}}
        width="24" height="24" 
        fillRule="evenodd" clipRule="evenodd">
        <path d="M7 2c1.695 1.942 2.371 3 4 
        3h13v17h-24v-20h7zm4 5c-2.339 
        0-3.537-1.388-4.917-3h-4.083v16h20v-13h-11zm2 
        6h3v2h-3v3h-2v-3h-3v-2h3v-3h2v3z"/></svg>);
    }

    renderEditIcon(boardId, boardKey, boardTitle) {
        return (<svg className="board-item-edit" id={boardId}
        onClick={(e)=>{
            e.stopPropagation();
            this.togglePop(boardId, boardKey, boardTitle);}}
        width="18" height="18" viewBox="0 0 24 24">
        <path id={boardId} d="M12 18c1.657 0 3 1.343 3 
        3s-1.343 3-3 3-3-1.343-3-3 1.343-3 3-3zm0-9c1.657 
        0 3 1.343 3 3s-1.343 3-3 3-3-1.343-3-3 
        1.343-3 3-3zm0-9c1.657 0 3 1.343 3 3s-1.343 
        3-3 3-3-1.343-3-3 1.343-3 3-3z"/></svg>);
    }

    renderBoards() {
        const {boards} = this.props;
        if (!boards)
            return;
        
        let boardList = [];

        boards.forEach((board, key)=>{
            boardList.push(
                <div 
                className="board-item"
                onClick={this.finder} 
                key={board.id}
                id={board.id}>
                    {this.renderFolderIcon(board.id)}
                    <label 
                    className="board-title" 
                    id={board.id}>{board.title}</label>
                    {this.renderEditIcon(board.id, key, board.title)}</div>);
        });
        return boardList;
    }

    renderSheets() {
        const {sheets} = this.props;
        if (!sheets)
            return;

        let sheetList = [];
        for (let sheet of sheets) {
            sheetList.push(
            <p className="item"
            onClick={this.processer} key={sheet.id} id={sheet.id}>
                <label>{sheet.title}</label>
                <button className="board-item-edit">편집</button> 
            </p>)
        }
        return sheetList;
    }

    escape() {
        deleteCookie('sheetId');
        this.setState({sheetId:null});
    }

    render() {
        const menu = (
            <div className="home-menu">
            {this.renderNewFolderIcon()}
            </div> 
        )
        const back = (
            <label className="item" onClick={this.initialize}>←</label>
        )
        return (
            <div>
                {!this.state.boardId && menu}
                {this.state.popped && 
                <BoardEdit 
                    togglePop={this.togglePop}
                    id={this.state.targetId}
                    key_={this.state.targetKey}
                    value={this.state.targetValue}/>}
                <div className="board-list">
                    {!this.state.boardId && this.renderBoards()}
                </div>
                <div className="sheet-list">
                    {(this.state.boardId && !this.state.sheetId) && back}
                    {!this.state.sheetId && this.renderSheets()}
                </div>
                {this.state.sheetId && 
                <Sheet
                    sheet_id={this.state.sheetId}
                    escape={this.escape.bind(this)}/>}
            </div>
        );
    }
}

export default connect((state) => {
    return {
      user: state.userReducer.user,
      logged: state.userReducer.logged,
      boards: state.boardReducer.boards,
      sheets: state.sheetReducer.sheets,
    };
}, { clearError, fetch, getBoard, getSheet })(Home);

