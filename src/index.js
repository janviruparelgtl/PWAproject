import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import 'jquery';
import 'bootstrap-4-react'
import App1 from './App1';
import store from "./store";
import { Provider } from "react-redux";
import { BrowserRouter as Router, Route} from "react-router-dom";
import products from './components/products';


ReactDOM.render(<Provider store={store}>
    <Router>
              <div>
                <Route path='/' exact component={App} />
                <Route path='/product' exact component={App1} />
                <Route path='/productList' exact component={products} />
              </div>
    </Router> 
    </Provider>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.register();
