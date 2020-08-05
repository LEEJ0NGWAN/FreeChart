import { fetch, clearError, reportError, action } from './common';
import axios from 'axios';
axios.defaults.withCredentials = true;

export const SHEET = 'SHEET';
export const SHEETS = 'SHEETS';

export const GET_BOARD = 'GET_BOARD';
export const GET_BOARDS = 'GET_BOARDS';
export const CREATE_BOARD = 'CREATE_BOARD';
export const MODIFY_BOARD = 'MODIFY_BOARD';
export const DELETE_BOARD = 'DELETE_BOARD';


export function getBoard(id=null) {
    return (dispatch) => {
        let params = {};
        if (id)
            params.id = id;
        return axios.get('api/board/', {params})
        .then(res => {
            if (res.data.board)
                dispatch(fetch(GET_BOARD, res.data));
            else {
                dispatch(fetch(GET_BOARDS, res.data));
                if (res.data.sheets)
                    dispatch(fetch(SHEETS, res.data));
            }
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

export function createBoard(title=null) {
    return (dispatch) => {
        return axios.post('api/board/', {title: title})
        .then(res => {
            dispatch(fetch(CREATE_BOARD, res.data));
            dispatch(clearError());
        })
        .catch(err => {
            dispatch(reportError(err));
        })
    }
}

export function modifyBoard(id, key, title=null) {
    return (dispatch) => {
        return axios.put('api/board/', {
            id: id, title: title
        })
        .then(() => {
            dispatch(
                fetch(MODIFY_BOARD, {key: key, title: title}));
            dispatch(clearError());
        })
        .catch(err => {
            dispatch(reportError(err));
        });
    };
}

export function deleteBoard(id, key) {
    return (dispatch) => {
        let params = {id: id};
        return axios.delete('api/board/', {params})
        .then(() => {
            dispatch(fetch(DELETE_BOARD, {key:key}));
            dispatch(clearError());
        })
        .catch(err => {
            dispatch(reportError(err));
        });
    };
}

