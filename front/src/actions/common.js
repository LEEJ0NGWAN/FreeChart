export const CLEAR_ERROR = 'CLEAR_ERROR';
export const ERROR = 'ERROR';
export const CLEAR = 'CLEAR';
export const REFRESH = 'REFRESH';
export const ACK_REFRESH = 'ACK_REFRESH';

export const action = (type) => {
    return {
        type: type
    };
}

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
    return {
        type: ERROR,
        payload: {
            error_msg: (err.response.data.error)? 
                        err.response.data.error: null,
            error_code: err.response.status          
        }
    };
}

