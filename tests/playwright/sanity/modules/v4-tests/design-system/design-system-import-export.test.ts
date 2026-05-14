import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { type BrowserContext, expect, type Page } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import EditorPage from '../../../../pages/editor-page';
import WpAdminPage from '../../../../pages/wp-admin-page';
import DesignSystemPage from './design-system-page';
import {
	cleanupDesignSystemData,
	createTestClass,
	createTestVariable,
	DESIGN_SYSTEM_EXPERIMENTS,
} from './utils';
import {
	cleanupTempFixture,
	createClassItem,
	createDesignSystemZip,
	type FixtureData,
	SAMPLE_CLASSES_DATA,
} from './fixtures/fixture-builder';

const ORIGINAL_BG_COLOR = '#ff0000';
const IMPORTED_BG_COLOR = '#0000ff';
const ORIGINAL_BG_RGB = 'rgb(255, 0, 0)';
const IMPORTED_BG_RGB = 'rgb(0, 0, 255)';

const backgroundProp = ( hex: string ) => ( {
	background: {
		$$type: 'background',
		value: { color: { $$type: 'color', value: hex } },
	},
} );
const CONFLICT_CLASS_ID = 'e-gc-conflict-cls';
const CONFLICT_CLASS_LABEL = 'ConflictClass';
const IMPORT_CLASS_ID = 'e-gc-import-cls';
const STYLE_POLL_TIMEOUT_MS = 15_000;

async function createTempFixture( data: FixtureData ): Promise< string > {
	const zipBuffer = await createDesignSystemZip( data );
	const tempName = `temp-${ Date.now() }-${ Math.random().toString( 36 ).slice( 2 ) }.zip`;
	const filePath = path.join( os.tmpdir(), tempName );
	fs.writeFileSync( filePath, zipBuffer );
	return filePath;
}

test.describe( 'Design System Import/Export @v4-tests', () => {
	let wpAdmin: WpAdminPage;
	let editor: EditorPage;
	let page: Page;
	let context: BrowserContext;
	let designSystem: DesignSystemPage;
	const tempFixtures: string[] = [];

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		context = await browser.newContext();
		page = await context.newPage();
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( DESIGN_SYSTEM_EXPERIMENTS );
		designSystem = new DesignSystemPage( page );
	} );

	test.beforeEach( async ( { apiRequests } ) => {
		editor = await wpAdmin.openNewPage();
		await cleanupDesignSystemData( apiRequests, page.context().request );
	} );

	test.afterEach( async () => {
		for ( const fixturePath of tempFixtures ) {
			cleanupTempFixture( fixturePath );
		}
		tempFixtures.length = 0;
	} );

	test.afterAll( async ( { apiRequests } ) => {
		await cleanupDesignSystemData( apiRequests, page.context().request );
		await wpAdmin.resetExperiments();
		await context.close();
	} );

	test( 'export works and downloads a file with success notification', async ( { apiRequests } ) => {
		const request = page.context().request;

		await test.step( 'Seed class + variable', async () => {
			await createTestClass( apiRequests, request, {
				id: 'e-gc-export-test',
				label: 'ExportTestClass',
				props: { color: { $$type: 'color', value: '#ff0000' } },
			} );
			await createTestVariable( apiRequests, request, {
				id: 'e-gv-export-test',
				label: 'ExportTestVar',
				value: '#00ff00',
				type: 'color',
			} );
		} );

		await test.step( 'Open design system panel', async () => {
			await designSystem.openFromToolbar();
		} );

		await test.step( 'Start export and verify download and success notification', async () => {
			const download = await designSystem.startExport();
			await designSystem.waitForExportSuccess();
			const downloadPath = await download.path();
			expect( downloadPath ).toBeTruthy();
			expect( fs.statSync( downloadPath! ).size ).toBeGreaterThan( 0 );
		} );
	} );

	test( 'import works without conflicts and shows imported class', async ( { apiRequests } ) => {
		const request = page.context().request;

		await test.step( 'Seed only a variable (no class conflicts possible)', async () => {
			await createTestVariable( apiRequests, request, {
				id: 'e-gv-no-conflict',
				label: 'ExistingVar',
				value: '#aaaaaa',
				type: 'color',
			} );
		} );

		await test.step( 'Create import fixture with a new class not in DB', async () => {
			const fixturePath = await createTempFixture( { classes: SAMPLE_CLASSES_DATA } );
			tempFixtures.push( fixturePath );
		} );

		await test.step( 'Open design system panel', async () => {
			await designSystem.openFromToolbar();
		} );

		await test.step( 'Import the fixture with keep strategy and wait for success', async () => {
			await designSystem.performImport( tempFixtures[ 0 ], 'keep' );
			await designSystem.waitForImportSuccess();
		} );

		await test.step( 'Imported class is visible in Classes tab', async () => {
			await designSystem.switchToClassesTab();
			await expect( designSystem.getClassItem( 'TestHeader' ) ).toBeVisible();
			await expect( designSystem.getClassItem( 'TestButton' ) ).toBeVisible();
		} );
	} );

	test( 'import with replace conflict overwrites existing class color on canvas', async ( { apiRequests } ) => {
		const request = page.context().request;
		let fixturePath: string;

		await test.step( 'Seed conflicting class with original red color', async () => {
			await createTestClass( apiRequests, request, {
				id: CONFLICT_CLASS_ID,
				label: CONFLICT_CLASS_LABEL,
				props: backgroundProp( ORIGINAL_BG_COLOR ),
			} );
		} );

		await test.step( 'Create import fixture with same-label class but blue color', async () => {
			fixturePath = await createTempFixture( {
				classes: {
					items: {
						[ IMPORT_CLASS_ID ]: createClassItem( IMPORT_CLASS_ID, CONFLICT_CLASS_LABEL, backgroundProp( IMPORTED_BG_COLOR ) ),
					},
					order: [ IMPORT_CLASS_ID ],
				},
			} );
			tempFixtures.push( fixturePath );
		} );

		let divBlockId: string;

		await test.step( 'Add div block and assign the seeded class', async () => {
			divBlockId = await editor.addElement( { elType: 'e-div-block' }, 'document' );
			await editor.selectElement( divBlockId );
			await editor.v4Panel.openTab( 'style' );
			await editor.v4Panel.style.addGlobalClass( CONFLICT_CLASS_LABEL );
		} );

		await test.step( 'Verify div block initially shows original red color', async () => {
			const widget = await editor.getWidget( divBlockId );
			await expect.poll(
				() => widget.evaluate( ( el ) => getComputedStyle( el ).backgroundColor ),
				{ timeout: STYLE_POLL_TIMEOUT_MS },
			).toBe( ORIGINAL_BG_RGB );
		} );

		await test.step( 'Open design system panel and import with replace strategy', async () => {
			await designSystem.openFromToolbar();
			await designSystem.performImport( fixturePath, 'replace' );
			await designSystem.waitForImportSuccess();
		} );

		await test.step( 'Canvas reflects imported blue color after replace', async () => {
			const widget = await editor.getWidget( divBlockId );
			await expect.poll(
				() => widget.evaluate( ( el ) => getComputedStyle( el ).backgroundColor ),
				{ timeout: STYLE_POLL_TIMEOUT_MS },
			).toBe( IMPORTED_BG_RGB );
		} );
	} );

	test( 'import with keep conflict preserves existing class color on canvas', async ( { apiRequests } ) => {
		const request = page.context().request;
		let fixturePath: string;

		await test.step( 'Seed conflicting class with original red color', async () => {
			await createTestClass( apiRequests, request, {
				id: CONFLICT_CLASS_ID,
				label: CONFLICT_CLASS_LABEL,
				props: backgroundProp( ORIGINAL_BG_COLOR ),
			} );
		} );

		await test.step( 'Create import fixture with same-label class but blue color', async () => {
			fixturePath = await createTempFixture( {
				classes: {
					items: {
						[ IMPORT_CLASS_ID ]: createClassItem( IMPORT_CLASS_ID, CONFLICT_CLASS_LABEL, backgroundProp( IMPORTED_BG_COLOR ) ),
					},
					order: [ IMPORT_CLASS_ID ],
				},
			} );
			tempFixtures.push( fixturePath );
		} );

		let divBlockId: string;

		await test.step( 'Add div block and assign the seeded class', async () => {
			divBlockId = await editor.addElement( { elType: 'e-div-block' }, 'document' );
			await editor.selectElement( divBlockId );
			await editor.v4Panel.openTab( 'style' );
			await editor.v4Panel.style.addGlobalClass( CONFLICT_CLASS_LABEL );
		} );

		await test.step( 'Verify div block initially shows original red color', async () => {
			const widget = await editor.getWidget( divBlockId );
			await expect.poll(
				() => widget.evaluate( ( el ) => getComputedStyle( el ).backgroundColor ),
				{ timeout: STYLE_POLL_TIMEOUT_MS },
			).toBe( ORIGINAL_BG_RGB );
		} );

		await test.step( 'Open design system panel and import with keep strategy', async () => {
			await designSystem.openFromToolbar();
			await designSystem.performImport( fixturePath, 'keep' );
			await designSystem.waitForImportSuccess();
		} );

		await test.step( 'Canvas still shows original red color after keep', async () => {
			const widget = await editor.getWidget( divBlockId );
			await expect.poll(
				() => widget.evaluate( ( el ) => getComputedStyle( el ).backgroundColor ),
				{ timeout: STYLE_POLL_TIMEOUT_MS },
			).toBe( ORIGINAL_BG_RGB );
		} );
	} );

	test( 'import shows error for corrupted zip with try again button', async () => {
		const corruptedPath = path.join( os.tmpdir(), `temp-corrupted-${ Date.now() }.zip` );
		fs.writeFileSync( corruptedPath, 'not a valid zip content' );
		tempFixtures.push( corruptedPath );

		await test.step( 'Open design system panel', async () => {
			await designSystem.openFromToolbar();
		} );

		await test.step( 'Try to import the corrupted zip', async () => {
			await designSystem.performImport( corruptedPath, 'keep' );
		} );

		await test.step( 'Error notification and try again button are visible', async () => {
			await designSystem.waitForImportFailure();
			await expect( designSystem.tryAgainButton ).toBeVisible();
		} );
	} );
} );
