import ContentType from '../models/content-type';
import { useQuery } from 'react-query';
import { useSettingsContext } from '../context/settings-context';

export const KEY = 'content-types';

/**
 * The data should come from the server, this is a temp solution that helps to demonstrate that data comes from the server
 * but for now this is a local data.
 *
 * @return {import('react-query').UseQueryResult<Promise.constructor, unknown>} result
 */
export default function useContentTypes() {
	const { settings } = useSettingsContext();

	return useQuery( [ KEY, settings ], () => fetchContentTypes( settings.access_tier ) );
}

/**
 * @param {string} tier - Current user tier.
 *
 * @return {Promise.constructor} content types
 */
function fetchContentTypes( tier ) {
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

	// BC: When there is no tier, fallback to legacy (Core/Pro dependency).
	const currentTier = tier || 'legacy';

	if ( isValidTier( currentTier, 'legacy' ) ) {
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

function isValidTier( currentTier, expectedTier ) {
	const tiers = {
		essential: 10,
		legacy: 15,
		advanced: 20,
		expert: 30,
		agency: 40,
	};

	if ( ! tiers[ currentTier ] || ! tiers[ expectedTier ] ) {
		return false;
	}

	return tiers[ currentTier ] >= tiers[ expectedTier ];
}
