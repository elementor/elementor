import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import { NavigationHelpers } from './helpers/navigation-helpers';

test.describe( 'Import Export Customization - Navigation', () => {
	test( 'should navigate to export page from Elementor Tools', async ( { page } ) => {
		await NavigationHelpers.navigateToExportCustomizationPage( page );

		await expect( page ).toHaveURL( /.*export.*/ );
	} );

	test( 'should display all export sections', async ( { page } ) => {
		await NavigationHelpers.visitExportCustomizationPage( page );

		await expect( page.locator( 'text=Content' ).first() ).toBeVisible();
		await expect( page.locator( 'text=Templates' ).first() ).toBeVisible();
		await expect( page.locator( 'text=Settings & configurations' ).first() ).toBeVisible();
		await expect( page.locator( 'text=Plugins' ).first() ).toBeVisible();
	} );

	test( 'should display section titles and descriptions', async ( { page } ) => {
		await NavigationHelpers.visitExportCustomizationPage( page );

		await expect( page.locator( 'text=Content' ).first() ).toBeVisible();
		await expect( page.locator( 'text=Elementor Pages, Elementor Posts, WP Pages, WP Posts, WP Menus, Custom Post Types' ) ).toBeVisible();

		await expect( page.locator( 'text=Templates' ).first() ).toBeVisible();
		await expect( page.locator( 'text=Saved Templates, Headers, Footers, Archives, Single Posts, Single Pages, Search Results, 404 Error Page, Popups, Global widgets' ) ).toBeVisible();

		await expect( page.locator( 'text=Settings & configurations' ).first() ).toBeVisible();
		await expect( page.locator( 'text=Global Colors, Global Fonts, Theme Style Settings, Layout Settings, Lightbox Settings, Background Settings, Custom Fonts, Icons, Code' ) ).toBeVisible();

		await expect( page.locator( 'text=Plugins' ).first() ).toBeVisible();
		await expect( page.locator( 'text=All plugins are required for this website templates to work' ) ).toBeVisible();
	} );

	test( 'should display Edit buttons for customizable sections', async ( { page } ) => {
		await NavigationHelpers.visitExportCustomizationPage( page );

		await expect( page.locator( NavigationHelpers.getEditButtonSelector( 'content' ) ) ).toBeVisible();
		await expect( page.locator( NavigationHelpers.getEditButtonSelector( 'settings' ) ) ).toBeVisible();
		await expect( page.locator( NavigationHelpers.getEditButtonSelector( 'plugins' ) ) ).toBeVisible();
	} );

	test( 'should display Upgrade button for Templates section', async ( { page } ) => {
		await NavigationHelpers.visitExportCustomizationPage( page );

		await expect( page.locator( NavigationHelpers.getUpgradeButtonSelector( 'templates' ) ) ).toBeVisible();
	} );

	test( 'should display kit info form fields', async ( { page } ) => {
		await NavigationHelpers.visitExportCustomizationPage( page );

		await expect( page.locator( 'input[placeholder="Type name here..."]' ) ).toBeVisible();

		await expect( page.locator( 'textarea[placeholder="Type description here..."]' ) ).toBeVisible();
	} );

	test( 'should display export action buttons', async ( { page } ) => {
		await NavigationHelpers.navigateToExportCustomizationPage( page );

		await expect( page.locator( '[data-testid="export-kit-footer-export-zip-button"]' ) ).toBeVisible();
	} );

	test( 'should show required field indicator for kit name', async ( { page } ) => {
		await NavigationHelpers.visitExportCustomizationPage( page );

		await expect( page.locator( 'text=Website template name *' ) ).toBeVisible();
	} );

	test( 'should display Learn more link', async ( { page } ) => {
		await NavigationHelpers.visitExportCustomizationPage( page );

		await expect( page.locator( 'text=Learn more' ) ).toBeVisible();
	} );
} );
