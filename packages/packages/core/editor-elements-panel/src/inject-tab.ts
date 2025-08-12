import { type ComponentType } from 'react';
import {
	__privateListenTo as listenTo,
	routeOpenEvent,
	v1ReadyEvent,
	windowEvent,
} from '@elementor/editor-v1-adapters';

import { LEGACY_ELEMENTS_PANEL_ROUTE_PREFIX } from './consts';
import { registerTab } from './tabs';
import { createLegacyView } from './utils/create-legacy-view';
import { createTabNavItem } from './utils/create-tab-nav-item';
import { getLegacyElementsPanelComponent } from './utils/get-legacy-elements-panel-component';
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
			// Creating a empty legacy view that will be replaced by react component.
			regions[ id ] = { region: elements, view: createLegacyView() };

			return regions;
		} );
	} );

	listenTo( windowEvent( 'elementor/panel/init' ), () => {
		// when adding a tab to the legacy elements panel, it will generate new route based on the id.
		getLegacyElementsPanelComponent().addTab( id, { title: label } );
	} );

	listenTo( routeOpenEvent( LEGACY_ELEMENTS_PANEL_ROUTE_PREFIX ), ( e ) => {
		const route = `${ LEGACY_ELEMENTS_PANEL_ROUTE_PREFIX }${ id }`;

		createTabNavItem( {
			id,
			label,
			route,
			isActive: 'route' in e && e.route === route,
		} );
	} );
}
