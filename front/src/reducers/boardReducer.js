import { CLEAR } from '../actions/common';
import { GET_BOARD, GET_PARENT, GET_BOARDS, 
    CREATE_BOARD, DELETE_BOARD, MODIFY_BOARD  } from '../actions/board_api';

const initialState = {};

export default function (state = initialState, action) {
    switch(action.type) {
        case CLEAR:
            return {};
        case GET_PARENT:
            return {
                ...state,
                parent: action.payload.parent
            };
        case GET_BOARD:
            return {
                ...state,
                board: action.payload.board
            };
        case GET_BOARDS:
            return {
                ...state,
                boards: action.payload.boards
            };
        case CREATE_BOARD:
            return {
                ...state,
                boards: [
                    ...state.boards,
                    action.payload.board
                ]
            };
        case MODIFY_BOARD:
            const {key, title} = action.payload;
            state.boards[key].title = title;
            return {
                ...state,
                baords: [
                    ...state.boards,
                ]
            };
        case DELETE_BOARD:
            state.boards.splice(action.payload.key,1);
            return {
                ...state,
                boards: [
                    ...state.boards,
                ]
            };
        default:
            return state;
    }
}

