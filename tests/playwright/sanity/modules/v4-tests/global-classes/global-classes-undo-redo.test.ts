import { expect, type Locator } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import type EditorPage from '../../../../pages/editor-page';
import WpAdminPage from '../../../../pages/wp-admin-page';
import { deleteAllGlobalClasses } from './utils';

const CLASS_NAME = 'undo-test-class';
const BG_COLOR = '#FF0000';
const FONT_COLOR = '#0000FF';
const EXPECTED_BG_CSS = 'rgb(255, 0, 0)';
const EXPECTED_FONT_COLOR_CSS = 'rgb(0, 0, 255)';
const DEFAULT_BG_CSS = 'rgba(0, 0, 0, 0)';
const SETTLE_MS = 1000;
const UNDO_SETTLE_MS = 500;

function getCanvasDivBlock( editor: EditorPage, divBlockId: string ): Locator {
	return editor.getPreviewFrame().locator( `[data-id="${ divBlockId }"]` );
}

async function undo( editor: EditorPage ): Promise<void> {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	await editor.page.evaluate( () => ( window as any ).$e.run( 'document/history/undo' ) );
	await editor.page.waitForTimeout( UNDO_SETTLE_MS );
}

async function redo( editor: EditorPage ): Promise<void> {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	await editor.page.evaluate( () => ( window as any ).$e.run( 'document/history/redo' ) );
	await editor.page.waitForTimeout( UNDO_SETTLE_MS );
}

async function undoUntilClassRemoved( editor: EditorPage, divBlock: Locator ): Promise<void> {
	const MAX_UNDO_STEPS = 10;

	for ( let i = 0; i < MAX_UNDO_STEPS; i++ ) {
		await undo( editor );

		const hasClass = await divBlock.evaluate(
			( el, cn ) => el.classList.contains( cn ),
			CLASS_NAME,
		);

		if ( ! hasClass ) {
			return;
		}
	}
}

async function redoUntilClassRestored( editor: EditorPage, divBlock: Locator ): Promise<void> {
	const MAX_REDO_STEPS = 10;

	for ( let i = 0; i < MAX_REDO_STEPS; i++ ) {
		await redo( editor );

		const hasClass = await divBlock.evaluate(
			( el, cn ) => el.classList.contains( cn ),
			CLASS_NAME,
		);

		if ( hasClass ) {
			return;
		}
	}
}

async function redoUntilCSSApplied( editor: EditorPage, divBlock: Locator, property: string, expectedValue: string ): Promise<void> {
	const MAX_REDO_STEPS = 10;

	for ( let i = 0; i < MAX_REDO_STEPS; i++ ) {
		const currentValue = await divBlock.evaluate(
			( el, prop ) => getComputedStyle( el ).getPropertyValue( prop ),
			property,
		);

		if ( currentValue === expectedValue ) {
			return;
		}

		await redo( editor );
	}
}

test.describe( 'Global Classes - Undo/Redo @v4-tests', () => {
	let wpAdmin: WpAdminPage;
	let editor: EditorPage;
	let divBlockId: string;

	test.beforeEach( async ( { page, apiRequests }, testInfo ) => {
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( { e_atomic_elements: 'active', e_classes: 'active' } );

		const { request } = page.context();
		await deleteAllGlobalClasses( apiRequests, request );

		editor = await wpAdmin.openNewPage();
		divBlockId = await editor.addElement( { elType: 'e-div-block' }, 'document' );
		await editor.selectElement( divBlockId );
		await editor.v4Panel.openTab( 'style' );
	} );

	test.afterEach( async () => {
		await wpAdmin.resetExperiments();
	} );

	test( 'Undo and redo global class creation with multiple prop changes', async () => {
		const divBlock = getCanvasDivBlock( editor, divBlockId );

		// Arrange - create class and set multiple properties
		await editor.v4Panel.style.addGlobalClass( CLASS_NAME );
		await editor.page.waitForTimeout( SETTLE_MS );

		await editor.v4Panel.style.openSection( 'Background' );
		await editor.v4Panel.style.setBackgroundColor( BG_COLOR );
		await editor.page.waitForTimeout( SETTLE_MS );

		await editor.v4Panel.style.openSection( 'Typography' );
		await editor.v4Panel.style.setFontColor( FONT_COLOR );
		await editor.page.waitForTimeout( SETTLE_MS );

		await editor.v4Panel.style.setFontSize( 24, 'px' );
		await editor.page.waitForTimeout( SETTLE_MS );

		// Assert - all styles are applied
		await expect( divBlock ).toHaveClass( new RegExp( CLASS_NAME ) );
		await expect( divBlock ).toHaveCSS( 'background-color', EXPECTED_BG_CSS );
		await expect( divBlock ).toHaveCSS( 'color', EXPECTED_FONT_COLOR_CSS );
		await expect( divBlock ).toHaveCSS( 'font-size', '24px' );

		// Act - undo everything until the class is fully removed
		await undoUntilClassRemoved( editor, divBlock );

		// Assert - class and all styles are gone
		await expect( divBlock ).not.toHaveClass( new RegExp( CLASS_NAME ) );
		await expect( divBlock ).toHaveCSS( 'background-color', DEFAULT_BG_CSS );

		// Act - redo until the class is back
		await redoUntilClassRestored( editor, divBlock );

		// Assert - class is back on the element (verifies class ID reuse on redo)
		await expect( divBlock ).toHaveClass( new RegExp( CLASS_NAME ) );

		// Act - redo until all properties are restored
		await redoUntilCSSApplied( editor, divBlock, 'font-size', '24px' );

		// Assert - all styles are fully restored (verifies replace mode works on redo)
		await expect( divBlock ).toHaveCSS( 'background-color', EXPECTED_BG_CSS );
		await expect( divBlock ).toHaveCSS( 'color', EXPECTED_FONT_COLOR_CSS );
		await expect( divBlock ).toHaveCSS( 'font-size', '24px' );
		await expect( divBlock ).toHaveClass( new RegExp( CLASS_NAME ) );
	} );
} );
