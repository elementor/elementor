import { routeCloseEvent, type RouteEventDescriptor, routeOpenEvent } from '../listeners';
import { isRouteActive } from '../readers';
import useListenTo from './use-listen-to';

export default function useIsRouteActive( route: RouteEventDescriptor[ 'name' ] ) {
	return useListenTo( [ routeOpenEvent( route ), routeCloseEvent( route ) ], () => isRouteActive( route ), [
		route,
	] );
}
