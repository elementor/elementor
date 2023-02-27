import useListenTo from './use-listen-to';
import { isRouteActive, routeCloseEvent, routeOpenEvent, RouteEventDescriptor } from '../';

export default function useIsRouteActive( route: RouteEventDescriptor['name'] ) {
	return useListenTo(
		[
			routeOpenEvent( route ),
			routeCloseEvent( route ),
		],
		() => isRouteActive( route ),
		[ route ]
	);
}
