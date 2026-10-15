export type GameId = string;

export type Result<T, E = string> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

export interface Identifiable {
  readonly id: GameId;
}

export interface GameClock {
  now(): number;
}