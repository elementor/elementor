import { useEffect, useState } from 'react';
import { listenTo, routeCloseEvent, routeOpenEvent, RouteEventDescriptor } from '../listeners';

export function useIsRouteActive( route: RouteEventDescriptor['name'] ): boolean {
	const [ isActive, setIsActive ] = useState( isRouteActive( route ) );

	useEffect( () => {
		const cleanupOpen = listenTo(
			routeOpenEvent( route ),
			() => setIsActive( true ),
		);

		const cleanupClose = listenTo(
			routeCloseEvent( route ),
			() => setIsActive( false ),
		);

		return () => {
			cleanupOpen();
			cleanupClose();
		};
	}, [] );

	return isActive;
}

// TODO: Move to the dispatchers and promisify (?).
function isRouteActive( route: string ): boolean {
	return ( window as any ).$e.routes.is( route );
}
