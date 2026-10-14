import { type EditMode, useEditMode } from '../edit-mode';
import { type RouteEventDescriptor } from '../listeners';
import useIsRouteActive from './use-is-route-active';

export type UseRouteStatusOptions = {
	blockOnKitRoutes?: boolean;
	allowedEditModes?: EditMode[];
};

export default function useRouteStatus(
	route: RouteEventDescriptor[ 'name' ],
	{ blockOnKitRoutes = true, allowedEditModes = [ 'edit' ] }: UseRouteStatusOptions = {}
) {
	const isRouteActive = useIsRouteActive( route );
	const isKitRouteActive = useIsRouteActive( 'panel/global' );
	const currentEditMode = useEditMode();

	const isBlockedByEditMode = ! allowedEditModes.includes( currentEditMode );

	const isBlockedByKit = blockOnKitRoutes && isKitRouteActive;

	const isActive = isRouteActive && ! isBlockedByEditMode;

	const isBlocked = isBlockedByEditMode || isBlockedByKit;

	return {
		isActive,
		isBlocked,
	};
}
