import React, { Component } from 'react';
import { connect } from 'react-redux';
import { clearError } from '../actions/common';
import { getElement } from '../actions/sheet_api';

class Sheet extends Component {
    state = {
        error: null,
    };

    componentDidMount() {
        const {logged, history, sheet} = this.props;
        if (!logged){
            history.push('/login');
            return;
        }
        if (!sheet){
            history.push('/');
            return;
        }
        this.props.getElement(sheet.id);
    }

    componentDidUpdate(prevProps, prevStates) {
        const {error_msg, error_code} = this.props;

        if (error_code) {
            let nextState = {};
            nextState.error = error_msg?
                error_msg: "[ERROR] "+ error_code;
            this.props.clearError();
            this.setState(nextState);
        }
    }

    // TODO vis.js 연동해서 노드와 엣지 그리기

    render() {
        
    }
}

export default connect((state) => {
    return {
        user: state.userReducer.user,
        logged: state.userReducer.logged,
        error_msg: state.commonReducer.error_msg,
        error_code: state.commonReducer.error_code,
        sheet: state.sheetReducer.sheet,
        nodes: state.elementReducer.nodes,
        edges: state.elementReducer.edges
    };
}, { getElement, clearError })(Sheet);

