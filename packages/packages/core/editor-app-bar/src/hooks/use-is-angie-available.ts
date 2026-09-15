import { useEffect, useState } from 'react';
import { isAngiePluginAvailable, waitForAngiePluginAvailable } from '@elementor/editor-mcp';

export function useIsAngieAvailable(): boolean {
	const [ available, setAvailable ] = useState( () => isAngiePluginAvailable() );

	useEffect( () => {
		if ( available ) {
			return;
		}

		let cancelled = false;

		void waitForAngiePluginAvailable().then( ( pluginAvailable ) => {
			if ( ! cancelled && pluginAvailable ) {
				setAvailable( true );
			}
		} );

		return () => {
			cancelled = true;
		};
	}, [ available ] );

	return available;
}
