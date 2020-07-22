import { CLEAR, ERROR } from '../actions/common';

const initialState = {
    error_msg: null,
    error_code: null
};

export default function (state = initialState, action) {
    switch(action.type) {
        case CLEAR:
            switch (action.payload) {
                case ERROR:
                    return {
                        ...state,
                        error_msg: null,
                        error_code: null,
                    };
                default:
                    return state;
            }
        case ERROR:
            return {
                ...state,
                error_msg: action.payload.error_msg,
                error_code: action.payload.error_code
            };
        default:
            return state;
    }
}

