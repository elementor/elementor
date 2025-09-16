import { parallelTest as test } from '../../../parallelTest';
import { expect } from '@playwright/test';
import WpAdminPage from '../../../pages/wp-admin-page';
import { NavigationHelpers } from './helpers/navigation-helpers';

test.describe( 'Import Export Customization - Navigation', () => {
	let wpAdminPage: WpAdminPage;

	test.beforeEach( async ( { page, apiRequests } ) => {
		wpAdminPage = new WpAdminPage( page, test.info(), apiRequests );

		// Login to WordPress admin
		await wpAdminPage.login();
	} );

	test( 'should navigate to export page from Elementor Tools', async ( { page } ) => {
		await NavigationHelpers.navigateToExportCustomizationPage( page );

		// Verify we're on the export page
		await expect( page ).toHaveURL( /.*export-customization.*/ );
	} );

	test( 'should display all export sections', async ( { page } ) => {
		await NavigationHelpers.visitExportCustomizationPage( page );

		// Verify all sections are visible
		await expect( page.locator( 'text=Content' ).first() ).toBeVisible();
		await expect( page.locator( 'text=Templates' ).first() ).toBeVisible();
		await expect( page.locator( 'text=Settings & configurations' ).first() ).toBeVisible();
		await expect( page.locator( 'text=Plugins' ).first() ).toBeVisible();
	} );

	test( 'should display section titles and descriptions', async ( { page } ) => {
		await NavigationHelpers.visitExportCustomizationPage( page );

		// Verify Content section
		await expect( page.locator( 'text=Content' ).first() ).toBeVisible();
		await expect( page.locator( 'text=Elementor Pages, Elementor Posts, WP Pages, WP Posts, WP Menus, Custom Post Types' ) ).toBeVisible();

		// Verify Templates section
		await expect( page.locator( 'text=Templates' ).first() ).toBeVisible();
		await expect( page.locator( 'text=Saved Templates, Headers, Footers, Archives, Single Posts, Single Pages, Search Results, 404 Error Page, Popups, Global widgets' ) ).toBeVisible();

		// Verify Settings section
		await expect( page.locator( 'text=Settings & configurations' ).first() ).toBeVisible();
		await expect( page.locator( 'text=Global Colors, Global Fonts, Theme Style Settings, Layout Settings, Lightbox Settings, Background Settings, Custom Fonts, Icons, Code' ) ).toBeVisible();

		// Verify Plugins section
		await expect( page.locator( 'text=Plugins' ).first() ).toBeVisible();
		await expect( page.locator( 'text=All plugins are required for this website templates to work' ) ).toBeVisible();
	} );

	test( 'should display Edit buttons for customizable sections', async ( { page } ) => {
		await NavigationHelpers.visitExportCustomizationPage( page );

		// Verify Edit buttons are visible for customizable sections
		await expect( page.locator( NavigationHelpers.getEditButtonSelector( 'content' ) ) ).toBeVisible();
		await expect( page.locator( NavigationHelpers.getEditButtonSelector( 'settings' ) ) ).toBeVisible();
		await expect( page.locator( NavigationHelpers.getEditButtonSelector( 'plugins' ) ) ).toBeVisible();
	} );

	test( 'should display Upgrade button for Templates section', async ( { page } ) => {
		await NavigationHelpers.visitExportCustomizationPage( page );

		// Verify Upgrade button is visible for Templates section
		await expect( page.locator( NavigationHelpers.getUpgradeButtonSelector( 'templates' ) ) ).toBeVisible();
	} );

	test( 'should display kit info form fields', async ( { page } ) => {
		await NavigationHelpers.visitExportCustomizationPage( page );

		// Verify kit name field
		await expect( page.locator( 'input[placeholder="Type name here..."]' ) ).toBeVisible();

		// Verify kit description field
		await expect( page.locator( 'textarea[placeholder="Type description here..."]' ) ).toBeVisible();
	} );

	test( 'should display export action buttons', async ( { page } ) => {
		await NavigationHelpers.navigateToExportCustomizationPage( page );

		// Verify export buttons are visible
		await expect( page.locator( '[data-testid="export-kit-footer-export-zip-button"]' ) ).toBeVisible();
	} );

	test( 'should show required field indicator for kit name', async ( { page } ) => {
		await NavigationHelpers.visitExportCustomizationPage( page );

		// Verify required field indicator (*) is visible
		await expect( page.locator( 'text=Website template name *' ) ).toBeVisible();
	} );

	test( 'should display Learn more link', async ( { page } ) => {
		await NavigationHelpers.visitExportCustomizationPage( page );

		// Verify Learn more link is visible
		await expect( page.locator( 'text=Learn more' ) ).toBeVisible();
	} );
} );
