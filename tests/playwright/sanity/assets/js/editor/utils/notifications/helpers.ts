import { type Page } from '@playwright/test';

export default class NotificationsHelpers {
	readonly page: Page;
	constructor( page: Page ) {
		this.page = page;
	}

	async waitForToast( text: string ) {
		await this.page.waitForSelector( `#elementor-toast >> :text("${ text }")`, { timeout: 4000 } );
	}
}
