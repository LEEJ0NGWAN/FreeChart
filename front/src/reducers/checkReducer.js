import { CLEAR } from '../actions/common';
import { CHECK, 
    CLEAR_EMAIL_VALIDITY, CLEAR_USERNAME_VALIDITY } from '../actions/api';

const initialState = {};

export default function (state = initialState, action) {
    switch(action.type) {
        case CLEAR:
            return {};
        case CLEAR_EMAIL_VALIDITY:
            return {
                username_validity: state.username_validity};
        case CLEAR_USERNAME_VALIDITY:
            return {
                email_validity: state.email_validity};
        case CHECK:
            let nextState = { ...state, };
            if (action.payload.email != null)
                nextState.email_validity = action.payload.email;
            if (action.payload.username != null)
                nextState.username_validity = action.payload.username;
            return nextState;
        default:
            return state;
    }
}

