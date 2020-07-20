import { fetchData } from './fetch';
import axios from 'axios';
axios.defaults.withCredentials = true;

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
                if (res.status == 200){
                    dispatch(fetchData(LOGIN, res.data));
                }
            })
            .catch(err => {
                throw(err);
            });
    };
}

export function logout() {
    return (dispatch) => {
        return axios.post('api/account/logout/')
        .then(res => {
            if (res.status == 200){
                dispatch(fetchData(LOGOUT, {}));
            }
        })
        .catch(err => {
            throw(err);
        });
    };
}

