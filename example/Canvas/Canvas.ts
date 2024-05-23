import { Plot } from './Plot';
import { Tail } from './Tail';
import { b2c, tc2xy, xy2txy } from './helper';
import { IPosition } from '../../interfaces';
import { TAIL_SIZE } from './defines';
import { Color, Polyline } from './types';

export class Canvas {
  private plot :Plot;

  private sprites :Tail[];

  private spritesMap :Map<number, Tail>;

  private position :IPosition;

  private readonly root :HTMLElement;

  private shiftX :number;

  private shiftY :number;

  private redrawAfterUpdate :number[];

  constructor(req) {
    this.root = document.getElementById('plot-demo');
    if (!this.root) {
      throw new Error('root for drawing not ready yet!');
    }
    const { width, height } = getComputedStyle(this.root);
    const plot = this.plot = new Plot(this.root, {
      w: parseInt(width, 10),
      h: parseInt(height, 10),
    });
    this.sprites = [];
    this.spritesMap = new Map();
    this.position = {
      x: 0,
      y: 0,
    };
    this.redrawAfterUpdate = [];

    plot.bind(() => { // onChunk
      const buffer = plot.getUnsentBC();
      if (buffer === null) {
        return;
      }
      req(buffer);
    }, (coords :Polyline) => { // onClear
      const [[x, y]] = coords;
      const tc = xy2txy(x, y);
      const t = [tc[2]];
      if (coords.length === 2) {
        const [,[x, y]] = coords;
        const tc = xy2txy(x, y);
        if (t[0] !== tc[2]) {
          t[1] = tc[2];
        }
      }
      t.forEach((tCoord) => {
        const sprite = this.spritesMap.get(tCoord);
        if (sprite) {
          sprite.clear(sprite.polyLaneAbs2Rel(coords));
        }
        this.redrawAfterUpdate.push(...t);
      });
    }, () => { // onClearEnd
      //
    });
    this.shiftX = this.plot.size.w / 2;
    this.shiftY = this.plot.size.h / 2;
  }

  resize() {
    const { width, height } = getComputedStyle(this.root);
    this.plot.resize(parseInt(width, 10), parseInt(height, 10));
    this.move(this.position);
  }

  move(position :IPosition) {
    const { x, y } = position;
    this.position = { x, y };
    this.shiftX = x + this.plot.size.w / 2;
    this.shiftY = y + this.plot.size.h / 2;
    const p = {
      x: this.shiftX,
      y: this.shiftY,
    };
    this.sprites.forEach((tail) => {
      tail.move(p);
    });
    this.plot.move(p);
  }

  append(approved :number[], summary :Int32Array) {
    const instructions = b2c(summary);
    [...instructions].forEach(([tCxy, insBuf]) => {
      let tail = this.spritesMap.get(tCxy);
      if (!tail) {
        const [tAx, tAy] = tc2xy(tCxy);
        tail = new Tail(this.root, {
          w: TAIL_SIZE,
          h: TAIL_SIZE,
          x: tAx,
          y: tAy,
        });
        tail.move({
          x: this.plot.size.w / 2 + this.position.x,
          y: this.plot.size.h / 2 + this.position.y,
        });
        this.spritesMap.set(tCxy, tail);
        this.sprites.push(tail);
      }
      insBuf.forEach((ins) => {
        tail.pushBuffer(ins);
      });
    });
    if (this.redrawAfterUpdate.length) {
      const done = new Set<number>();
      this.redrawAfterUpdate.forEach((t :number) => {
        if (!done.has(t)) {
          done.add(t);
          const sprite = this.spritesMap.get(t);
          if (sprite) {
            sprite.redraw();
          }
        }
      });
      this.redrawAfterUpdate = [];
    }
    this.plot.sendDone(approved);
  }

  setDraw(isDraw) {
    if (isDraw) {
      this.plot.show();
    } else {
      this.plot.hide();
    }
  }

  choseBrushMode(color :Color) {
    this.plot.brush(color);
  }

  eraseMode() {
    this.plot.erase();
  }

  eraseAll() {
    this.sprites.forEach((tail) => {
      tail.eraseBuffers();
      tail.redraw();
    });
  }
}
