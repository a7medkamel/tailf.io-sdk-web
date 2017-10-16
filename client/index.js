/*
    ./client/index.js
    which is the webpack entry file
*/
import Tailf from './embed.js';

new Tailf().render('ide', { uri : 'http://localhost:8654/' });
