import { useEffect, useRef } from 'react';

export default function usePageTitle( { title, prefix } ) {
	const prefixRef = useRef( prefix );

	useEffect( () => {
		if ( ! prefix ) {
			prefixRef.current = __( 'Elementor', 'elementor' );
		}

		document.title = `${ prefixRef.current } | ${ title }`;
	}, [ title, prefix ] );
}
