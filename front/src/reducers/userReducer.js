import { USER } from '../actions/common';
import { LOGIN, LOGOUT, CLEAR_SESSION } from '../actions/api';

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
        case CLEAR_SESSION:
            return {expired: true};
        default:
            return state;
    }
}

