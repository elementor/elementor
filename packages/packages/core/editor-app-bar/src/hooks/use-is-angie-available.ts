import { useEffect, useState } from 'react';
import { isAngieAvailable } from '@elementor/editor-mcp';

export function useIsAngieAvailable(): boolean {
	const [ available, setAvailable ] = useState( () => isAngieAvailable() );

	useEffect( () => {
		if ( available ) {
			return;
		}

		if ( isAngieAvailable() ) {
			setAvailable( true );
			return;
		}

		const observer = new MutationObserver( () => {
			if ( isAngieAvailable() ) {
				observer.disconnect();
				setAvailable( true );
			}
		} );

		observer.observe( document.body, {
			childList: true,
			subtree: true,
		} );

		return () => observer.disconnect();
	}, [ available ] );

	return available;
}
