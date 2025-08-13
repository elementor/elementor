import { type ComponentType } from 'react';

type Tab = {
	id: string;
	label: string;
	component: ComponentType;
};

const tabs: Record< Tab[ 'id' ], Tab > = {};

export function registerTab( tab: Tab ) {
	tabs[ tab.id ] = tab;
}

export function getTab( id: string ): Tab | null {
	return tabs[ id ] || null;
}
