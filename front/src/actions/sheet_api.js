import { fetch, clearError, reportError } from './common';
import axios from 'axios';
axios.defaults.withCredentials = true;

export const ELEMENTS = 'ELEMENTS';

export function getElement(sheet_id) {
    return (dispatch) => {
        let params = {sheet_id: sheet_id};
        return axios.get('api/sheet/element/', {params})
        .then(res => {
            dispatch(fetch(ELEMENTS, res.data));
            dispatch(clearError());
        })
        .catch(err => {
            reportError(err);
        });
    };
}

