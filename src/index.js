import React from 'react';
import './index.css';
import * as serviceWorker from './serviceWorker';


import 'bootstrap/dist/css/bootstrap.min.css';
import ReactDOM from 'react-dom';
import './index.css';
import Agencies from './agencies';

//ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA




ReactDOM.render(<Agencies />, document.getElementById('root'));
serviceWorker.unregister();