import { FETCH_USER } from '../actions/fetch';
import { ERROR, LOGIN, LOGOUT } from '../actions/api';

const initialState = {
    logged: false,
    user: null,
    msg: null,
    code: null,
};

export default function (state = initialState, action) {
    switch(action.type) {
        case ERROR:
            return {
                ...state,
                msg: action.payload.msg,
                code: action.payload.status
            };
        case FETCH_USER:
            return { 
                ...state,
                user: action.payload,
                logged: true,
                msg: null,
                code: null
            };
        case LOGIN:
            return { 
                ...state,
                user: action.payload.user,
                logged: true,
                msg: null,
                code: null
            };
        case LOGOUT:
            return {
                ...state, 
                user: null, 
                logged: false,
                msg: null,
                code: null
            };
        default:
            return state;
    }
}

