import EditorPage from '../../../pages/editor-page';
import { type APIRequestContext, Page, type TestInfo } from '@playwright/test';
import WpAdminPage from '../../../pages/wp-admin-page';
import { controlIds, selectors } from './selectors';
import { proStepIds, Step, StepId } from '../../../types/checklist';
import ApiRequests from '../../../assets/api-requests';

export class ChecklistHelper {
	readonly page: Page;
	readonly editor: EditorPage;
	readonly wpAdmin: WpAdminPage;
	readonly apiRequests: ApiRequests;

	constructor( page: Page, testInfo: TestInfo, apiRequest: ApiRequests ) {
		this.page = page;
		this.editor = new EditorPage( page, testInfo );
		this.wpAdmin = new WpAdminPage( page, testInfo, apiRequest );
		this.apiRequests = apiRequest;
	}

	async setChecklistSwitcherInPreferences( shouldShow: boolean ) {
		await this.editor.openUserPreferencesPanel();
		await this.editor.setSwitcherControlValue( controlIds.preferencePanel.checklistSwitcher, shouldShow );
		await this.page.waitForResponse( ( response ) => response.url().includes( 'wp-admin/admin-ajax.php' ), { timeout: 30000 } );
		await this.page.waitForResponse( ( response ) => response.url().includes( 'wp-admin/admin-ajax.php' ), { timeout: 30000 } );
	}

	async toggleChecklist( context: 'editor' | 'wp-admin', shouldOpen: boolean ) {
		if ( shouldOpen === await this.isChecklistOpen( context ) ) {
			return;
		}

		const frame = 'editor' === context ? this.editor.page : this.page;

		if ( 'editor' === context && await this.editor.hasTopBar() ) {
			await frame.locator( selectors.topBarIcon ).click();
		} else if ( 'editor' === context ) {
			// TODO: Implement openChecklist with no top bar
		} else {
			// TODO: Implement openChecklist in wp-admin
		}

		await frame.locator( selectors.popup ).waitFor( { state: shouldOpen ? 'visible' : 'hidden' } );
	}

	async toggleExpandChecklist( context: 'editor' | 'wp-admin', shouldExpand: boolean ) {
		await this.toggleChecklist( context, true );

		if ( await this.isChecklistExpanded( context ) === shouldExpand ) {
			return;
		}

		const frame = 'editor' === context
			? this.editor.page
			: this.page;

		await frame.locator( selectors.toggleExpandButton ).click();
		await frame.locator( `${ selectors.toggleExpandButton }[aria-expanded="${ shouldExpand.toString() }"]` ).waitFor();
	}

	async toggleChecklistItem( itemId: string, context: 'editor' | 'wp-admin', shouldExpand: boolean ) {
		if ( ! await this.isChecklistOpen( context ) ) {
			await this.toggleChecklist( context, true );
		}

		if ( shouldExpand === await this.isChecklistItemExpanded( itemId, context ) ) {
			return;
		}

		await this.page.click( this.getStepItemSelector( itemId ) );
	}

	async isChecklistOpen( context: 'editor' | 'wp-admin' ) {
		return 'editor' === context
			? await this.editor.page.locator( selectors.popup ).isVisible()
			: await this.page.locator( selectors.popup ).isVisible();
	}

	async isChecklistExpanded( context: 'editor' | 'wp-admin' ) {
		const frame = 'editor' === context
			? this.editor.page
			: this.page;

		return await this.isChecklistOpen( context ) && 'true' === await frame.locator( selectors.toggleExpandButton ).getAttribute( 'aria-expanded' );
	}

	async isChecklistItemExpanded( itemId: string, context: 'editor' | 'wp-admin' ) {
		const checklistItemSelector = this.getStepContentSelector( itemId ),
			frame = context ? this.editor.page : this.page;

		return await this.isChecklistOpen( context ) && await frame.locator( checklistItemSelector ).isVisible();
	}

	async toggleMarkAsDone( itemId: string, context: 'editor' | 'wp-admin' ) {
		await this.toggleChecklistItem( itemId, context, true );

		const markAsButton = this.page.locator( this.getStepContentSelector( itemId, selectors.markAsButton ) ),
			buttonText = await markAsButton.textContent();

		await this.page.locator( this.getStepContentSelector( itemId, selectors.markAsButton ) ).click();
		await this.page
			.locator( this.getStepContentSelector( itemId ) )
			.getByText( buttonText, { exact: true } )
			.waitFor( { state: 'hidden' } );
	}

	async getProgressFromPopup( context: 'editor' | 'wp-admin' ) {
		if ( ! await this.isChecklistOpen( context ) ) {
			await this.toggleChecklist( context, true );
		}

		const progress = await this.page.locator( selectors.progressBarPercentage ).textContent();

		return +progress.replace( '%', '' );
	}

	getStepContentSelector( itemId: string, innerSelector: string = '' ) {
		return `${ selectors.checklistItemContent } [data-step-id="${ itemId }"] ${ innerSelector }`;
	}

	getStepItemSelector( itemId: string, innerSelector: string = '' ) {
		return `${ selectors.checklistItemButton }[data-step-id="${ itemId }"] ${ innerSelector }`;
	}

	async getSteps( request: APIRequestContext ): Promise< Step[] > {
		return ( await this.apiRequests.customGet( request, 'wp-json/elementor/v1/checklist/steps' ) ).data;
	}

	async resetStepsInDb( request: APIRequestContext ) {
		const steps = await this.getSteps( request );

		for ( const step of steps ) {
			await this.apiRequests.customPut( request, `wp-json/elementor/v1/checklist/steps/${ step.config.id }`, {
				id: step.config.id,
				is_marked_completed: false,
				is_absolute_completed: false,
				is_immutable_completed: false,
			} );
		}
	}

	isStepCompleted( step: Step ) {
		return step.is_absolute_completed || step.is_marked_completed || step.is_immutable_completed;
	}

	isStepProLocked( stepId: StepId ) {
		return proStepIds.includes( stepId );
	}

	returnDataMockAllDoneMessage( isCompleted ) {
		return {
			data: [
				{
					is_marked_completed: false,
					is_immutable_completed: false,
					is_absolute_completed: isCompleted,
					config: {
						id: 'assign_homepage',
						title: 'Assign a homepage',
						description: 'Before your launch, make sure to assign a homepage so visitors have a clear entry point into your site.',
						learn_more_text: 'Learn more',
						learn_more_url: 'http://go.elementor.com/app-website-checklist-assign-home-article',
						is_completion_immutable: false,
						cta_text: 'Assign homepage',
						cta_url: 'https://elementor.com',
						image_src: 'https://assets.elementor.com/checklist/v1/images/checklist-step-6.jpg',
						required_license: 'free',
						is_locked: false,
						promotion_url: '',
					},
				},
				{
					is_marked_completed: false,
					is_immutable_completed: false,
					is_absolute_completed: true,
					config: {
						id: 'all_done',
						title: 'You\'re on your way!',
						description: 'With these steps, you\'ve got a great base for a robust website. Enjoy your web creation journey!',
						learn_more_text: 'Learn more',
						learn_more_url: 'https://go.elementor.com/getting-started-with-elementor/',
						is_completion_immutable: false,
						cta_text: 'Got it',
						cta_url: 'https://elementor.com',
						image_src: 'https://assets.elementor.com/checklist/v1/images/checklist-step-7.jpg',
						required_license: 'free',
						is_locked: false,
						promotion_url: '',
					},
				} ],
		};
	}
}
