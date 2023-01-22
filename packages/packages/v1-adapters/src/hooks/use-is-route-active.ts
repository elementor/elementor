import { useEffect, useState } from 'react';
import {
	isRouteActive,
	listenTo,
	routeCloseEvent,
	routeOpenEvent,
	RouteEventDescriptor,
} from '../';

export function useIsRouteActive( route: RouteEventDescriptor['name'] ): boolean {
	const [ isActive, setIsActive ] = useState( () => isRouteActive( route ) );

	useEffect( () => {
		const events = [
			routeOpenEvent( route ),
			routeCloseEvent( route ),
		];

		const cleanup = listenTo(
			events,
			() => setIsActive( isRouteActive( route ) )
		);

		return cleanup;
	}, [ route ] );

	return isActive;
}
