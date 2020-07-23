export const CLEAR_ERROR = 'CLEAR_ERROR';
export const ERROR = 'ERROR';
export const CLEAR = 'CLEAR';
export const USER = 'USER';

export const fetch = (type, data) => {
    return {
        type: type,
        payload: data
    };
}

export function clear() {
    return {
        type: CLEAR
    };
}

export function clearError() {
    return {
        type: CLEAR_ERROR
    };
}

export function reportError(err) {
    return (dispatch) => {
        let payload = {
            error_msg: err.response.data.error,
            error_code: err.response.status
        };
        dispatch(fetch(ERROR, payload));
    }
}

