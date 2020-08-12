import { 
    CHECK_EMAIL_VALIDITY, 
    CLEAR_EMAIL_VALIDITY } from '../actions/api';

const initialState = {};

export default function (state = initialState, action) {
    switch(action.type) {
        case CLEAR_EMAIL_VALIDITY:
            return {};
        case CHECK_EMAIL_VALIDITY:
            let nextState = {};
            if (action.payload.email != null)
                nextState.email_validity = action.payload.email;
            return nextState;
        default:
            return state;
    }
}

