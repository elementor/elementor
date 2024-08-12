import EditorPage from '../../../pages/editor-page';
import { Page } from '@playwright/test';
import WpAdminPage from '../../../pages/wp-admin-page';
import { controlIds, selectors } from './selectors';
import topBarSelectors from '../../../selectors/top-bar-selectors';

export default class ChecklistHelper {
	readonly page: Page;
	readonly editor: EditorPage;
	readonly wpAdmin: WpAdminPage;

	constructor( page: Page, wpAdmin: WpAdminPage, editor?: EditorPage ) {
		this.page = page;
		this.editor = editor || null;
		this.wpAdmin = wpAdmin;
	}

	async setChecklistSwitcherInPreferences( shouldShow: boolean ) {
		await this.editor.openUserPreferencesPanel();
		await this.editor.setSwitcherControlValue( controlIds.preferencePanel.checklistSwitcher, shouldShow );
	}

	async toggleChecklistInTheEditor( shouldOpen: boolean = true ) {
		if ( shouldOpen === await this.isChecklistOpen() ) {
			return;
		}

		if ( await this.editor.hasTopBar() ) {
			await this.editor.clickTopBarItem( topBarSelectors.checklistToggle );
		} else {
			// TODO: Implement openChecklistInTheEditor
		}
	}

	async toggleChecklistItem( itemId: string, shouldExpand: boolean = true ) {
		if ( ! await this.isChecklistOpen() ) {
			await this.toggleChecklistInTheEditor( true );
		}

		if ( shouldExpand === await this.isChecklistItemExpanded( itemId ) ) {
			return;
		}

		await this.page.click( this.getButtonSelector( itemId ) );
	}

	async isChecklistOpen() {
		return ( await this.editor?.previewFrame.locator( selectors.popup ).isVisible() ) ||
			( await this.page.locator( selectors.popup ).isVisible() );
	}

	async isChecklistItemExpanded( itemId: string ) {
		const checklistItemSelector = this.getContentSelector( itemId );

		return await this.isChecklistOpen() && (
			await this.editor.previewFrame.locator( checklistItemSelector ).isVisible() ||
			await this.page.locator( checklistItemSelector ).isVisible()
		);
	}

	async toggleMarkAsDone( itemId: string, status: 'done' | 'undone' ) {
		await this.toggleChecklistItem( itemId, true );


	}

	getContentSelector( itemId: string, innerSelector: string = '' ) {
		return `${ selectors.popup } ${ selectors.checklistItemContent }[data-id="${ itemId }"] ${ innerSelector }`;
	}

	getButtonSelector( itemId: string ) {
		return `${ selectors.popup } ${ selectors.checklistItemButton }[data-id="${ itemId }"]`;
	}
}

