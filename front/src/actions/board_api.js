import { fetch, clearError, reportError } from './common';
import { GET_SHEETS } from './sheet_api';
import axios from 'axios';
axios.defaults.withCredentials = true;

export const GET_BOARD = 'GET_BOARD';
export const GET_PARENT = 'GET_PARENT';
export const GET_BOARDS = 'GET_BOARDS';
export const CREATE_BOARD = 'CREATE_BOARD';
export const MODIFY_BOARD = 'MODIFY_BOARD';
export const DELETE_BOARD = 'DELETE_BOARD';


export function getChild(id=null) {
    return (dispatch) => {
        let params = {id:id}
        return axios.get('api/child/',{params})
        .then(res=>{
            dispatch(fetch(GET_PARENT, res.data));
            dispatch(fetch(GET_BOARDS, res.data));
            dispatch(fetch(GET_SHEETS, res.data));
            dispatch(clearError());
        })
        .catch(err => {
            dispatch(reportError(err));
        })
    }
}

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
            }
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

