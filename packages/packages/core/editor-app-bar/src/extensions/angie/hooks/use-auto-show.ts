import { useEffect } from 'react';

import { CREATE_WIDGET_EVENT } from '../angie-consts';

export function useAutoShow() {
	useEffect( () => {
		if ( ! window.elementor?.config?.angie?.autoShow ) {
			return;
		}

		const id = setTimeout( () => {
			window.dispatchEvent(
				new CustomEvent( CREATE_WIDGET_EVENT, {
					detail: { entry_point: 'auto_show' },
				} )
			);
		}, 0 );

		return () => clearTimeout( id );
	}, [] );
}
