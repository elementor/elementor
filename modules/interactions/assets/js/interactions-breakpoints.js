'use strict';

const RESIZE_DEBOUNCE_TIMEOUT = 100;

const breakpoints = {
	list: {},
	active: {},
	onChange: () => {},
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

	const onResize = () => {
		if ( timeout ) {
			window.clearTimeout( timeout );
			timeout = null;
		}

		timeout = window.setTimeout( () => {
			const currentBreakpoint = matchBreakpoint( window.innerWidth );

			if ( currentBreakpoint === breakpoints.active ) {
				return;
			}

			breakpoints.active = currentBreakpoint;

			if ( 'function' === typeof breakpoints.onChange ) {
				breakpoints.onChange( breakpoints.active );
			}
		}, RESIZE_DEBOUNCE_TIMEOUT );
	};

	window.addEventListener( 'resize', onResize );
}

function getBreakpointsList() {
	return ElementorInteractionsConfig?.breakpoints || {};
}

export function initBreakpoints( { onChange } = {} ) {
	breakpoints.list = getBreakpointsList();

	breakpoints.active = matchBreakpoint( window.innerWidth );

	if ( 'function' === typeof onChange ) {
		breakpoints.onChange = onChange;
	}

	attachEventListeners();
}
