import { action, fetch, clearError, reportError } from './common';
import axios from 'axios';
axios.defaults.withCredentials = true;

export const SAVED = 'SAVED';
export const RESET = 'RESET';
export const ELEMENTS = 'ELEMENTS';

export function getElement(sheetId) {
    return (dispatch) => {
        let params = {sheet_id: sheetId};
        return axios.get('api/sheet/element/', {params})
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
        return axios.post(
            'api/sheet/element/',
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

