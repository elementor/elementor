'use strict';

const breakpoints = {
	list: {},
	active: {},
	onChange: ( breakpoint ) => {},
};

export function getActiveBreakpoint() {
	return breakpoints.active;
}

function matchBreakpoint( width ) {
	for ( const label in breakpoints.list ) {
		const breakpoint = breakpoints.list[ label ];

		if ( 'min' === breakpoint.direction && width >= breakpoint.value ) {
			return label;
		}

		if ( 'max' === breakpoint.direction && breakpoint.value >= width ) {
			return label;
		}
	}

	return 'desktop';
}

function attachEventListeners() {
	let timeout = null;

	window.addEventListener( 'resize', () => {
		timeout && window.clearTimeout( timeout );
		timeout = window.setTimeout( () => {
			timeout = null;

			const currentBreakpoint = matchBreakpoint( window.innerWidth );

			if ( currentBreakpoint === breakpoints.active ) {
				return;
			}

			breakpoints.active = currentBreakpoint;

			if ( 'function' === typeof breakpoints.onChange ) {
				breakpoints.onChange( breakpoints.active );
			}
		}, 25 );
	} );
}

export function initBreakpoints( { onChange } = {} ) {
	breakpoints.list = window.elementorFrontendConfig.responsive.activeBreakpoints;
	breakpoints.active = matchBreakpoint( window.innerWidth );

	if ( 'function' === typeof onChange ) {
		breakpoints.onChange = onChange;
	}

	attachEventListeners();
}
