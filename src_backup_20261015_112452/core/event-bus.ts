export type GameEventMap = {
  'game:ready': { timestamp: number };
  'game:paused': { reason: string };
  'game:resumed': { timestamp: number };
};

type Listener<T> = (payload: T) => void;

export class TypedEventBus<E extends Record<string, unknown>> {
  private readonly listeners = new Map<keyof E, Set<Listener<never>>>();

  on<K extends keyof E>(event: K, listener: Listener<E[K]>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    const set = this.listeners.get(event)!;
    set.add(listener as Listener<never>);
    return () => {
      set.delete(listener as Listener<never>);
    };
  }

  emit<K extends keyof E>(event: K, payload: E[K]): void {
    const set = this.listeners.get(event);
    if (!set) return;
    for (const listener of set) {
      (listener as Listener<E[K]>)(payload);
    }
  }

  removeAll(): void {
    this.listeners.clear();
  }
}