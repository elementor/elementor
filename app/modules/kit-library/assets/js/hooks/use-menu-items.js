import { useMemo } from 'react';
import useCloudKitsEligibility from './use-cloud-kits-eligibility';
import useConnectState from './use-connect-state';

/**
 * Generate the menu items for the kit library pages.
 *
 * @param {string} path - The current page path
 * @return {Array} menu items
 */
export default function useMenuItems( path ) {
	const { isConnected } = useConnectState();
	
	const { data: isCloudKitsAvailable } = useCloudKitsEligibility( {
		enabled: isConnected,
	} );

	return useMemo( () => {
		const page = path.replace( '/', '' );

		// Determine the label suffix for "My Website Templates"
		let myTemplatesLabel = __( 'My Website Templates', 'elementor' );
		if ( ! isConnected ) {
			myTemplatesLabel += ' ' + __( '(Connect)', 'elementor' );
		} else if ( isConnected && isCloudKitsAvailable === false ) {
			myTemplatesLabel += ' ' + __( '(Upgrade)', 'elementor' );
		}

		const menuItems = [
			{
				label: __( 'All Website Templates', 'elementor' ),
				icon: 'eicon-filter',
				isActive: ! page,
				url: '/kit-library',
				trackEventData: { command: 'kit-library/select-organizing-category', category: 'all' },
			},
			{
				label: myTemplatesLabel,
				icon: 'eicon-library-cloud-empty',
				isActive: 'cloud' === page,
				url: '/kit-library/cloud',
				trackEventData: { command: 'kit-library/select-organizing-category', category: 'cloud' },
			},
			{
				label: __( 'Favorites', 'elementor' ),
				icon: 'eicon-heart-o',
				isActive: 'favorites' === page,
				url: '/kit-library/favorites',
				trackEventData: { command: 'kit-library/select-organizing-category', category: 'favorites' },
			},
		];

		return menuItems;
	}, [ path, isConnected, isCloudKitsAvailable ] );
}
