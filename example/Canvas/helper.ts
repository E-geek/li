/* eslint-disable @typescript-eslint/no-extra-parens */
import { IInstructionBuffer } from './types';
import { BS, ES, TAIL_SIZE } from './defines';

const ZERO_SHIFT = 0xffff >> 1;

const PADDING = Math.max(BS, ES);

const X_ONE = 1 << 16;

const Y_ONE = 1;

// return true if t1 and t2 equals array by content without order
const noDiffT = (t1 :number[], t2 :number[]) => {
  let d = t1[0];
  for (let i = 1, l = t1.length; i < l; i++) {
    d = d ^ t1[i];
  }
  for (let i = 0, l = t2.length; i < l; i++) {
    d = d ^ t2[i];
  }
  return d === 0;
};

const mergeTT = (t1 :number[], t2 :number[]) :number[] => {
  const res = t1;
  const set = new Set(t1);
  t2.forEach((v) => {
    if (!set.has(v)) {
      set.add(v);
      res.push(v);
    }
  });
  return t1;
};

export const xy2txy = (x :number, y :number) :Uint32Array => {
  const u32 = new Uint32Array(3);
  u32[0] = (ZERO_SHIFT + Math.floor(x / TAIL_SIZE)) << 16;
  u32[1] = (ZERO_SHIFT + Math.floor(y / TAIL_SIZE)) & 0xffff;
  u32[2] = u32[0] | u32[1];
  return u32;
};

export const tc2xy = (tc :number) :[number, number] => {
  const x = ((tc >> 16 & 0xffff) - ZERO_SHIFT) * TAIL_SIZE;
  const y = ((tc & 0xffff) - ZERO_SHIFT) * TAIL_SIZE;
  return [x, y];
};

export const b2c = (buf :Int32Array) :Map<number, IInstructionBuffer[]> => {
  const tails = new Map<number, IInstructionBuffer[]>();
  let tt = [];
  let ins :IInstructionBuffer;
  let color;

  const ins2tails = () => {
    if (ins) {
      tt.forEach((tc) => {
        const list = tails.get(tc);
        if (list) {
          list.push(ins);
        } else {
          tails.set(tc, [ins]);
        }
      });
      tt = [];
      ins = null;
    }
  };

  let px = buf[3];
  let py = buf[4];
  let [pTx, pTy] = xy2txy(px, py);

  for (let i = 0, j = 0, k = 0, l = buf.length; i < l; i += 2) {
    if (j === k) { // is meta
      k = buf[i];
      color = buf[i + 2];
      j = 3;
      i++;
      ins2tails();
      continue;
    }
    j += 2;
    const x = buf[i];
    const y = buf[i + 1];
    const spx = px;
    const spy = py;
    [pTx, pTy] = xy2txy(px, py);
    px = x;
    py = y;
    const [Tx, Ty, tc] = xy2txy(x, y);
    const t = [tc];
    const ix = Math.abs(x) % TAIL_SIZE;
    const iy = Math.abs(y) % TAIL_SIZE;
    let xInZone = 0;
    if (ix < PADDING) {
      t.push((Tx - X_ONE) | Ty);
      xInZone = -X_ONE;
    } else if (ix > TAIL_SIZE - PADDING) {
      t.push((Tx + X_ONE) | Ty);
      xInZone = +X_ONE;
    }
    if (iy < PADDING) {
      t.push(Tx | (Ty - Y_ONE));
      if (xInZone !== 0) {
        t.push((Tx + xInZone) | (Ty - Y_ONE));
      }
    } else if (iy > TAIL_SIZE - PADDING) {
      t.push(Tx | (Ty + Y_ONE));
      if (xInZone !== 0) {
        t.push((Tx + xInZone) | (Ty + Y_ONE));
      }
    }
    if (!ins) {
      ins = {
        c: color,
        p: [[x, y]],
      };
      tt = t;
      continue;
    }
    ins.p.push([x, y]);
    if (t.length === tt.length && noDiffT(t, tt)) {
      continue;
    }
    // if no diagonal rects
    const pTax = pTx >>> 16;
    const Tax = Tx >>> 16;
    if ((pTax === Tax && pTy === Ty) ||
      (pTax === Tax && Math.abs(pTy - Ty) === 1) ||
      (pTy === Ty && Math.abs(pTax - Tax) === 1)) {
      if (tt.length <= 1 && t.length === 1) {
        ins2tails();
        ins = {
          c: color,
          p: [[spx, spy], [x, y]],
        };
        tt = t;
        continue;
      }
      mergeTT(tt, t);
      continue;
    }
    // else if not vertical or horizontal link
    let minTx;
    let minTy;
    let maxTx;
    let maxTy;
    if (pTax < Tax) {
      minTx = pTax;
      maxTx = Tax;
    } else {
      minTx = Tax;
      maxTx = pTax;
    }
    if (pTy < Ty) {
      minTy = pTy;
      maxTy = Ty;
    } else {
      minTy = Ty;
      maxTy = pTy;
    }
    for (let cTy = minTy; cTy <= maxTy; cTy++) {
      for (let cTx = minTx; cTx <= maxTx; cTx++) {
        t.push((cTx << 16) | cTy);
      }
    }
    mergeTT(tt, t); // IMPORTANT! mergeTT has uniq filter now!
  }
  ins2tails();
  return tails;
};
