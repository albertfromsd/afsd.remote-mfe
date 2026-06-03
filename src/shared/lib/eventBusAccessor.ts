/**
 * Federated-or-local accessor for the cross-MFE event bus.
 *
 * Mirrors the storeAccessor pattern: in embedded mode the bus is the
 * host's federated singleton (one EventTarget across host + remote). In
 * standalone mode the federation import fails and we fall back to the
 * remote's local bus — events fire but only the remote sees them, which
 * is the correct standalone behavior.
 *
 * Consume `eventBus` directly for emit (sync). For `on/once`, prefer the
 * `useEventBus` React hook below since federation resolution is async.
 */
import { useEffect } from 'react';
import {
  eventBus as localEventBus,
  type EventBus,
  type EventName,
  type EventMap,
  type Unsubscribe,
} from './eventBus';

let resolvedBus: EventBus = localEventBus;
let resolved = false;

const busPromise: Promise<EventBus> = (async () => {
  try {
    const mod = (await import('hostTemplate/lib/eventBus')) as { eventBus: EventBus };
    resolvedBus = mod.eventBus;
  } catch (err) {
    console.warn('[eventBus] hostTemplate/lib/eventBus unavailable; using local fallback', err);
    resolvedBus = localEventBus;
  }
  resolved = true;
  return resolvedBus;
})();

/**
 * Always returns the *current* bus. Before federation resolves this is the
 * local bus; after it resolves it's whichever side resolved (host singleton
 * in embedded mode, local fallback in standalone).
 *
 * Emits are safe to do synchronously — listeners attached to the local bus
 * pre-resolution simply won't see federated events from the brief window
 * before resolution. In practice resolution happens before user interaction.
 */
export const eventBus: EventBus = new Proxy({} as EventBus, {
  get(_target, prop, receiver) {
    return Reflect.get(resolvedBus, prop, receiver).bind(resolvedBus);
  },
});

/**
 * React hook to subscribe with proper cleanup. Waits for federation to
 * resolve before subscribing so listeners attach to the canonical bus.
 */
export function useEventBus<K extends EventName>(
  name: K,
  listener: (payload: EventMap[K]) => void,
  deps: ReadonlyArray<unknown> = [],
): void {
  useEffect(() => {
    let off: Unsubscribe | undefined;
    let cancelled = false;
    const attach = (bus: EventBus) => {
      if (cancelled) return;
      off = bus.on(name, listener);
    };
    if (resolved) attach(resolvedBus);
    else busPromise.then(attach);
    return () => {
      cancelled = true;
      off?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, ...deps]);
}

export async function initEventBus(): Promise<EventBus> {
  return busPromise;
}

export type { EventName, EventMap, Unsubscribe, EventBus };
