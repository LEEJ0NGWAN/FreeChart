import { USER } from '../actions/common';
import { LOGIN, LOGOUT } from '../actions/api';

const initialState = {
    logged: false,
    user: null,
};

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
            return {
                ...state, 
                user: null, 
                logged: false,
            };
        default:
            return state;
    }
}

