import axios_ from "./axiosApi";
// import axios from 'axios';
// axios.defaults.withCredentials = true;

import { action, fetch, clearError, reportError } from './common';

const ELEMENTS_API_URL = `/sheets/elements`;
const TEST_API_URL = `/sheets/test/elements`;

export const SAVED = 'SAVED';
export const RESET = 'RESET';
export const ELEMENTS = 'ELEMENTS';

export function getElement(sheetId) {
    return (dispatch) => {
        let params = {sheet_id: sheetId};
        return axios_.get(ELEMENTS_API_URL, {params})
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
        return axios_.put(
            ELEMENTS_API_URL,
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
        return axios_.get(TEST_API_URL)
        .then(res => {
            dispatch(fetch(ELEMENTS, res.data));
            dispatch(clearError());
        });
    }
}

