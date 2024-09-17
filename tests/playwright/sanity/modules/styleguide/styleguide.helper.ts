import { Page, TestInfo } from '@playwright/test';
import ApiRequests from '../../../assets/api-requests';
import WpAdminPage from '../../../pages/wp-admin-page';

export const getInSettingsTab = async ( page: Page, testInfo: TestInfo, apiRequests: ApiRequests, tabName: string, styleguideOpen: boolean ) => {
	const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	const editor = await wpAdmin.openNewPage();
	page.setDefaultTimeout( 10000 );

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
		editor.openSiteSettings( ),
	] );

	await page.waitForTimeout( 1000 );

	await page.click( `.elementor-panel-menu-item-title:has-text("${ tabName }")` );

	await page.waitForTimeout( 1000 );

	return { editor, wpAdmin };
};
