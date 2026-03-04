import { useCallback, useEffect, useState } from 'react';
import { getAngieIframe, toggleAngieSidebar } from '@elementor/angie-sdk';

import { isAngieActive } from '../utils/is-angie-active';

export function useAngieSidebarPrompt() {
	const [ angieSidebar, setAngieSidebar ] = useState< HTMLIFrameElement | null >( null );

	useEffect( () => {
		async function load() {
			const isActive = await isAngieActive();
			if ( isActive ) {
				const iframe = getAngieIframe();

				setAngieSidebar( iframe );
			}
		}
		load();
	}, [] );

	const callback = useCallback(
		( prompt?: string ) => {
			if ( ! angieSidebar ) {
				return;
			}
			toggleAngieSidebar( angieSidebar, true );

			if ( ! prompt ) {
				return;
			}

			window.location.hash = `angie-prompt=${ encodeURIComponent( prompt ) }`;
		},
		[ angieSidebar ]
	);

	if ( ! angieSidebar ) {
		return null;
	}

	return callback;
}
