import { useEffect } from 'react';

export default function usePageTitle( { title, prefix } ) {
	useEffect( () => {
		if ( ! prefix ) {
			prefix = __( 'Elementor', 'elementor' );
		}

		document.title = `${ prefix } | ${ title }`;
	}, [ title, prefix ] );
}
