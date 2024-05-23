import { AnyFunction, IPosition, ISize } from 'interfaces';

import { CHUNK_SIZE_TRIGGER, CHUNK_TIME, ERASE_SIZE_TRIGGER, MAX_CANVAS_SIZE } from './defines';
import { Color, IInstructionBuffer, Polyline } from './types';

import { Tail } from './Tail';
import { Node, TrickyList } from './TrickyList';

export class Plot {
  private readonly canvas :HTMLElement;

  private readonly root :HTMLElement;

  private instrument :'b' | 'e';

  private color :Color;

  private readonly buffersCandidate :TrickyList<IInstructionBuffer>;

  private buffer :Polyline;

  private lastSendBuffer :Node<IInstructionBuffer>;

  private successSent :Set<number>;

  private onChunk :AnyFunction;

  private isPressed :boolean;

  private position :IPosition;

  private shiftX :number;

  private shiftY :number;

  private tails :Tail[];

  size :ISize;

  constructor(root :HTMLElement, size :ISize) {
    this.root = root;
    const canvas = document.createElement('div');
    canvas.className = 'plot__draw-layer';
    root.appendChild(canvas);
    this.canvas = canvas;
    this.tails = [];
    this.resize(size.w, size.h);
    this.position = { x: 0, y: 0 };
    this.buffer = [];
    this.color = 0x00ffff;
    this.instrument = 'b';
    this.isPressed = false;
    this.successSent = new Set();
    this.lastSendBuffer = null;
    this.shiftX = 0;
    this.shiftY = 0;
    this.buffersCandidate = new TrickyList<IInstructionBuffer>();
  }

  resize(w :number, h :number) {
    this.size = { w, h };
    let width = w;
    let hCount = 1;
    if (w > MAX_CANVAS_SIZE) {
      hCount = Math.ceil(w / MAX_CANVAS_SIZE);
      width = Math.round(w / hCount);
    }
    let height = h;
    let vCount = 1;
    if (h > MAX_CANVAS_SIZE) {
      vCount = Math.ceil(h / MAX_CANVAS_SIZE);
      height = Math.round(h / vCount);
    }
    const tails = [];
    for (let vp = 0; vp < vCount; vp++) {
      for (let hp = 0; hp < hCount; hp++) {
        const tail = new Tail(this.root, {
          w: width,
          h: height,
          x: width * hp,
          y: height * vp,
        });
        tail.canvas.className += ' plot__ctx-top';
        tails.push(tail);
      }
    }
    this.tails.forEach((tail) => tail.destructor());
    this.tails = tails;
  }

  hide() {
    this.canvas.style.display = 'none';
    this.tails.forEach((tail) => tail.hide());
  }

  show() {
    this.canvas.style.display = '';
    this.tails.forEach((tail) => tail.show());
  }

  move(position :IPosition) {
    this.chunkToBC();
    this.tails.forEach((tail) => {
      tail.eraseBuffers();
      tail.redraw();
    });
    const { x, y } = position;
    this.position.x = x;
    this.position.y = y;
    this.shiftX = -x;
    this.shiftY = -y;
  }

  chunkToBC(suppressSend ?:boolean) {
    if (this.buffer.length === 0) {
      return;
    }
    const buffer = this.buffer;
    this.buffer = [];
    if (this.isPressed) {
      this.buffer.push(buffer[buffer.length - 1]);
    }
    this.buffersCandidate.push({
      p: buffer,
      c: this.color,
    });
    if (!suppressSend && this.onChunk) {
      this.onChunk();
    }
  }

  getUnsentBC() :null | Int32Array {
    const buf :Node<IInstructionBuffer>[] = [];
    const { shiftX, shiftY } = this;
    let l = 0;
    let current :Node<IInstructionBuffer>;
    if (this.lastSendBuffer) {
      current = this.lastSendBuffer.n;
      if (current == null) {
        return null;
      }
    } else {
      current = this.buffersCandidate.start;
    }

    let i = 0;
    while (current && i++ < 10000) {
      l += 3 + current.v.p.length * 2;
      buf.push(current);
      current = current.n;
    }
    const ab = new ArrayBuffer(l * 4);
    const buffer = new Int32Array(ab);
    i = 0;
    buf.forEach(({ id, v }) => {
      buffer[i] = v.p.length * 2 + 3;
      buffer[i + 1] = id;
      buffer[i + 2] = v.c;
      i += 3;
      v.p.forEach(([x, y]) => {
        buffer[i] = x + shiftX;
        buffer[i + 1] = y + shiftY;
        i += 2;
      });
    });
    this.lastSendBuffer = this.buffersCandidate.end;
    return buffer;
  }

  sendDone(ids :number[]) {
    if (ids.length === 0) {
      return;
    }
    const { tails, successSent } = this;
    this.chunkToBC(true);
    ids.forEach(id => successSent.add(id));
    tails.forEach((tail) => {
      tail.eraseBuffers();
    });
    let prev = null;
    for (const bufferNode of this.buffersCandidate) {
      // if buffer success send
      if (successSent.has(bufferNode.id)) {
        // if it first node
        if (prev === null) {
          this.buffersCandidate.start = bufferNode.n;
        } else {
          prev.n = bufferNode.n;
          prev = bufferNode;
        }
      } else {
        tails.forEach((tail) => {
          tail.pushBuffer(bufferNode.v);
        });
        prev = bufferNode;
      }
    }

    if (tails[0].buffers.length === 0) {
      successSent.clear();
      this.buffersCandidate.end = null;
      this.lastSendBuffer = null;
    }
    tails.forEach((tail) => {
      tail.redraw();
    });
  }

  bind(onChunk :AnyFunction, onClear :AnyFunction, onClearEnd :AnyFunction) {
    this.onChunk = onChunk;
    const { canvas } = this;
    let isDown = false;
    let timer;
    let left;
    let top;
    let scale = 1;
    let tails;
    let px;
    let py;
    let maxChunkSize;
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const TouchEvent :any = window.TouchEvent || function(){};

    const timeTriggerChunk = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        this.chunkToBC();
      }, CHUNK_TIME);
    };

    const start = (e) => {
      if (this.instrument == null) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      this.isPressed = true;
      isDown = true;
      let coordinateSource;
      if (e instanceof TouchEvent) {
        const { left: l, top: t, width } = canvas.getBoundingClientRect();
        left = l;
        top = t;
        scale = width / this.size.w;
        const { clientX, clientY } = e.touches[0];
        coordinateSource = {
          offsetX: (clientX - l) / scale,
          offsetY: (clientY - t) / scale,
        };
      } else {
        coordinateSource = e;
      }
      const { offsetX: x, offsetY: y } = coordinateSource;
      this.buffer.push([x, y]);
      tails = this.tails;
      maxChunkSize = this.instrument === 'b' ? CHUNK_SIZE_TRIGGER : ERASE_SIZE_TRIGGER;
      if (this.instrument === 'b') {
        tails.forEach((tail) => tail.drawStart(this.color, x, y));
      } else {
        const { shiftX, shiftY } = this;
        onClear([[x + shiftX, y + shiftY]]);
        px = x + shiftX;
        py = y + shiftY;
      }
      timeTriggerChunk();
    };

    const move = (e) => {
      if (this.instrument == null) {
        return;
      }
      if (!isDown) {
        return;
      }
      if (!this.isPressed) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      let coordinateSource;
      if (e instanceof TouchEvent) {
        const { clientX, clientY } = e.touches[0];
        coordinateSource = {
          offsetX: (clientX - left) / scale,
          offsetY: (clientY - top) / scale,
        };
      } else {
        coordinateSource = e;
      }
      const { offsetX: x, offsetY: y } = coordinateSource;
      this.buffer.push([x, y]);
      if (this.buffer.length >= maxChunkSize) {
        this.chunkToBC();
        timeTriggerChunk();
      }
      if (this.instrument === 'b') {
        tails.forEach((tail) => tail.drawPush(x, y));
      } else {
        const { shiftX, shiftY } = this;
        onClear([[px, py], [x + shiftX, y + shiftY]]);
        px = x + shiftX;
        py = y + shiftY;
      }
    };

    const end = (e) => {
      if (this.instrument == null) {
        return;
      }
      if (!this.isPressed) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      this.isPressed = false;
      isDown = false;
      tails.forEach((tail) => {
        tail.drawEnd();
        tail.clearEnd();
      });
      clearTimeout(timer);
      this.chunkToBC();
      if (this.instrument === 'e') {
        onClearEnd();
      }
      if (this.onChunk) {
        this.onChunk();
      }
    };

    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('touchstart', start);
    canvas.addEventListener('mousemove', move);
    canvas.addEventListener('touchmove', move);
    canvas.addEventListener('mouseup', end);
    canvas.addEventListener('touchend', end);
    canvas.addEventListener('mouseleave', end);
    canvas.addEventListener('touchcancel', end);
  }

  disable() {
    this.instrument = null;
  }

  brush(color :Color) {
    this.instrument = 'b';
    this.color = color;
    this.canvas.classList.remove('f-erase');
  }

  erase() {
    this.instrument = 'e';
    this.color = -1;
    this.canvas.classList.add('f-erase');
  }

  get isActive() {
    return this.instrument != null;
  }
}
