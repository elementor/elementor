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
		await this.page.waitForResponse( ( response ) => response.url().includes( 'wp-admin/admin-ajax.php' ), { timeout: 30000 } );
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

		await this.page.click( this.getStepButtonSelector( itemId ) );
	}

	async isChecklistOpen() {
		return ( await this.editor?.page.locator( selectors.popup ).isVisible() ) ||
			( await this.page.locator( selectors.popup ).isVisible() );
	}

	async isChecklistItemExpanded( itemId: string ) {
		const checklistItemSelector = this.getStepContentSelector( itemId );

		return await this.isChecklistOpen() && (
			await this.editor.page.locator( checklistItemSelector ).isVisible() ||
			await this.page.locator( checklistItemSelector ).isVisible()
		);
	}

	async toggleMarkAsDone( itemId: string ) {
		await this.toggleChecklistItem( itemId, true );
	}

	getStepContentSelector( itemId: string, innerSelector: string = '' ) {
		return `${ selectors.popup } ${ selectors.checklistItemContent }.checklist-step-${ itemId } ${ innerSelector }`;
	}

	getStepButtonSelector( itemId: string ) {
		return `${ selectors.popup } ${ selectors.checklistItemButton }.checklist-step-${ itemId }`;
	}

	getSteps() {
		return [
			{
				id: 'create-pages',
				title: 'Create your first 3 pages',
				imagePath: 'https://assets.elementor.com/checklist/v1/images/checklist-step-3.jpg',
				description: 'Jumpstart your creation with professional designs form the Template Library or start from scratch.',
				learn_more_link: 'https://elementor.com/help/create-new-page/',
				learn_more_text: 'https://elementor.com/help/create-new-page/',
				cta_text: 'Create a new page',
				is_completed: true,
			},
		];
	}
}

