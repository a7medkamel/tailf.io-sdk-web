import React from 'react';

import XTerm from 'react-xterm';

import XTermCSS from 'xterm/dist/xterm.css';

import tailf_sdk from 'tailf.io-sdk';

import css_parser from 'css-math/lib/parser';

import fscreen from "fscreen";

import _ from 'lodash';

import 'jquery';

export default class Stdio extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
        end           : false
      , error         : false
      , connected     : false
      , is_fullscreen : false
    };
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

      let client    = new Client(uri, { token })
        , is_blank  = true
        , lst_type  = undefined
        ;

      client
        .on('data', (payload = {}) => {
          let { text, type }  = payload
            , { xtermjs }     = this
            ;

          if (xtermjs) {
            if (!is_blank && lst_type != type) {
              lst_type = type;
              xtermjs.write('\n');
            }

            xtermjs.write(text);
            is_blank = false;
          }
        }).on('end', (payload) => {
          let { error } = payload;

          this.setState({ end : true, error });
        });

      client
        .socket
        .on('readable', () => {
          this.setState({ connected : true });
        })
        .on('disconnect', () => {
          this.setState({ connected : false });
        })
        ;

      this.client = client;
    }
  }

  componentWillMount() {
    let { uri, token }  = this.props;

    this.connect({ uri, token });
  }

  componentDidMount() {
    this.fit();

    fscreen.addEventListener('fullscreenchange', (e) => {
      let is_fullscreen = !!fscreen.fullscreenElement;

      if (this.state.is_fullscreen != is_fullscreen) {
        this.setState({ is_fullscreen })
      }

      this.fit();

      // the full screen transition takes time, fit again when it is expected to be done
      setTimeout(() => this.fit(), 2000);
    });

    let tips = $(this.node).find('[data-toggle="tooltip"]');
    if (tips.tooltip) {
      tips.tooltip();
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

    let tips = $(this.node).find('[data-toggle="tooltip"]');
    if (tips.tooltip) {
      tips.tooltip();
    }
  }

  fit() {
    let { xtermjs } = this;

    if (xtermjs) {
      xtermjs.fit();
    }
  }

  goFull = (fullscreen) => {
    // this.setState({ is_fullscreen : !this.is_fullscreen });
    if (fscreen.fullscreenEnabled) {
      if (fullscreen) {
        fscreen.requestFullscreen(this.node);
      } else {
        fscreen.exitFullscreen();
      }
    }
  }

  render() {
    let href          = this.props.uri
      , render_end    = this.state.end
      , render_err    = !!this.state.error
      , render_con    = !this.state.connected
      , text          = this.client? `${this.client.id}` : ''
      ;

    let height = _.get(this.props.style, 'height', 'initial');

    if (this.state.is_fullscreen) {
      height = '100%';
    }

    let expand_icon = this.state.is_fullscreen? 'fa-compress' : 'fa-expand'
      , toggle_to   = !this.state.is_fullscreen
      ;

    let css = `
    .td-terminal-status {
      position: absolute;
      right: 5px;
      bottom: 5px;
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

    .td-terminal-status-err {
      background-color: rgba(218, 66, 80, 1);
    }

    .td-terminal-status-con {

    }

    .tf-terminal-wrap {
      padding : 5px;
      width: 100%;
      background-color: rgb(0, 0, 0);
      display: flex;
      position: relative;
      height: ${height}
    }

    .tf-terminal-content, .xterm-rows {
      width: 100%;
    }

    .tf-terminal-content .ReactXTerm {
      height: 100%;
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
      <div className="tf-terminal-wrap" ref={(child) => { this.node = child; }}>
        <div className="td-terminal-status">
          <div>
            <div className="td-terminal-status-item"><a href='#' style={{ color : '#333' }} onClick={() => this.goFull(toggle_to)}><i className={"fa fa-fw " + expand_icon} aria-hidden="true"></i></a></div>
            <div className="td-terminal-status-item"><a href={href} style={{ color : '#333' }}><i className="fa fa-fw fa-file-text-o" aria-hidden="true"></i></a></div>
            <div className="td-terminal-status-con td-terminal-status-item" style={{ color : this.state.connected? "#28a745" : "#dc3545" }}><i className="fa fa-circle" aria-hidden="true"></i></div>
            {render_end &&
              <div className="td-terminal-status-end td-terminal-status-item"><i className="fa fa-hand-spock-o" aria-hidden="true"></i> End</div>
            }
            {render_err &&
              <div className="td-terminal-status-err td-terminal-status-item"><i className="fa fa-exclamation-circle" aria-hidden="true" data-toggle="tooltip" title={this.state.error}></i></div>
            }
          </div>
        </div>
        <style>{css}</style>
        <div className="tf-terminal-content">
          <XTerm options={{ cursorBlink : false, cursorStyle : 'underline' }} ref={(child) => { this.xtermjs = child; }}/>
        </div>
      </div>
    );
  }
}
