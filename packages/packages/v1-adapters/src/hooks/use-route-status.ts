import useIsPreviewMode from './use-is-preview-mode';
import useIsRouteActive from './use-is-route-active';
import { RouteEventDescriptor } from '../listeners';

type Options = {
	blockOnKitRoutes?: boolean,
	blockOnPreviewMode?: boolean,
}

export default function useRouteStatus(
	route: RouteEventDescriptor['name'],
	{
		blockOnKitRoutes = true,
		blockOnPreviewMode = true,
	}: Options = {}
) {
	const isRouteActive = useIsRouteActive( route );
	const isKitRouteActive = useIsRouteActive( 'panel/global' );
	const isPreviewMode = useIsPreviewMode();

	const isActive = isRouteActive && ! ( blockOnPreviewMode && isPreviewMode );

	const isBlocked = (
		( blockOnPreviewMode && isPreviewMode ) ||
		( blockOnKitRoutes && isKitRouteActive )
	);

	return {
		isActive,
		isBlocked,
	};
}
