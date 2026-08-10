import { type ComponentType } from 'react';

type Tab = {
  component: ComponentType;
  priority: number;
};

const registry = new Map< string, Tab >();

const DEFAULT_PRIORITY = 10;

export function registerSiteSettingsTab( {
  id,
  priority = DEFAULT_PRIORITY,
  component,
}: {
  id: string;
  priority?: number;
  component: ComponentType;
} ) {
  const existing = registry.get( id );

  if ( ! existing || priority <= existing.priority ) {
    registry.set( id, { component, priority } );
  }
}

export function getSiteSettingsTab( id: string ): Tab | null {
  return registry.get( id ) ?? null;
}
