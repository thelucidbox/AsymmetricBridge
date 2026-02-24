import { defaultThesis } from "../config/default-thesis.js";

export const DOMINOS = defaultThesis.dominos;

export const ALL_SIGNALS = DOMINOS.flatMap((domino) =>
  domino.signals.map((signal) => ({
    ...signal,
    dominoId: domino.id,
    dominoName: domino.name,
    dominoColor: domino.color,
  })),
);
