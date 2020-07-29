import { CLEAR } from '../actions/common';
import { ELEMENTS, SAVED, RESET } from '../actions/sheet_api';

const initialState = {};

export default function (state = initialState, action) {
    switch(action.type) {
        case CLEAR:
            return {};
        case ELEMENTS:
            return {
                nodes: action.payload.nodes,
                edges: action.payload.edges
            };
        case SAVED:
            return {
                ...state,
                saved: true,
            }
        case RESET:
            return {
                nodes: state.nodes,
                edges: state.edges
            }
        default:
            return state;
    }
}

