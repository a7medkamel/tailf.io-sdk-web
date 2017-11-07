import React from 'react';

import XTerm from 'react-xterm';

import XTermCSS from 'xterm/dist/xterm.css';

import tailf_sdk from 'tailf.io-sdk';

import css_parser from 'css-math/lib/parser';

export default class Stdio extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
        end   : false
      , error : false
    }
  }

  connect(options = {}) {
    let { uri, token }  = options
      , { xtermjs }     = this
      ;

    if (this.client) {
      this.client.close();
      delete this.client;
    }

    if (xtermjs) {
      xtermjs.xterm.clear();
    }

    if (uri && token) {
      let { Client } = tailf_sdk;

      let client = new Client(uri, { token });

      client
        .on('data', (payload = {}) => {
          let { text }    = payload
          , { xtermjs } = this
          ;

          if (xtermjs) {
            xtermjs.write(text);
          }
        }).on('end', (payload) => {
          let { error } = payload;

          this.setState({ end : true, error });
        });

      this.client = client;
    }
  }

  componentWillMount() {
    let { uri, token }  = this.props;

    this.connect({ uri, token });
  }

  componentDidMount() {
    let { xtermjs } = this;

    if (xtermjs) {
      xtermjs.fit();
    }
  }

  componentWillUpdate(nextProps, nextState) {
    let { uri, token }  = nextProps;

    if (this.props.uri != uri || this.props.token != token) {
      this.connect({ uri, token });
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

    let href          = this.props.uri
      , render_footer = this.props.show_footer && !!this.client
      , render_end    = this.state.end
      , render_err    = !!this.state.error
      , text          = this.client? `${this.client.id}` : ''
      ;

    // let oh = this.props.style.height
    //   , th = `calc(${oh} - 20px)`
    //   ;
    //
    // if (render_footer) {
    //   th = `calc(${oh} - 27px - 20px)`
    // }

    let css = `
    .td-terminal-status {
      position: absolute;
      right: 10px;
      bottom: 10px;
      z-index: 10;
      display: flex;
      flex-direction: column;
      align-content: flex-end;
    }

    .td-terminal-status-item {
      margin: 2px;
      background-color: #ddd;
      color: #000;
      padding: 5px;
      display: inline-block;
    }

    .td-terminal-status-end {
      display: inline-block;
    }

    .td-terminal-status-error {
      font-size: 0.8em;
    }

    .tf-terminal-wrap {
      padding : 5px;
      width: 100%;
      background-color: rgb(0, 0, 0);
      display: flex;
    }

    .tf-terminal-content, .xterm-rows {
      width: 100%;
    }

    .terminal.xterm  {
      font-size : 11px
    }

    .tf-terminal-footer {
      font-weight: bold;
      font-size: 0.65em;

      padding: 5px 10px;
      margin: 10px -10px 0;

      background-color: #f5f5f5;

      border: 1px solid #ddd;
      /*
      border-bottom-right-radius: 3px;
      border-bottom-left-radius: 3px;
      */

      font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
    }
    `

    return (
      <div className="tf-terminal-wrap">
        {(render_end || render_err) &&
          <div className="td-terminal-status">
            {render_end &&
              <div>
                <div className="td-terminal-status-end td-terminal-status-item"><i className="fa fa-hand-spock-o" aria-hidden="true"></i> End</div>
              </div>
            }
            {render_err &&
              <div className="td-terminal-status-error td-terminal-status-item"><i className="fa fa-exclamation-circle" aria-hidden="true"></i> {this.state.error}</div>
            }
          </div>
        }
        <style>{css}</style>
        <div className="tf-terminal-content">
          <XTerm options={{ cursorBlink : false, cursorStyle : 'underline' }} ref={(child) => { this.xtermjs = child; }}/>
        </div>
        {render_footer &&
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
