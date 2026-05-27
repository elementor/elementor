import { useEffect } from 'react';

import { ANGIE_GUIDE_TOGGLE_EVENT } from '../angie-consts';

export function useAutoShow() {
	useEffect( () => {
		if ( ! window.elementor?.config?.angie?.autoShow ) {
			return;
		}

		const id = setTimeout( () => {
			window.dispatchEvent( new CustomEvent( ANGIE_GUIDE_TOGGLE_EVENT ) );
		}, 0 );

		return () => clearTimeout( id );
	}, [] );
}
