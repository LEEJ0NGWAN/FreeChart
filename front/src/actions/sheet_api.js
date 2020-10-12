import axios_ from "./axiosApi";
// import axios from 'axios';
// axios.defaults.withCredentials = true;

import { fetch, clearError, reportError, REFRESH, action } from './common';

const SHEET_API_URL = `/sheets`;
const COPY_API_URL = `/sheets/copies`;

export const GET_SHEET = 'GET_SHEET';
export const GET_SHEETS = 'GET_SHEETS';
export const CREATE_SHEET = 'CREATE_SHEET';
export const MODIFY_SHEET = 'MODIFY_SHEET';
export const DELETE_SHEET = 'DELETE_SHEET';

export function getSheet(id=null, board_id=null) {
    return (dispatch) => {
        let params = {};
        if (id)
            params.id = id;
        if (board_id)
            params.board_id = board_id;
        return axios_.get(SHEET_API_URL, {params})
        .then(res => {
            if (res.data.sheet)
                dispatch(fetch(GET_SHEET, res.data));
            else
                dispatch(fetch(GET_SHEETS, res.data));
            dispatch(clearError());
        })
        .catch(err => {
            dispatch(reportError(err));
        });
    };
}

export function createSheet(title=null, boardId=null) {
    return (dispatch) => {
        return axios_.post(SHEET_API_URL,
        {
            title: title,
            board_id: boardId
        })
        .then(res => {
            dispatch(fetch(CREATE_SHEET, res.data));
            dispatch(clearError());
        })
        .catch(err => {
            dispatch(reportError(err));
        })
    }
}

export function modifySheet(id, key, title=null, boardId=null) {
    return (dispatch) => {
        let params = {id: id};
        if (title)
            params.title = title;
        if (boardId)
            params.board_id = (boardId > 0)? boardId: null; // -1: root

        return axios_.put(SHEET_API_URL, params)
        .then(res => {
            if (title)
                dispatch(
                    fetch(MODIFY_SHEET, {
                        key: key, 
                        ...res.data.sheet
                    }));
            else
                dispatch(action(REFRESH));
            dispatch(clearError());
        })
        .catch(err => {
            dispatch(reportError(err));
        });
    };
}

export function deleteSheet(id, key) {
    return (dispatch) => {
        let params = {id: id};
        return axios_.delete(SHEET_API_URL, {params})
        .then(() => {
            dispatch(fetch(DELETE_SHEET, {key:key}));
            dispatch(clearError());
        })
        .catch(err => {
            dispatch(reportError(err));
        });
    };
}

export function copySheet(id) {
    return (dispatch) => {
        let params = {sheet_id: id}
        return axios_.post(COPY_API_URL, params)
        .then(()=> {
            dispatch(action(REFRESH));
            dispatch(clearError());
        })
        .catch(err => {
            dispatch(reportError(err));
        });
    }
}

export function updateSheet(id, key) {
    return (dispatch) => {
        let params = {id: id};

        return axios_.put(SHEET_API_URL, params)
        .then(res => {
            dispatch(
                fetch(MODIFY_SHEET, {
                    key: key, 
                    ...res.data.sheet
                }));
            dispatch(clearError());
        })
        .catch(err => {
            dispatch(reportError(err));
        });
    };
}

