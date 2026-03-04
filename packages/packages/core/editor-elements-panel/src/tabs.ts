import { type ComponentType } from 'react';

type Tab = {
	label: string;
	component: ComponentType;
	priority: number;
};

const registry = new Map< string, Tab >();

const DEFAULT_PRIORITY = 10;

export function registerTab( {
	id,
	priority = DEFAULT_PRIORITY,
	...props
}: Omit< Tab, 'priority' > & { id: string; priority?: number } ) {
	registry.set( id, { ...props, priority } );
}

export function getTab( id: string ): Tab | null {
	return registry.get( id ) ?? null;
}
