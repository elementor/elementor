import { Page, expect } from '@playwright/test';
import * as path from 'path';
import { ImportExportSelectors } from '../selectors/import-export-selectors';

export class ImportExportHelpers {
	private static async closeAnnouncementsIfVisible( page: Page ): Promise<void> {
		const popupContainer = page.locator( '#e-pro-free-trial-popup' );
		const popupCount = await popupContainer.count();

		console.log( `[DEBUG] closeAnnouncementsIfVisible: popup container count = ${ popupCount }` );

		if ( popupCount > 0 ) {
			const dialogBackdrop = page.locator( '[role="presentation"]' ).last();
			const backdropCount = await dialogBackdrop.count();

			console.log( `[DEBUG] closeAnnouncementsIfVisible: backdrop count = ${ backdropCount }` );

			if ( backdropCount > 0 ) {
				console.log( `[DEBUG] closeAnnouncementsIfVisible: Attempting to click backdrop` );
				try {
					await dialogBackdrop.click( { force: true, timeout: 2000 } );
					await page.waitForTimeout( 500 );
					console.log( `[DEBUG] closeAnnouncementsIfVisible: Backdrop clicked successfully` );
				} catch ( error ) {
					console.log( `[DEBUG] closeAnnouncementsIfVisible: Backdrop click failed: ${ error.message }` );
				}
			}

			const closeButton = page.locator( 'button[aria-label*="close" i], button:has-text("Not now")' ).first();
			const closeButtonCount = await closeButton.count();

			console.log( `[DEBUG] closeAnnouncementsIfVisible: close button count = ${ closeButtonCount }` );

			if ( closeButtonCount > 0 ) {
				console.log( `[DEBUG] closeAnnouncementsIfVisible: Attempting to click close button` );
				try {
					await closeButton.click( { timeout: 2000 } );
					await page.waitForTimeout( 500 );
					console.log( `[DEBUG] closeAnnouncementsIfVisible: Close button clicked successfully` );
				} catch ( error ) {
					console.log( `[DEBUG] closeAnnouncementsIfVisible: Close button click failed: ${ error.message }` );
				}
			}

			const finalPopupCount = await popupContainer.count();
			console.log( `[DEBUG] closeAnnouncementsIfVisible: Final popup count before removal = ${ finalPopupCount }` );

			if ( finalPopupCount > 0 ) {
				console.log( `[DEBUG] closeAnnouncementsIfVisible: Removing popup container element` );
				await page.evaluate( ( selector ) => {
					const element = document.getElementById( selector );
					if ( element ) {
						console.log( `[DEBUG] closeAnnouncementsIfVisible: Element found, removing` );
						element.remove();
					} else {
						console.log( `[DEBUG] closeAnnouncementsIfVisible: Element not found in DOM` );
					}
				}, 'e-pro-free-trial-popup' );

				const afterRemovalCount = await popupContainer.count();
				console.log( `[DEBUG] closeAnnouncementsIfVisible: Popup count after removal = ${ afterRemovalCount }` );
			}
		} else {
			console.log( `[DEBUG] closeAnnouncementsIfVisible: No popup found, skipping` );
		}
	}

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
		await page.waitForURL( /.*export-customization\/process.*/ );
		await expect( page.locator( 'text=Setting up your website template...' ) ).toBeVisible();
		await expect( page.locator( 'text=This usually takes a few moments.' ) ).toBeVisible();
		await expect( page.locator( 'text=Don\'t close this window until the process is finished.' ) ).toBeVisible();
	}

	static async waitForImportProcess( page: Page ): Promise<void> {
		await page.waitForURL( /.*import-customization\/process.*/ );
		await expect( page.locator( 'text=Settings up your website templates...' ) ).toBeVisible();
		await expect( page.locator( 'text=This usually take a few moments.' ) ).toBeVisible();
		await expect( page.locator( 'text=Don\'t close this window until the process is finished.' ) ).toBeVisible();
	}

	static async waitForExportComplete( page: Page ): Promise<void> {
		await page.waitForURL( /.*export-customization\/complete.*/, { timeout: 30000 } );
		await expect( page.locator( 'text=Your .zip file is ready' ) ).toBeVisible();
		await expect( page.locator( 'text=Once the download is complete, you can upload it to be used for other sites.' ) ).toBeVisible();
		await expect( page.locator( 'text=What\'s included:' ) ).toBeVisible();
	}

	static async waitForImportComplete( page: Page ): Promise<void> {
		await page.waitForURL( /.*import-customization\/complete.*/, { timeout: 30000 } );
		await expect( page.locator( 'text=Your website templates is now live on your site!' ) ).toBeVisible();
		await expect( page.locator( 'text=You\'ve imported and applied the following to your site:' ) ).toBeVisible();
		await expect( page.locator( 'text=What\'s included:' ) ).toBeVisible();
	}

	static async verifyContentSection( page: Page, expectedText: string ): Promise<void> {
		await this.closeAnnouncementsIfVisible( page );
		const contentSection = page.locator( ImportExportSelectors.summaryContentSection );
		await expect( contentSection ).toBeVisible();
		await expect( contentSection.locator( `text=${ expectedText }` ) ).toBeVisible();
	}

	static async verifyTemplatesSection( page: Page, expectedText: string ): Promise<void> {
		await this.closeAnnouncementsIfVisible( page );
		const templatesSection = page.locator( ImportExportSelectors.summaryTemplatesSection );
		await expect( templatesSection ).toBeVisible();
		await expect( templatesSection.locator( `text=${ expectedText }` ) ).toBeVisible();
	}

	static async verifySettingsSection( page: Page, expectedText: string ): Promise<void> {
		await this.closeAnnouncementsIfVisible( page );
		const settingsSection = page.locator( ImportExportSelectors.summarySettingsSection );
		await expect( settingsSection ).toBeVisible();
		await expect( settingsSection.locator( `text=${ expectedText }` ) ).toBeVisible();
	}

	static async verifyPluginsSection( page: Page, expectedText: string ): Promise<void> {
		await this.closeAnnouncementsIfVisible( page );
		const pluginsSection = page.locator( ImportExportSelectors.summaryPluginsSection );
		await expect( pluginsSection ).toBeVisible();
		await expect( pluginsSection.locator( `text=${ expectedText }` ) ).toBeVisible();
	}

	static async verifyNotInContentSection( page: Page, notExpectedText: string ): Promise<void> {
		await this.closeAnnouncementsIfVisible( page );
		const contentSection = page.locator( ImportExportSelectors.summaryContentSection );
		await expect( contentSection.locator( `text=${ notExpectedText }` ) ).not.toBeVisible();
	}

	static async verifyNotInSettingsSection( page: Page, notExpectedText: string ): Promise<void> {
		await this.closeAnnouncementsIfVisible( page );
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
