import { __ } from '@wordpress/i18n';

import { type Breakpoint, type BreakpointId, type ExtendedWindow } from '../../types';

export function getBreakpointsByWidths(): { minWidth: Breakpoint[]; defaults: Breakpoint[]; maxWidth: Breakpoint[] } {
	const { breakpoints } = ( window as unknown as ExtendedWindow ).elementor?.config?.responsive || {};

	if ( ! breakpoints || Object.entries( breakpoints ).length === 0 ) {
		return {
			minWidth: [],
			defaults: [],
			maxWidth: [],
		};
	}

	const minWidth: Breakpoint[] = [];
	const maxWidth: Breakpoint[] = [];

	const defaults: Breakpoint[] = [
		// Desktop breakpoint is not included in V1 config.
		{ id: 'desktop', label: __( 'Desktop', 'elementor' ) },
	];

	Object.entries( breakpoints ).forEach( ( [ id, v1Breakpoint ] ) => {
		if ( ! v1Breakpoint.is_enabled ) {
			return;
		}

		const breakpoint: Breakpoint = {
			id: id as BreakpointId,
			label: v1Breakpoint.label,
			width: v1Breakpoint.value,
			type: v1Breakpoint.direction === 'min' ? 'min-width' : 'max-width',
		};

		if ( ! breakpoint.width ) {
			defaults.push( breakpoint );
		} else if ( breakpoint.type === 'min-width' ) {
			minWidth.push( breakpoint );
		} else if ( breakpoint.type === 'max-width' ) {
			maxWidth.push( breakpoint );
		}
	} );

	const byWidth = ( a: Breakpoint, b: Breakpoint ) => {
		return a.width && b.width ? b.width - a.width : 0;
	};

	return {
		minWidth: minWidth.sort( byWidth ),
		defaults,
		maxWidth: maxWidth.sort( byWidth ),
	};
}
