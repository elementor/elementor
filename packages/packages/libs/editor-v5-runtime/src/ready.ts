const INITIALIZED_EVENT = 'elementor/initialized';
const LOADING_DISMISS_DURATION_MS = 600;
const LOADING_SELECTORS = [ '#elementor-loading', '#elementor-preview-loading' ];

function dismissLoadingElement( element: HTMLElement ): void {
	element.style.transition = `opacity ${ LOADING_DISMISS_DURATION_MS }ms`;
	element.style.opacity = '0';

	window.setTimeout( () => {
		element.remove();
	}, LOADING_DISMISS_DURATION_MS );
}

export function dismissEditorLoading(): void {
	for ( const selector of LOADING_SELECTORS ) {
		const element = document.querySelector< HTMLElement >( selector );

		if ( element ) {
			dismissLoadingElement( element );
		}
	}
}

export function dispatchReadyEvent(): void {
	dismissEditorLoading();
	window.dispatchEvent( new CustomEvent( INITIALIZED_EVENT ) );
}
