import EditorPage from '../playwright/pages/editor-page';
import EditorSelectors from '../playwright/selectors/editor-selectors';
import { expect, type Frame, type Page, type TestInfo } from '@playwright/test';
type ScreenShot = {
	device: string,
	isPublished: boolean,
	widgetType: string,
	hoverSelector: { [ key: string ]: string }
}
export default class ElementRegressionHelper {
	readonly page: Page;
	readonly editor: EditorPage;

	constructor( page: Page, testInfo: TestInfo ) {
		this.page = page;
		this.editor = new EditorPage( page, testInfo );
	}

	getLabel( isPublished: boolean ) {
		return isPublished ? 'published' : 'editor';
	}

	async doScreenshot( widgetType: string, isPublished: boolean ) {
		if ( widgetType.includes( 'hover' ) ) {
			return;
		}

		// TODO: Fix in a separate task.
		if ( 'text_path' === widgetType ) {
			return;
		}

		const locator = isPublished
			? this.page.locator( EditorSelectors.container + ' >> nth=0' )
			: this.editor.getPreviewFrame().locator( EditorSelectors.container + ' >> nth=0' );

		const label = this.getLabel( isPublished );

		if ( ! isPublished ) {
			await this.page.evaluate( async () => {
				const iframe = document.getElementById( 'elementor-preview-iframe' );
				iframe.style.height = '3000px';
			} );
		}
		await expect.soft( locator )
			.toHaveScreenshot( `${ widgetType }_${ label }.png`, { maxDiffPixels: 200, timeout: 10000 } );
	}

	async doHoverScreenshot( args:Omit<ScreenShot, 'device'> ) {
		if ( args.widgetType.includes( 'hover' ) ) {
			const widget = args.isPublished
				? this.page.locator( EditorSelectors.widget )
				: this.editor.getPreviewFrame().locator( EditorSelectors.widget );
			const label = this.getLabel( args.isPublished );
			const widgetCount = await widget.count();

			for ( let i = 0; i < widgetCount; i++ ) {
				await expect( widget.nth( i ) ).not.toHaveClass( /elementor-widget-empty/ );
				await widget.locator( args.hoverSelector[ args.widgetType ] ).nth( i ).hover();
				await expect.soft( widget.nth( i ) )
					.toHaveScreenshot( `${ args.widgetType }_${ i }_${ label }.png`, { maxDiffPixels: 200, timeout: 10000, animations: 'disabled' } );
			}
		}
	}

	async setResponsiveMode( mode: string ) {
		const hasTopBar = await this.editor.hasTopBar();

		if ( hasTopBar ) {
			const deviceLabel = mode.charAt( 0 ).toUpperCase() + mode.slice( 1 );

			await this.page.locator( `${ EditorSelectors.panels.topBar.wrapper } [aria-label="Switch Device"] button[aria-label*="${ deviceLabel }"]` ).click();
		} else {
			if ( ! await this.page.locator( '.elementor-device-desktop.ui-resizable' ).isVisible() ) {
				await this.page.getByRole( 'button', { name: 'Responsive Mode' } ).click();
			}
			await this.page.locator( `#e-responsive-bar-switcher__option-${ mode } i` ).click();
			await this.editor.getPreviewFrame().locator( '#site-header' ).click();
		}
	}

	async doResponsiveScreenshot( args: Omit<ScreenShot, 'hoverSelector'> ) {
		let page: Page | Frame;
		let label = '';
		const deviceParams = { mobile: { width: 360, height: 736 }, tablet: { width: 768, height: 787 } };

		// TODO: Fix in a separate task.
		if ( 'text_path' === args.widgetType ) {
			return;
		}

		if ( args.widgetType.includes( 'hover' ) ) {
			return;
		}

		if ( args.isPublished ) {
			page = this.page;
			await page.setViewportSize( deviceParams[ args.device ] );

			if ( 'container_grid' === args.widgetType && 'mobile' === args.device ) {
				await page.waitForTimeout( 500 );
			}

			label = '_published';
			await expect.soft( page.locator( EditorSelectors.container + ' >> nth=0' ) )
				.toHaveScreenshot( `${ args.widgetType }_${ args.device }${ label }.png`, { maxDiffPixels: 200, timeout: 10000 } );
		} else {
			page = this.editor.getPreviewFrame();
			await this.setResponsiveMode( args.device );
			await this.page.evaluate( () => {
				const iframe = document.getElementById( 'elementor-preview-iframe' );
				iframe.style.height = '3000px';
			} );
			await expect.soft( page.locator( EditorSelectors.container + ' >> nth=0' ) )
				.toHaveScreenshot( `${ args.widgetType }_${ args.device }${ label }.png`, { maxDiffPixels: 200, timeout: 10000 } );
		}
	}
}
