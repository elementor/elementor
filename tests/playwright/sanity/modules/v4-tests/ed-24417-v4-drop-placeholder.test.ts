import { expect, type BrowserContext, type Page } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import EditorPage from '../../../pages/editor-page';

const ROW_BAR_MAX_WIDTH_PX = 20;
const ANIMATION_SETTLE_MS = 300;

test.describe( 'V4 row flexbox drop placeholder (ED-24417) @v4-tests', () => {
	let editor: EditorPage;
	let wpAdmin: WpAdminPage;
	let context: BrowserContext;
	let page: Page;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		context = await browser.newContext();
		page = await context.newPage();
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( {
			e_atomic_elements: 'active',
			e_opt_in_v4: 'active',
		} );
	} );

	test.afterAll( async () => {
		await context.close();
	} );

	const measurePlaceholder = async ( secondImageId: string, insertInsideImg: boolean ) => {
		return editor.getPreviewFrame().evaluate( async ( { secondId, insertInside } ) => {
			const wrapper = document.querySelector( `[data-id="${ secondId }"]` ) as HTMLElement;
			const target = wrapper?.querySelector( ':not(.elementor-widget-placeholder)' ) as HTMLElement;
			const container = wrapper?.closest( '.e-con' ) as HTMLElement;

			if ( ! wrapper || ! target || ! container ) {
				return { error: 'elements not found' };
			}

			const isFlexRow = [ 'flex', 'inline-flex' ].includes( window.getComputedStyle( container ).display )
				&& [ 'row', 'row-reverse' ].includes( window.getComputedStyle( container ).flexDirection );

			const placeholder = document.createElement( 'div' );
			placeholder.className = 'elementor-sortable-placeholder elementor-widget-placeholder';

			if ( insertInside ) {
				target.append( placeholder );
			} else {
				target.before( placeholder );
				if ( isFlexRow ) {
					container.classList.add( 'e-con--row' );
				}
			}

			await new Promise( ( resolve ) => setTimeout( resolve, 300 ) );

			const rect = placeholder.getBoundingClientRect();

			placeholder.remove();
			container.classList.remove( 'e-con--row' );

			return {
				rectWidth: rect.width,
				rectHeight: rect.height,
				visible: rect.width > 1 && rect.height > 1,
				looksLikeRowBar: rect.width <= 20 && rect.height > 15,
			};
		}, { secondId: secondImageId, insertInside: insertInsideImg } );
	};

	test( 'Outside insert shows visible row drop bar; inside img does not', async () => {
		editor = await wpAdmin.openNewPage();

		const flexboxId = await editor.addElement( { elType: 'e-flexbox' }, 'document' );
		await editor.addWidget( { widgetType: 'e-image', container: flexboxId } );
		const secondImageId = await editor.addWidget( { widgetType: 'e-image', container: flexboxId } );

		const outside = await measurePlaceholder( secondImageId, false );
		const inside = await measurePlaceholder( secondImageId, true );

		expect( outside.visible ).toBe( true );
		expect( outside.looksLikeRowBar ).toBe( true );
		expect( inside.visible ).toBe( false );
	} );


	test( 'V4 image in row flexbox satisfies flexRow logical-wrapper insert conditions', async () => {
		editor = await wpAdmin.openNewPage();

		const flexboxId = await editor.addElement( { elType: 'e-flexbox' }, 'document' );
		await editor.addWidget( { widgetType: 'e-image', container: flexboxId } );
		const secondImageId = await editor.addWidget( { widgetType: 'e-image', container: flexboxId } );

		const context = await editor.getPreviewFrame().evaluate( ( secondId ) => {
			const currentElement = document.querySelector( `[data-id="${ secondId }"]` ) as HTMLElement;
			const placeholderTarget = currentElement?.querySelector( ':not(.elementor-widget-placeholder)' ) as HTMLElement;
			const container = currentElement?.closest( '.e-con' ) as HTMLElement;
			const containerStyle = window.getComputedStyle( container );

			return {
				hasLogicalWrapper: 'contents' === window.getComputedStyle( currentElement ).display,
				isFlexRowContainer: [ 'flex', 'inline-flex' ].includes( containerStyle.display )
					&& [ 'row', 'row-reverse' ].includes( containerStyle.flexDirection ),
				placeholderIsImg: 'IMG' === placeholderTarget?.tagName,
			};
		}, secondImageId );

		expect( context.hasLogicalWrapper ).toBe( true );
		expect( context.isFlexRowContainer ).toBe( true );
		expect( context.placeholderIsImg ).toBe( true );
	} );

} );
