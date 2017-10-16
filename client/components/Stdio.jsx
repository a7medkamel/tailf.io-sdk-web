import React from 'react';

import XTerm from 'react-xterm';

import XTermCSS from 'xterm/dist/xterm.css';

import tailf_sdk from 'tailf.io-sdk';

import css_parser from 'css-math/lib/parser';

export default class Stdio extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
        uri   : undefined
      , token : undefined
    }
  }

  componentDidMount() {
    if (this.xtermjs) {
      this.xtermjs.fit();
    }
  }

  componentWillUpdate(nextProps, nextState) {
    let { uri, token }  = nextState
      , { xtermjs }     = this
      ;

    if (this.state.uri != uri || this.state.token != token) {
      if (this.client) {
        this.client.close();
        delete this.client;
      }

      if (xtermjs) {
        xtermjs.xterm.clear();
      }

      let { Client } = tailf_sdk;

      let client = new Client(uri, { token });

      client
        .on('connect', () => {
          // connected
        })
        .on('data', (payload = {}) => {
          let { text } = payload;
          if (xtermjs) {
            xtermjs.write(text);
          }
        }).on('end', (payload) => {
        });

      this.client = client;
    }
  }

  componentDidUpdate(prevProps, prevState) {
    let { xtermjs } = this;

    if (xtermjs) {
      xtermjs.fit();
    }
  }

  render() {
    if (this.props.state == 'none') {
      return null;
    }

    const css = `
    .terminal.xterm  {
      height : ${this.props.style.height};
      font-size : 11px
    }
    `

    let height = css_parser(`${this.props.style.height} + 20px`);
    //  height : `calc(${this.props.style.height} - 20)`
    return (
      <div style={{ padding : '10px', height, 'backgroundColor' : 'rgb(0, 0, 0)' }}>
        <style>{css}</style>
        <XTerm options={{ cursorBlink : false, cursorStyle : 'underline' }} ref={(child) => { this.xtermjs = child; }}/>
      </div>
    );
  }
}
