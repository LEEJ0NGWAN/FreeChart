import axios_ from "./axiosApi";
import { API_HOST } from './setupProxy';
import axios from 'axios';
// axios.defaults.withCredentials = true;

import { action, fetch, clearError, reportError } from './common';

const USER_API_URL = `/users`;
const ACCOUNT_API_URL = `/accounts/`;
const PASSWORD_API_URL = `/accounts/password`;

export const USER = 'USER';
export const LOGIN = 'LOGIN';
export const LOGOUT = 'LOGOUT';
export const CLEAR_SESSION = 'CLEAR_SESSION';
export const CHECK_EMAIL_VALIDITY = 'CHECK_EMAIL_VALIDITY';
export const CLEAR_EMAIL_VALIDITY = 'CLEAR_EMAIL_VALIDITY';

export function login(email, password) {
    return (dispatch) => {
        return axios_.post(
            ACCOUNT_API_URL,
            {
                email: email,
                password: password
            })
            .then(res => {
                axios_.defaults.headers['Authorization'] = 
                    "JWT " + res.data.access;
                localStorage.setItem('access_token', res.data.access);
                localStorage.setItem('refresh_token', res.data.refresh);
                dispatch(fetch(LOGIN, {user: res.data.user}));
                dispatch(clearError());
            })
            .catch(err => {
                dispatch(reportError(err));
            });
    };
}

export function logout() {
    return (dispatch) => {
        dispatch(action(LOGOUT));
        dispatch(clearError());
    }
}

export function check(email) {
    return (dispatch) => {
        let params = {email: email};

        return axios_.get(ACCOUNT_API_URL, {params})
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
        
        return axios.post(API_HOST+USER_API_URL, data)
        .then(res => {
            axios_.defaults.headers['Authorization'] = 
                "JWT " + res.data.access;
            localStorage.setItem('access_token', res.data.access);
            localStorage.setItem('refresh_token', res.data.refresh);
            dispatch(fetch(LOGIN, {user: res.data.user}));
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
            API_HOST+PASSWORD_API_URL, { email: email })
        .then(dispatch(clearError()))
        .catch(err => {
            dispatch(reportError(err));});
    }
}

export function checkSession() {
    return (dispatch) => {
        return axios_.get(USER_API_URL)
        .then(res => {
            dispatch(fetch(USER, res.data.user));
            dispatch(clearError());
        })
        .catch(() => {
            dispatch(action(CLEAR_SESSION));
        });
    }
}

export function modifyUsername(username) {
    return (dispatch) => {
        return axios_.put(USER_API_URL,{username: username})
        .then(res => {
            dispatch(fetch(USER, res.data.user));
            dispatch(clearError());
        })
        .catch(err => {
            dispatch(reportError(err));
        });
    }
}

export function modifyPassword(password) {
    return (dispatch) => {
        return axios_.put(USER_API_URL,{password: password})
        .then(res => {
            dispatch(fetch(USER, res.data.user));
            dispatch(clearError());
        })
        .catch(err => {
            dispatch(reportError(err));
        });
    };
}

export function deleteUser(id, password) {
    return (dispatch) => {
        let params = {
            id: id,
            password: password
        };
        return axios_.put(PASSWORD_API_URL, params)
        .then(()=> {
            axios_.delete(USER_API_URL)
            .then(
                dispatch(action(LOGOUT)))
            .catch(err=>{
                dispatch(reportError(err));});
        })
        .catch(err=> {
            dispatch(reportError(err));
        });
    };
}

