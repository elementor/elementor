import EComponent from './e-component';

window.addEventListener( 'elementor:init-components', () => {
	window.$e.components.register( new EComponent() );
} );

