import { type ComponentType } from 'react';

import { registerKitTab } from './tabs';

type Config = {
	id: string;
	component: ComponentType;
	priority?: number;
};

export function injectKitTab( { id, component, priority }: Config ) {
	registerKitTab( { id, component, priority } );
}
