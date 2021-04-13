import { fabric } from 'fabric';

const DEFAULT_SHAPE_CONFIG = {
  STROKE_WIDTH: 1,
  STROKE_COLOR: 'red',
};

const fabricBasicOptions = {
  hasControls: false,
  hasBorders: false,
  evented: false,
  objectCaching: false,
};

export const initFabricCanvas = (el, options = {}) => {
  const fabricCanvas = new fabric.Canvas(el, {
    renderOnAddRemove: false,
    ...options,
  });
  fabricCanvas.renderOnAddRemove = false;
  return fabricCanvas;
};

export const resizeFabricCanvas = function ({ width, height, zoom = 1 }) {
  if (this instanceof fabric.Canvas) {
    this.setHeight(height);
    this.setWidth(width);
    this.setZoom(zoom);
    this.viewportTransform[4] = 0;
    this.viewportTransform[5] = 0;
    this.renderAll();
    return;
  }
  console.error('this must be instanceof fabric.Canvas');
};

export const makeLine = (points, options) => {
  return new fabric.Line(points, {
    ...fabricBasicOptions,
    stroke: DEFAULT_SHAPE_CONFIG.STROKE_COLOR,
    strokeWidth: 1 / 0.8,
    fill: 'rgba(0,0,0,0)',
    ...options,
  });
};

export const makeCircle = (left, top, radius = 2, options = {}) => {
  return new fabric.Circle({
    ...fabricBasicOptions,
    left,
    top,
    strokeWidth: DEFAULT_SHAPE_CONFIG.STROKE_WIDTH,
    fill: '#298BFE',
    stroke: '#298BFE',
    radius,
    ...options,
  });
};

export const makeImg = (imgElement, options = {}) => {
  return new fabric.Image(imgElement, {
    ...fabricBasicOptions,
    left: 0,
    top: 0,
    ...options,
  });
};
