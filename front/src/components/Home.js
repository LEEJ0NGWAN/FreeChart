import React, { Component } from 'react';
import { connect } from 'react-redux';
import { clearError, fetch } from '../actions/common';
import { getBoard, getSheet } from '../actions/board_api';
import { getCookie, setCookie, deleteCookie } from '../utils';
import Sheet from './Sheet';

class Home extends Component {
    state = {
        error: null,
        boardId: null,
        sheetId: null,
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

    renderBoards() {
        const {boards} = this.props;
        if (!boards)
            return;
        
        let boardList = [];
        for (let board of boards) {
            boardList.push(
            <p className="item"
            onClick={this.finder} key={board.id} id={board.id}>
                {board.title}
                <button className="item-button">...</button>            
            </p>)
        }
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
                {sheet.title}
                <button className="item-button">...</button> 
            </p>)
        }
        return sheetList;
    }

    escape() {
        deleteCookie('sheetId');
        this.setState({sheetId:null});
    }

    render() {
        const back = (
            <p onClick={this.initialize}>...</p>
        )
        return (
            <div className="board-menu">
            {!this.state.boardId && this.renderBoards()}
            {(this.state.boardId && !this.state.sheetId) && back}
            {!this.state.sheetId && this.renderSheets()}
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

