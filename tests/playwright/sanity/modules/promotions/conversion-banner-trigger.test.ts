import { expect, type APIRequestContext } from '@playwright/test';
import ApiRequests from '../../../assets/api-requests';
import { wpCli } from '../../../assets/wp-cli';
import { timeouts } from '../../../config/timeouts';
import WpAdminPage from '../../../pages/wp-admin-page';
import { parallelTest as test } from '../../../parallelTest';

const BANNER_READY_SELECTOR = '#e-conversion-banner.e-conversion-banner--ready';
const ELEMENTOR_EDIT_MODE = '_elementor_edit_mode';
const PENDING_TRANSIENT = 'elementor_conversion_banner_pages_pending';
const TEST_PAGE_TITLE_PREFIX = 'Conversion banner PW';
const UNLOCK_OPTION = 'elementor_conversion_banner_unlocked';

const testPageIds: string[] = [];

const CONVERSION_BANNER_DISMISS_KEY = 'conversion_banner_go_pro';

const resetBannerTriggerState = async (): Promise<void> => {
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

	await clearElementorEditModeMeta();
};

const clearElementorEditModeMeta = async (): Promise<void> => {
	await wpCli( `wp eval delete_metadata("post",0,"${ ELEMENTOR_EDIT_MODE }","",true);` );
};

const deleteTestPages = async ( request: APIRequestContext, apiRequests: ApiRequests ): Promise<void> => {
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

const createPublishedElementorPage = async (
	request: APIRequestContext,
	apiRequests: ApiRequests,
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

test.describe.serial( 'Conversion banner admin trigger @promotions', () => {
	test.beforeEach( async ( { page, apiRequests } ) => {
		await resetBannerTriggerState();
		await deleteTestPages( page.context().request, apiRequests );
	} );

	test.afterEach( async ( { page, apiRequests } ) => {
		await deleteTestPages( page.context().request, apiRequests );
	} );

	test( 'Does not show the banner with fewer than two Elementor pages', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		await createPublishedElementorPage( page.context().request, apiRequests );
		await wpAdmin.openWordPressDashboard();

		await expect( page.locator( BANNER_READY_SELECTOR ) ).toHaveCount( 0, { timeout: timeouts.expect } );
	} );

	test( 'Shows the banner after two Elementor pages on the dashboard', async ( { page, apiRequests }, testInfo ) => {
		const request = page.context().request;
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		await createPublishedElementorPage( request, apiRequests );
		await createPublishedElementorPage( request, apiRequests );
		await wpAdmin.openWordPressDashboard();

		const banner = page.locator( BANNER_READY_SELECTOR );

		await expect( banner ).toBeVisible( { timeout: timeouts.longAction } );
		await expect( banner.locator( '.e-conversion-banner__title' ) ).toContainText( 'Elementor Pro' );
	} );
} );
