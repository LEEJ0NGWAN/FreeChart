import { fetchData, clearError, ERROR } from './common';
import axios from 'axios';
axios.defaults.withCredentials = true;

export const LOGIN = 'LOGIN';
export const LOGOUT = 'LOGOUT';
export const CHECK = 'CHECK';

export function login(email, password) {
    return (dispatch) => {
        return axios.post(
            'api/account/login/',
            {
                email: email,
                password: password
            })
            .then(res => {
                dispatch(fetchData(LOGIN, res.data));
                dispatch(clearError());
            })
            .catch(err => {
                let payload = {
                    error_msg: err.response.data.error,
                    error_code: err.response.status
                };
                dispatch(fetchData(ERROR, payload));
            });
    };
}

export function logout() {
    return (dispatch) => {
        return axios.post('api/account/logout/')
        .then(res => {
            dispatch(fetchData(LOGOUT, {}));
            dispatch(clearError());
        })
        .catch(err => {
            let payload = {
                error_msg: err.response.data.error,
                error_code: err.response.status
            };
            dispatch(fetchData(ERROR, payload));
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
            dispatch(fetchData(CHECK, res.data));
            dispatch(clearError());
        })
        .catch(err => {
            console.log(err);
            let payload = {
                error_msg: err.response.data.error,
                error_code: err.response.status
            };
            dispatch(fetchData(ERROR, payload));
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
            dispatch(fetchData(LOGIN, res.data));
            dispatch(clearError());
        })
        .catch(err => {
            let payload = {
                error_msg: err.response.data.error,
                error_code: err.response.status
            };
            dispatch(fetchData(ERROR, payload));
        });
    };
}

