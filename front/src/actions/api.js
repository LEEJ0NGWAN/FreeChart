import axios from 'axios';
export const GET_USER = 'GET_USER';

export function getUser() {
    const res = axios.get('/api/user/');
    return {
        type: GET_USER,
        payload: res
    };
}

