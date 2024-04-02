import { test, expect } from '@playwright/test';
import WpAdminPage from '../../../pages/wp-admin-page';
import { getPages } from '../../../assets/api-requests';
import EditorPage from '../../../pages/editor-page';

test.describe( 'Home screen, get strated setcion, editor settings links', () => {
	const actualExistingTitles = [],
		possibleTitles = [ 'Site Settings', 'Site Logo', 'Global Colors', 'Global Fonts' ];

	test.beforeAll( async ( { browser, request }, testInfo ) => {
		const page = await browser.newPage(),
			wpAdmin = new WpAdminPage( page, testInfo ),
			pageIds = ( await getPages( request ) )?.map( ( { id } ) => id );

		await wpAdmin.setExperiments( { home_screen: true } );

		if ( ! pageIds?.[ 0 ] ) {
			await wpAdmin.openNewPage();

			const editor = new EditorPage( page, testInfo );

			await editor.publishPage();
		}
	} );

	test( 'Home screen links test setup', async ( { page }, testInfo ) => {
		new WpAdminPage( page, testInfo );
		await page.goto( 'wp-admin/admin.php?page=elementor' );
		await page.getByText( 'Get started with Elementor' ).first().waitFor();

		const linkCount = await page.locator( '.get-started-list li' ).count();

		for ( let itemIndex = 0; itemIndex < linkCount; itemIndex++ ) {
			const listItemElement = page.locator( '.get-started-list li' ).nth( itemIndex ),
				title = listItemElement.locator( '.MuiTypography-subtitle1' ),
				titleText = await title.textContent();

			if ( ! possibleTitles.includes( titleText ) ) {
				continue;
			}

			actualExistingTitles.push( titleText );
		}
	} );

	test.afterAll( async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo );

		await wpAdmin.setExperiments( { home_screen: false } );
	} );

	for ( const title of possibleTitles ) {
		test( 'Test link to ' + title, async ( { page }, testInfo ) => {
			if ( ! actualExistingTitles.includes( title ) ) {
				return;
			}

			new WpAdminPage( page, testInfo );
			await page.goto( 'wp-admin/admin.php?page=elementor' );
			await page.getByText( title ).first().waitFor();

			const routes = ( await page.locator( `.get-started-list li :has-text("${ title }") a` ).getAttribute( 'href' ) ).split( '/' ),
				formattedRoutes = 'wp-admin' === routes[ 0 ]
					? routes
					: [ 'wp-admin', ...routes ];

			await page.goto( formattedRoutes.join( '/' ) );
			await page.locator( '#elementor-panel-header', { hasText: 'Site Settings' } ).first().waitFor();

			if ( 'Site Settings' !== title ) {
				await page.locator( '.elementor-control-content', { hasText: title } ).first().waitFor();
			}

			await expect.soft( page.locator( '#elementor-panel-content-wrapper' ) )
				.toHaveScreenshot( title.toLowerCase().replaceAll( ' ', '-' ) + '.png' );
		} );
	}
} );
