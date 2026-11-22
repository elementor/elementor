import { useMemo } from 'react';

import { getAccessiblePanelPostTypes, panelPostTypeSlugs } from '../api/post';
import { env } from '../env';
import useUser from './use-user';

export default function useAccessiblePanelPostTypes() {
	const { data: user, isPending: isUserPending, isError: isUserError } = useUser();

	const accessiblePostTypes = useMemo( () => {
		if ( user?.capabilities ) {
			return getAccessiblePanelPostTypes( user.capabilities );
		}

		if ( isUserError && env.can_access_site_content_panel ) {
			return panelPostTypeSlugs;
		}

		return [];
	}, [ user, isUserError ] );

	const showUserLoadError = isUserError && accessiblePostTypes.length === 0;

	return {
		accessiblePostTypes,
		isUserPending,
		showUserLoadError,
	};
}