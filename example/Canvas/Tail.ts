import { IPosition, ISize } from 'interfaces';
import { Color, IInstructionBuffer, Polyline } from './types';
import { BS, EH, ES, ES2 } from './defines';

export class Tail {
  canvas :HTMLCanvasElement;

  ctx :CanvasRenderingContext2D;

  private px :number;

  private py :number;

  private color :number;

  private size :ISize;

  private readonly position :IPosition;

  private pShift :IPosition;

  private readonly root :HTMLElement;

  buffers :IInstructionBuffer[];

  constructor(root :HTMLElement, box :ISize & IPosition) {
    this.root = root;
    const canvas = this.canvas = document.createElement('canvas');
    canvas.setAttribute('draggable', 'false');
    canvas.width = box.w;
    canvas.height = box.h;
    canvas.style.transform = `translate(${box.x}px, ${box.y}px) translateZ(0)`;
    root.appendChild(canvas);
    const ctx = this.ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = BS;

    this.buffers = [];
    this.size = {
      w: box.w,
      h: box.h,
    };
    this.position = {
      x: box.x,
      y: box.y,
    };
    this.pShift = {
      x: 0,
      y: 0,
    };
  }

  destructor() {
    this.eraseBuffers();
    this.root.removeChild(this.canvas);
  }

  move({ x, y } :IPosition) {
    this.pShift.x = x;
    this.pShift.y = y;
    this.canvas.style.transform = `translate(${x + this.position.x}px, ${y + this.position.y}px) translateZ(0)`;
  }

  resize({ w, h } :ISize) {
    this.canvas.width = this.size.w = w;
    this.canvas.height = this.size.h = h;
    this.redraw();
  }

  redraw() {
    this.ctx.clearRect(0, 0, this.size.w, this.size.h);
    this.buffers.forEach(({ c, p }) => {
      if (c < 0) {
        this.clear(p);
      } else {
        this.draw(c, p);
      }
    });
  }

  eraseBuffers() {
    this.buffers = [];
  }

  pushBuffer(buf :IInstructionBuffer) {
    const { x, y } = this.position;
    const prepared :IInstructionBuffer = {
      c: buf.c,
      p: buf.p.map(([px, py]) => [px - x, py - y]),
    };
    this.buffers.push(prepared);
    if (prepared.c < 0) {
      this.clear(prepared.p);
    } else {
      this.draw(prepared.c, prepared.p);
    }
  }

  draw(color :Color, pl :Polyline) {
    const { ctx } = this;
    ctx.beginPath();
    ctx.strokeStyle = '#' + color.toString(16).padStart(6, '0');
    ctx.moveTo(pl[0][0], pl[0][1]);
    pl.forEach(([x, y]) => {
      ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  polyLaneAbs2Rel(poly :Polyline) :Polyline {
    const { x: sx, y :sy } = this.position;
    return poly.map(([x, y]) => [x - sx, y - sy]);
  }

  clear(pl :Polyline) {
    const { ctx } = this;
    let px;
    let py;
    pl.forEach(([x, y]) => {
      ctx.clearRect(x - ES2, y - ES2, ES, ES);
      if (px == null) {
        px = x;
        py = y;
        return;
      }
      if (x == px) {
        ctx.clearRect(x - ES2, Math.min(py, y), ES, Math.abs(py - y));
      } else if (y == py) {
        ctx.clearRect(Math.min(x, px), y - ES2, Math.abs(x - px), ES);
      } else {
        let lxc; // left x center
        let lyc; // left y center
        let rxc; // right x center
        let ryc; // right y center
        if (px < x) {
          lxc = px;
          lyc = py;
          rxc = x;
          ryc = y;
        } else {
          lxc = x;
          lyc = y;
          rxc = px;
          ryc = py;
        }
        const dx = rxc - lxc;
        const dy = ryc - lyc;
        const l = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)); // length rect
        const a = Math.atan(dy / dx); // angle rotate
        let x0;
        let x1;
        const y0 = lyc - ES2;
        const y1 = lyc + ES2 - EH;
        if (a > 0) { // clockwise rotation
          x0 = lxc + ES2;
          x1 = lxc - ES2;
        } else { // counterclockwise rotation
          x0 = lxc - ES2;
          x1 = lxc + ES2;
        }
        ctx.translate(x0, y0);
        ctx.rotate(a);
        ctx.translate(-x0, -y0);
        ctx.clearRect(x0, y0, l, EH);
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        ctx.translate(x1, y1 + EH);
        ctx.rotate(a);
        ctx.translate(-x1, -y1 - EH);
        ctx.clearRect(x1, y1, l, EH);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        px = x;
        py = y;
      }
    });
  }

  clearStart(x :number, y :number) {
    const { x: sx, y :sy } = this.position;
    this.ctx.clearRect(x - ES2 - sx, y - ES2 - sy, ES, ES);
    this.px = x - sx;
    this.py = y - sy;
  }

  clearPush(x :number, y :number) {
    const { x: sx, y :sy } = this.position;
    this.clear([[this.px, this.py], [x - sx, y - sy]]);
    this.px = x - sx;
    this.py = y - sy;
  }

  clearEnd() {
    this.px = null;
    this.py = null;
  }

  drawStart(color :Color, x :number, y :number) {
    const { x: sx, y :sy } = this.position;
    this.draw(color, [[x - sx, y - sy]]);
    this.color = color;
    this.px = x - sx;
    this.py = y - sy;
  }

  drawPush(x :number, y :number) {
    const { x: sx, y :sy } = this.position;
    this.draw(this.color, [[this.px, this.py], [x - sx, y - sy]]);
    this.px = x - sx;
    this.py = y - sy;
  }

  drawEnd() {
    this.px = null;
    this.py = null;
    this.color = null;
  }

  fillRect(x, y, w, h) {
    this.ctx.fillStyle = '#ffff00';
    this.ctx.fillRect(x, y, w, h);
  }

  hide() {
    this.canvas.style.display = 'none';
  }

  show() {
    this.canvas.style.display = '';
  }
}
