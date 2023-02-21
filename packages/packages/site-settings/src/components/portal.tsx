import { ReactNode } from 'react';
import { Portal as BasePortal } from '@elementor/ui';
import { isRouteActive, routeCloseEvent, routeOpenEvent, useListenTo } from '@elementor/v1-adapters';

export default function Portal( { children }: { children: ReactNode } ) {
	const containerRef = useListenTo(
		[
			routeOpenEvent( 'panel/global' ),
			routeCloseEvent( 'panel/global' ),
		],
		getContainerRef
	);

	if ( ! containerRef.current ) {
		return null;
	}

	return (
		<BasePortal container={ containerRef.current }>
			{ children }
		</BasePortal>
	);
}

function getContainerRef() {
	return isRouteActive( 'panel/global' )
		? { current: document.querySelector( '#elementor-panel-inner' ) }
		: { current: null };
}
