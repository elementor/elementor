import { useMemo } from 'react';

/**
 * Generate the menu items for the kit library pages.
 *
 * @param {string} path - The current page path
 * @return {Array} menu items
 */
export default function useMenuItems( path ) {
	return useMemo( () => {
		const page = path.replace( '/', '' );
		const isCloudKitsExperimentActive = elementorCommon?.config?.experimentalFeatures?.e_cloud_library_kits;

		const menuItems = [
			{
				label: __( 'All Website Kits', 'elementor' ),
				icon: 'eicon-filter',
				isActive: ! page,
				url: '/kit-library',
				trackEventData: { command: 'kit-library/select-organizing-category', category: 'all' },
			},
			...( isCloudKitsExperimentActive ? [ {
				label: __( 'My Cloud Kits', 'elementor' ),
				icon: 'eicon-library-cloud-empty',
				isActive: 'cloud' === page,
				url: '/kit-library/cloud',
				trackEventData: { command: 'kit-library/select-organizing-category', category: 'cloud' },
			} ] : [] ),
			{
				label: __( 'Favorites', 'elementor' ),
				icon: 'eicon-heart-o',
				isActive: 'favorites' === page,
				url: '/kit-library/favorites',
				trackEventData: { command: 'kit-library/select-organizing-category', category: 'favorites' },
			},
		];

		return menuItems;
	}, [ path ] );
} 