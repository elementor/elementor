import { dispatch } from '@elementor/store';
import { Breakpoint, ExtendedWindow, Slice } from '../types';
import { listenTo, v1ReadyEvent, windowEvent } from '@elementor/v1-adapters';
import { __ } from '@wordpress/i18n';

export default function syncStore( slice: Slice ) {
	syncInitialization( slice );
	syncOnChange( slice );
}

function syncInitialization( slice: Slice ) {
	const { init } = slice.actions;

	listenTo(
		v1ReadyEvent(),
		() => {
			dispatch( init( {
				entities: getBreakpoints(),
				activeId: getActiveBreakpoint(),
			} ) );
		}
	);
}

function syncOnChange( slice: Slice ) {
	const { activateBreakpoint } = slice.actions;

	listenTo(
		deviceModeChangeEvent(),
		() => {
			const activeBreakpoint = getActiveBreakpoint();

			dispatch( activateBreakpoint( activeBreakpoint ) );
		},
	);
}

function getBreakpoints() {
	const { breakpoints } = ( window as unknown as ExtendedWindow ).elementor?.config?.responsive || {};

	if ( ! breakpoints ) {
		return [];
	}

	const entities = Object
		.entries( breakpoints )
		.filter( ( [ , breakpoint ] ) => breakpoint.is_enabled )
		.map( ( [ id, { value, direction, label } ] ) => {
			return {
				id,
				label,
				width: value,
				type: direction === 'min' ? 'min-width' : 'max-width',
			} as Breakpoint;
		} );

	// Desktop breakpoint is not included in V1 config.
	entities.push( {
		id: 'desktop',
		label: __( 'Desktop', 'elementor' ),
	} );

	return entities;
}

function getActiveBreakpoint() {
	const extendedWindow = window as unknown as ExtendedWindow;

	return extendedWindow.elementor?.channels?.deviceMode?.request?.( 'currentMode' ) || null;
}

function deviceModeChangeEvent() {
	return windowEvent( 'elementor/device-mode/change' );
}
