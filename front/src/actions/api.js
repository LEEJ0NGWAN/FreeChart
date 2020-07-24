import { action, fetch, clearError, reportError } from './common';
import axios from 'axios';
axios.defaults.withCredentials = true;

export const LOGIN = 'LOGIN';
export const LOGOUT = 'LOGOUT';
export const CHECK = 'CHECK';
export const CLEAR_SESSION = 'CLEAR_SESSION';

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
            dispatch(action(LOGOUT));
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

export function checkSession() {
    return (dispatch) => {
        return axios.post(
            'api/account/login/',
            {email: null, password: null})
        .then()
        .catch(err => {
            let status = err.response.status;
            if (status != 403)
                dispatch(action(CLEAR_SESSION));
        })
    }
}

