import { type ComponentType } from 'react';
import {
	__privateListenTo as listenTo,
	routeOpenEvent,
	v1ReadyEvent,
	windowEvent,
} from '@elementor/editor-v1-adapters';

import { E_ROUTE_PREFIX } from './consts';
import { registerTab } from './tabs';
import { createLegacyView } from './utils/create-legacy-view';
import { createTabNavItem } from './utils/create-tab-nav-item';
import { getEComponent } from './utils/get-e-component';
import { getWindow } from './utils/get-window';

type Config = {
	id: string;
	label: string;
	component: ComponentType;
};

export function injectTab( { id, label, component }: Config ) {
	registerTab( { id, label, component } );

	listenTo( v1ReadyEvent(), () => {
		getWindow().elementor.hooks.addFilter( 'panel/elements/regionViews', ( regions, { elements } ) => {
			regions[ id ] = { region: elements, view: createLegacyView() };

			return regions;
		} );
	} );

	listenTo( windowEvent( 'elementor/panel/init' ), () => {
		getEComponent().addTab( id, { title: label } );
	} );

	listenTo( routeOpenEvent( 'panel/elements' ), ( e ) => {
		const route = `${ E_ROUTE_PREFIX }${ id }`;

		createTabNavItem( {
			id,
			label,
			route,
			isActive: 'route' in e && e.route === route,
		} );
	} );
}
