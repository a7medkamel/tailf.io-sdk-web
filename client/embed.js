/*
    ./client/index.js
    which is the webpack entry file
*/
import React from 'react';
import _ from 'lodash';
import ReactDOM from 'react-dom';
import Stdio from './components/Stdio.jsx';

import Bootstrap from 'bootstrap/dist/css/bootstrap.css';

export default class Tailf {
  render(root, options = {}) {
    let elm = _.isString(root)
              ? document.getElementById(root)
              : root
              ;
    ReactDOM.render(
      <Stdio
        style = {{ height : '400px' }}
        uri = { options.uri }
      />, elm);
  }
}
