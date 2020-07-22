export const ERROR = 'ERROR';
export const CLEAR = 'CLEAR';
export const FETCH_USER = 'FETCH_USER';

export const fetchData = (type, data) => {
    return {
        type: type,
        payload: data
    };
}

export function fetchUser(user) {
    return {
        type: FETCH_USER,
        payload: user
    };
}

export function clearError() {
    return {
        type: CLEAR,
        payload: ERROR,
    };
}

