import { Page } from '@playwright/test';

export class NavigationHelpers {
	static async visitExportCustomizationPage( page: Page ): Promise<void> {
		await page.goto( '/wp-admin/admin.php?page=elementor-app&ver=3.33.0#/export' );
		await page.waitForLoadState( 'networkidle' );
	}

	static async navigateToExportCustomizationPage( page: Page ): Promise<void> {
		await page.goto( '/wp-admin/admin.php?page=elementor-tools' );

		await page.waitForLoadState( 'networkidle' );

		await page.locator( '#elementor-settings-tab-import-export-kit' ).scrollIntoViewIfNeeded();
		await page.click( '#elementor-settings-tab-import-export-kit' );

		await page.waitForSelector( '#tab-import-export-kit', { timeout: 10000 } );

		await page.click( '#elementor-import-export__export' );

		await page.waitForLoadState( 'networkidle' );
	}

	static async waitForExportPageLoad( page: Page ): Promise<void> {
		await page.waitForLoadState( 'networkidle' );
	}

	static readonly SectionSelectors = {
		content: '[data-testid="KitPartsSelectionRow-content"]',
		templates: '[data-testid="KitPartsSelectionRow-templates"]',
		settings: '[data-testid="KitPartsSelectionRow-settings"]',
		plugins: '[data-testid="KitPartsSelectionRow-plugins"]',
	} as const;

	static getEditButtonSelector( section: keyof typeof NavigationHelpers.SectionSelectors ): string {
		return `${ this.SectionSelectors[ section ] } button:has-text("Edit")`;
	}

	static getUpgradeButtonSelector( section: keyof typeof NavigationHelpers.SectionSelectors ): string {
		return `${ this.SectionSelectors[ section ] } button:has-text("Upgrade")`;
	}
}
