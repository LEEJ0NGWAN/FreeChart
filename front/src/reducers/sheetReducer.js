import { CLEAR } from '../actions/common';
import { GET_SHEET, GET_SHEETS, 
    CREATE_SHEET, MODIFY_SHEET, DELETE_SHEET } from '../actions/sheet_api';

const initialState = {};

export default function (state = initialState, action) {
    switch(action.type) {
        case CLEAR:
            return {};
        case GET_SHEET:
            return {
                ...state,
                sheet: action.payload.sheet
            };
        case GET_SHEETS:
            return {
                ...state,
                sheets: action.payload.sheets
            };
        case CREATE_SHEET:
            return {
                ...state,
                sheets: [
                    ...state.sheets,
                    action.payload.sheet
                ]
            };
        case MODIFY_SHEET:
            const {key, title, modify_date} = action.payload;

            let sheet = state.sheets[key];
            sheet.title = title;
            sheet.modify_date = modify_date;

            return {
                ...state,
                sheets: [
                    ...state.sheets,
                ]
            };
        case DELETE_SHEET:
            state.sheets.splice(action.payload.key,1);
            return {
                ...state,
                sheets: [
                    ...state.sheets,
                ]
            };
            default:
                return state;
    }
}

