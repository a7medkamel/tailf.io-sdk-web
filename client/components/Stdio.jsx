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
      , id    : undefined
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

    let css = `
    .terminal.xterm  {
      height : ${this.props.style.height};
      font-size : 11px
    }

    .tf-terminal-footer {
      font-weight: bold;
      font-size: 0.65em;

      padding: 5px 10px;

      background-color: #f5f5f5;

      border: 1px solid #ddd;
      border-bottom-right-radius: 3px;
      border-bottom-left-radius: 3px;

      font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
    }
    `
    let href        = this.state.uri
      , render_uri  = !!href
      , text        = `${this.state.id}`
      ;

    let height = css_parser(`${this.props.style.height} + 20px`);
    //  height : `calc(${this.props.style.height} - 20)`

    return (
      <div>
        <style>{css}</style>
        <div style={{ padding : '10px', height, 'backgroundColor' : 'rgb(0, 0, 0)' }}>
          <XTerm options={{ cursorBlink : false, cursorStyle : 'underline' }} ref={(child) => { this.xtermjs = child; }}/>
        </div>
        {render_uri &&
          <div className="tf-terminal-footer">
            <a href={href} style={{ color : '#333' }}>
              <i className="fa fa-fw fa-file-text-o" style={{ marginRight : '0.25em' }}></i>{text}
            </a>
            <div className="pull-right">
              <a href="https://www.tailf.io" style={{ color : '#333' }}>TAILF</a>
            </div>
          </div>
        }
      </div>
    );
  }
}
