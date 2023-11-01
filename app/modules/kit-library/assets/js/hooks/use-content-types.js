import ContentType from '../models/content-type';
import { useQuery } from 'react-query';
import { useSettingsContext } from '../context/settings-context';
import { isTierAtLeast, TIERS } from '../tiers';

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
	const currentTier = tier || TIERS[ 'essential-oct2023' ];
	const tierThatSupportsPopups = TIERS[ 'essential-oct2023' ];

	if ( isTierAtLeast( currentTier, tierThatSupportsPopups ) ) {
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
