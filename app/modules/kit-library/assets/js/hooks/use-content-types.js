import ContentType from '../models/content-type';
import { useQuery } from 'react-query';
import { useSettingsContext } from '../context/settings-context';
import { isTierAtLeast, TIERS } from 'elementor-utils/tiers';

export const KEY = 'content-types';

/**
 * The data should come from the server, this is a temp solution that helps to demonstrate that data comes from the server
 * but for now this is a local data.
 *
 * @return {import('react-query').UseQueryResult<Promise.constructor, unknown>} result
 */
export default function useContentTypes() {
	const { settings } = useSettingsContext();

	return useQuery( [ KEY, settings ], () => fetchContentTypes( settings ) );
}

/**
 * @param {Object} settings - Current settings
 *
 * @return {Promise.constructor} content types
 */
function fetchContentTypes( settings ) {
	const contentTypes = [
		{
			id: 'page',
			label: __( 'Pages', 'elementor' ),
			doc_types: [ 'wp-page' ],
			order: 0,
		},
		{
			id: 'site-parts',
			label: __( 'Site Parts', 'elementor' ),
			doc_types: [
				'archive',
				'error-404',
				'footer',
				'header',
				'search-results',
				'single-page',
				'single-post',

				// WooCommerce types
				'product',
				'product-archive',

				// Legacy Types
				'404',
				'single',
			],
			order: 1,
		},
	];

	// BC: When user has old Pro version which doesn't override the `free` access_tier.
	let userAccessTier = settings.access_tier;
	const hasActiveProLicense = settings.is_pro && settings.is_library_connected;
	const shouldFallbackToLegacy = hasActiveProLicense && userAccessTier === TIERS.free;

	// Fallback to the last access_tier before the new tiers were introduced.
	// TODO: Remove when Pro with the new tiers is stable.
	if ( shouldFallbackToLegacy ) {
		userAccessTier = TIERS[ 'essential-oct2023' ];
	}

	const tierThatSupportsPopups = TIERS[ 'essential-oct2023' ];

	if ( isTierAtLeast( userAccessTier, tierThatSupportsPopups ) ) {
		contentTypes.push( {
			id: 'popup',
			label: __( 'Popups', 'elementor' ),
			doc_types: [ 'popup' ],
			order: 2,
		} );
	}

	return Promise.resolve( contentTypes ).then( ( data ) => {
		return data.map( ( contentType ) => ContentType.createFromResponse( contentType ) );
	} );
}
