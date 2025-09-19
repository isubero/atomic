export { createAtom } from "./atom";

// Re-export types for better developer experience
export type AtomState = Record<string, any>;
export type AtomSubscriber = (state: AtomState) => void;

// Export the main Atom interface
export interface Atom {
  readonly state: AtomState;
  getState(): AtomState;
  setState(newState: Partial<AtomState>): void;
  attach(element: HTMLElement): void;
  detach(element: HTMLElement): void;
  cleanup(): void;
  subscribe(callback: AtomSubscriber): () => void;
  unsubscribe(callback: AtomSubscriber): void;
}
