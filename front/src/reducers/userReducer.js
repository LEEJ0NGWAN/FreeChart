import { USER } from '../actions/common';
import { LOGIN, LOGOUT } from '../actions/api';

const initialState = {};

export default function (state = initialState, action) {
    switch(action.type) {
        case USER:
            return { 
                ...state,
                user: action.payload,
                logged: true,
            };
        case LOGIN:
            return { 
                ...state,
                user: action.payload.user,
                logged: true,
            };
        case LOGOUT:
            return {};
        default:
            return state;
    }
}

