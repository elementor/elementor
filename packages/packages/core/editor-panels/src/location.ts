import { type ComponentType } from 'react';
import { createLocation } from '@elementor/locations';

type PanelsInjectionMeta = {
	keepMounted?: boolean;
};

export type PanelsInjection = {
	id: string;
	component: ComponentType;
	keepMounted?: boolean;
};

const panelsMeta = new Map< string, PanelsInjectionMeta >();

const {
	inject: baseInject,
	useInjections: baseUseInjections,
	getInjections,
} = createLocation();

function pruneStalePanelsMeta( injections: ReturnType< typeof getInjections > ) {
	const activeIds = new Set( injections.map( ( injection ) => injection.id ) );

	for ( const id of panelsMeta.keys() ) {
		if ( ! activeIds.has( id ) ) {
			panelsMeta.delete( id );
		}
	}
}

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

	if ( getInjections().some( ( injection ) => injection.id === id ) && ! existedBefore ) {
		panelsMeta.set( id, { keepMounted } );
	}
}

export function usePanelsInjections(): PanelsInjection[] {
	const injections = baseUseInjections();

	pruneStalePanelsMeta( injections );

	return injections.map( ( injection ) => ( {
		...injection,
		keepMounted: panelsMeta.get( injection.id )?.keepMounted ?? false,
	} ) );
}
