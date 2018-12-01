/*
    ./client/index.js
    which is the webpack entry file
*/
import Tailf from './sdk.js';

new Tailf().render('terminal', { uri : 'https://tailf.io/' });
