import { type ComponentType } from 'react';
import { __registerFlushInjections, createLocation } from '@elementor/locations';

type PanelsInjectionMeta = {
	keepMounted?: boolean;
};

export type PanelsInjection = {
	id: string;
	component: ComponentType;
	keepMounted?: boolean;
};

const panelsMeta = new Map< string, PanelsInjectionMeta >();

const { inject: baseInject, useInjections: baseUseInjections, getInjections } = createLocation();

__registerFlushInjections( () => {
	panelsMeta.clear();
} );

export function injectIntoPanels( {
	id,
	component,
	keepMounted,
}: {
	id: string;
	component: ComponentType;
	keepMounted?: boolean;
} ) {
	const existedBefore = getInjections().some( ( injection ) => injection.id === id );

	baseInject( { id, component } );

	if ( ! existedBefore ) {
		panelsMeta.set( id, { keepMounted } );
	}
}

export function usePanelsInjections(): PanelsInjection[] {
	const injections = baseUseInjections();

	return injections.map( ( injection ) => ( {
		...injection,
		keepMounted: panelsMeta.get( injection.id )?.keepMounted ?? false,
	} ) );
}
