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

const { inject: baseInject, useInjections: baseUseInjections } = createLocation();

export function injectIntoPanels( {
	id,
	component,
	keepMounted,
}: {
	id: string;
	component: ComponentType;
	keepMounted?: boolean;
} ) {
	panelsMeta.set( id, { keepMounted } );
	baseInject( { id, component } );
}

export function usePanelsInjections(): PanelsInjection[] {
	const injections = baseUseInjections();

	return injections.map( ( injection ) => ( {
		...injection,
		keepMounted: panelsMeta.get( injection.id )?.keepMounted ?? false,
	} ) );
}
