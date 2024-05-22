import { test, expect } from '@playwright/test';
import EditorPage from '../pages/editor-page';
import wpAdminPage from '../pages/wp-admin-page';
import WpEnvCli from '../assets/wp-env-cli';

const pluginList1 = [
	'essential-addons-for-elementor-lite',
	'jetsticky-for-elementor',
	'jetgridbuilder',
	'the-plus-addons-for-elementor-page-builder',
	'stratum',
	'bdthemes-prime-slider-lite',
	'wunderwp',
	'addon-elements-for-elementor-page-builder',
	'addons-for-elementor',
	'anywhere-elementor',
	'astra-sites',
	'connect-polylang-elementor',
	'dynamic-visibility-for-elementor',
	'ele-custom-skin',
	'elementskit-lite',
	'envato-elements',
	'exclusive-addons-for-elementor',
	// 'header-footer-elementor',
	'jeg-elementor-kit',
	'make-column-clickable-elementor',
	'metform',
	'music-player-for-elementor',
	'ooohboi-steroids-for-elementor',
];

const pluginList2 = [
	'post-grid-elementor-addon',
	'powerpack-lite-for-elementor',
	'premium-addons-for-elementor',
	'rife-elementor-extensions',
	'royal-elementor-addons',
	'sb-elementor-contact-form-db',
	'skyboot-custom-icons-for-elementor',
	'sticky-header-effects-for-elementor',
	'timeline-widget-addon-for-elementor',
	// 'unlimited-elements-for-elementor',
	// 'visibility-logic-elementor',
	'ht-mega-for-elementor',
	'jetgridbuilder',
	'jetsticky-for-elementor',
	'tutor-lms-elementor-addons',
	'code-block-for-elementor',
	'jetwidgets-for-elementor',
	'envato-elements',
	'happy-elementor-addons',
];

test.describe( `Plugin tester tests: containers`, () => {
	for ( const plugin of pluginList1 ) {
		test( `"${ plugin }" plugin: @pluginTester1_containers`, async ( { page }, testInfo ) => {
			const editorPage = new EditorPage( page, testInfo );
			const wpAdmin = new wpAdminPage( page, testInfo );
			const wpEnvCli = new WpEnvCli();
			const adminBar = 'wpadminbar';

			wpEnvCli.cmd( `npm run wp-env run cli wp plugin install ${ plugin }` );
			wpEnvCli.cmd( `npm run wp-env run cli wp plugin activate ${ plugin }` );

			await page.goto( '/law-firm-about/' );
			await page.locator( `#${ adminBar }` ).waitFor( { timeout: 10000 } );
			await page.evaluate( ( selector ) => {
				const admin = document.getElementById( selector );
				admin.remove();
			}, adminBar );
			await editorPage.removeClasses( 'elementor-motion-effects-element' );
			await editorPage.scrollPage();
			await expect.soft( page ).toHaveScreenshot( 'frontPage.png', { fullPage: true } );

			if ( 'astra-sites' === plugin ) {
				await page.goto( '/wp-admin/index.php' );
			}
			await page.goto( '/law-firm-about/?elementor' );
			await editorPage.getPreviewFrame().getByRole( 'heading', { name: 'About Us' } ).waitFor( { timeout: 15000 } );
			await wpAdmin.closeAnnouncementsIfVisible();
			await editorPage.closeNavigatorIfOpen();

			await expect.soft( page ).toHaveScreenshot( 'editor.png', { fullPage: true } );
			wpEnvCli.cmd( `npm run wp-env run cli wp plugin deactivate ${ plugin }` );
		} );
	}

	for ( const plugin of pluginList2 ) {
		test( `"${ plugin }" plugin: @pluginTester2_containers`, async ( { page }, testInfo ) => {
			const editorPage = new EditorPage( page, testInfo );
			const wpAdmin = new wpAdminPage( page, testInfo );
			const wpEnvCli = new WpEnvCli();
			const adminBar = 'wpadminbar';

			wpEnvCli.cmd( `npm run wp-env run cli wp plugin install ${ plugin }` );
			wpEnvCli.cmd( `npm run wp-env run cli wp plugin activate ${ plugin }` );

			await page.goto( '/law-firm-about/' );
			await page.locator( `#${ adminBar }` ).waitFor( { timeout: 10000 } );
			await page.evaluate( ( selector ) => {
				const admin = document.getElementById( selector );
				admin.remove();
			}, adminBar );
			await editorPage.removeClasses( 'elementor-motion-effects-element' );
			await editorPage.scrollPage();
			await expect.soft( page ).toHaveScreenshot( 'frontPage.png', { fullPage: true } );

			await page.goto( '/law-firm-about/?elementor' );
			if ( 'happy-elementor-addons' === plugin ) {
				await page.goto( '/law-firm-about/?elementor' );
			}
			await editorPage.getPreviewFrame().getByRole( 'heading', { name: 'About Us' } ).waitFor( { timeout: 15000 } );
			await wpAdmin.closeAnnouncementsIfVisible();
			await editorPage.closeNavigatorIfOpen();

			await expect.soft( page ).toHaveScreenshot( 'editor.png', { fullPage: true } );
			wpEnvCli.cmd( `npm run wp-env run cli wp plugin deactivate ${ plugin }` );
		} );
	}
} );

test.describe( 'Plugin tester tests: sections', () => {
	test.beforeAll( async () => {
		const wpEnvCli = new WpEnvCli();
		wpEnvCli.cmd( `npx wp-env run cli wp elementor experiments deactivate container` );
	} );
	for ( const plugin of pluginList1 ) {
		test( `"${ plugin }" plugin: @pluginTester1_sections`, async ( { page }, testInfo ) => {
			const editorPage = new EditorPage( page, testInfo );
			const wpAdmin = new wpAdminPage( page, testInfo );
			const wpEnvCli = new WpEnvCli();
			const adminBar = 'wpadminbar';

			wpEnvCli.cmd( `npm run wp-env run cli wp plugin install ${ plugin }` );
			wpEnvCli.cmd( `npm run wp-env run cli wp plugin activate ${ plugin }` );

			await page.goto( '/law-firm-about/' );
			await page.locator( `#${ adminBar }` ).waitFor( { timeout: 10000 } );
			await page.evaluate( ( selector ) => {
				const admin = document.getElementById( selector );
				admin.remove();
			}, adminBar );
			await editorPage.removeClasses( 'elementor-motion-effects-element' );
			await editorPage.scrollPage();
			await expect.soft( page ).toHaveScreenshot( 'frontPage.png', { fullPage: true } );

			if ( 'astra-sites' === plugin ) {
				await page.goto( '/wp-admin/index.php' );
			}
			await page.goto( '/law-firm-about/?elementor' );
			await editorPage.getPreviewFrame().getByRole( 'heading', { name: 'About Us' } ).waitFor( { timeout: 15000 } );
			await wpAdmin.closeAnnouncementsIfVisible();
			await editorPage.closeNavigatorIfOpen();

			await expect.soft( page ).toHaveScreenshot( 'editor.png', { fullPage: true } );
			wpEnvCli.cmd( `npm run wp-env run cli wp plugin deactivate ${ plugin }` );
		} );
	}

	for ( const plugin of pluginList2 ) {
		test( `"${ plugin }" plugin: @pluginTester2_sections`, async ( { page }, testInfo ) => {
			const editorPage = new EditorPage( page, testInfo );
			const wpAdmin = new wpAdminPage( page, testInfo );
			const wpEnvCli = new WpEnvCli();
			const adminBar = 'wpadminbar';

			wpEnvCli.cmd( `npm run wp-env run cli wp plugin install ${ plugin }` );
			wpEnvCli.cmd( `npm run wp-env run cli wp plugin activate ${ plugin }` );

			await page.goto( '/law-firm-about/' );
			await page.locator( `#${ adminBar }` ).waitFor( { timeout: 10000 } );
			await page.evaluate( ( selector ) => {
				const admin = document.getElementById( selector );
				admin.remove();
			}, adminBar );
			await editorPage.removeClasses( 'elementor-motion-effects-element' );
			await editorPage.scrollPage();
			await expect.soft( page ).toHaveScreenshot( 'frontPage.png', { fullPage: true } );

			await page.goto( '/law-firm-about/?elementor' );
			if ( 'happy-elementor-addons' === plugin ) {
				await page.goto( '/law-firm-about/?elementor' );
			}
			await editorPage.getPreviewFrame().getByRole( 'heading', { name: 'About Us' } ).waitFor( { timeout: 15000 } );
			await wpAdmin.closeAnnouncementsIfVisible();
			await editorPage.closeNavigatorIfOpen();

			await expect.soft( page ).toHaveScreenshot( 'editor.png', { fullPage: true } );
			wpEnvCli.cmd( `npm run wp-env run cli wp plugin deactivate ${ plugin }` );
		} );
	}
} );
