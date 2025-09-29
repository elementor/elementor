import BasePage from '../base-page';

export default class GeneralTab extends BasePage {
	private readonly sectionButtonSelector = 'button[id*="label-"][aria-controls*="content-"]';

	async openSection( sectionName: 'Content' | 'Settings' ): Promise<void> {
		const sectionButton = this.page.locator( this.sectionButtonSelector )
			.filter( { hasText: sectionName } );

		const isOpen = await this.isSectionOpen( sectionName );
		if ( ! isOpen ) {
			await sectionButton.click();
		}
	}

	async isSectionOpen( sectionName: 'Content' | 'Settings' ): Promise<boolean> {
		const sectionButton = this.page.locator( this.sectionButtonSelector )
			.filter( { hasText: sectionName } );

		const ariaControls = await sectionButton.getAttribute( 'aria-controls' );
		if ( ! ariaControls ) {
			return false;
		}

		const sectionPanel = this.page.locator( `#${ ariaControls }` );
		return await sectionPanel.isVisible();
	}
}
