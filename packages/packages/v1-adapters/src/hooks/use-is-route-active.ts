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
		return listenTo( [
			routeOpenEvent( route ),
			routeCloseEvent( route ),
		],
		() => setIsActive( isRouteActive( route ) ),
		);
	}, [] );

	return isActive;
}
