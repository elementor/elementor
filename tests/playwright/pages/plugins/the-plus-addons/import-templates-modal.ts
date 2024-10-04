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

	async skipTemplatesImport() {
		await this.page.locator( this.skipButton ).last().click();
	}

	async importTemplates() {
		await this.page.locator( this.importTemplatesButton ).last().click();
	}

	async skipTemplatesImportIfVisible() {
		const modalVisible = await this.page.isVisible( this.modal );
		if ( modalVisible ) {
			await this.skipTemplatesImport();
		}
	}
}
