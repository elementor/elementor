import { register } from '@elementor/frontend-handlers';

register( {
	elementType: 'e-tabs',
	uniqueId: 'e-tabs-handler',
	callback: ( { element } ) => {
		const testElement = document.createElement( 'div' );
		testElement.style.height = '100%';
		testElement.style.backgroundColor = 'red';
		testElement.style.width = '100%';
		element.appendChild( testElement );
		console.log( element );
	},
} );
