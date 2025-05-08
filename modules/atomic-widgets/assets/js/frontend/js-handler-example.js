import { register } from '@elementor/frontend-handlers';

register( {
	elementType: 'e-button',
	uniqueId: 'e-button-click-handler',
	callback: ( { element } ) => {
		const onClick = () => {
			alert( `${ element.innerText } clicked` );
		};

		element.addEventListener( 'click', onClick );

		return () => {
			element.removeEventListener( 'click', onClick );
		};
	}
} );

register( {
	elementType: 'e-button',
	uniqueId: 'e-button-hover-handler',
	callback: ( { element, signal } ) => {
		const onMouseEnter = () => {
			element.style.color = 'red';
		};

		const onMouseLeave = () => {
			element.style.color = '';
		};

		element.addEventListener( 'mouseenter', onMouseEnter, { signal } );
		element.addEventListener( 'mouseleave', onMouseLeave, { signal } );
	}
} );
