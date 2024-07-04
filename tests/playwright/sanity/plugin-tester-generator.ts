import { expect } from '@playwright/test';
import { parallelTest as test } from '../parallelTest';
import EditorPage from '../pages/editor-page';
import wpAdminPage from '../pages/wp-admin-page';
import { wpEnvCli } from '../assets/wp-env-cli';

const pluginList: { pluginName: string, installByAPI: boolean }[] = [
	{ pluginName: 'essential-addons-for-elementor-lite', installByAPI: true },
	{ pluginName: 'jetsticky-for-elementor', installByAPI: true },
	{ pluginName: 'jetgridbuilder', installByAPI: true },
	{ pluginName: 'the-plus-addons-for-elementor-page-builder', installByAPI: true },
	{ pluginName: 'stratum', installByAPI: true },
	{ pluginName: 'bdthemes-prime-slider-lite', installByAPI: true },
	{ pluginName: 'wunderwp', installByAPI: true },
	{ pluginName: 'addon-elements-for-elementor-page-builder', installByAPI: true },
	// Addons for elementor is closed as of July 2, 2024 and is not available for download. This closure is temporary, pending a full review.
	// see: https://wordpress.org/plugins/addons-for-elementor/
	// { pluginName: 'addons-for-elementor', installByAPI: true },
	{ pluginName: 'anywhere-elementor', installByAPI: true },
	{ pluginName: 'astra-sites', installByAPI: true },
	{ pluginName: 'connect-polylang-elementor', installByAPI: true },
	{ pluginName: 'dynamic-visibility-for-elementor', installByAPI: true },
	{ pluginName: 'ele-custom-skin', installByAPI: true },
	{ pluginName: 'elementskit-lite', installByAPI: true },
	{ pluginName: 'envato-elements', installByAPI: true },
	{ pluginName: 'exclusive-addons-for-elementor', installByAPI: true },
	// 'header-footer-elementor',
	{ pluginName: 'jeg-elementor-kit', installByAPI: false },
	{ pluginName: 'make-column-clickable-elementor', installByAPI: true },
	{ pluginName: 'metform', installByAPI: true },
	{ pluginName: 'music-player-for-elementor', installByAPI: false },
	{ pluginName: 'ooohboi-steroids-for-elementor', installByAPI: true },
	{ pluginName: 'post-grid-elementor-addon', installByAPI: true },
	{ pluginName: 'powerpack-lite-for-elementor', installByAPI: true },
	{ pluginName: 'premium-addons-for-elementor', installByAPI: false },
	{ pluginName: 'rife-elementor-extensions', installByAPI: true },
	{ pluginName: 'royal-elementor-addons', installByAPI: false },
	{ pluginName: 'sb-elementor-contact-form-db', installByAPI: true },
	{ pluginName: 'skyboot-custom-icons-for-elementor', installByAPI: true },
	{ pluginName: 'sticky-header-effects-for-elementor', installByAPI: true },
	{ pluginName: 'timeline-widget-addon-for-elementor', installByAPI: true },
	// 'unlimited-elements-for-elementor',
	// 'visibility-logic-elementor',
	{ pluginName: 'ht-mega-for-elementor', installByAPI: true },
	{ pluginName: 'tutor-lms-elementor-addons', installByAPI: true },
	{ pluginName: 'code-block-for-elementor', installByAPI: true },
	{ pluginName: 'jetwidgets-for-elementor', installByAPI: true },
	{ pluginName: 'happy-elementor-addons', installByAPI: false },
];

export const generatePluginTests = ( testType: string ) => {
	for ( const plugin of pluginList ) {
		test( `"${ plugin.pluginName }" plugin: @pluginTester1_${ testType }`, async ( { page, apiRequests }, testInfo ) => {
			let pluginTechnicalName: string;
			if ( plugin.installByAPI ) {
				pluginTechnicalName = await apiRequests.installPlugin( page.context().request, plugin.pluginName, true );
			} else {
				wpEnvCli( `wp plugin install ${ plugin.pluginName } --activate` );
			}
			try {
				const editor = new EditorPage( page, testInfo );
				const wpAdmin = new wpAdminPage( page, testInfo, apiRequests );
				const adminBar = 'wpadminbar';

				await page.goto( '/law-firm-about/' );
				await page.locator( `#${ adminBar }` ).waitFor( { timeout: 10000 } );
				await page.evaluate( ( selector ) => {
					const admin = document.getElementById( selector );
					admin.remove();
				}, adminBar );
				await editor.removeClasses( 'elementor-motion-effects-element' );
				await expect.soft( page ).toHaveScreenshot( 'frontPage.png', { fullPage: true } );

				if ( 'astra-sites' === plugin.pluginName ) {
					await page.goto( '/wp-admin/index.php' );
				}
				await page.goto( '/law-firm-about/?elementor' );

				await editor.getPreviewFrame().getByRole( 'heading', { name: 'About Us' } ).waitFor( { timeout: 15000 } );
				await wpAdmin.closeAnnouncementsIfVisible();
				await editor.closeNavigatorIfOpen();

				await expect.soft( page ).toHaveScreenshot( 'editor.png', { fullPage: true } );
			} finally {
				if ( plugin.installByAPI ) {
					await apiRequests.deactivatePlugin( page.context().request, pluginTechnicalName );
					await apiRequests.deletePlugin( page.context().request, pluginTechnicalName );
				} else {
					wpEnvCli( `wp plugin uninstall ${ plugin.pluginName } --deactivate` );
				}
			}
		} );
	}
};
