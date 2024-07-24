import { expect, type Page, type TestInfo } from '@playwright/test';
import WpAdminPage from '../../../../../pages/wp-admin-page';
import Breakpoints from '../../../../../assets/breakpoints';
import EditorPage from '../../../../../pages/editor-page';

export default class ReverseColumns {
	readonly page: Page;
	readonly testInfo: TestInfo;
	readonly wpAdmin: WpAdminPage;
	readonly editor: EditorPage;

	constructor( page: Page, testInfo: TestInfo, apiRequests ) {
		this.page = page;
		this.testInfo = testInfo;
		this.wpAdmin = new WpAdminPage( this.page, this.testInfo, apiRequests );
		this.editor = new EditorPage( this.page, this.testInfo );
	}

	getFirstColumn() {
		return this.editor.getPreviewFrame().locator( '[data-element_type="column"][data-col="50"]:nth-child(1)' ).first();
	}

	async reverseColumnsForBreakpoint( breakpoint: string ) {
		await this.editor.openPanelTab( 'advanced' );
		await this.editor.openSection( '_section_responsive' );
		await this.editor.setSwitcherControlValue( `reverse_order_${ breakpoint }`, true );
	}

	async init() {
		await this.wpAdmin.openNewPage();
		await this.editor.closeNavigatorIfOpen();
		await this.editor.getPreviewFrame().locator( '.elementor-add-section-inner' ).click( { button: 'right' } );
		await this.editor.getPreviewFrame().click( '.elementor-add-section-button', { delay: 500, clickCount: 2 } );
		await this.editor.getPreviewFrame().click( '.elementor-select-preset-list li:nth-child(2)' );
	}

	async initAdditionalBreakpoints() {
		const editor = await this.wpAdmin.openNewPage();
		await this.editor.getPreviewFrame().locator( '.elementor-add-section-inner' ).click( { button: 'right' } );
		const pageUrl = new URL( this.page.url() );
		const searchParams = pageUrl.searchParams;

		const breakpoints = new Breakpoints( this.page );
		await breakpoints.addAllBreakpoints( editor, searchParams.get( 'post' ) );
	}

	async resetAdditionalBreakpoints() {
		const editor = await this.wpAdmin.openNewPage();
		const breakpoints = new Breakpoints( this.page );
		await breakpoints.resetBreakpoints( editor );
	}

	async testReverseColumnsOneActivated( testDevice, isExperimentBreakpoints = false ) {
		await this.init();

		await this.editor.changeResponsiveView( testDevice );
		const firstColumn = this.getFirstColumn();
		await expect( firstColumn ).toHaveCSS( 'order', '0' );

		await this.reverseColumnsForBreakpoint( testDevice );

		await expect( firstColumn ).toHaveCSS( 'order', '10' );

		const breakpoints = isExperimentBreakpoints ? Breakpoints.getAll() : Breakpoints.getBasic(),
			filteredBreakpoints = breakpoints.filter( ( value ) => testDevice !== value );

		for ( const breakpoint of filteredBreakpoints ) {
			await this.editor.changeResponsiveView( breakpoint );
			await expect( firstColumn ).toHaveCSS( 'order', '0' );
		}
	}

	async testReverseColumnsAllActivated( isExperimentBreakpoints = false ) {
		await this.init();

		const breakpoints = isExperimentBreakpoints ? Breakpoints.getAll() : Breakpoints.getBasic();

		for ( const breakpoint of breakpoints ) {
			if ( 'widescreen' === breakpoint ) {
				continue;
			}
			await this.editor.changeResponsiveView( breakpoint );
			const firstColumn = this.getFirstColumn();
			if ( 'desktop' === breakpoint ) {
				await expect( firstColumn ).toHaveCSS( 'order', '0' );
				continue;
			}
			await this.reverseColumnsForBreakpoint( breakpoint );
			await expect( firstColumn ).toHaveCSS( 'order', '10' );
		}
	}
}
