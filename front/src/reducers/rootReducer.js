import { combineReducers } from 'redux';
import userReducer from './userReducer';
import checkReducer from './checkReducer';
import commonReducer from './commonReducer';
import boardReducer from './boardReducer';
import sheetReducer from './sheetReducer';
import elementReducer from './elementReducer';

const rootReducer = combineReducers({
    userReducer: userReducer,
    checkReducer: checkReducer,
    commonReducer: commonReducer,
    boardReducer: boardReducer,
    sheetReducer: sheetReducer,
    elementReducer: elementReducer,
});
export default rootReducer;

