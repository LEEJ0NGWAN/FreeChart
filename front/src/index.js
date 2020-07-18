import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from './components/App';
import { createStore } from 'redux'
import rootReducer from './reducers/rootReducer';
import createHistory from 'history/createBrowserHistory';
import { Router, Route} from 'react-router-dom'

const store = createStore(rootReducer);
const history = createHistory();

ReactDOM.render(
    <Provider store={store}>
        <Router history={history}>
            <Route path="/" component={App}/>
        </Router>
    </Provider>,
    document.getElementById('root')
);

