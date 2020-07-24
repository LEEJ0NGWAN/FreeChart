import React, { Component } from 'react';
import { connect } from 'react-redux';
import { clearError, fetch } from '../actions/common';
import { NavLink } from 'react-router-dom';
import { BOARDS, SHEETS, getBoard } from '../actions/board_api';

class Home extends Component {
    initializeUserInfo = async () => {
        const root = JSON.parse(localStorage.getItem('root'));
        if(!root) {
            await this.props.getBoard();            
            return;
        }

        this.props.fetch(BOARDS, {boards: root.boards});
        this.props.fetch(SHEETS, {sheets: root.sheets});
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
        
        let root = {};
        if (prevProps.boards != boards)
            root.boards = boards;

        if (prevProps.sheets != sheets)
            root.sheets = sheets;

        if (Object.keys(root).length){
            localStorage.setItem(
                'root',
                JSON.stringify(root));
        }
    }
  
    renderUser() {
        return JSON.stringify(this.props.user);
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
            {logout}<br/>
            <ul>
                {this.renderUser()}
            </ul>
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

