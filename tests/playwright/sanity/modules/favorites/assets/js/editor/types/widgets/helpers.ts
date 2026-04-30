import { type Page } from '@playwright/test';

export default class FavoriteWidgetsHelper {
	readonly page: Page;
	constructor( page: Page ) {
		this.page = page;
	}

	async add( widgetTitle: string ) {
		await this.openPanelElementContextMenu( widgetTitle );
		await this.page.click( `.elementor-context-menu >> :text("Add to Favorites")` );
	}

	async remove( widgetTitle: string ) {
		await this.openPanelElementContextMenu( widgetTitle );
		await this.page.click( `.elementor-context-menu >> :text("Remove from Favorites")` );
	}

	async ensureNotFavorited( widgetTitle: string ) {
		await this.openPanelElementContextMenu( widgetTitle );
		const removeButton = this.page.locator( '.elementor-context-menu' ).locator( ':text("Remove from Favorites")' );

		if ( await removeButton.isVisible() ) {
			await removeButton.click();
		} else {
			await this.page.keyboard.press( 'Escape' );
		}
	}

	async openPanelElementContextMenu( widgetTitle: string ) {
		await this.page.click( `.elementor-element >> :text("${ widgetTitle }")`, { button: 'right' } );
		await this.page.waitForSelector( '.elementor-context-menu' );
	}
}
