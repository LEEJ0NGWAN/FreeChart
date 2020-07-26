import { CLEAR, ERROR, CLEAR_ERROR } from '../actions/common';

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
        default:
            return state;
    }
}

