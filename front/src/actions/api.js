import { fetchData } from './fetch';
import axios from 'axios';
axios.defaults.withCredentials = true;

export const ERROR = 'ERROR';
export const LOGIN = 'LOGIN';
export const LOGOUT = 'LOGOUT';

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
            })
            .catch(err => {
                let data = {
                    msg: err.response.data.error,
                    status: err.response.status
                };
                dispatch(fetchData(ERROR, data));
            });
    };
}

export function logout() {
    return (dispatch) => {
        return axios.post('api/account/logout/')
        .then(res => {
            dispatch(fetchData(LOGOUT, {}));
        })
        .catch(err => {
            throw(err);
        });
    };
}

