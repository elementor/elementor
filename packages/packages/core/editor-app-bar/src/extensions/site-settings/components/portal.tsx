import * as React from 'react';
import {
	__privateIsRouteActive as isRouteActive,
	__privateUseListenTo as useListenTo,
	routeCloseEvent,
	routeOpenEvent,
} from '@elementor/editor-v1-adapters';
import { Portal as BasePortal, type PortalProps } from '@elementor/ui';

export default function Portal( props: Omit< PortalProps, 'container' > ) {
	const containerRef = useListenTo(
		[ routeOpenEvent( 'panel/global' ), routeCloseEvent( 'panel/global' ) ],
		getContainerRef
	);

	if ( ! containerRef.current ) {
		return null;
	}

	return <BasePortal container={ containerRef.current } { ...props } />;
}

function getContainerRef() {
	return isRouteActive( 'panel/global' )
		? { current: document.querySelector( '#elementor-panel-inner' ) }
		: { current: null };
}
