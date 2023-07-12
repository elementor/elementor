import EditorPage from '../playwright/pages/editor-page';
import EditorSelectors from '../playwright/selectors/editor-selectors';
import { expect } from '@playwright/test';

export default class ElementRegressionHelper {
	constructor( page, testInfo ) {
		this.page = page;
		this.editorPage = new EditorPage( page, testInfo );
	}

	async doScreenshotComparison( args = { widgetType, hoverSelector } ) {
		let animation = 'disabled';
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

	async doScreenshotComparisonPublished( args = { widgetType, hoverSelector } ) {
		const widgetCount = await this.page.locator( EditorSelectors.widget ).length;
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
	}
}
