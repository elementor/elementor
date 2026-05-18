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
	CONFLICT_FIXTURE,
	CONFLICT_SAME_LABEL_ZIP,
	SAMPLE_CLASSES_LABELS,
	SAMPLE_CLASSES_ZIP,
} from './fixtures/fixture-builder';

const ORIGINAL_BG_COLOR = '#ff0000';
const ORIGINAL_BG_RGB = 'rgb(255, 0, 0)';

const backgroundProp = ( hex: string ) => ( {
	background: {
		$$type: 'background',
		value: { color: { $$type: 'color', value: hex } },
	},
} );
const STYLE_POLL_TIMEOUT_MS = 15_000;

test.describe( 'Design System Import/Export @v4-tests', () => {
	let wpAdmin: WpAdminPage;
	let editor: EditorPage;
	let page: Page;
	let context: BrowserContext;
	let designSystem: DesignSystemPage;
	const tempFiles: string[] = [];

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		context = await browser.newContext();
		page = await context.newPage();
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( DESIGN_SYSTEM_EXPERIMENTS );
		designSystem = new DesignSystemPage( page );
	} );

	test.beforeEach( async ( { apiRequests } ) => {
		editor = await wpAdmin.openNewPage();
		await cleanupDesignSystemData( apiRequests, page );
	} );

	test.afterEach( async () => {
		for ( const filePath of tempFiles ) {
			if ( fs.existsSync( filePath ) ) {
				fs.unlinkSync( filePath );
			}
		}
		tempFiles.length = 0;
	} );

	test.afterAll( async ( { apiRequests } ) => {
		await cleanupDesignSystemData( apiRequests, page );
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

		await test.step( 'Open design system panel', async () => {
			await designSystem.openFromToolbar();
		} );

		await test.step( 'Import the fixture with keep strategy and wait for success', async () => {
			await designSystem.performImport( SAMPLE_CLASSES_ZIP, 'keep' );
			await designSystem.waitForImportSuccess();
		} );

		await test.step( 'Imported classes are visible in Classes tab', async () => {
			await designSystem.switchToClassesTab();
			for ( const label of SAMPLE_CLASSES_LABELS ) {
				await expect( designSystem.getClassItem( label ) ).toBeVisible();
			}
		} );
	} );

	test( 'import with replace conflict overwrites existing class color on canvas', async ( { apiRequests } ) => {
		const request = page.context().request;

		await test.step( 'Seed conflicting class with original red color', async () => {
			await createTestClass( apiRequests, request, {
				id: 'e-gc-conflict-cls',
				label: CONFLICT_FIXTURE.classLabel,
				props: backgroundProp( ORIGINAL_BG_COLOR ),
			} );
		} );

		// Reload editor so it initialises with the seeded class already in the DB.
		editor = await wpAdmin.openNewPage();
		let divBlockId: string;

		await test.step( 'Add div block and assign the seeded class', async () => {
			divBlockId = await editor.addElement( { elType: 'e-div-block' }, 'document' );
			await editor.selectElement( divBlockId );
			await editor.v4Panel.openTab( 'style' );
			await editor.v4Panel.style.addGlobalClass( CONFLICT_FIXTURE.classLabel );
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
			await designSystem.performImport( CONFLICT_SAME_LABEL_ZIP, 'replace' );
			await designSystem.waitForImportSuccess();
		} );

		await test.step( 'Canvas reflects imported blue color after replace', async () => {
			const widget = await editor.getWidget( divBlockId );
			await expect.poll(
				() => widget.evaluate( ( el ) => getComputedStyle( el ).backgroundColor ),
				{ timeout: STYLE_POLL_TIMEOUT_MS },
			).toBe( CONFLICT_FIXTURE.importedColorRgb );
		} );
	} );

	test( 'import with keep conflict preserves existing class color on canvas', async ( { apiRequests } ) => {
		const request = page.context().request;

		await test.step( 'Seed conflicting class with original red color', async () => {
			await createTestClass( apiRequests, request, {
				id: 'e-gc-conflict-cls',
				label: CONFLICT_FIXTURE.classLabel,
				props: backgroundProp( ORIGINAL_BG_COLOR ),
			} );
		} );

		// Reload editor so it initialises with the seeded class already in the DB.
		editor = await wpAdmin.openNewPage();
		let divBlockId: string;

		await test.step( 'Add div block and assign the seeded class', async () => {
			divBlockId = await editor.addElement( { elType: 'e-div-block' }, 'document' );
			await editor.selectElement( divBlockId );
			await editor.v4Panel.openTab( 'style' );
			await editor.v4Panel.style.addGlobalClass( CONFLICT_FIXTURE.classLabel );
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
			await designSystem.performImport( CONFLICT_SAME_LABEL_ZIP, 'keep' );
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
		tempFiles.push( corruptedPath );

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
