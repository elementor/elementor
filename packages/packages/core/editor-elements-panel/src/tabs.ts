import { type ComponentType } from 'react';

type Tab = {
	id: string;
	label: string;
	component: ComponentType;
	priority?: number;
};

const tabs: Record< Tab[ 'id' ], Tab > = {};

export function registerTab( tab: Tab ) {
	tabs[ tab.id ] = tab;
}

export function getTab( id: string ): Tab | null {
	const tab = tabs[ id ];

	if ( tab ) {
		return tab;
	}

	const sortedTabs = Object.values( tabs ).sort( ( { priority: a = 0 }, { priority: b = 0 } ) => a - b );

	return sortedTabs.find( ( { id: _id } ) => _id === id ) ?? null;
}
