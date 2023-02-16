import { PropsWithChildren } from 'react';
import { Portal as BasePortal } from '@elementor/ui';
import { isRouteActive, routeCloseEvent, routeOpenEvent, useListenTo } from '@elementor/v1-adapters';

export default function Portal( { children }: PropsWithChildren<object> ) {
	const containerRef = useListenTo( [
		routeOpenEvent( 'panel/global' ),
		routeCloseEvent( 'panel/global' ),
	], () => {
		return isRouteActive( 'panel/global' )
			? { current: document.querySelector( '#elementor-panel-inner' ) }
			: { current: null };
	} );

	if ( ! containerRef.current ) {
		return null;
	}

	return (
		<BasePortal container={ containerRef.current }>
			{ children }
		</BasePortal>
	);
}
