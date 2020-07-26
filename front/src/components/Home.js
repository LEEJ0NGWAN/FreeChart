import React, { Component } from 'react';
import { connect } from 'react-redux';
import { clearError, fetch } from '../actions/common';
import { NavLink } from 'react-router-dom';
import { BOARDS, SHEETS, getBoard } from '../actions/board_api';

class Home extends Component {
    initializeUserInfo = async () => {
        const boards = JSON.parse(localStorage.getItem('boards'));
        const sheets = JSON.parse(localStorage.getItem('sheets'));

        if(!boards || !sheets) {
            await this.props.getBoard();            
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
            boardList.push(<li key={board.id}><b>{board.title}</b></li>)
        }
        return boardList;
    }

    renderSheets() {
        const {sheets} = this.props;
        if (!sheets)
            return;

        let sheetList = [];
        for (let sheet of sheets) {
            sheetList.push(<li key={sheet.id}><b>{sheet.title}</b></li>)
        }
        return sheetList;
    }

    render() {
        const logout = (
            <button className="waves-effect waves-light btn">
            <NavLink to="/logout" 
            style={{textDecoration:'none'}}>로그아웃</NavLink>
            </button>
        )
        return (
            <div>
            <h1><b>{this.renderUser()}</b></h1><br/>
            {this.renderBoards()}<br/>
            {this.renderSheets()}<br/>
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
}, { clearError, fetch, getBoard })(Home);

