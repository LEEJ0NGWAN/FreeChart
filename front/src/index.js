import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from './components/App';
import createHistory from 'history/createBrowserHistory';
import { Router, Route} from 'react-router-dom'
import store from './store';

const history = createHistory();

ReactDOM.render(
    <Provider store={store}>
        <Router history={history}>
            <Route path="/" component={App}/>
        </Router>
    </Provider>,
    document.getElementById('root')
);

