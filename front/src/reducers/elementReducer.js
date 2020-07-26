import { CLEAR } from '../actions/common';
import { ELEMENTS } from '../actions/sheet_api';

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
        default:
            return state;
    }
}

