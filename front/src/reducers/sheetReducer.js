import { CLEAR } from '../actions/common';
import { SHEET, SHEETS } from '../actions/board_api';

const initialState = {};

export default function (state = initialState, action) {
    switch(action.type) {
        case CLEAR:
            return {};
        case SHEET:
            return {
                ...state,
                sheet: action.payload.sheet
            };
        case SHEETS:
            return {
                ...state,
                sheets: action.payload.sheets
            };
        default:
            return state;
    }
}

