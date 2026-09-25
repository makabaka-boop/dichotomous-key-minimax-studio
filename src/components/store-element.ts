import { LitElement } from 'lit';
import type { KeyStore } from '../store';

/**
 * Base element that re-renders whenever the shared store emits.
 * Subclasses adding their own reactive properties must spread
 * `StoreElement.properties` into their own `static properties`.
 */
export abstract class StoreElement extends LitElement {
  static override properties = { store: { attribute: false } };

  store!: KeyStore;

  private unsub: (() => void) | undefined;

  override connectedCallback(): void {
    super.connectedCallback();
    this.resubscribe();
  }

  override disconnectedCallback(): void {
    this.unsub?.();
    this.unsub = undefined;
    super.disconnectedCallback();
  }

  override willUpdate(changed: Map<string, unknown>): void {
    if (changed.has('store')) this.resubscribe();
  }

  private resubscribe(): void {
    this.unsub?.();
    this.unsub = this.store?.subscribe(() => this.requestUpdate());
  }
}
