import { useEffect, useState } from 'react';
import {
	isRouteActive,
	listenTo,
	routeCloseEvent,
	routeOpenEvent,
	RouteEventDescriptor,
} from '../';

export default function useIsRouteActive( route: RouteEventDescriptor['name'] ) {
	const [ isActive, setIsActive ] = useState( () => isRouteActive( route ) );

	useEffect( () => {
		const updateState = () => setIsActive( isRouteActive( route ) );

		// Ensure the state is re-calculated when the route is changed.
		updateState();

		const events = [
			routeOpenEvent( route ),
			routeCloseEvent( route ),
		];

		const cleanup = listenTo( events, updateState );

		return cleanup;
	}, [ route ] );

	return isActive;
}
