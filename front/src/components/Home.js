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
  
    renderUser() {
        const {user} = this.props;
        if (!user)
            return;
        
        let userInfo = [];
        userInfo.push(<div key={user.email}>{user.email}<br/></div>);
        if (user.email !== user.username)
            userInfo.push(<div key={user.username}>{user.username}<br/></div>);

        return userInfo;
    }

    renderBoards() {
        const {boards} = this.props;
        if (!boards)
            return;
        
        let boardList = [];
        for (let board of boards) {
            boardList.push(<p onClick={this.finder} key={board.id} id={board.id}>{board.title}</p>)
        }
        return boardList;
    }

    renderSheets() {
        const {sheets} = this.props;
        if (!sheets)
            return;

        let sheetList = [];
        for (let sheet of sheets) {
            sheetList.push(<p onClick={this.processer} key={sheet.id} id={sheet.id}>{sheet.title}</p>)
        }
        return sheetList;
    }

    render() {
        const back = (
            <p onClick={this.initialize}>...</p>
        )
        const exit = (
            <p onClick={(e)=>{
                deleteCookie('sheetId');
                this.setState({sheetId:null});}}>나가기</p>
        )
        return (
            <div>
            <h5><b>{this.renderUser()}</b></h5><br/>
            {!this.state.boardId && this.renderBoards()}
            {(this.state.boardId && !this.state.sheetId) && back}
            {this.state.sheetId? exit: this.renderSheets()}
            {this.state.sheetId && <Sheet sheet_id={this.state.sheetId}/>}
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

