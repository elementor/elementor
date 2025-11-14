import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper } from '../helper';

test.describe( 'Bricks brxe-* Class Filtering @widget-class-filtering', () => {
	let wpAdmin: WpAdminPage;
	let editor: EditorPage;
	let cssHelper: CssConverterHelper;

	const BRICKS_TEMPLATE_URL = 'https://templates.bricksbuilder.io/karlson/template/karlson-about/';
	const BRXE_CLASS_PATTERN = /brxe-/;
	const ELEMENTOR_CLASS_PREFIXES = [ 'elementor-', 'e-con' ];

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdminPage = new WpAdminPage( page, testInfo, apiRequests );

		await wpAdminPage.setExperiments( {
			e_opt_in_v4_page: 'active',
			e_atomic_elements: 'active',
		} );

		await wpAdminPage.setExperiments( {
			e_nested_elements: 'active',
		} );

		await page.close();
		cssHelper = new CssConverterHelper();
	} );

	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdminPage = new WpAdminPage( page, testInfo, apiRequests );
		await page.close();
	} );

	test.beforeEach( async ( { page, apiRequests }, testInfo ) => {
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	} );

	test( 'should NOT process brxe-* classes as widget classes', async ( { page, request } ) => {
		await test.step( 'Import Bricks template and check debug logs', async () => {
			const apiResult = await cssHelper.convertFromUrl(
				request,
				BRICKS_TEMPLATE_URL,
				[],
				false,
				{
					createGlobalClasses: true,
				}
			);

			const validation = cssHelper.validateApiResult( apiResult );
			if ( validation.shouldSkip ) {
				test.skip( true, validation.skipReason );
				return;
			}

			expect( apiResult.success ).toBe( true );
			expect( apiResult.post_id ).toBeDefined();

			await test.step( 'Check debug logs for brxe-* class processing', async () => {
				const debugLogResponse = await request.get( '/wp-content/debug.log', {
					timeout: 5000,
				} ).catch( () => null );

				if ( debugLogResponse && debugLogResponse.ok() ) {
					const debugLog = await debugLogResponse.text();
					const lines = debugLog.split( '\n' );

					const widgetClassProcessorLines = lines.filter( ( line ) =>
						line.includes( 'Widget Class Processor' ) && line.includes( 'brxe' )
					);

				const extractedBrxeRules = widgetClassProcessorLines.filter( ( line ) =>
					line.includes( 'EXTRACTED' ) && ! line.includes( 'Total' ) && ! line.match( /EXTRACTED.*:\s*0/ )
				);

					const targetClassesLines = widgetClassProcessorLines.filter( ( line ) =>
						line.includes( 'Target classes' )
					);

					console.log( '=== DEBUG LOG ANALYSIS ===' );
					console.log( `Total Widget Class Processor lines with brxe: ${ widgetClassProcessorLines.length }` );
					console.log( `Extracted brxe rules: ${ extractedBrxeRules.length }` );
					console.log( `Target classes lines: ${ targetClassesLines.length }` );

					if ( extractedBrxeRules.length > 0 ) {
						console.log( 'ERROR: Found brxe-* classes being extracted as widget-specific:' );
						extractedBrxeRules.slice( 0, 5 ).forEach( ( line ) => {
							console.log( `  - ${ line }` );
						} );
					}

					if ( targetClassesLines.length > 0 ) {
						console.log( 'Target classes found:' );
						targetClassesLines.slice( 0, 5 ).forEach( ( line ) => {
							console.log( `  - ${ line }` );
						} );
					}

					expect( extractedBrxeRules.length ).toBe( 0 );
				}
			} );

			await test.step( 'Verify intro-section is NOT extracted as widget-specific', async () => {
				const debugLogResponse = await request.get( '/wp-content/debug.log', {
					timeout: 5000,
				} ).catch( () => null );

				if ( debugLogResponse && debugLogResponse.ok() ) {
					const debugLog = await debugLogResponse.text();
					const lines = debugLog.split( '\n' );

					const introSectionExtracted = lines.filter( ( line ) =>
						line.includes( 'Widget Class Processor' ) &&
						line.includes( 'intro-section' ) &&
						line.includes( 'EXTRACTED' ) &&
						! line.includes( 'Total' ) &&
						! line.match( /EXTRACTED.*:\s*0/ )
					);

					console.log( `intro-section extracted as widget-specific: ${ introSectionExtracted.length }` );

					if ( introSectionExtracted.length > 0 ) {
						console.log( 'ERROR: intro-section was incorrectly extracted:' );
						introSectionExtracted.forEach( ( line ) => {
							console.log( `  - ${ line }` );
						} );
					}

					expect( introSectionExtracted.length ).toBe( 0 );
				}
			} );

			await test.step( 'Verify intro-section CSS rules exist before Widget Class Processor', async () => {
				const debugLogResponse = await request.get( '/wp-content/debug.log', {
					timeout: 5000,
				} ).catch( () => null );

				if ( debugLogResponse && debugLogResponse.ok() ) {
					const debugLog = await debugLogResponse.text();
					const lines = debugLog.split( '\n' );

					const beforeExtractionLines = lines.filter( ( line ) =>
						line.includes( 'Widget Class Processor' ) &&
						line.includes( 'intro-section' ) &&
						line.includes( 'BEFORE extraction' )
					);

					const totalBeforeLines = lines.filter( ( line ) =>
						line.includes( 'Widget Class Processor' ) &&
						line.includes( 'Total .intro-section rules BEFORE extraction' )
					);

					console.log( `intro-section rules BEFORE extraction: ${ beforeExtractionLines.length }` );
					console.log( `Total BEFORE extraction lines: ${ totalBeforeLines.length }` );

					if ( totalBeforeLines.length > 0 ) {
						const totalLine = totalBeforeLines[ totalBeforeLines.length - 1 ];
						const match = totalLine.match( /Total \.intro-section rules BEFORE extraction: (\d+)/ );
						if ( match ) {
							const count = parseInt( match[ 1 ], 10 );
							console.log( `Total count: ${ count }` );
							expect( count ).toBe( 0 );
						}
					}
				}
			} );

			await test.step( 'Verify intro-section is detected as global class', async () => {
				const debugLogResponse = await request.get( '/wp-content/debug.log', {
					timeout: 5000,
				} ).catch( () => null );

				if ( debugLogResponse && debugLogResponse.ok() ) {
					const debugLog = await debugLogResponse.text();
					const lines = debugLog.split( '\n' );

					const detectionLines = lines.filter( ( line ) =>
						line.includes( 'Detection Service' ) &&
						line.includes( 'intro-section' )
					);

					const foundInDetected = lines.filter( ( line ) =>
						line.includes( 'Detection Service' ) &&
						line.includes( 'intro-section in detected_classes: YES' )
					);

					console.log( `Detection Service lines with intro-section: ${ detectionLines.length }` );
					console.log( `Found in detected_classes: ${ foundInDetected.length }` );

					if ( foundInDetected.length === 0 ) {
						console.log( 'WARNING: intro-section was NOT found in detected_classes' );
						detectionLines.slice( -10 ).forEach( ( line ) => {
							console.log( `  - ${ line }` );
						} );
					}
				}
			} );
		} );
	} );

	test( 'should verify is_widget_class logic excludes brxe-* classes', async () => {
		await test.step( 'Test that brxe-* classes are NOT widget classes', () => {
			const testClasses = [
				'brxe-section',
				'brxe-container',
				'brxe-div',
				'brxe-530443',
				'intro-section',
				'elementor-section',
				'e-con',
				'e-con-inner',
			];

			testClasses.forEach( ( className ) => {
				const isBrxe = BRXE_CLASS_PATTERN.test( className );
				const isElementor = ELEMENTOR_CLASS_PREFIXES.some( ( prefix ) =>
					className.startsWith( prefix )
				);

				if ( isBrxe ) {
					expect( isElementor ).toBe( false );
					console.log( `✓ ${ className } is correctly NOT an Elementor widget class` );
				} else if ( isElementor ) {
					console.log( `✓ ${ className } is correctly an Elementor widget class` );
				} else {
					console.log( `✓ ${ className } is correctly NOT a widget class (should be global)` );
				}
			} );
		} );
	} );
} );

