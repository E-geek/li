
export class Node<T> {
  id :number;

  v :T;

  n :Node<T> | null;

  constructor(id :number, v :T, n ?:Node<T> | null) {
    this.id = id;
    this.v = v;
    this.n = n || null;
  }
}

export class TrickyList<T> {
  private id :number;

  start :Node<T> | null;

  end :Node<T> | null;

  constructor() {
    this.id = 0;
    this.start = null;
    this.end = null;
  }

  push(v :T) {
    const node = new Node(this.id++, v);
    if (this.start === null) {
      this.start = this.end = node;
    } else {
      this.end.n = node;
      this.end = node;
    }
  }

  [Symbol.iterator]() {
    let cur = this.start;
    return {
      next: () => {
        const out = {
          done: cur === null,
          value: cur,
        };
        if (cur) {
          cur = cur.n;
        }
        return out;
      },
    };
  }
}
