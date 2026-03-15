const ELEMENT_RENDERED_EVENT = 'elementor/editor/element-rendered';

export function notifyElementsRendered() {
	setTimeout( () => {
		window.dispatchEvent( new CustomEvent( ELEMENT_RENDERED_EVENT ) );
	}, 0 );
}
