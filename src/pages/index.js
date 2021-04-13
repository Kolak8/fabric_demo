import React, { useRef } from 'react';
import { encode, decode } from '@msgpack/msgpack/dist';
import { makeImageBlobFromBuffer } from '@/util/util';

import ImagePanel from '@/components/ImagePanel';
import './index.less';
function DevPanel(props) {
  const inputRef = useRef();

  return (
    <div
      style={{
        padding: 20,
        position: 'fixed',
        bottom: 300,
        right: 110,
        zIndex: 999,
        background: '#ccc',
        width: '10vw',
        height: '8vh',
        fontSize: '0.6vw',
      }}
    >
      <div>
        socket:
        <div>
          <input
            style={{ width: '9vw' }}
            ref={inputRef}
            type="text"
            defaultValue="ws://192.168.14.244:24000"
          />
        </div>
        <button onClick={() => props.onConnect(inputRef.current.value.trim())}>
          connect
        </button>{' '}
        | <button onClick={props.onClose}>close</button>
      </div>
    </div>
  );
}

function Logo() {
  return (
    <div className="logo">
      <img src="./icon/logo@2x.png"></img>
    </div>
  );
}
export default class OMSVisual extends React.PureComponent {
  constructor(props) {
    super(props);
    this.ImagePanelRef = React.createRef();

    this.socket = null;

    this.ImagePanelRef = React.createRef();
    this.banner_ref = React.createRef();
    this.panel_ref = React.createRef();
    this.devPanel_ref = React.createRef();
    this.logo_ref = React.createRef();
    // this.initSocket(SOCKET_URL);
  }
  componentDidMount() {
    this.logo_ref.current.addEventListener('click', () => {
      if (this.devPanel_ref.current.style.display === 'none') {
        this.devPanel_ref.current.style.display = 'block';
      } else {
        this.devPanel_ref.current.style.display = 'none';
      }
    });
  }
  componentWillUnmount() {
    this.clearSocket();
  }

  initSocket(url) {
    this.clearSocket();

    this.socket = new WebSocket(url);
    this.socket.binaryType = 'arraybuffer';
    this.socket.addEventListener('open', (e) => {
      console.log('socket open');
      const initdata = encode({
        source: 'client_user_dms',
        topic: 'subscribe',
        data: 'dms.viewer_api.v1',
      });
      this.socket.send(initdata);
    });

    this.socket.addEventListener('close', () => {
      console.log('socket close');
    });

    this.socket.addEventListener('message', (e) => {
      // console.log('on message',e.data)
      this.handleSocketMessage(e.data);
    });
  }

  clearSocket() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  decodeMessage(message) {
    const deData = decode(message);
    return decode(deData.data);
  }

  formatFrameData(data) {
    const imgKeys = ['image', 'avatar', 'l_eye_image', 'r_eye_image'];
    let result = {};
    imgKeys.forEach((k) => {
      if (data[k]) {
        result[k] = makeImageBlobFromBuffer(data[k]);
      }
    });

    result.frame_info = JSON.parse(data.frame_info);
    result.images_info = JSON.parse(data.images_info);
    return result;
  }

  handleSocketMessage(message) {
    const data = this.decodeMessage(message);
    const frameData = this.formatFrameData(data);
    this.renderFrameData(frameData);
  }

  renderFrameData(frameData) {
    // console.log(frameData);
    // todo 数据更新
    this.ImagePanelRef.current.updateDraw(frameData);

    /* render alert_info */
    // this.banner_ref.current.Head_banner_change(frameData);

    /* render panel_info */
    // this.panel_ref.current.Aside_panel_change(frameData);
  }
  render() {
    return (
      <>
        <div className="container">
          <div ref={this.logo_ref}>
            <Logo></Logo>
          </div>

          <ImagePanel ref={this.ImagePanelRef}></ImagePanel>
        </div>
        <div ref={this.devPanel_ref}>
          <DevPanel
            onConnect={(url) => this.initSocket(url)}
            onClose={() => this.clearSocket()}
          />
        </div>
      </>
    );
  }
}
