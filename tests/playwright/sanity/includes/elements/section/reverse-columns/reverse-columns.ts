import { expect, type Page, type TestInfo } from '@playwright/test';
import WpAdminPage from '../../../../../pages/wp-admin-page';
import Breakpoints from '../../../../../assets/breakpoints';
import EditorPage from '../../../../../pages/editor-page';
import Content from '../../../../../pages/elementor-panel-tabs/content';

export default class ReverseColumns {
	readonly page: Page;
	readonly testInfo: TestInfo;
	readonly wpAdmin: WpAdminPage;
	readonly editor: EditorPage;

	constructor( page: Page, testInfo: TestInfo ) {
		this.page = page;
		this.testInfo = testInfo;
		this.wpAdmin = new WpAdminPage( this.page, this.testInfo );
		this.editor = new EditorPage( this.page, this.testInfo );
	}

	async open() {
		await this.page.waitForTimeout( 1000 );
		await this.editor.getPreviewFrame().click( '.elementor-add-section-button', { delay: 500, clickCount: 2 } );
		await this.editor.getPreviewFrame().click( '.elementor-select-preset-list li:nth-child(2)' );
		await this.page.click( '#elementor-panel-footer-responsive' );
		await this.page.click( 'text=Advanced' );
		await this.page.click( 'text=Responsive' );
	}

	getFirstColumn() {
		return this.editor.getPreviewFrame().locator( '[data-element_type="column"][data-col="50"]:nth-child(1)' ).first();
	}

	async toggle( device: string ) {
		const contentTab = new Content( this.page, this.testInfo );
		await contentTab.toggleControls( [ `[data-setting="reverse_order_${ device }"]` ] );
	}

	async init( isExperimentBreakpoints: boolean ) {
		await this.wpAdmin.setExperiments( {
			additional_custom_breakpoints: isExperimentBreakpoints,
			container: false,
		} );
		await this.wpAdmin.openNewPage();
		await this.editor.getPreviewFrame().locator( '.elementor-add-section-inner' ).click( { button: 'right' } );
		if ( isExperimentBreakpoints ) {
			const pageUrl = new URL( this.page.url() );
			const searchParams = pageUrl.searchParams;

			const breakpoints = new Breakpoints( this.page );
			await breakpoints.addAllBreakpoints( searchParams.get( 'post' ) );
		}

		await this.open();
	}

	async testReverseColumnsOneActivated( testDevice, isExperimentBreakpoints = false ) {
		await this.init( isExperimentBreakpoints );

		await this.page.click( `#e-responsive-bar-switcher__option-${ testDevice }` );
		const firstColumn = this.getFirstColumn();
		await expect( firstColumn ).toHaveCSS( 'order', '0' );

		await this.toggle( testDevice );

		await expect( firstColumn ).toHaveCSS( 'order', '10' );

		const breakpoints = isExperimentBreakpoints ? Breakpoints.getAll() : Breakpoints.getBasic(),
			filteredBreakpoints = breakpoints.filter( ( value ) => testDevice !== value );

		for ( const breakpoint of filteredBreakpoints ) {
			await this.page.click( `#e-responsive-bar-switcher__option-${ breakpoint }` );
			await expect( firstColumn ).toHaveCSS( 'order', '0' );
		}
	}

	async testReverseColumnsAllActivated( isExperimentBreakpoints = false ) {
		await this.init( isExperimentBreakpoints );

		const breakpoints = isExperimentBreakpoints ? Breakpoints.getAll() : Breakpoints.getBasic();

		for ( const breakpoint of breakpoints ) {
			await this.page.click( `#e-responsive-bar-switcher__option-${ breakpoint }` );
			const firstColumn = this.getFirstColumn();
			if ( 'desktop' === breakpoint ) {
				await expect( firstColumn ).toHaveCSS( 'order', '0' );
				continue;
			}
			await this.toggle( breakpoint );
			await expect( firstColumn ).toHaveCSS( 'order', '10' );
		}
	}
}
