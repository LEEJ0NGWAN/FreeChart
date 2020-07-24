import { fetch, clearError, reportError } from './common';
import axios from 'axios';
axios.defaults.withCredentials = true;

export const BOARD = 'BOARD';
export const BOARDS = 'BOARDS';
export const SHEET = 'SHEET';
export const SHEETS = 'SHEETS';
export const ELEMENTS = 'ELEMENTS';


export function getBoard(id=null, owner_id=null) {
    return (dispatch) => {
        let params = {};
        if (id)
            params.id = id;
        if (owner_id)
            params.owner_id = owner_id;
        return axios.get('api/board/', {params})
        .then(res => {
            console.log(res.data);
            if (res.data.board)
                dispatch(fetch(BOARD, res.data));
            else
                dispatch(fetch(BOARDS, {boards: res.data.boards}));
                if (res.data.sheets)
                    dispatch(fetch(SHEETS, {sheets: res.data.sheets}));
            dispatch(clearError());
        })
        .catch(err => {
            reportError(err);
        });
    };
}

export function getSheet(id=null, board_id=null) {
    return (dispath) => {
        let params = {};
        if (id)
            params.id = id;
        if (board_id)
            params.board_id = board_id;
        return axios.get('api/sheet/', {params})
        .then(res => {
            if (res.data.sheet)
                dispath(fetch(SHEET, res.data));
            else
                dispath(fetch(SHEETS, res.data));
            dispath(clearError());
        })
        .catch(err => {
            reportError(err);
        });
    };
}

export function getElement(sheet_id) {
    return (dispatch) => {
        let params = {sheet_id: sheet_id};
        return axios.get('api/sheet/element')
        .then(res => {
            dispatch(fetch(ELEMENTS, res.data));
        })
        .catch(err => {
            reportError(err);
        });
    };
}

