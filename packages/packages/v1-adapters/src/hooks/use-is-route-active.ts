import useListenTo from './use-listen-to';
import { isRouteActive } from '../readers';
import { routeCloseEvent, routeOpenEvent, RouteEventDescriptor } from '../listeners';

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
