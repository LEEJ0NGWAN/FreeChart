import { combineReducers } from 'redux';
import UserReducer from './userReducer';
import checkReducer from './checkReducer';
import commonReducer from './commonReducer';

const rootReducer = combineReducers({
    userReducer: UserReducer,
    checkReducer: checkReducer,
    commonReducer: commonReducer,
});
export default rootReducer;

