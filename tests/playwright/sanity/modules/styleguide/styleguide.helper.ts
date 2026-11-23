import { Page, TestInfo } from '@playwright/test';
import ApiRequests from '../../../assets/api-requests';
import EditorPage from '../../../pages/editor-page';
import WpAdminPage from '../../../pages/wp-admin-page';
import { timeouts } from '../../../config/timeouts';

const openNewPageWithEditorReloadRetry = async (
	wpAdmin: WpAdminPage,
	page: Page,
	testInfo: TestInfo,
): Promise<EditorPage> => {
	try {
		return await wpAdmin.openNewPage();
	} catch {
		await page.reload( { waitUntil: 'load', timeout: timeouts.heavyAction } );
		await wpAdmin.waitForPanel();
		await wpAdmin.closeAnnouncementsIfVisible();
		return new EditorPage( page, testInfo );
	}
};

export const getInSettingsTab = async (
	page: Page,
	testInfo: TestInfo,
	apiRequests: ApiRequests,
	innerPanel: string,
	styleguideOpen: boolean,
	retryEditorOpen = false,
) => {
	const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	const editor = retryEditorOpen
		? await openNewPageWithEditorReloadRetry( wpAdmin, page, testInfo )
		: await wpAdmin.openNewPage();
	page.setDefaultTimeout( timeouts.longAction );

	await page.evaluate( ( isOpen ) => $e.run( 'document/elements/settings', {
		container: elementor.settings.editorPreferences.getEditedView().getContainer(),
		settings: {
			enable_styleguide_preview: isOpen ? 'yes' : '',
		},
		options: {
			external: true,
		},
	} ), styleguideOpen );

	await page.waitForTimeout( 3000 );

	await Promise.all( [
		page.waitForResponse( '/wp-admin/admin-ajax.php' ),
		editor.openSiteSettings( innerPanel ),
	] );

	await page.waitForTimeout( 1000 );

	return { editor };
};
