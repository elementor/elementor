import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import EditorPage from '../../../pages/editor-page';
import { wpCli } from '../../../assets/wp-cli';

const GRID_PRESETS = [
	{ structure: '1-2', rows: 1, columns: 2 },
	{ structure: '2-1', rows: 2, columns: 1 },
	{ structure: '1-3', rows: 1, columns: 3 },
	{ structure: '3-1', rows: 3, columns: 1 },
	{ structure: '2-2', rows: 2, columns: 2 },
	{ structure: '2-3', rows: 2, columns: 3 },
];

function hasWhiteSpace( value: string ) {
	return /\s/g.test( value );
}

test.describe( 'V4 grid layout wizard presets @css-grid', () => {
	test.beforeAll( async () => {
		await wpCli( 'wp elementor experiments activate e_atomic_elements,container,e_opt_in_v4' );
	} );

	test( 'Grid wizard presets create e-grid with matching track counts', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = new EditorPage( page, testInfo );
		await wpAdmin.openNewPage();
		await editor.closeNavigatorIfOpen();

		const frame = editor.getPreviewFrame();

		for ( const { structure, rows, columns } of GRID_PRESETS ) {
			await test.step( `Assert preset ${ structure }`, async () => {
				await frame.locator( '.elementor-add-section-button' ).click();
				await frame.locator( '.grid-preset-button' ).click();
				await frame.locator( `[data-structure="${ structure }"]` ).click();

				const gridElement = frame.locator( '[data-element_type="e-grid"]' ).last();
				await expect( gridElement ).toBeVisible();
				await expect( gridElement ).toHaveCSS( 'display', 'grid' );

				const [ initialRows, initialColumns ] = await gridElement.evaluate( ( el ) => {
					const computedStyle = window.getComputedStyle( el );
					return [
						computedStyle.getPropertyValue( 'grid-template-rows' ),
						computedStyle.getPropertyValue( 'grid-template-columns' ),
					];
				} );

				await gridElement.evaluate( ( el, { rowsCount, colsCount } ) => {
					el.style.setProperty( 'grid-template-rows', `repeat(${ rowsCount }, 1fr)` );
					el.style.setProperty( 'grid-template-columns', `repeat(${ colsCount }, 1fr)` );
				}, { rowsCount: rows, colsCount: columns } );

				await expect( gridElement ).toHaveCSS( 'grid-template-rows', initialRows );
				await expect( gridElement ).toHaveCSS( 'grid-template-columns', initialColumns );

				await editor.cleanContent();
			} );
		}
	} );

	test( 'Grid wizard preset collapses to one column on mobile', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = new EditorPage( page, testInfo );
		await wpAdmin.openNewPage();
		await editor.closeNavigatorIfOpen();

		const frame = editor.getPreviewFrame();

		await frame.locator( '.elementor-add-section-button' ).click();
		await frame.locator( '.grid-preset-button' ).click();
		await frame.locator( '[data-structure="1-3"]' ).click();

		const gridElement = frame.locator( '[data-element_type="e-grid"]' ).last();

		await editor.changeResponsiveView( 'mobile' );

		const gridTemplateColumnsCssValue = await gridElement.evaluate( ( element ) => {
			return window.getComputedStyle( element ).getPropertyValue( 'grid-template-columns' );
		} );

		expect( hasWhiteSpace( gridTemplateColumnsCssValue ) ).toBeFalsy();
	} );
} );
