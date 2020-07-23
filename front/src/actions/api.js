import { fetch, clearError, ERROR } from './common';
import axios from 'axios';
axios.defaults.withCredentials = true;

export const LOGIN = 'LOGIN';
export const LOGOUT = 'LOGOUT';
export const CHECK = 'CHECK';

function reportError(err) {
    let payload = {
        error_msg: err.response.data.error,
        error_code: err.response.status
    };
    dispatch(fetch(ERROR, payload));
}

export function login(email, password) {
    return (dispatch) => {
        return axios.post(
            'api/account/login/',
            {
                email: email,
                password: password
            })
            .then(res => {
                dispatch(fetch(LOGIN, res.data));
                dispatch(clearError());
            })
            .catch(err => {
                reportError(err);
            });
    };
}

export function logout() {
    return (dispatch) => {
        return axios.post('api/account/logout/')
        .then(res => {
            dispatch(fetch(LOGOUT, {}));
            dispatch(clearError());
        })
        .catch(err => {
            reportError(err);
        });
    };
}

export function check(email=null, username=null) {
    return (dispatch) => {
        let data = {};
        if (email){
            data.email = email;
        }

        if (username){
            data.username = username;
        }

        let length = Object.keys(data).length;
        if (!length) return;
        
        return axios.post('api/account/check/', data)
        .then(res => {
            dispatch(fetch(CHECK, res.data));
            dispatch(clearError());
        })
        .catch(err => {
            reportError(err);
        })
    }
}

export function register_(email, username=null, password) {
    return (dispatch) => {
        let data = {
            email: email,
            password: password
        };
        if (username)
            data.username = username;
        
        return axios.post('api/user/', data)
        .then(res => {
            dispatch(fetch(LOGIN, res.data));
            dispatch(clearError());
        })
        .catch(err => {
            reportError(err);
        });
    };
}

export function passwordReset(email) {
    return (dispatch) => {
        return axios.post(
            'api/account/password/reset/', { email: email })
        .then(res => {
            dispatch(clearError());
        })
        .catch(err => {
            reportError(err);
        });
    }
}

