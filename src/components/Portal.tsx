import React, {
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  useSyncExternalStore,
} from 'react';
import { StyleSheet, View } from 'react-native';

interface PortalEntry {
  id: string;
  node: React.ReactNode;
}

class PortalRegistry {
  private entries: PortalEntry[] = [];
  private listeners = new Set<() => void>();

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = () => this.entries;

  mount(id: string, node: React.ReactNode) {
    const existingIndex = this.entries.findIndex((item) => item.id === id);
    if (existingIndex >= 0) {
      const next = [...this.entries];
      next[existingIndex] = { id, node };
      this.entries = next;
    } else {
      this.entries = [...this.entries, { id, node }];
    }
    this.emit();
  }

  unmount(id: string) {
    if (!this.entries.some((item) => item.id === id)) return;
    this.entries = this.entries.filter((item) => item.id !== id);
    this.emit();
  }

  private emit() {
    for (const listener of this.listeners) {
      listener();
    }
  }
}

const PortalContext = createContext<PortalRegistry | null>(null);

export function PortalProvider({ children }: { children: React.ReactNode }) {
  const registry = useMemo(() => new PortalRegistry(), []);
  return (
    <PortalContext.Provider value={registry}>
      <View style={styles.root}>
        {children}
        <PortalHost />
      </View>
    </PortalContext.Provider>
  );
}

function PortalHost() {
  const registry = useContext(PortalContext);
  if (!registry) return null;
  return <PortalHostInner registry={registry} />;
}

function PortalHostInner({ registry }: { registry: PortalRegistry }) {
  const entries = useSyncExternalStore(
    registry.subscribe,
    registry.getSnapshot,
    registry.getSnapshot
  );

  if (entries.length === 0) {
    return null;
  }

  return (
    <View style={styles.host} pointerEvents="box-none">
      {entries.map((entry) => (
        <View
          key={entry.id}
          style={StyleSheet.absoluteFill}
          pointerEvents="box-none"
        >
          {entry.node}
        </View>
      ))}
    </View>
  );
}

export function Portal({ children }: { children: React.ReactNode }) {
  const registry = useContext(PortalContext);
  const id = useId();

  useEffect(() => {
    if (!registry) return;
    registry.mount(id, children);
  }, [registry, id, children]);

  useEffect(() => {
    if (!registry) return;
    return () => {
      registry.unmount(id);
    };
  }, [registry, id]);

  return null;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  host: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 9999,
    elevation: 9999,
  },
});
