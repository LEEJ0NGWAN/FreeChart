import { CHECK } from '../actions/api';

const initialState = {};

export default function (state = initialState, action) {
    switch(action.type) {
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

