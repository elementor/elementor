import WpAdminPage from '../../../pages/wp-admin-page';
import EditorPage from '../../../pages/editor-page';

export default class FloatingElementPage extends WpAdminPage {
	private FLOATING_BUTTON_POST_ID = 50;
	async goToFloatingButtonsEmptyPage() {
		await this.page.goto(
			'/wp-admin/edit.php?post_type=elementor_library&page=e-floating-buttons',
		);
	}

	async goToFloatingButtonsPage() {
		await this.page.goto(
			'/wp-admin/edit.php?post_type=e-floating-buttons',
		);
	}

	async deleteAllFloatingButtons() {
		await this.goToFloatingButtonsPage();
		await this.page.locator( '#cb-select-all-1' ).click();
		await this.page.locator( '#bulk-action-selector-top' ).selectOption( 'trash' );
		await this.page.locator( '#doaction' ).click();
		await this.page.waitForURL( '/wp-admin/edit.php?post_type=e-floating-buttons&paged=1' );
	}

	async goToFloatingButtonElementorEditor() {
		await this.page.goto( `/wp-admin/post.php?post=${ this.FLOATING_BUTTON_POST_ID }&action=elementor` );
		await this.closeAnnouncementsIfVisible();

		return new EditorPage( this.page, this.testInfo, this.FLOATING_BUTTON_POST_ID );
	}
}
