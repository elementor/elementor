import { type ComponentType } from 'react';
import { __registerFlushInjections, createLocation } from '@elementor/locations';

type FloatingPanelsInjectionMeta = {
	keepMounted?: boolean;
};

export type FloatingPanelsInjection = {
	id: string;
	component: ComponentType;
	keepMounted?: boolean;
};

const panelsMeta = new Map< string, FloatingPanelsInjectionMeta >();

const { inject: baseInject, useInjections: baseUseInjections, getInjections } = createLocation();

__registerFlushInjections( () => {
	panelsMeta.clear();
} );

export function injectIntoFloatingPanels( {
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

export function useFloatingPanelsInjections(): FloatingPanelsInjection[] {
	const injections = baseUseInjections();

	return injections.map( ( injection ) => ( {
		...injection,
		keepMounted: panelsMeta.get( injection.id )?.keepMounted ?? false,
	} ) );
}
