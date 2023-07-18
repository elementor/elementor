export function dispatchCommandBefore( command: string ) {
	window.dispatchEvent( new CustomEvent( 'elementor/commands/run/before', {
		detail: {
			command,
		},
	} ) );
}

export function dispatchCommandAfter( command: string ) {
	window.dispatchEvent( new CustomEvent( 'elementor/commands/run/after', {
		detail: {
			command,
		},
	} ) );
}

export function dispatchRouteOpen( route: string ) {
	window.dispatchEvent( new CustomEvent( 'elementor/routes/open', {
		detail: {
			route,
		},
	} ) );
}

export function dispatchRouteClose( route: string ) {
	window.dispatchEvent( new CustomEvent( 'elementor/routes/close', {
		detail: {
			route,
		},
	} ) );
}

export function dispatchEditModeChange() {
	window.dispatchEvent( new CustomEvent( 'elementor/edit-mode/change' ) );
}

export function dispatchWindowEvent( event: string ) {
	window.dispatchEvent( new CustomEvent( event ) );
}
