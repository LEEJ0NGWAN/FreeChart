import { action, fetch, clearError, reportError } from './common';
import axios from 'axios';
axios.defaults.withCredentials = true;

export const USER = 'USER';
export const LOGIN = 'LOGIN';
export const LOGOUT = 'LOGOUT';
export const CLEAR_SESSION = 'CLEAR_SESSION';
export const CHECK_EMAIL_VALIDITY = 'CHECK_EMAIL_VALIDITY';
export const CLEAR_EMAIL_VALIDITY = 'CLEAR_EMAIL_VALIDITY';

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
                dispatch(reportError(err));
            });
    };
}

export function logout() {
    return (dispatch) => {
        return axios.post('api/account/logout/')
        .then(res => {
            dispatch(action(LOGOUT));
            dispatch(clearError());
        })
        .catch(err => {
            dispatch(reportError(err));
        });
    };
}

export function check(email) {
    return (dispatch) => {
        let data = {
            email: email
        };
        
        return axios.post('api/account/check/', data)
        .then(res => {
            dispatch(fetch(CHECK_EMAIL_VALIDITY, res.data));
            dispatch(clearError());
        })
        .catch(err => {
            dispatch(reportError(err));
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
            dispatch(reportError(err));
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
            dispatch(reportError(err));
        });
    }
}

export function checkSession() {
    return (dispatch) => {
        return axios.get('api/user/')
        .then(res => {
            dispatch(fetch(USER, res.data.user));
            dispatch(clearError());
        })
        .catch(() => {
            dispatch(action(CLEAR_SESSION));
        })
    }
}

