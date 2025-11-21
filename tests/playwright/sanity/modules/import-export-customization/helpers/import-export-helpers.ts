import { Page, expect } from '@playwright/test';
import * as path from 'path';
import { ImportExportSelectors } from '../selectors/import-export-selectors';

export class ImportExportHelpers {
	static async navigateToExportCustomizationPage( page: Page ): Promise<void> {
		await page.goto( ImportExportSelectors.exportCustomizationPage );
		await page.waitForLoadState( 'networkidle' );
	}

	static async navigateToToolsPage( page: Page ): Promise<void> {
		await page.goto( '/wp-admin/admin.php?page=elementor-tools' );
		await page.waitForLoadState( 'networkidle' );
	}

	static async openWebsiteTemplatesTab( page: Page ): Promise<void> {
		await page.locator( ImportExportSelectors.websiteTemplatesTab ).scrollIntoViewIfNeeded();
		await page.click( ImportExportSelectors.websiteTemplatesTab );
		await page.waitForSelector( ImportExportSelectors.tabContent, { timeout: 10000 } );
	}

	static async uncheckAllSections( page: Page ): Promise<void> {
		await page.uncheck( ImportExportSelectors.contentCheckbox );
		await page.uncheck( ImportExportSelectors.templatesCheckbox );
		await page.uncheck( ImportExportSelectors.settingsCheckbox );
	}

	static async openExportPage( page: Page ): Promise<void> {
		await this.navigateToToolsPage( page );
		await this.openWebsiteTemplatesTab( page );
		await page.click( ImportExportSelectors.exportButton );
		await page.waitForLoadState( 'networkidle' );
	}

	static async openImportPage( page: Page ): Promise<void> {
		await this.navigateToToolsPage( page );
		await this.openWebsiteTemplatesTab( page );
		await page.click( ImportExportSelectors.importNavigationButton );
		await page.waitForLoadState( 'networkidle' );
	}

	static async uploadKitFile( page: Page ): Promise<void> {
		const kitPath = path.join( __dirname, '..', 'kits', 'test-kit.zip' );
		await page.setInputFiles( 'input[type="file"]', kitPath );
	}

	static async fillKitInfo( page: Page, name: string, description?: string ): Promise<void> {
		await page.fill( ImportExportSelectors.kitNameInput, name );
		if ( description ) {
			await page.fill( ImportExportSelectors.kitDescriptionInput, description );
		}
	}

	static async customizeContentSection( page: Page, uncheckPost: boolean = false ): Promise<void> {
		await page.click( ImportExportSelectors.contentEditButton );
		if ( uncheckPost ) {
			await page.uncheck( ImportExportSelectors.postCheckbox );
		}
		await page.click( ImportExportSelectors.saveChangesButton );
	}

	static async customizeSettingsSection( page: Page, uncheckTheme: boolean = false ): Promise<void> {
		await page.click( ImportExportSelectors.settingsEditButton );
		if ( uncheckTheme ) {
			await page.click( ImportExportSelectors.themeSwitch );
		}
		await page.click( ImportExportSelectors.saveChangesButton );
	}

	static async customizePluginsSection( page: Page, uncheckHelloDolly: boolean = false, uncheckWordPressImporter: boolean = false ): Promise<void> {
		await page.click( ImportExportSelectors.pluginsEditButton );
		if ( uncheckHelloDolly ) {
			await page.uncheck( ImportExportSelectors.helloDollyCheckbox );
		}
		if ( uncheckWordPressImporter ) {
			await page.uncheck( ImportExportSelectors.wordPressImporterCheckbox );
		}
		await page.click( ImportExportSelectors.saveChangesButton );
	}

	static async startExport( page: Page ): Promise<void> {
		await page.click( ImportExportSelectors.exportAsZipButton );
	}

	static async startImport( page: Page ): Promise<void> {
		await page.click( ImportExportSelectors.importActionButton );
	}

	static async waitForExportProcess( page: Page ): Promise<void> {
		await page.waitForURL( /.*export\/process.*/ );
		await expect( page.locator( 'text=Setting up your website template...' ) ).toBeVisible();
		await expect( page.locator( 'text=This usually takes a few moments.' ) ).toBeVisible();
		await expect( page.locator( 'text=Don\'t close this window until the process is finished.' ) ).toBeVisible();
	}

	static async waitForImportProcess( page: Page ): Promise<void> {
		await page.waitForURL( /.*import\/process.*/ );
		await expect( page.locator( 'text=Settings up your website templates...' ) ).toBeVisible();
		await expect( page.locator( 'text=This usually take a few moments.' ) ).toBeVisible();
		await expect( page.locator( 'text=Don\'t close this window until the process is finished.' ) ).toBeVisible();
	}

	static async waitForExportComplete( page: Page ): Promise<void> {
		await page.waitForURL( /.*export\/complete.*/, { timeout: 30000 } );
		await expect( page.locator( 'text=Your .zip file is ready' ) ).toBeVisible();
		await expect( page.locator( 'text=Once the download is complete, you can upload it to be used for other sites.' ) ).toBeVisible();
		await expect( page.locator( 'text=What\'s included:' ) ).toBeVisible();
	}

	static async waitForImportComplete( page: Page ): Promise<void> {
		await page.waitForURL( /.*import\/complete.*/, { timeout: 30000 } );
		await expect( page.locator( 'text=Your website templates is now live on your site!' ) ).toBeVisible();
		await expect( page.locator( 'text=You\'ve imported and applied the following to your site:' ) ).toBeVisible();
		await expect( page.locator( 'text=What\'s included:' ) ).toBeVisible();
	}

	static async verifyContentSection( page: Page, expectedText: string ): Promise<void> {
		const contentSection = page.locator( ImportExportSelectors.summaryContentSection );
		await expect( contentSection ).toBeVisible();
		await expect( contentSection.locator( `text=${ expectedText }` ) ).toBeVisible();
	}

	static async verifyTemplatesSection( page: Page, expectedText: string ): Promise<void> {
		const templatesSection = page.locator( ImportExportSelectors.summaryTemplatesSection );
		await expect( templatesSection ).toBeVisible();
		await expect( templatesSection.locator( `text=${ expectedText }` ) ).toBeVisible();
	}

	static async verifySettingsSection( page: Page, expectedText: string ): Promise<void> {
		const settingsSection = page.locator( ImportExportSelectors.summarySettingsSection );
		await expect( settingsSection ).toBeVisible();
		await expect( settingsSection.locator( `text=${ expectedText }` ) ).toBeVisible();
	}

	static async verifyPluginsSection( page: Page, expectedText: string ): Promise<void> {
		const pluginsSection = page.locator( ImportExportSelectors.summaryPluginsSection );
		await expect( pluginsSection ).toBeVisible();
		await expect( pluginsSection.locator( `text=${ expectedText }` ) ).toBeVisible();
	}

	static async verifyNotInContentSection( page: Page, notExpectedText: string ): Promise<void> {
		const contentSection = page.locator( ImportExportSelectors.summaryContentSection );
		await expect( contentSection.locator( `text=${ notExpectedText }` ) ).not.toBeVisible();
	}

	static async verifyNotInSettingsSection( page: Page, notExpectedText: string ): Promise<void> {
		const settingsSection = page.locator( ImportExportSelectors.summarySettingsSection );
		await expect( settingsSection.locator( `text=${ notExpectedText }` ) ).not.toBeVisible();
	}

	static async verifyLearnMoreLink( page: Page ): Promise<void> {
		await expect( page.locator( ImportExportSelectors.learnMoreLink ) ).toBeVisible();
	}

	static async verifyDoneButton( page: Page ): Promise<void> {
		await expect( page.locator( ImportExportSelectors.doneButton ) ).toBeVisible();
	}
}
