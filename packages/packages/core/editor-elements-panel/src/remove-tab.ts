import {
	__privateListenTo as listenTo,
	routeOpenEvent,
	v1ReadyEvent,
	windowEvent,
} from '@elementor/editor-v1-adapters';

import { getEComponent } from './utils/get-e-component';
import { getNavigationWrapperElement } from './utils/get-navigation-wrapper-element';
import { getWindow } from './utils/get-window';

export function removeTab( id: string ) {
	listenTo( v1ReadyEvent(), () => {
		getWindow().elementor.hooks.addFilter( 'panel/elements/regionViews', ( regions ) => {
			const entries = Object.entries( regions ).filter( ( [ key ] ) => key !== id );

			return Object.fromEntries( entries );
		} );
	} );

	listenTo( windowEvent( 'elementor/panel/init' ), () => {
		getEComponent().removeTab( id );
	} );

	listenTo( routeOpenEvent( 'panel/elements' ), () => {
		getNavigationWrapperElement().querySelector( `[data-tab="${ id }"]` )?.remove();
	} );
}
