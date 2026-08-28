export type DrawingEntry = {
  id: number;
  artist: string;
  date: number;
  drawing: string;
  printed: boolean;
};

export type Photo = {
  name: string;
  thumb: string;
  w?: number;
  h?: number;
};
