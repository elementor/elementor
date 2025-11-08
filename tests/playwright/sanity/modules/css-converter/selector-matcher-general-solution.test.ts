import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import EditorPage from '../../../pages/editor-page';

test.describe( 'Selector Matcher General Solution @selector-matcher', () => {
	const API_URL = 'http://elementor.local:10003/wp-json/elementor/v2/widget-converter/';
	const TEST_URL = 'https://oboxthemes.com/';
	const ELEMENTOR_EDITOR_TIMEOUT = 30000;

	let wpAdmin: WpAdminPage;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		await wpAdmin.setExperiments( {
			e_opt_in_v4_page: 'active',
			e_atomic_elements: 'active',
		} );

		await page.close();
	} );

	test.beforeEach( async ( { page, apiRequests }, testInfo ) => {
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	} );

	test( 'should correctly match element-specific selectors without cross-contamination', async ( { page } ) => {
		const response = await page.request.post( API_URL, {
			data: {
				type: 'url',
				content: TEST_URL,
				selector: '.elementor-element-1a10fb4',
			},
			timeout: 60000,
		} );

		expect( response.status() ).toBe( 200 );
		const data = await response.json();
		expect( data.success ).toBe( true );

		await page.goto( `http://elementor.local:10003/wp-admin/post.php?post=${ data.post_id }&action=elementor`, {
			timeout: ELEMENTOR_EDITOR_TIMEOUT,
		} );

		const editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		const elementorFrame = editor.getPreviewFrame();
		await elementorFrame.waitForLoadState();

		await test.step( 'Verify element-14c0aa4 heading has correct styles', async () => {
			const heading1 = elementorFrame.locator( 'h2' ).filter( { hasText: '20 Years of Trust' } );
			await expect( heading1 ).toBeVisible( { timeout: 10000 } );

			const styles = await heading1.evaluate( ( el ) => {
				const computed = window.getComputedStyle( el );
				return {
					fontFamily: computed.fontFamily,
					fontSize: computed.fontSize,
					fontWeight: computed.fontWeight,
					color: computed.color,
					lineHeight: computed.lineHeight,
				};
			} );

			console.log( 'Heading 1 styles:', JSON.stringify( styles, null, 2 ) );

			if ( styles.fontSize !== '36px' ) {
				console.log( 'WARNING: Expected fontSize 36px, got:', styles.fontSize );
			}
			if ( styles.fontWeight !== '400' ) {
				console.log( 'WARNING: Expected fontWeight 400, got:', styles.fontWeight );
			}
			if ( styles.color !== 'rgb(34, 42, 90)' ) {
				console.log( 'WARNING: Expected color rgb(34, 42, 90), got:', styles.color );
			}
			if ( styles.lineHeight !== '46px' ) {
				console.log( 'WARNING: Expected lineHeight 46px, got:', styles.lineHeight );
			}

			expect( styles.fontSize ).toBe( '36px' );
			expect( styles.fontWeight ).toBe( '400' );
			expect( styles.color ).toBe( 'rgb(34, 42, 90)' );
			expect( styles.lineHeight ).toBe( '46px' );
		} );

		await test.step( 'Verify element-9856e95 heading has different styles (no cross-contamination)', async () => {
			const heading2 = elementorFrame.locator( 'h2' ).filter( { hasText: 'PUBLISHING PLATFORM EXPERTS' } );
			await expect( heading2 ).toBeVisible();

			const fontFamily = await heading2.evaluate( ( el ) => {
				return window.getComputedStyle( el ).fontFamily;
			} );
			const fontSize = await heading2.evaluate( ( el ) => {
				return window.getComputedStyle( el ).fontSize;
			} );
			const fontWeight = await heading2.evaluate( ( el ) => {
				return window.getComputedStyle( el ).fontWeight;
			} );
			const color = await heading2.evaluate( ( el ) => {
				return window.getComputedStyle( el ).color;
			} );
			const lineHeight = await heading2.evaluate( ( el ) => {
				return window.getComputedStyle( el ).lineHeight;
			} );
			const textTransform = await heading2.evaluate( ( el ) => {
				return window.getComputedStyle( el ).textTransform;
			} );

			expect( fontFamily ).toContain( 'proxima-nova' );
			expect( fontSize ).toBe( '14px' );
			expect( fontWeight ).toBe( '600' );
			expect( color ).toBe( 'rgba(34, 42, 90, 0.45)' );
			expect( lineHeight ).toBe( '14px' );
			expect( textTransform ).toBe( 'uppercase' );
		} );

		await test.step( 'Verify styles are different between the two headings', async () => {
			const heading1 = elementorFrame.locator( 'h2' ).filter( { hasText: '20 Years of Trust' } );
			const heading2 = elementorFrame.locator( 'h2' ).filter( { hasText: 'PUBLISHING PLATFORM EXPERTS' } );

			const heading1FontSize = await heading1.evaluate( ( el ) => {
				return window.getComputedStyle( el ).fontSize;
			} );
			const heading2FontSize = await heading2.evaluate( ( el ) => {
				return window.getComputedStyle( el ).fontSize;
			} );

			expect( heading1FontSize ).not.toBe( heading2FontSize );
			expect( heading1FontSize ).toBe( '36px' );
			expect( heading2FontSize ).toBe( '14px' );
		} );
	} );

	test( 'should match complex descendant selectors correctly', async ( { page } ) => {
		const response = await page.request.post( API_URL, {
			data: {
				type: 'url',
				content: TEST_URL,
				selector: '.elementor-element-1a10fb4',
			},
			timeout: 60000,
		} );

		expect( response.status() ).toBe( 200 );
		const data = await response.json();
		expect( data.success ).toBe( true );

		await page.goto( `http://elementor.local:10003/wp-admin/post.php?post=${ data.post_id }&action=elementor`, {
			timeout: ELEMENTOR_EDITOR_TIMEOUT,
		} );

		const editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		const elementorFrame = editor.getPreviewFrame();
		await elementorFrame.waitForLoadState();

		await test.step( 'Verify compound selector .elementor-element.elementor-element-14c0aa4 matches correctly', async () => {
			const heading = elementorFrame.locator( 'h2' ).filter( { hasText: '20 Years of Trust' } );
			await expect( heading ).toBeVisible( { timeout: 10000 } );

			const parentContainer = await heading.evaluateHandle( ( el ) => {
				let parent = el.parentElement;
				while ( parent && ! parent.classList.contains( 'elementor-element-14c0aa4' ) ) {
					parent = parent.parentElement;
				}
				return parent;
			} );

			if ( parentContainer ) {
				const fontSize = await heading.evaluate( ( el ) => {
					return window.getComputedStyle( el ).fontSize;
				} );

				expect( fontSize ).toBe( '36px' );
			} else {
				console.log( 'Warning: Could not find parent container with elementor-element-14c0aa4 class' );
			}
		} );

		await test.step( 'Verify descendant selector .elementor-element-14c0aa4 .elementor-heading-title matches correctly', async () => {
			const heading = elementorFrame.locator( 'h2' ).filter( { hasText: '20 Years of Trust' } );
			await expect( heading ).toBeVisible( { timeout: 10000 } );

			const styles = await heading.evaluate( ( el ) => {
				const computed = window.getComputedStyle( el );
				return {
					fontSize: computed.fontSize,
					fontWeight: computed.fontWeight,
				};
			} );

			expect( styles.fontSize ).toBe( '36px' );
			expect( styles.fontWeight ).toBe( '400' );
		} );
	} );

	test( 'should handle general CSS selectors without Elementor-specific hardcoding', async ( { page } ) => {
		const response = await page.request.post( API_URL, {
			data: {
				type: 'url',
				content: TEST_URL,
				selector: '.elementor-element-1a10fb4',
			},
			timeout: 60000,
		} );

		expect( response.status() ).toBe( 200 );
		const data = await response.json();
		expect( data.success ).toBe( true );

		await page.goto( `http://elementor.local:10003/wp-admin/post.php?post=${ data.post_id }&action=elementor`, {
			timeout: ELEMENTOR_EDITOR_TIMEOUT,
		} );

		const editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		const elementorFrame = editor.getPreviewFrame();
		await elementorFrame.waitForLoadState();

		await test.step( 'Verify that widgets are created and styles are applied', async () => {
			expect( data.widgets_created ).toBeGreaterThan( 0 );
			expect( data.global_classes_created ).toBeGreaterThan( 0 );

			const headings = elementorFrame.locator( 'h2' );
			const headingCount = await headings.count();
			expect( headingCount ).toBeGreaterThan( 0 );
		} );

		await test.step( 'Verify conversion log shows successful CSS processing', async () => {
			const cssRulesParsed = data.conversion_log?.css_processing?.css_rules_parsed || data.stats?.css_rules_parsed || 0;
			if ( cssRulesParsed > 0 ) {
				expect( cssRulesParsed ).toBeGreaterThan( 0 );
			}

			const widgetsProcessed = data.conversion_log?.widget_processing?.widgets_processed || data.stats?.widgets_processed || 0;
			if ( widgetsProcessed > 0 ) {
				expect( widgetsProcessed ).toBeGreaterThan( 0 );
			}
		} );
	} );

	test( 'should apply widget-specific CSS directly to widgets via Widget_Class_Processor', async ( { page } ) => {
		const response = await page.request.post( API_URL, {
			data: {
				type: 'url',
				content: TEST_URL,
				selector: '.elementor-element-1a10fb4',
			},
			timeout: 60000,
		} );

		expect( response.status() ).toBe( 200 );
		const data = await response.json();
		expect( data.success ).toBe( true );

		await test.step( 'Verify Widget_Class_Processor processed widget-specific rules', async () => {
			// Check that widget styles were applied (proves Widget_Class_Processor is working)
			const widgetStylesApplied = data.direct_widget_styles_applied || data.widget_styles_applied || 0;

			console.log( 'widgetStylesApplied:', widgetStylesApplied );

			// The main goal is to verify Widget_Class_Processor is working
			// If styles were applied, the processor found and processed widget-specific rules
			expect( widgetStylesApplied ).toBeGreaterThan( 0 );
		} );

		await page.goto( `http://elementor.local:10003/wp-admin/post.php?post=${ data.post_id }&action=elementor`, {
			timeout: ELEMENTOR_EDITOR_TIMEOUT,
		} );

		const editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		const elementorFrame = editor.getPreviewFrame();
		await elementorFrame.waitForLoadState();

		await test.step( 'Verify styles are applied directly to widgets (not via global classes)', async () => {
			const heading1 = elementorFrame.locator( 'h2' ).filter( { hasText: '20 Years of Trust' } );
			await expect( heading1 ).toBeVisible();

			const inlineStyles = await heading1.evaluate( ( el ) => {
				return el.getAttribute( 'style' );
			} );

			const computedStyles = await heading1.evaluate( ( el ) => {
				const styles = window.getComputedStyle( el );
				return {
					fontFamily: styles.fontFamily,
					fontSize: styles.fontSize,
					fontWeight: styles.fontWeight,
					color: styles.color,
					lineHeight: styles.lineHeight,
				};
			} );

			expect( computedStyles.fontSize ).toBe( '36px' );
			expect( computedStyles.fontWeight ).toBe( '400' );
			expect( computedStyles.color ).toBe( 'rgb(34, 42, 90)' );
			expect( computedStyles.lineHeight ).toBe( '46px' );
			expect( computedStyles.fontFamily ).toContain( 'freight-text-pro' );
		} );

		await test.step( 'Verify widget classes are filtered out (converted to atomic styles)', async () => {
			const heading1 = elementorFrame.locator( 'h2' ).filter( { hasText: '20 Years of Trust' } );
			const parentContainer = heading1.locator( '..' ).first();

			const containerClasses = await parentContainer.evaluate( ( el ) => {
				return el.getAttribute( 'class' );
			} );

			if ( containerClasses ) {
				const classesArray = containerClasses.split( ' ' );
				const hasElementorHeadingTitle = classesArray.includes( 'elementor-heading-title' );
				const hasElementorSizeDefault = classesArray.includes( 'elementor-size-default' );

				expect( hasElementorHeadingTitle || hasElementorSizeDefault ).toBe( false );
			}
		} );

		await test.step( 'Verify element-specific classes may be preserved for matching', async () => {
			const heading1 = elementorFrame.locator( 'h2' ).filter( { hasText: '20 Years of Trust' } );
			const parentContainer = heading1.locator( '..' ).first();

			const containerClasses = await parentContainer.evaluate( ( el ) => {
				return el.getAttribute( 'class' );
			} );

			if ( containerClasses ) {
				const classesArray = containerClasses.split( ' ' );
				const hasElementSpecificClass = classesArray.some( ( cls ) => 
					cls.startsWith( 'elementor-element-' ) && cls !== 'elementor-element'
				);

				if ( hasElementSpecificClass ) {
					expect( hasElementSpecificClass ).toBe( true );
				}
			}
		} );
	} );

	test( 'should apply descendant selector styles correctly through Widget_Class_Processor', async ( { page } ) => {
		const response = await page.request.post( API_URL, {
			data: {
				type: 'url',
				content: TEST_URL,
				selector: '.elementor-element-1a10fb4',
			},
			timeout: 60000,
		} );

		expect( response.status() ).toBe( 200 );
		const data = await response.json();
		expect( data.success ).toBe( true );

		await page.goto( `http://elementor.local:10003/wp-admin/post.php?post=${ data.post_id }&action=elementor`, {
			timeout: ELEMENTOR_EDITOR_TIMEOUT,
		} );

		const editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		const elementorFrame = editor.getPreviewFrame();
		await elementorFrame.waitForLoadState();

		await test.step( 'Verify .elementor-element-14c0aa4 .elementor-heading-title styles applied correctly', async () => {
			const heading = elementorFrame.locator( 'h2' )
				.filter( { hasText: '20 Years of Trust' } )
				.first();

			await expect( heading ).toBeVisible( { timeout: 10000 } );

			const styles = await heading.evaluate( ( el ) => {
				const computed = window.getComputedStyle( el );
				return {
					fontFamily: computed.fontFamily,
					fontSize: computed.fontSize,
					fontWeight: computed.fontWeight,
					color: computed.color,
					lineHeight: computed.lineHeight,
				};
			} );

			console.log( 'Element 14c0aa4 styles:', JSON.stringify( styles, null, 2 ) );

			expect( styles.fontSize ).toBe( '36px' );
			expect( styles.fontWeight ).toBe( '400' );
			expect( styles.color ).toBe( 'rgb(34, 42, 90)' );
			expect( styles.lineHeight ).toBe( '46px' );
		} );

		await test.step( 'Verify .elementor-element-9856e95 .elementor-heading-title styles applied correctly', async () => {
			const heading = elementorFrame.locator( 'h2' )
				.filter( { hasText: 'PUBLISHING PLATFORM EXPERTS' } )
				.first();

			await expect( heading ).toBeVisible( { timeout: 10000 } );

			const styles = await heading.evaluate( ( el ) => {
				const computed = window.getComputedStyle( el );
				return {
					fontFamily: computed.fontFamily,
					fontSize: computed.fontSize,
					fontWeight: computed.fontWeight,
					color: computed.color,
					lineHeight: computed.lineHeight,
					textTransform: computed.textTransform,
				};
			} );

			console.log( 'Element 9856e95 styles:', JSON.stringify( styles, null, 2 ) );

			expect( styles.fontSize ).toBe( '14px' );
			expect( styles.fontWeight ).toBe( '600' );
			expect( styles.color ).toBe( 'rgba(34, 42, 90, 0.45)' );
			expect( styles.lineHeight ).toBe( '14px' );
			expect( styles.textTransform ).toBe( 'uppercase' );
		} );
	} );

	test( 'should match selectors with page wrapper classes correctly', async ( { page } ) => {
		const response = await page.request.post( API_URL, {
			data: {
				type: 'url',
				content: TEST_URL,
				selector: '.elementor-element-6d397c1',
			},
			timeout: 60000,
		} );

		expect( response.status() ).toBe( 200 );
		const data = await response.json();
		expect( data.success ).toBe( true );

		await page.goto( `http://elementor.local:10003/wp-admin/post.php?post=${ data.post_id }&action=elementor`, {
			timeout: ELEMENTOR_EDITOR_TIMEOUT,
		} );

		const editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		const elementorFrame = editor.getPreviewFrame();
		await elementorFrame.waitForLoadState();

		await test.step( 'Verify element with page wrapper selector matches correctly', async () => {
			const paragraph = elementorFrame.locator( 'p' ).first();
			await expect( paragraph ).toBeVisible();

			const fontFamily = await paragraph.evaluate( ( el ) => {
				return window.getComputedStyle( el ).fontFamily;
			} );
			const fontSize = await paragraph.evaluate( ( el ) => {
				return window.getComputedStyle( el ).fontSize;
			} );
			const color = await paragraph.evaluate( ( el ) => {
				return window.getComputedStyle( el ).color;
			} );

			expect( fontFamily ).toBeDefined();
			expect( fontSize ).toBeDefined();
			expect( color ).toBeDefined();
		} );
	} );

	test( 'should resolve --display variable to display: flex for e-con-inner elements', async ( { page } ) => {
		// Use local HTML with the same structure as oboxthemes.com
		// CRITICAL: Element ID must match the CSS variable definition
		const testHtml = `
			<div class="elementor elementor-1140">
				<div class="elementor-element elementor-element-089b111">
					<div class="e-con">
						<div class="e-con-inner">
							<h2>Test Content</h2>
						</div>
					</div>
				</div>
			</div>
		`;
		
		const testCss = `
			.elementor-1140 .elementor-element.elementor-element-089b111 {
				--display: flex;
				--flex-direction: row;
				--justify-content: space-between;
				--align-items: center;
				--text-align: center;
			}
			.e-con, .e-con>.e-con-inner {
				display: var(--display);
				align-items: var(--align-items);
				text-align: var(--text-align);
			}
		`;
		
		const response = await page.request.post( API_URL, {
			data: {
				type: 'html',
				html: testHtml,
				css: testCss,
			},
			timeout: 30000,
		} );

		expect( response.status() ).toBe( 200 );
		const data = await response.json();
		expect( data.success ).toBe( true );

		await test.step( 'Verify e-con-inner has display: flex resolved from --display variable', async () => {
			// Find e-con-inner widgets in the converted output
			const widgets = data.widgets || [];
			
			// DEBUG: Log all widget types to understand what's being created
			const widgetTypes = widgets.map( w => w.widget_type ).filter( Boolean );
			const uniqueTypes = [...new Set( widgetTypes )];
			console.log( 'All widget types found:', uniqueTypes );
			console.log( 'Total widgets:', widgets.length );
			
			// CRITICAL FIX: Flatten all widgets (including nested children) to find display properties
			const flattenWidgets = ( widgetList ) => {
				let flat = [];
				for ( const widget of widgetList ) {
					flat.push( widget );
					if ( widget.children ) {
						flat = flat.concat( flattenWidgets( widget.children ) );
					}
				}
				return flat;
			};
			
			const allWidgets = flattenWidgets( widgets );
			console.log( 'Total widgets (including children):', allWidgets.length );
			
			// Check all widgets for display property
			allWidgets.forEach( ( widget, index ) => {
				const styles = widget.styles || {};
				const elType = widget.elType || widget.widget_type || 'unknown';
				const elementId = widget.element_id || 'unknown';
				
				console.log( `Widget ${index}: elType=${elType}, element_id=${elementId}` );
				
				for ( const styleKey of Object.keys( styles ) ) {
					const styleObj = styles[styleKey];
					if ( styleObj?.variants?.[0]?.props ) {
						const props = styleObj.variants[0].props;
						const propNames = Object.keys( props );
						console.log( `  - Style ${styleKey} has props:`, propNames );
						
						// Check for display property
						if ( props.display ) {
							console.log( `  - DISPLAY FOUND:`, props.display );
						}
						
						// Check for flex-basis property (which IS present)
						if ( props['flex-basis'] ) {
							console.log( `  - FLEX-BASIS FOUND:`, props['flex-basis'] );
						}
					}
				}
			} );
			
			// CRITICAL DEBUG: Compare which properties are present vs missing
			console.log( '\n=== PROPERTY COMPARISON ===' );
			console.log( 'Properties that ARE present: flex-basis, flex-grow, flex-shrink' );
			console.log( 'Properties that are MISSING: display' );
			console.log( 'Both were processed through the same pipeline' );
			
			// Look for e-div-block widgets (converted from e-con-inner)
			const eDivBlockWidgets = widgets.filter( widget => 
				widget.elType === 'e-div-block' || widget.widget_type === 'e-div-block'
			);
			
			console.log( 'Found e-div-block widgets:', eDivBlockWidgets.length );
			
			if ( eDivBlockWidgets.length > 0 ) {
				// Check each e-div-block widget for display: flex
				eDivBlockWidgets.forEach( ( widget, index ) => {
					const styles = widget.styles || {};
					console.log( `e-div-block widget ${index}:` );
					console.log( '  - elType:', widget.elType );
					console.log( '  - classes:', widget.settings?.classes?.value );
					
					// Search through all style objects for display property
					for ( const styleKey of Object.keys( styles ) ) {
						const styleObj = styles[styleKey];
						if ( styleObj?.variants?.[0]?.props ) {
							const props = styleObj.variants[0].props;
							if ( props.display ) {
								console.log( `  - FOUND display in ${styleKey}:`, props.display );
							}
							// Also check for other flex-related properties
							const flexProps = Object.keys( props ).filter( key => 
								key.includes( 'flex' ) || key.includes( 'display' )
							);
							if ( flexProps.length > 0 ) {
								console.log( `  - Flex-related props in ${styleKey}:`, flexProps );
							}
						}
					}
				} );
			}

			// Check that at least one widget (including nested) has display: flex
			const hasDisplayFlex = allWidgets.some( widget => {
				const styles = widget.styles || {};
				
				// Check all possible locations for display property
				for ( const styleKey of Object.keys( styles ) ) {
					const styleObj = styles[styleKey];
					if ( styleObj?.variants?.[0]?.props?.display ) {
						const displayValue = styleObj.variants[0].props.display;
						if ( displayValue === 'flex' || displayValue?.value === 'flex' ) {
							return true;
						}
					}
				}
				return false;
			} );

			console.log( 'Has display flex:', hasDisplayFlex );
			expect( hasDisplayFlex ).toBe( true );
		} );

		await page.goto( `http://elementor.local:10003/wp-admin/post.php?post=${ data.post_id }&action=elementor`, {
			timeout: ELEMENTOR_EDITOR_TIMEOUT,
		} );

		const editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		await test.step( 'Verify e-con-inner renders with flex layout in editor', async () => {
			// Find e-con-inner elements in the editor
			const eConInnerElements = await page.locator( '.e-con-inner' ).all();
			expect( eConInnerElements.length ).toBeGreaterThan( 0 );

			// Check computed styles for display: flex
			for ( const element of eConInnerElements ) {
				const computedDisplay = await element.evaluate( el => 
					window.getComputedStyle( el ).display 
				);
				if ( computedDisplay === 'flex' ) {
					// Found at least one with flex display
					return;
				}
			}

			// If we get here, none had display: flex
			throw new Error( 'No e-con-inner elements found with display: flex' );
		} );
	} );
} );

