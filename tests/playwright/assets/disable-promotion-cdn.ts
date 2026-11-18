import { wpCli } from './wp-cli';

/**
 * Seed inactive EditorAssetsAPI option payloads so Playwright is not coupled to live
 * Black Friday / sale CDN copy (side-menu label, sticky panel message, admin banners).
 */
const INACTIVE_CDN_OPTION = {
	timeout: 2147483647,
	value: JSON.stringify( { is_active: false } ),
};

const PROMOTION_CDN_OPTION_KEYS = [
	'elementor_side_menu_assets_data',
	'elementor_sticky_panel_promotion_assets_data',
	'elementor_conversion_banner_assets_data',
] as const;

export async function disablePromotionCdn(): Promise<void> {
	const payload = JSON.stringify( INACTIVE_CDN_OPTION );

	for ( const key of PROMOTION_CDN_OPTION_KEYS ) {
		await wpCli( `wp option update ${ key } ${ payload } --format=json` );
	}
}
