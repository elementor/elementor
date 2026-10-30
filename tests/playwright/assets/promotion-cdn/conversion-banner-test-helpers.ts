import { type APIRequestContext } from '@playwright/test';
import ApiRequests from '../api-requests';
import { wpCli } from '../wp-cli';
import {
	CONVERSION_BANNER_CDN_OPTION,
	CONVERSION_BANNER_INACTIVE_FIXTURE,
} from './constants';
import { seedPromotionCdnCache } from './seed-promotion-cache';

export const BANNER_READY_SELECTOR = '#e-conversion-banner.e-conversion-banner--ready';

const ELEMENTOR_EDIT_MODE = '_elementor_edit_mode';
const PENDING_TRANSIENT = 'elementor_conversion_banner_pages_pending';
const TEST_PAGE_TITLE_PREFIX = 'Conversion banner PW';
const UNLOCK_OPTION = 'elementor_conversion_banner_unlocked';
const CONVERSION_BANNER_DISMISS_KEY = 'conversion_banner_go_pro';

export const resetConversionBannerTriggerState = async (): Promise<void> => {
	try {
		await wpCli( `wp option delete ${ UNLOCK_OPTION }` );
	} catch {
		// Option may not exist yet.
	}

	try {
		await wpCli( `wp transient delete ${ PENDING_TRANSIENT }` );
	} catch {
		// Transient may not exist yet.
	}

	try {
		await wpCli(
			`wp eval update_user_meta(1,"elementor_introduction",array_diff_key((array)get_user_meta(1,"elementor_introduction",true),array("${ CONVERSION_BANNER_DISMISS_KEY }"=>true)));`,
		);
	} catch {
		// Introduction meta may not exist yet.
	}

	await seedPromotionCdnCache( CONVERSION_BANNER_CDN_OPTION, CONVERSION_BANNER_INACTIVE_FIXTURE );

	await clearElementorEditModeMeta();
};

const clearElementorEditModeMeta = async (): Promise<void> => {
	await wpCli( `wp eval delete_metadata("post",0,"${ ELEMENTOR_EDIT_MODE }","",true);` );
};

export const createPublishedElementorPage = async (
	request: APIRequestContext,
	apiRequests: ApiRequests,
	testPageIds: string[],
): Promise<string> => {
	const postId = await apiRequests.create( request, 'pages', {
		title: `${ TEST_PAGE_TITLE_PREFIX } ${ Date.now() }-${ Math.random().toString( 36 ).slice( 2, 8 ) }`,
		status: 'publish',
		content: '',
	} );

	await wpCli( `wp post meta update ${ postId } ${ ELEMENTOR_EDIT_MODE } builder` );
	testPageIds.push( postId );

	return postId;
};

export const deleteConversionBannerTestPages = async (
	request: APIRequestContext,
	apiRequests: ApiRequests,
	testPageIds: string[],
): Promise<void> => {
	while ( testPageIds.length ) {
		const postId = testPageIds.pop();

		if ( ! postId ) {
			continue;
		}

		try {
			await apiRequests.delete( request, 'pages', postId );
		} catch {
			// Page may already be removed.
		}
	}
};
