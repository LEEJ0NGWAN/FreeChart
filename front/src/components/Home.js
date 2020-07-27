import React, { Component } from 'react';
import { connect } from 'react-redux';
import { clearError, fetch } from '../actions/common';
import { BOARDS, SHEETS, getBoard, getSheet } from '../actions/board_api';
import Sheet from './Sheet';

class Home extends Component {
    state = {
        error: null,
        isRoot: true,
        sheetId: null,
    }

    initializeUserInfo = async (event) => {
        const boards = JSON.parse(localStorage.getItem('boards'));
        const sheets = JSON.parse(localStorage.getItem('sheets'));

        if(!boards || !sheets || event) {
            await this.props.getBoard();
            if (event)
                this.setState({isRoot:true});
            return;
        }

        this.props.fetch(BOARDS, {boards: boards});
        this.props.fetch(SHEETS, {sheets: sheets});
    }

    componentDidMount() {
        const {logged, history} = this.props;
        if (!logged){
            history.push('/login');
            return;
        }
        this.initializeUserInfo();
    }

    componentDidUpdate(prevProps, prevStates) {
        const {boards, sheets} = this.props;

        if (prevProps.boards !== boards){
            localStorage.setItem(
                'boards',
                JSON.stringify(boards));
        }

        if (prevProps.sheets !== sheets){
            localStorage.setItem(
                'sheets',
                JSON.stringify(sheets));
        }
    }

    finder = (event) => {
        const board_id = event.target.id;
        if (!board_id)
            return;
        
        this.props.getSheet(null, board_id);
        this.setState({isRoot: false});
    }

    processer = (event) => {
        const sheet_id = event.target.id;
        this.setState({sheetId:sheet_id});
    }
  
    renderUser() {
        const {user} = this.props;
        if (!user)
            return;
        
        let userInfo = [];
        userInfo.push(<div key={user.email}>{user.email}<br/></div>);
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
            <p onClick={this.initializeUserInfo}>...</p>
        )
        const exit = (
            <p onClick={(e)=>{this.setState({sheetId:null})}}>나가기</p>
        )
        return (
            <div>
            <h1><b>{this.renderUser()}</b></h1><br/>
            {(!this.state.sheetId && this.state.isRoot) &&
            this.renderBoards()}
            {(!this.state.sheetId && !this.state.isRoot) &&
            back}
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
      board: state.boardReducer.board,
      sheet: state.sheetReducer.sheet,
      boards: state.boardReducer.boards,
      sheets: state.sheetReducer.sheets,
      nodes: state.elementReducer.nodes,
      edges: state.elementReducer.edges,
    };
}, { clearError, fetch, getBoard, getSheet })(Home);

