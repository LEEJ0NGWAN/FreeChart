import { createStore, applyMiddleware } from 'redux';
import rootReducer from './reducers/rootReducer';
// import { createLogger } from 'redux-logger';
import ReduxThunk from 'redux-thunk';

// const logger = createLogger(); 

const store = createStore(rootReducer, applyMiddleware(ReduxThunk));

export default store;

