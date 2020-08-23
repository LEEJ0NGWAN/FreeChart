import { API_HOST } from './setupProxy';
import { fetch, clearError, reportError, REFRESH, action } from './common';
import axios from 'axios';
axios.defaults.withCredentials = true;

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
        return axios.get(`${API_HOST}/sheet/`, {params})
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
        return axios.post(`${API_HOST}/sheet/`,
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

        return axios.put(`${API_HOST}/sheet/`, params)
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
        return axios.delete(`${API_HOST}/sheet/`, {params})
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
        return axios.post(`${API_HOST}/sheet/copy/`, params)
        .then(()=> {
            dispatch(action(REFRESH));
            dispatch(clearError());
        })
        .catch(err => {
            dispatch(reportError(err));
        });
    }
}

