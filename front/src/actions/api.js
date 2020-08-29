import axios_ from "./axiosApi";
// import axios from 'axios';
// axios.defaults.withCredentials = true;

import { action, fetch, clearError, reportError } from './common';

export const USER = 'USER';
export const LOGIN = 'LOGIN';
export const LOGOUT = 'LOGOUT';
export const CLEAR_SESSION = 'CLEAR_SESSION';
export const CHECK_EMAIL_VALIDITY = 'CHECK_EMAIL_VALIDITY';
export const CLEAR_EMAIL_VALIDITY = 'CLEAR_EMAIL_VALIDITY';

export function login(email, password) {
    return (dispatch) => {
        return axios_.post(
            `/account/login/`,
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
    // return (dispatch) => {
    //     return axios_.post(`/account/logout/`)
    //     .then(res => {
    //         dispatch(action(LOGOUT));
    //         dispatch(clearError());
    //     })
    //     .catch(err => {
    //         dispatch(reportError(err));
    //     });
    // };
}

export function check(email) {
    return (dispatch) => {
        let data = {
            email: email
        };
        
        return axios_.post(`/account/check/`, data)
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
        
        return axios_.post(`/user/`, data)
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
        return axios_.post(
            `/account/password/reset/`, { email: email })
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
        return axios_.get(`/user/`)
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
        return axios_.put(`/user/`,{username: username})
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
        return axios_.put(`/user/`,{password: password})
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
        return axios_.post(`/account/delete/`, params)
        .then(()=> {
            dispatch(action(LOGOUT));
        })
        .catch(err=> {
            dispatch(reportError(err));
        });
    };
}

