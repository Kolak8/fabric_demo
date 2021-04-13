import React from 'react';
import {
  initFabricCanvas,
  resizeFabricCanvas,
  makeCircle,
  makeLine,
  makeImg,
} from './fabric.util';

import styles from './index.less';

export default class extends React.PureComponent {
  contentRef = React.createRef();
  canvasRef = React.createRef();
  ImageFreshRef = React.createRef();
  fabricCanvas = null;
  imgInfo = null; // 记录图片的信息
  sizeObserver = null;
  isDrawing = false;
  drawIngShape = null;
  nowImgSrc = '';

  constructor(props) {
    super(props);
    this.$img = document.createElement('img');
    this.$img.onload = this.onImageLoad;
    this.$img.onerror = this.onImageError;
  }

  componentDidMount() {
    this.fabricCanvas = initFabricCanvas(this.canvasRef.current);
    this.sizeObserver = new window.ResizeObserver(() => {
      this.updateCanvasSize();
    });
    this.sizeObserver.observe(this.contentRef.current);
  }

  componentWillUnmount() {
    if (this.sizeObserver) {
      this.sizeObserver.unobserve(this.contentRef.current);
      this.sizeObserver = null;
    }
    if (this.fabricCanvas) {
      this.fabricCanvas.clear();
      this.fabricCanvas.dispose();
      this.fabricCanvas = null;
    }
    this.imgInfo = null;
    this.isDrawing = false;
    this.drawIngShape = null;
    this.$img = null;
    if (this.nowImgSrc) {
      URL.revokeObjectURL(this.nowImgSrc);
      this.nowImgSrc = '';
    }
  }

  updateCanvasSize = () => {
    if (this.contentRef.current) {
      console.log(' resize ');
      const imgOriginW = this.imgInfo ? this.imgInfo.width : 1280;
      const { width, height } = window.getComputedStyle(
        this.contentRef.current,
      );
      const w = parseFloat(width);
      const h = parseFloat(height);
      const zoom = w / imgOriginW;
      resizeFabricCanvas.call(this.fabricCanvas, {
        width: w,
        height: h,
        zoom: zoom,
      });
    }
  };

  loadImage(image) {
    const imgUrl = URL.createObjectURL(image);
    this.$img.src = imgUrl;
    URL.revokeObjectURL(this.nowImgSrc);
    this.nowImgSrc = imgUrl;
  }

  drawShapes(shapes) {
    const { dots, lines } = shapes;
    this.fabricCanvas.clear();

    const img = makeImg(this.$img);
    this.fabricCanvas.add(img);

    dots.forEach((d) => {
      const dot = makeCircle(d.x, d.y, 2);
      this.fabricCanvas.add(dot);
    });

    lines.forEach((l) => {
      const line = makeLine(l.coords, l.options);
      this.fabricCanvas.add(line);
    });

    this.fabricCanvas.renderAll();
  }

  updateDraw(data) {
    if (this.isDrawing) {
      return;
    }
    this.isDrawing = true;
    const { image, frame_info, images_info } = data;

    // console.log(frame_info)
    const { image: imgInfo } = images_info;
    const {
      face68,
      head_axes_endpoints: ha,
      eye_gaze_endpoints: eg,
    } = frame_info;

    if (!this.imgInfo) {
      this.imgInfo = imgInfo;
      this.updateCanvasSize();
    } else {
      this.imgInfo = imgInfo;
    }

    const shapes = {
      dots: [],
      lines: [],
    };
    if (face68) {
      shapes.dots = face68;
    }
    if (ha && ha.length >= 4) {
      const xa = {
        coords: [ha[0].x, ha[0].y, ha[1].x, ha[1].y],
        options: { stroke: 'red', fill: 'red' },
      };
      const ya = {
        coords: [ha[0].x, ha[0].y, ha[2].x, ha[2].y],
        options: { stroke: 'yellow', fill: 'yellow' },
      };
      const za = {
        coords: [ha[0].x, ha[0].y, ha[3].x, ha[3].y],
        options: { stroke: 'green', fill: 'green' },
      };
      shapes.lines = [xa, ya, za];
    }

    if (eg && eg.length >= 4) {
      const e1 = {
        coords: [eg[0].x, eg[0].y, eg[1].x, eg[1].y],
        options: { stroke: 'red', fill: 'red' },
      };
      const e2 = {
        coords: [eg[2].x, eg[2].y, eg[3].x, eg[3].y],
        options: { stroke: 'red', fill: 'red' },
      };
      shapes.lines = [...shapes.lines, e1, e2];
    }

    this.drawIngShape = shapes;
    this.loadImage(image);
  }

  onImageLoad = (e) => {
    if (e.target.src === this.nowImgSrc) {
      this.drawShapes(this.drawIngShape);
      this.drawIngShape = null;
      this.isDrawing = false;
    }
  };

  onImageError = (e) => {
    URL.revokeObjectURL(this.nowImgSrc);
    this.nowImgSrc = '';
    this.drawIngShape = null;
    this.isDrawing = false;
  };

  render() {
    return (
      <div className={styles.imagePannel} ref={this.contentRef}>
        <div className="fabric-canvas">
          <canvas ref={this.canvasRef} className={'draw-canvas'} />
        </div>
      </div>
    );
  }
}
