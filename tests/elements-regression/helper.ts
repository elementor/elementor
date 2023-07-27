import EditorPage from '../playwright/pages/editor-page';
import EditorSelectors from '../playwright/selectors/editor-selectors';
import { expect, type Frame, type Page, type TestInfo } from '@playwright/test';
type ScreenShot = {
	device: string,
	isPublished?: boolean,
	widgetType: string
}

export default class ElementRegressionHelper {
	readonly page: Page;
	readonly editorPage: EditorPage;

	constructor( page: Page, testInfo: TestInfo ) {
		this.page = page;
		this.editorPage = new EditorPage( page, testInfo );
	}

	async doScreenshotComparison( args: { widgetType: string, hoverSelector: {[ key: string ]: string} } ) {
		let animation: 'disabled' | 'allow' = 'disabled';
		const widgetCount = await this.editorPage.getWidgetCount();
		for ( let i = 0; i < widgetCount; i++ ) {
			const widget = this.editorPage.getWidget().nth( i );
			await expect( widget ).not.toHaveClass( /elementor-widget-empty/ );

			if ( args.widgetType.includes( 'hover' ) ) {
				await widget.locator( args.hoverSelector[ args.widgetType ] ).hover();
				animation = 'allow';
			}
			await expect( widget )
				.toHaveScreenshot( `${ args.widgetType }_${ i }.png`, { maxDiffPixels: 200, timeout: 10000, animations: animation } );
		}
	}

	async doScreenshotPublished( args: { widgetType: string, hoverSelector: {[ key: string ]: string} } ) {
		const widgetCount = await this.page.locator( EditorSelectors.widget ).count();
		if ( args.widgetType.includes( 'hover' ) ) {
			for ( let i = 0; i < widgetCount; i++ ) {
				await this.page.locator( `${ EditorSelectors.widget } ${ args.hoverSelector[ args.widgetType ] }` ).nth( i ).hover();
				await expect( this.page.locator( EditorSelectors.widget ).nth( i ) ).
					toHaveScreenshot( `${ args.widgetType }_${ i }_published.png`, { maxDiffPixels: 200, timeout: 10000, animations: 'allow' } );
			}
		} else {
			await expect( this.page.locator( EditorSelectors.container ) )
				.toHaveScreenshot( `${ args.widgetType }_published.png`, { maxDiffPixels: 200, timeout: 10000 } );
		}
	}

	async setResponsiveMode( mode ) {
		// Mobile tablet desktop
		if ( ! await this.page.locator( '.elementor-device-desktop.ui-resizable' ).isVisible() ) {
			await this.page.getByRole( 'button', { name: 'Responsive Mode' } ).click();
		}
		await this.page.locator( `#e-responsive-bar-switcher__option-${ mode } i` ).click();
		await this.editorPage.getPreviewFrame().locator( '#site-header' ).click();
	}

	async doResponsiveScreenshot( args: ScreenShot = { isPublished: false, device: 'mobile', widgetType: '' } ) {
		let page: Page | Frame;
		let label = '';
		const deviceParams = { mobile: { width: 360, height: 736 }, tablet: { width: 768, height: 787 } };

		if ( args.widgetType.includes( 'hover' ) ) {
			return;
		}
		if ( args.isPublished ) {
			page = this.page;
			await page.setViewportSize( deviceParams[ args.device ] );
			label = '_published';
			await expect( page.locator( EditorSelectors.container ) )
				.toHaveScreenshot( `${ args.widgetType }_${ args.device }${ label }.png`, { maxDiffPixels: 200, timeout: 10000 } );
		} else {
			page = this.editorPage.getPreviewFrame();
			await this.setResponsiveMode( args.device );
			await this.page.evaluate( () => {
				const iframe = document.getElementById( 'elementor-preview-iframe' );
				iframe.style.height = '2000px';
			} );
			await expect( page.locator( EditorSelectors.container ) )
				.toHaveScreenshot( `${ args.widgetType }_${ args.device }${ label }.png`, { maxDiffPixels: 200, timeout: 10000 } );
		}
	}
}
