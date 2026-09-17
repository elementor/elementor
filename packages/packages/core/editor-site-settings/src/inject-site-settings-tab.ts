import { type ComponentType } from 'react';

import { registerSiteSettingsTab } from './tabs';

type Config = {
	id: string;
	component: ComponentType;
	priority?: number;
};

export function injectSiteSettingsTab( { id, component, priority }: Config ) {
	registerSiteSettingsTab( { id, component, priority } );
}
