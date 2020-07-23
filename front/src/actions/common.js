export const ERROR = 'ERROR';
export const CLEAR = 'CLEAR';
export const USER = 'USER';

export const fetch = (type, data) => {
    return {
        type: type,
        payload: data
    };
}

export function clearError() {
    return {
        type: CLEAR,
        payload: ERROR,
    };
}

