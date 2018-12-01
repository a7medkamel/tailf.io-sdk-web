import React from 'react';
import _ from 'lodash';
import ReactDOM from 'react-dom';
import Stdio from '../components/Stdio.jsx';

import Bootstrap from 'bootstrap/dist/css/bootstrap.css';

export default class Tailf {
  render(root, options = {}) {
    let elm = _.isString(root)
              ? document.getElementById(root)
              : root
              ;

    let opt = _.extend({ style : { height : '400px' }, uri : 'https://tailf.io/' }, options);

    ReactDOM.render(
      <Stdio
        style   = { opt.style }
        uri     = { opt.uri }
        token   = { opt.token }
      />, elm);
  }
}
