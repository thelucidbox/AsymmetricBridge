import { fabianThesis } from "../config/fabian-thesis.js";

export const DOMINOS = fabianThesis.dominos;

export const ALL_SIGNALS = DOMINOS.flatMap((domino) =>
  domino.signals.map((signal) => ({
    ...signal,
    dominoId: domino.id,
    dominoName: domino.name,
    dominoColor: domino.color,
  })),
);
