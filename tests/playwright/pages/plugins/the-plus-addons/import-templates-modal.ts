import { Page } from '@playwright/test';

export default class ImportTemplatesModal {
	private readonly page: Page;
	private readonly modal: string;
	private readonly skipButton: string;
	private readonly importTemplatesButton: string;

	constructor( page: Page ) {
		this.page = page;
		this.modal = '#tp-onbording-elementorp';
		this.skipButton = '.tp-skip-button';
		this.importTemplatesButton = '.tp-button tp-do-it-button';
	}

	/**
	 * Skip the templates import.
	 *
	 * @return {Promise<void>}
	 */
	async skipTemplatesImport(): Promise<void> {
		await this.page.locator( this.skipButton ).last().click();
	}

	/**
	 * Import the templates.
	 *
	 * @return {Promise<void>}
	 */
	async importTemplates(): Promise<void> {
		await this.page.locator( this.importTemplatesButton ).last().click();
	}

	/**
	 * Skip the templates import if visible.
	 *
	 * @return {Promise<void>}
	 */
	async skipTemplatesImportIfVisible(): Promise<void> {
		const modalVisible = await this.page.isVisible( this.modal );
		if ( modalVisible ) {
			await this.skipTemplatesImport();
		}
	}
}
