import { useEffect, useState } from 'react';
import { listenTo, routeCloseEvent, routeOpenEvent, RouteEventDescriptor } from '../listeners';

export function useIsRouteActive( route: RouteEventDescriptor['name'] ): boolean {
	const [ isActive, setIsActive ] = useState( false );

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
