import axios_ from "./axiosApi";
// import axios from 'axios';
// axios.defaults.withCredentials = true;

import { fetch, clearError, reportError, REFRESH, action } from './common';
import { GET_SHEETS } from './sheet_api';

export const GET_BOARD = 'GET_BOARD';
export const GET_PARENT = 'GET_PARENT';
export const GET_BOARDS = 'GET_BOARDS';
export const CREATE_BOARD = 'CREATE_BOARD';
export const MODIFY_BOARD = 'MODIFY_BOARD';
export const DELETE_BOARD = 'DELETE_BOARD';


export function getChild(id=null, order=null) {
    return (dispatch) => {
        let params = {id:id, order:order}
        return axios_.get(`/child/`,{params})
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
        return axios_.get(`/board/`, {params})
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

export function createBoard(title=null, parentId=null) {
    return (dispatch) => {
        return axios_.post(`/board/`, {
            title: title, 
            parent_id: parentId
        })
        .then(res => {
            dispatch(fetch(CREATE_BOARD, res.data));
            dispatch(clearError());
        })
        .catch(err => {
            dispatch(reportError(err));
        })
    }
}

export function modifyBoard(id, key, title=null, parentId=null) {
    return (dispatch) => {
        let params = {id: id};
        if (title)
            params.title = title;
        if (parentId)
            params.parent_id = (parentId > 0)? parentId: null; // -1: root

        return axios_.put(`/board/`, params)
        .then(res => {
            if (title)
                dispatch(
                    fetch(MODIFY_BOARD, {
                        key: key, 
                        ...res.data.board,
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

export function deleteBoard(id, key, saveChild=null) {
    return (dispatch) => {
        let params = {
            id: id,
            save_child: saveChild
        };
        return axios_.post(`/board/delete/`, params)
        .then(res => {
            if (res.data.board)
                dispatch(fetch(DELETE_BOARD, {key:key}));
            else
                dispatch(action(REFRESH));
            dispatch(clearError());
        })
        .catch(err => {
            dispatch(reportError(err));
        });
    };
}

