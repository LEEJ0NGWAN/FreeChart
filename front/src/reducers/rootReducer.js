import { combineReducers } from 'redux';
import { reducer } from 'redux-form';
import UserReducer from './userReducer';

const rootReducer = combineReducers({
    user: UserReducer,
    form: reducer
});
export default rootReducer;

