import { fetchData } from './fetch';
import axios from 'axios';
axios.defaults.withCredentials = true;

export const CLEAR = 'CLEAR'; // 에러와 같은 공용 state에 대한 clear
export const ERROR = 'ERROR';
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
                dispatch(fetchData(CLEAR, ERROR));
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
            dispatch(fetchData(CLEAR, ERROR));
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
            dispatch(fetchData(CLEAR, ERROR));
        })
        .catch(err => {
            let payload = {
                error_msg: err.response.data.error,
                error_code: err.response.status
            };
            dispatch(fetchData(ERROR, payload));
        })
    }
}

