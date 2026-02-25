import { getNavigationWrapperElement } from './get-navigation-wrapper-element';
import { getWindow } from './get-window';

type Args = {
	id: string;
	label: string;
	route: string;
	isActive: boolean;
	position?: number;
};

export function createTabNavItem( { id, label, route, isActive, position }: Args ): void {
	const wrapper = getNavigationWrapperElement();

	const btn = document.createElement( 'button' );

	btn.className = [ 'elementor-component-tab', 'elementor-panel-navigation-tab', isActive ? 'elementor-active' : '' ]
		.filter( Boolean )
		.join( ' ' );

	btn.setAttribute( 'data-tab', id );

	btn.textContent = label;

	btn.addEventListener( 'click', () => {
		getWindow().$e.route( route );
	} );

	if ( position !== undefined && wrapper.children[ position ] ) {
		wrapper.insertBefore( btn, wrapper.children[ position ] );
	} else {
		wrapper.appendChild( btn );
	}
}
