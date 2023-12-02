import { test, expect } from '@playwright/test';
import EditorPage from '../pages/editor-page';
import { execSync } from 'child_process';
import wpAdminPage from '../pages/wp-admin-page';
import { error, warning } from '@actions/core';

const cmd = ( command: string ) => {
	const logs = execSync( command, { encoding: 'utf-8' } );
	// eslint-disable-next-line no-console
	console.log( '\x1b[36m%s\x1b[0m', logs );
	if ( logs.includes( 'Warning' ) && process.env.CI ) {
		warning( logs );
	}
	if ( logs.includes( 'Error' ) && process.env.CI ) {
		error( logs );
	}
};

const newPlugins = [
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
	'header-footer-elementor',
	'jeg-elementor-kit',
	'make-column-clickable-elementor',
	'metform',
	'music-player-for-elementor',
	'ooohboi-steroids-for-elementor',
	'post-grid-elementor-addon',
	'powerpack-lite-for-elementor',
	'premium-addons-for-elementor',
	'rife-elementor-extensions',
	'royal-elementor-addons',
	'sb-elementor-contact-form-db',
	'skyboot-custom-icons-for-elementor',
	'sticky-header-effects-for-elementor',
	'timeline-widget-addon-for-elementor',
	'unlimited-elements-for-elementor',
	'visibility-logic-elementor',
	'ht-mega-for-elementor',
	'jetgridbuilder',
	'jetsticky-for-elementor',
	'tutor-lms-elementor-addons',
	'code-block-for-elementor',
];

const plugins = [ 'addons-for-elementor', 'addon-elements-for-elementor-page-builder' ];

test.describe( 'Plugin tester tests @pluginTester', () => {
	for ( const plugin of plugins ) {
		test( `"${ plugin }" plugin`, async ( { page }, testInfo ) => {
			const editorPage = new EditorPage( page, testInfo );
			const wpAdmin = new wpAdminPage( page, testInfo );
			const adminBar = 'wpadminbar';

			cmd( `npm run wp-env run cli wp plugin install ${ plugin }` );
			cmd( `npm run wp-env run cli wp plugin activate ${ plugin }` );

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
			await editorPage.getPreviewFrame().getByRole( 'heading', { name: 'About Us' } ).waitFor( { timeout: 15000 } );
			await wpAdmin.closeAnnouncementsIfVisible();
			await editorPage.closeNavigatorIfOpen();

			await expect.soft( page ).toHaveScreenshot( 'editor.png', { fullPage: true } );
			cmd( `npm run wp-env run cli wp plugin deactivate ${ plugin }` );
		} );
	}
} );
