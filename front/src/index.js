import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from './components/App';
import { createBrowserHistory } from 'history';
import { Router, Route} from 'react-router-dom'
import store from './store';

const history = createBrowserHistory();

ReactDOM.render(
    <Provider store={store}>
        <Router history={history}>
            <Route path="/" component={App}/>
        </Router>
    </Provider>,
    document.getElementById('root')
);

