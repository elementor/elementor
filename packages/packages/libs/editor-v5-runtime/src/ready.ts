const INITIALIZED_EVENT = 'elementor/initialized';

export function dispatchReadyEvent(): void {
	window.dispatchEvent( new CustomEvent( INITIALIZED_EVENT ) );
}
