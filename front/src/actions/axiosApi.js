import axios from 'axios'
import { API_HOST } from './setupProxy';
const axios_ = axios.create({
    baseURL: API_HOST,
    timeout: 5000,
    headers: {
        'Authorization': "JWT " + localStorage.getItem('access_token'),
        'Content-Type': 'application/json',
        'accept': 'application/json'
    }
});
axios_.defaults.withCredentials = true;
axios_.interceptors.response.use(
    res => res,
    err => {
        const originalRequest = err.config;
        if (!err.response)
            return;
        if (err.response.status === 401 && err.response.statusText === "Unauthorized") {
            const refresh_token = localStorage.getItem('refresh_token');

            return axios_
                .post('/account/refresh/', {refresh: refresh_token})
                .then(res => {

                    localStorage.setItem('access_token', res.data.access);
                    localStorage.setItem('refresh_token', res.data.refresh);

                    axios_.defaults.headers['Authorization'] = "JWT " + res.data.access;
                    originalRequest.headers['Authorization'] = "JWT " + res.data.access;

                    return axios_(originalRequest);
                })
                .catch(err => {
                    if (err.response.status !== 400)
                        console.log(err);
                });
        }
        return Promise.reject(err);
    }
);

export default axios_;

