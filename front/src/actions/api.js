import axios from 'axios';
axios.defaults.withCredentials = true;

export const GET_USER = 'GET_USER';
export const LOGIN = 'LOGIN';
export const LOGOUT = 'LOGOUT';

export function getUser() {
    const res = axios.get('api/user/')
    return {
        type: GET_USER,
        payload: res
    };
}

export const fetchData = (type, data) => {
    return {
        type: type,
        payload: data
    };
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

