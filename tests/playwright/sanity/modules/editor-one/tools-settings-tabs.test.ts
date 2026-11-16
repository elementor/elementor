import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';

const TOOLS_PAGE_URL = '/wp-admin/admin.php?page=elementor-tools';

const SETTINGS_TAB_SELECTORS = {
	general: '#elementor-settings-tab-general',
	replaceUrl: '#elementor-settings-tab-replace_url',
	websiteTemplates: '#elementor-settings-tab-import-export-kit',
} as const;

const SETTINGS_PANEL_SELECTORS = {
	general: '#tab-general',
	replaceUrl: '#tab-replace_url',
	websiteTemplates: '#tab-import-export-kit',
} as const;

test.describe( 'Editor One Tools settings tabs', () => {
	test( 'switches between Tools tabs when clicked', async ( { page } ) => {
		// Arrange
		await page.goto( TOOLS_PAGE_URL );
		await page.waitForSelector( '#elementor-settings-form' );

		await expect( page.locator( SETTINGS_TAB_SELECTORS.general ) ).toHaveClass( /nav-tab-active/ );
		await expect( page.locator( SETTINGS_PANEL_SELECTORS.general ) ).toHaveClass( /elementor-active/ );

		// Act
		await page.locator( SETTINGS_TAB_SELECTORS.replaceUrl ).click();

		// Assert
		await expect( page ).toHaveURL( /#tab-replace_url$/ );
		await expect( page.locator( SETTINGS_TAB_SELECTORS.replaceUrl ) ).toHaveClass( /nav-tab-active/ );
		await expect( page.locator( SETTINGS_PANEL_SELECTORS.replaceUrl ) ).toHaveClass( /elementor-active/ );
		await expect( page.locator( SETTINGS_TAB_SELECTORS.general ) ).not.toHaveClass( /nav-tab-active/ );
		await expect( page.locator( SETTINGS_PANEL_SELECTORS.general ) ).not.toHaveClass( /elementor-active/ );

		// Act
		await page.locator( SETTINGS_TAB_SELECTORS.websiteTemplates ).click();

		// Assert
		await expect( page ).toHaveURL( /#tab-import-export-kit$/ );
		await expect( page.locator( SETTINGS_TAB_SELECTORS.websiteTemplates ) ).toHaveClass( /nav-tab-active/ );
		await expect( page.locator( SETTINGS_PANEL_SELECTORS.websiteTemplates ) ).toHaveClass( /elementor-active/ );
		await expect( page.locator( SETTINGS_PANEL_SELECTORS.replaceUrl ) ).not.toHaveClass( /elementor-active/ );
	} );
} );
