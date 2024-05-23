
export type Polyline = ([number, number])[];

export type Color = number;

export type TailCoords = number;

export interface IInstructionBuffer {
  c :Color;
  p :Polyline;
  t ?:TailCoords[];
}
