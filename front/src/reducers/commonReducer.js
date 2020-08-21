import { CLEAR, ERROR, CLEAR_ERROR, 
    REFRESH, ACK_REFRESH } from '../actions/common';

const initialState = {};

export default function (state = initialState, action) {
    switch(action.type) {
        case CLEAR:
        case CLEAR_ERROR:
            return {};
        case ERROR:
            return {
                error_msg: action.payload.error_msg,
                error_code: action.payload.error_code
            };
        case REFRESH:
            return {
                ...state,
                refresh: true
            };
        case ACK_REFRESH:
            let nextState = state;
            delete nextState.refresh;
            return nextState;
        default:
            return state;
    }
}

