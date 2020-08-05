import { fetch, clearError, reportError, action } from './common';
import axios from 'axios';
axios.defaults.withCredentials = true;

export const ACK = 'ACK';
export const UPDATE = 'UPDATE';
export const BOARD = 'BOARD';
export const BOARDS = 'BOARDS';
export const SHEET = 'SHEET';
export const SHEETS = 'SHEETS';


export function getBoard(id=null) {
    return (dispatch) => {
        let params = {};
        if (id)
            params.id = id;
        return axios.get('api/board/', {params})
        .then(res => {
            if (res.data.board)
                dispatch(fetch(BOARD, res.data));
            else
                dispatch(fetch(BOARDS, res.data));
                if (res.data.sheets)
                    dispatch(fetch(SHEETS, res.data));
            dispatch(clearError());
        })
        .catch(err => {
            dispatch(reportError(err));
        });
    };
}

export function getSheet(id=null, board_id=null) {
    return (dispatch) => {
        let params = {};
        if (id)
            params.id = id;
        if (board_id)
            params.board_id = board_id;
        return axios.get('api/sheet/', {params})
        .then(res => {
            if (res.data.sheet)
                dispatch(fetch(SHEET, res.data));
            else
                dispatch(fetch(SHEETS, res.data));
            dispatch(clearError());
        })
        .catch(err => {
            dispatch(reportError(err));
        });
    };
}

export function modifyBoard(id, title=null) {
    return (dispatch) => {
        return axios.put('api/board/', {
            id: id, title: title
        })
        .then(() => {
            dispatch(action(UPDATE));
            dispatch(clearError());
        })
        .catch(err => {
            dispatch(reportError(err));
        });
    };
}

export function deleteBoard(id) {
    return (dispatch) => {
        let params = {id: id};
        return axios.delete('api/board/', {params})
        .then(() => {
            dispatch(action(UPDATE));
            dispatch(clearError());
        })
        .catch(err => {
            dispatch(reportError(err));
        });
    };
}

