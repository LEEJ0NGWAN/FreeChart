import { CLEAR } from '../actions/common';
import { BOARD, BOARDS, UPDATE, ACK } from '../actions/board_api';

const initialState = {};

export default function (state = initialState, action) {
    switch(action.type) {
        case CLEAR:
            return {};
        case BOARD:
            return {
                ...state,
                board: action.payload.board
            };
        case BOARDS:
            return {
                ...state,
                boards: action.payload.boards
            };
        case UPDATE:
            return {
                ...state,
                success: true,
            }
        case ACK:
            let nextState = {
                ...state,
            };
            delete nextState.success;
            return nextState;
        default:
            return state;
    }
}

