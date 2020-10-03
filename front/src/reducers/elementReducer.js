import { CLEAR } from '../actions/common';
import { ELEMENTS, SAVED, RESET } from '../actions/element_api';

const initialState = {};

export default function (state = initialState, action) {
    switch(action.type) {
        case CLEAR:
            return {};
        case ELEMENTS:
            let nextState = {
                nodes: action.payload.nodes,
                edges: action.payload.edges
            };
            return nextState;
        case SAVED:
            return {
                ...state,
                saved: true,
            }
        case RESET:
            return {
                ...state,
                nodes: state.nodes,
                edges: state.edges
            }
        default:
            return state;
    }
}

