import { useMemo } from 'react';
import useCloudKitsEligibility from 'elementor-app/hooks/use-cloud-kits-eligibility';
import useConnectState from './use-connect-state';

/**
 * Generate the menu items for the kit library pages.
 *
 * @param {string} path - The current page path
 * @return {Array} menu items
 */
export default function useMenuItems( path ) {
	const { isConnected } = useConnectState();

	const { data: cloudKitsData } = useCloudKitsEligibility( {
		enabled: isConnected,
	} );

	const isCloudKitsAvailable = cloudKitsData?.is_eligible;

	return useMemo( () => {
		const page = path.replace( '/', '' );

		let myWebsiteTemplatesLabel = __( 'My Website Templates', 'elementor' );

		console.log( 'isCloudKitsAvailable', isCloudKitsAvailable );

		if ( ! isConnected ) {
			myWebsiteTemplatesLabel = (
				<>
					{ __( 'My Website Templates', 'elementor' ) }
					<span className="connect-badge">
						{ __( 'Connect', 'elementor' ) }
					</span>
				</>
			);
		} else if ( isConnected && false === isCloudKitsAvailable ) {
			myWebsiteTemplatesLabel = (
				<>
					{ __( 'My Website Templates', 'elementor' ) }
					<span className="upgrade-badge">
						{ __( 'Upgrade', 'elementor' ) }
					</span>
				</>
			);
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
				label: myWebsiteTemplatesLabel,
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
