import axios_ from "./axiosApi";
// import axios from 'axios';
// axios.defaults.withCredentials = true;

import { action, fetch, clearError, reportError } from './common';

export const SAVED = 'SAVED';
export const RESET = 'RESET';
export const ELEMENTS = 'ELEMENTS';

export function getElement(sheetId) {
    return (dispatch) => {
        let params = {sheet_id: sheetId};
        return axios_.get(`/sheet/element/`, {params})
        .then(res => {
            dispatch(fetch(ELEMENTS, res.data));
            dispatch(clearError());
        })
        .catch(err => {
            dispatch(reportError(err));
        });
    };
}

export function editElement(sheetId, nodes, edges, nodeStates, edgeStates) {
    return (dispatch) => {
        return axios_.post(
            `/sheet/element/`,
            {
                sheet_id: sheetId,
                nodes: nodes, edges:edges,
                nodeStates: nodeStates,
                edgeStates: edgeStates
            })
        .then(() => {
            dispatch(action(SAVED));
            dispatch(clearError());
        });
    }
}

export function testElement() {
    return (dispatch) => {
        return axios_.get(`/test/element/`)
        .then(res => {
            dispatch(fetch(ELEMENTS, res.data));
            dispatch(clearError());
        });
    }
}

