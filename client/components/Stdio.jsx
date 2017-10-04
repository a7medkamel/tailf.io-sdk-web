import React from 'react';

import XTerm from 'react-xterm';

import XTermCSS from 'xterm/dist/xterm.css';

import tailf_sdk from 'taskmill-core-tailf';

export default class Stdio extends React.Component {
  constructor(props) {
    super(props);

    // todo [akamel] should this be in the ctor?
    let { Client } = tailf_sdk;

    this.state = {
      tailf : undefined
    }

    let uri     = this.props.uri    || 'https://tailf.io'
      , token   = this.props.token
      ;

    this.client = new Client(uri, { token });

    this.client.on('connect', (data) => {
      let { uri : tailf } = data;

      this.setState({ tailf });

      this.xtermjs.xterm.clear();

      this.client.on('data', (payload) => {
        console.log(payload);
        if (this.xtermjs) {
          let { text } = payload;
          this.xtermjs.write(text);
        }
      });

      this.client.on('end', (payload) => {
        console.log(payload);
      });
    });
  }

  componentDidMount() {
    // var $this = $(ReactDOM.findDOMNode(this));
    // set el height and width etc.
    if (this.xtermjs) {
      this.xtermjs.fit();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.xtermjs) {
      this.xtermjs.fit();
    }
  }

  render() {
    if (this.props.state == 'none') {
      return null;
    }

    const css = `
    .tailf_io .terminal.xterm  {
      height : ${this.props.style.height};
      font-size : 11px
    }
    `

    return (
      <div className='tailf_io' style={{ padding : '10px', height : `calc(${this.props.style.height} - 20)`, 'backgroundColor' : 'rgb(0, 0, 0)' }}>
        <style>{css}</style>
        <XTerm options={{ cursorBlink : false, cursorStyle : 'underline' }} ref={(child) => { this.xtermjs = child; }}/>
      </div>
    );
  }
}
