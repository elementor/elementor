import { execSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { type BrowserContext, expect, type Page } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import DesignSystemPage from './design-system-page';
import {
	cleanupDesignSystemData,
	createTestClass,
	createTestVariable,
	initDesignSystemTest,
	mockApiRoute,
} from './utils';
import {
	cleanupTempFixture,
	createColorVariable,
	createDesignSystemZip,
	createFontSizeVariable,
	type FixtureData,
	SAMPLE_CLASSES_DATA,
	SAMPLE_VARIABLES_DATA,
} from './fixtures/fixture-builder';

function extractZip( zipBuffer: Buffer ): Record< string, string > {
	const tempDir = fs.mkdtempSync( path.join( os.tmpdir(), 'extract-zip-' ) );

	try {
		const zipPath = path.join( tempDir, 'input.zip' );
		fs.writeFileSync( zipPath, zipBuffer );
		execSync( `unzip -o "${ zipPath }" -d "${ tempDir }"`, { stdio: 'pipe' } );

		const files: Record< string, string > = {};
		for ( const fileName of fs.readdirSync( tempDir ) ) {
			if ( fileName.endsWith( '.json' ) ) {
				files[ fileName ] = fs.readFileSync( path.join( tempDir, fileName ), 'utf-8' );
			}
		}

		return files;
	} finally {
		fs.rmSync( tempDir, { recursive: true, force: true } );
	}
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
		wpAdmin = await initDesignSystemTest( page, testInfo, apiRequests );
		designSystem = new DesignSystemPage( page );
	} );

	test.beforeEach( async ( { apiRequests } ) => {
		editor = await wpAdmin.openNewPage();
		await cleanupDesignSystemData( apiRequests, page );
	} );

	test.afterEach( async () => {
		for ( const fixturePath of tempFixtures ) {
			cleanupTempFixture( fixturePath );
		}
		tempFixtures.length = 0;
	} );

	test.afterAll( async ( { apiRequests } ) => {
		await cleanupDesignSystemData( apiRequests, page );
		await wpAdmin.resetExperiments();
		await context.close();
	} );

	async function createTempFixtureFile( data: FixtureData ): Promise< string > {
		const zipBuffer = await createDesignSystemZip( data );
		const tempName = `temp-${ Date.now() }-${ Math.random().toString( 36 ).slice( 2 ) }.zip`;
		const filePath = path.join( __dirname, 'fixtures', tempName );
		fs.writeFileSync( filePath, zipBuffer );
		tempFixtures.push( filePath );
		return filePath;
	}

	test.describe( 'Export Flow', () => {
		test( 'exports design system with classes and variables', async ( { apiRequests } ) => {
			const { request } = page.context();

			await test.step( 'Create test class and variable', async () => {
				await createTestClass( apiRequests, request, {
					id: 'e-gc-export-test',
					label: 'Export Test Class',
					props: { color: '#ff0000' },
				} );

				await createTestVariable( apiRequests, request, {
					id: 'e-gv-export-test',
					label: 'Export Test Var',
					value: '#00ff00',
					type: 'color',
				} );
			} );

			await test.step( 'Open design system panel', async () => {
				await page.reload();
				await designSystem.openFromToolbar();
			} );

			let downloadedFile: Buffer;

			await test.step( 'Start export and wait for download', async () => {
				const download = await designSystem.startExport();
				await designSystem.waitForExportSuccess();

				const downloadPath = await download.path();
				expect( downloadPath ).toBeTruthy();
				downloadedFile = fs.readFileSync( downloadPath! );
			} );

			await test.step( 'Verify exported zip contents', async () => {
				const extractedFiles = extractZip( downloadedFile );

				expect( extractedFiles[ 'global-classes.json' ] ).toBeDefined();
				const classesContent = JSON.parse( extractedFiles[ 'global-classes.json' ] );
				expect( classesContent.items ).toBeDefined();
				expect( classesContent.order ).toBeDefined();

				expect( extractedFiles[ 'global-variables.json' ] ).toBeDefined();
				const variablesContent = JSON.parse( extractedFiles[ 'global-variables.json' ] );
				expect( variablesContent.data ).toBeDefined();
			} );
		} );

		test( 'export menu is disabled during export', async ( { apiRequests } ) => {
			const { request } = page.context();

			await test.step( 'Create minimal test data', async () => {
				await createTestClass( apiRequests, request, {
					id: 'e-gc-disable-test',
					label: 'Disable Test',
				} );
			} );

			await test.step( 'Open design system panel', async () => {
				await page.reload();
				await designSystem.openFromToolbar();
			} );

			await test.step( 'Start export and verify menu button is disabled', async () => {
				const downloadPromise = page.waitForEvent( 'download' );
				await designSystem.openHeaderMenu();
				await designSystem.exportMenuItem.click();

				const isDisabled = await designSystem.isHeaderMenuDisabled();
				expect( isDisabled ).toBe( true );

				await downloadPromise;
				await designSystem.waitForExportSuccess();
			} );

			await test.step( 'Menu button should be enabled again after export', async () => {
				await page.waitForTimeout( 500 );
				const isDisabledAfter = await designSystem.isHeaderMenuDisabled();
				expect( isDisabledAfter ).toBe( false );
			} );
		} );
	} );

	test.describe( 'Import Dialog Behavior', () => {
		test( 'opens import dialog from menu', async () => {
			await test.step( 'Open design system panel', async () => {
				await designSystem.openFromToolbar();
			} );

			await test.step( 'Open import dialog', async () => {
				await designSystem.openImportDialog();
			} );

			await test.step( 'Verify dialog elements are visible', async () => {
				await expect( designSystem.importDialog ).toBeVisible();
				await expect( designSystem.keepExistingRadio ).toBeVisible();
				await expect( designSystem.replaceExistingRadio ).toBeVisible();
				await expect( designSystem.importButton ).toBeVisible();
				await expect( designSystem.cancelButton ).toBeVisible();
			} );
		} );

		test( 'import button is disabled until file and strategy are selected', async () => {
			const fixturePath = await createTempFixtureFile( {
				classes: SAMPLE_CLASSES_DATA,
				variables: SAMPLE_VARIABLES_DATA,
			} );

			await test.step( 'Open import dialog', async () => {
				await designSystem.openFromToolbar();
				await designSystem.openImportDialog();
			} );

			await test.step( 'Import button should be disabled initially', async () => {
				await expect( designSystem.importButton ).toBeDisabled();
			} );

			await test.step( 'Upload file - button still disabled (no strategy)', async () => {
				await designSystem.uploadFile( fixturePath );
				await expect( designSystem.importButton ).toBeDisabled();
			} );

			await test.step( 'Select strategy - button should be enabled', async () => {
				await designSystem.selectConflictStrategy( 'keep' );
				await expect( designSystem.importButton ).toBeEnabled();
			} );
		} );

		test( 'can remove uploaded file and re-upload', async () => {
			const fixturePath1 = await createTempFixtureFile( {
				classes: SAMPLE_CLASSES_DATA,
			} );

			const fixturePath2 = await createTempFixtureFile( {
				variables: SAMPLE_VARIABLES_DATA,
			} );

			await test.step( 'Open import dialog and upload first file', async () => {
				await designSystem.openFromToolbar();
				await designSystem.openImportDialog();
				await designSystem.uploadFile( fixturePath1 );
			} );

			await test.step( 'Verify file row is visible', async () => {
				await expect( designSystem.uploadedFileRow ).toBeVisible();
			} );

			await test.step( 'Remove file', async () => {
				await designSystem.removeUploadedFile();
			} );

			await test.step( 'Upload different file', async () => {
				await designSystem.uploadFile( fixturePath2 );
				await expect( designSystem.uploadedFileRow ).toBeVisible();
			} );
		} );

		test( 'cancel closes dialog without importing', async () => {
			await test.step( 'Open import dialog', async () => {
				await designSystem.openFromToolbar();
				await designSystem.openImportDialog();
			} );

			await test.step( 'Click cancel', async () => {
				await designSystem.cancelButton.click();
			} );

			await test.step( 'Dialog should be closed', async () => {
				await expect( designSystem.importDialog ).toBeHidden();
			} );
		} );
	} );

	test.describe( 'Import Success Scenarios', () => {
		test( 'imports classes only', async () => {
			const fixturePath = await createTempFixtureFile( {
				classes: SAMPLE_CLASSES_DATA,
			} );

			await test.step( 'Open design system panel', async () => {
				await designSystem.openFromToolbar();
			} );

			await test.step( 'Perform import with keep strategy', async () => {
				await designSystem.performImport( fixturePath, 'keep' );
			} );

			await test.step( 'Wait for import success', async () => {
				await designSystem.waitForImportSuccess();
			} );

			await test.step( 'Verify imported classes appear in panel', async () => {
				await designSystem.switchToClassesTab();
				await expect( designSystem.getClassItem( 'Test Header' ) ).toBeVisible();
				await expect( designSystem.getClassItem( 'Test Button' ) ).toBeVisible();
			} );
		} );

		test( 'imports variables only', async () => {
			const fixturePath = await createTempFixtureFile( {
				variables: SAMPLE_VARIABLES_DATA,
			} );

			await test.step( 'Open design system panel', async () => {
				await designSystem.openFromToolbar();
			} );

			await test.step( 'Perform import with keep strategy', async () => {
				await designSystem.performImport( fixturePath, 'keep' );
			} );

			await test.step( 'Wait for import success', async () => {
				await designSystem.waitForImportSuccess();
			} );

			await test.step( 'Verify variables panel shows imported items', async () => {
				await designSystem.switchToVariablesTab();
				await expect( designSystem.variablesEmptyState ).toBeHidden();
			} );
		} );

		test( 'imports both classes and variables', async () => {
			const fixturePath = await createTempFixtureFile( {
				classes: SAMPLE_CLASSES_DATA,
				variables: SAMPLE_VARIABLES_DATA,
			} );

			await test.step( 'Perform import', async () => {
				await designSystem.openFromToolbar();
				await designSystem.performImport( fixturePath, 'keep' );
				await designSystem.waitForImportSuccess();
			} );

			await test.step( 'Verify classes imported', async () => {
				await designSystem.switchToClassesTab();
				await expect( designSystem.getClassItem( 'Test Header' ) ).toBeVisible();
			} );

			await test.step( 'Verify variables imported', async () => {
				await designSystem.switchToVariablesTab();
				await expect( designSystem.variablesEmptyState ).toBeHidden();
			} );
		} );
	} );

	test.describe( 'Conflict Resolution', () => {
		test( 'skip strategy preserves existing items', async ( { apiRequests } ) => {
			const { request } = page.context();

			await test.step( 'Create existing variable with same label', async () => {
				await createTestVariable( apiRequests, request, {
					id: 'e-gv-existing-primary',
					label: 'Primary Color',
					value: '#111111',
					type: 'color',
				} );
			} );

			const fixturePath = await createTempFixtureFile( {
				variables: {
					data: {
						'e-gv-imported-primary': createColorVariable(
							'e-gv-imported-primary',
							'Primary Color',
							'#222222',
							0
						),
					},
					watermark: 'test',
				},
			} );

			await test.step( 'Reload and perform import with keep strategy', async () => {
				await page.reload();
				await designSystem.openFromToolbar();
				await designSystem.performImport( fixturePath, 'keep' );
				await designSystem.waitForImportSuccess();
			} );

			await test.step( 'Verify original value is preserved', async () => {
				await designSystem.switchToVariablesTab();

				const { variables } = await apiRequests.customGet(
					request,
					'index.php?rest_route=/elementor/v1/variables/list'
				).then( ( r ) => r.data );

				const primaryVar = Object.values( variables ).find(
					( v: { label: string } ) => v.label === 'Primary Color'
				) as { value: string } | undefined;

				expect( primaryVar?.value ).toBe( '#111111' );
			} );
		} );

		test( 'replace strategy updates existing items', async ( { apiRequests } ) => {
			const { request } = page.context();

			await test.step( 'Create existing variable', async () => {
				await createTestVariable( apiRequests, request, {
					id: 'e-gv-replace-test',
					label: 'Replace Test',
					value: '#aaaaaa',
					type: 'color',
				} );
			} );

			const fixturePath = await createTempFixtureFile( {
				variables: {
					data: {
						'e-gv-replace-imported': createColorVariable(
							'e-gv-replace-imported',
							'Replace Test',
							'#bbbbbb',
							0
						),
					},
					watermark: 'test',
				},
			} );

			await test.step( 'Reload and perform import with replace strategy', async () => {
				await page.reload();
				await designSystem.openFromToolbar();
				await designSystem.performImport( fixturePath, 'replace' );
				await designSystem.waitForImportSuccess();
			} );

			await test.step( 'Verify value is updated', async () => {
				const { variables } = await apiRequests.customGet(
					request,
					'index.php?rest_route=/elementor/v1/variables/list'
				).then( ( r ) => r.data );

				const replaceVar = Object.values( variables ).find(
					( v: { label: string } ) => v.label === 'Replace Test'
				) as { value: string } | undefined;

				expect( replaceVar?.value ).toBe( '#bbbbbb' );
			} );
		} );

		test( 'type mismatch on replace creates new item with renamed label', async ( { apiRequests } ) => {
			const { request } = page.context();

			await test.step( 'Create existing color variable', async () => {
				await createTestVariable( apiRequests, request, {
					id: 'e-gv-type-mismatch',
					label: 'Type Mismatch Var',
					value: '#cccccc',
					type: 'color',
				} );
			} );

			const fixturePath = await createTempFixtureFile( {
				variables: {
					data: {
						'e-gv-type-mismatch-import': createFontSizeVariable(
							'e-gv-type-mismatch-import',
							'Type Mismatch Var',
							'16px',
							0
						),
					},
					watermark: 'test',
				},
			} );

			await test.step( 'Perform import with replace strategy', async () => {
				await page.reload();
				await designSystem.openFromToolbar();
				await designSystem.performImport( fixturePath, 'replace' );
				await designSystem.waitForImportSuccess();
			} );

			await test.step( 'Verify both variables exist (type mismatch creates new)', async () => {
				const { variables } = await apiRequests.customGet(
					request,
					'index.php?rest_route=/elementor/v1/variables/list'
				).then( ( r ) => r.data );

				const variableLabels = Object.values( variables )
					.filter( ( v: { deleted_at?: number | null } ) => ! v.deleted_at )
					.map( ( v: { label: string } ) => v.label );

				expect( variableLabels ).toContain( 'Type Mismatch Var' );
				expect( variableLabels.some( ( l: string ) => l.includes( 'Type Mismatch Var' ) && l !== 'Type Mismatch Var' ) ).toBe( true );
			} );
		} );
	} );

	test.describe( 'Error Scenarios', () => {
		test( 'shows error for corrupted zip file', async () => {
			const corruptedPath = path.join( __dirname, 'fixtures', 'temp-corrupted.zip' );
			fs.writeFileSync( corruptedPath, 'not a valid zip content' );
			tempFixtures.push( corruptedPath );

			await test.step( 'Open design system panel', async () => {
				await designSystem.openFromToolbar();
			} );

			await test.step( 'Try to import corrupted file', async () => {
				await designSystem.performImport( corruptedPath, 'keep' );
			} );

			await test.step( 'Should show error notification', async () => {
				await designSystem.waitForImportFailure();
				await expect( designSystem.tryAgainButton ).toBeVisible();
			} );
		} );

		test( 'handles network error during upload', async () => {
			const fixturePath = await createTempFixtureFile( {
				classes: SAMPLE_CLASSES_DATA,
			} );

			await test.step( 'Mock upload endpoint to fail', async () => {
				await mockApiRoute( page, '**/import-export-customization/upload', {
					status: 500,
					body: { message: 'Server error' },
				} );
			} );

			await test.step( 'Attempt import', async () => {
				await designSystem.openFromToolbar();
				await designSystem.performImport( fixturePath, 'keep' );
			} );

			await test.step( 'Should show error notification', async () => {
				await designSystem.waitForImportFailure();
			} );

			await test.step( 'Clear route mock', async () => {
				await page.unroute( '**/import-export-customization/upload' );
			} );
		} );

		test( 'Try again button reopens import dialog', async () => {
			const corruptedPath = path.join( __dirname, 'fixtures', 'temp-retry.zip' );
			fs.writeFileSync( corruptedPath, 'invalid zip' );
			tempFixtures.push( corruptedPath );

			await test.step( 'Trigger import failure', async () => {
				await designSystem.openFromToolbar();
				await designSystem.performImport( corruptedPath, 'keep' );
				await designSystem.waitForImportFailure();
			} );

			await test.step( 'Click Try again', async () => {
				await designSystem.tryAgainButton.click();
			} );

			await test.step( 'Import dialog should reopen', async () => {
				await expect( designSystem.importDialog ).toBeVisible();
			} );
		} );
	} );

	test.describe( 'Permission Tests', () => {
		test( 'non-admin user cannot see import/export menu', async ( { browser, apiRequests }, testInfo ) => {
			let testUser: { id: string; username: string; password: string };

			await test.step( 'Create editor user', async () => {
				testUser = await apiRequests.createNewUser( page.context().request, {
					username: `editorUser${ Date.now() }`,
					password: 'password123',
					email: `editor${ Date.now() }@test.com`,
					roles: [ 'editor' ],
				} );
			} );

			await test.step( 'Login as editor and open design system', async () => {
				const editorContext = await browser.newContext( { storageState: undefined } );
				const editorPage = await editorContext.newPage();
				const editorWpAdmin = new WpAdminPage( editorPage, testInfo, apiRequests );

				await editorWpAdmin.customLogin( testUser.username, 'password123' );
				await editorWpAdmin.openNewPage( false, false );

				const editorDesignSystem = new DesignSystemPage( editorPage );
				await editorDesignSystem.openFromToolbar();

				await test.step( 'Verify header menu is not visible for editor', async () => {
					await expect( editorDesignSystem.headerMenuButton ).toBeHidden();
				} );

				await editorContext.close();
			} );

			await test.step( 'Cleanup test user', async () => {
				if ( testUser?.id ) {
					try {
						await apiRequests.deleteUser( page.context().request, testUser.id );
					} catch {
						// Ignore cleanup errors
					}
				}
			} );
		} );

		test( 'admin user can see and use import/export menu', async () => {
			await test.step( 'Open design system as admin', async () => {
				await designSystem.openFromToolbar();
			} );

			await test.step( 'Verify header menu is visible', async () => {
				await expect( designSystem.headerMenuButton ).toBeVisible();
			} );

			await test.step( 'Verify menu items are accessible', async () => {
				await designSystem.openHeaderMenu();
				await expect( designSystem.importMenuItem ).toBeVisible();
				await expect( designSystem.exportMenuItem ).toBeVisible();
			} );
		} );
	} );

	test.describe( 'Integration Tests', () => {
		test( 'round-trip export and import preserves data', async ( { apiRequests } ) => {
			const { request } = page.context();

			const testClassName = 'Round Trip Class';
			const testVariableName = 'Round Trip Var';

			await test.step( 'Create test data', async () => {
				await createTestClass( apiRequests, request, {
					id: 'e-gc-roundtrip',
					label: testClassName,
					props: { color: '#123456' },
				} );

				await createTestVariable( apiRequests, request, {
					id: 'e-gv-roundtrip',
					label: testVariableName,
					value: '#654321',
					type: 'color',
				} );
			} );

			let exportedZip: Buffer;

			await test.step( 'Export design system', async () => {
				await page.reload();
				await designSystem.openFromToolbar();
				const download = await designSystem.startExport();
				await designSystem.waitForExportSuccess();
				const downloadPath = await download.path();
				exportedZip = fs.readFileSync( downloadPath! );
			} );

			await test.step( 'Delete all data', async () => {
				await cleanupDesignSystemData( apiRequests, page );
			} );

			await test.step( 'Import the exported zip', async () => {
				const importPath = path.join( __dirname, 'fixtures', 'temp-roundtrip.zip' );
				fs.writeFileSync( importPath, exportedZip );
				tempFixtures.push( importPath );

				await page.reload();
				await designSystem.openFromToolbar();
				await designSystem.performImport( importPath, 'keep' );
				await designSystem.waitForImportSuccess();
			} );

			await test.step( 'Verify class is restored', async () => {
				await designSystem.switchToClassesTab();
				await expect( designSystem.getClassItem( testClassName ) ).toBeVisible();
			} );

			await test.step( 'Verify variable is restored', async () => {
				await designSystem.switchToVariablesTab();
				await expect( designSystem.variablesEmptyState ).toBeHidden();
			} );
		} );

		test( 'import is disabled during another import', async () => {
			const fixturePath = await createTempFixtureFile( {
				classes: SAMPLE_CLASSES_DATA,
				variables: SAMPLE_VARIABLES_DATA,
			} );

			await test.step( 'Open design system and start import', async () => {
				await designSystem.openFromToolbar();
				await designSystem.performImport( fixturePath, 'keep' );
			} );

			await test.step( 'Menu should be disabled during import', async () => {
				const isDisabled = await designSystem.isHeaderMenuDisabled();
				expect( isDisabled ).toBe( true );
			} );

			await test.step( 'Wait for import to complete', async () => {
				await designSystem.waitForImportSuccess();
			} );
		} );
	} );
} );
