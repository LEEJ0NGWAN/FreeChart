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
    return (dispath) => {
        return axios.put('api/board/', {
            id: id, title: title
        })
        .then(() => {
            dispath(action(UPDATE));
            dispath(clearError());
        })
        .catch(err => {
            dispath(reportError(err));
        });
    };
}

