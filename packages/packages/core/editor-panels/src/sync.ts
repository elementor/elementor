import {
	__privateIsRouteActive as isRouteActive,
	__privateListenTo as listenTo,
	__privateOpenRoute as openRoute,
	__privateRegisterRoute as registerRoute,
	routeCloseEvent,
	routeOpenEvent,
	windowEvent,
} from '@elementor/editor-v1-adapters';
import { __dispatch, __getState, __subscribe as originalSubscribe } from '@elementor/store';

import { selectOpenId, slice } from './store';

export const V2_PANEL = 'panel/v2';

export function getPortalContainer() {
	return document.querySelector( '#elementor-panel-inner' );
}

export function sync() {
	// Register the V2 panel route on panel init.
	listenTo( windowEvent( 'elementor/panel/init' ), () => registerRoute( V2_PANEL ) );

	// On empty route open, hide V1 panel elements.
	listenTo( routeOpenEvent( V2_PANEL ), () => {
		getV1PanelElements().forEach( ( el ) => {
			el.setAttribute( 'hidden', 'hidden' );
			el.setAttribute( 'inert', 'true' );
		} );
	} );

	// On empty route close, close the V2 panel.
	listenTo( routeCloseEvent( V2_PANEL ), () => selectOpenId( __getState() ) && __dispatch( slice.actions.close() ) );

	// On empty route close, show V1 panel elements.
	listenTo( routeCloseEvent( V2_PANEL ), () => {
		getV1PanelElements().forEach( ( el ) => {
			el.removeAttribute( 'hidden' );
			el.removeAttribute( 'inert' );
		} );
	} );

	// On V2 panel open, open the V2 panel route.
	listenTo( windowEvent( 'elementor/panel/init' ), () =>
		subscribe( {
			on: ( state ) => selectOpenId( state ),
			when: ( { prev, current } ) => !! ( ! prev && current ), // is panel opened
			callback: () => openRoute( V2_PANEL ),
		} )
	);

	// On V2 panel close, close the V2 panel route.
	listenTo( windowEvent( 'elementor/panel/init' ), () =>
		subscribe( {
			on: ( state ) => selectOpenId( state ),
			when: ( { prev, current } ) => !! ( ! current && prev ), // is panel closed
			callback: () => isRouteActive( V2_PANEL ) && openRoute( getDefaultRoute() ),
		} )
	);
}

function getV1PanelElements() {
	const v1ElementsSelector = [
		'#elementor-panel-header-wrapper',
		'#elementor-panel-content-wrapper',
		'#elementor-panel-state-loading',
		'#elementor-panel-footer',
	].join( ', ' );

	return document.querySelectorAll( v1ElementsSelector );
}

function getDefaultRoute() {
	type ExtendedWindow = Window & {
		elementor?: {
			documents?: {
				getCurrent?: () => {
					config?: {
						panel?: {
							default_route?: string;
						};
					};
				};
			};
		};
	};

	const defaultRoute = ( window as unknown as ExtendedWindow )?.elementor?.documents?.getCurrent?.()?.config?.panel
		?.default_route;

	return defaultRoute || 'panel/elements/categories';
}

function subscribe< TVal >( {
	on,
	when,
	callback,
}: {
	on: ( state: ReturnType< typeof __getState > ) => TVal;
	when: ( { prev, current }: { prev: TVal; current: TVal } ) => boolean;
	callback: ( { prev, current }: { prev: TVal; current: TVal } ) => void;
} ) {
	let prev: TVal;

	originalSubscribe( () => {
		const current = on( __getState() );

		if ( when( { prev, current } ) ) {
			callback( { prev, current } );
		}

		prev = current;
	} );
}
