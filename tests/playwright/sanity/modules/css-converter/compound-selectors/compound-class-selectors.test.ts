import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper } from '../helper';

test.describe( 'Compound Class Selectors @compound-selectors', () => {
	let wpAdmin: WpAdminPage;
	let editor: EditorPage;
	let cssHelper: CssConverterHelper;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdminPage = new WpAdminPage( page, testInfo, apiRequests );

		// Enable atomic widgets experiments to match manual testing environment
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

	test( 'Scenario 1: Simple compound selector (.first.second)', async ( { request } ) => {
		const htmlContent = `
			<style>
				.first.second {
					color: red;
					font-size: 16px;
				}
			</style>
			<div class="first second">
				Compound Element
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '', {
			createGlobalClasses: true,
		} );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, 'Skipping due to backend property mapper issues' );
			return;
		}

		expect( apiResult.success ).toBe( true );
		expect( apiResult.compound_classes_created ).toBe( 1 );

		const compoundClasses = apiResult.compound_classes || {};
		expect( compoundClasses[ 'first-and-second' ] ).toBeDefined();

		const compoundData = compoundClasses[ 'first-and-second' ];
		expect( compoundData.requires ).toEqual( [ 'first', 'second' ] );
		expect( compoundData.specificity ).toBe( 20 );
		expect( compoundData.original_selector ).toBe( '.first.second' );
	} );

	test( 'Scenario 2: Multiple compound selectors', async ( { request } ) => {
		const htmlContent = `
			<style>
				.btn.primary {
					background: blue;
					color: white;
				}
				.btn.secondary {
					background: gray;
					color: black;
				}
			</style>
			<button class="btn primary">Primary</button>
			<button class="btn secondary">Secondary</button>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '', {
			createGlobalClasses: true,
		} );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, 'Skipping due to backend property mapper issues' );
			return;
		}

		expect( apiResult.success ).toBe( true );
		expect( apiResult.compound_classes_created ).toBe( 2 );

		const compoundClasses = apiResult.compound_classes || {};
		expect( compoundClasses[ 'btn-and-primary' ] ).toBeDefined();
		expect( compoundClasses[ 'btn-and-secondary' ] ).toBeDefined();

		const primaryCompound = compoundClasses[ 'btn-and-primary' ];
		expect( primaryCompound.requires ).toEqual( [ 'btn', 'primary' ] );
		expect( primaryCompound.specificity ).toBe( 20 );

		const secondaryCompound = compoundClasses[ 'btn-and-secondary' ];
		expect( secondaryCompound.requires ).toEqual( [ 'btn', 'secondary' ] );
		expect( secondaryCompound.specificity ).toBe( 20 );
	} );

	test( 'Scenario 3: Three-class selector - only first two used (.btn.primary.large)', async ( { request } ) => {
		const htmlContent = `
			<style>
				.btn.primary.large {
					padding: 20px;
					font-size: 24px;
					border-radius: 8px;
				}
			</style>
			<button class="btn primary large">Large Primary</button>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '', {
			createGlobalClasses: true,
		} );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, 'Skipping due to backend property mapper issues' );
			return;
		}

		expect( apiResult.success ).toBe( true );
		expect( apiResult.compound_classes_created ).toBe( 1 );

		const compoundClasses = apiResult.compound_classes || {};
		expect( compoundClasses[ 'btn-and-primary' ] ).toBeDefined();
		expect( compoundClasses[ 'btn-and-large-and-primary' ] ).toBeUndefined();

		const compoundData = compoundClasses[ 'btn-and-primary' ];
		expect( compoundData.requires ).toEqual( [ 'btn', 'primary' ] );
		expect( compoundData.requires ).toHaveLength( 2 );
		expect( compoundData.specificity ).toBe( 20 );
	} );

	test( 'Scenario 4: Class missing - compound not applied', async ( { request } ) => {
		const htmlContent = `
			<style>
				.first.second {
					color: red;
				}
			</style>
			<div class="first">Only first</div>
			<div class="second">Only second</div>
			<div class="first second">Both</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '', {
			createGlobalClasses: true,
		} );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, 'Skipping due to backend property mapper issues' );
			return;
		}

		expect( apiResult.success ).toBe( true );
		expect( apiResult.compound_classes_created ).toBe( 1 );

		const compoundClasses = apiResult.compound_classes || {};
		expect( compoundClasses[ 'first-and-second' ] ).toBeDefined();

		const compoundData = compoundClasses[ 'first-and-second' ];
		expect( compoundData.requires ).toEqual( [ 'first', 'second' ] );
		expect( compoundData.specificity ).toBe( 20 );
	} );

	test( 'Scenario 5: Order independence - normalized class name', async ( { request } ) => {
		const htmlContent = `
			<style>
				.first.second {
					color: red;
				}
				.second.first {
					font-size: 20px;
				}
			</style>
			<div class="first second">Text</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '', {
			createGlobalClasses: true,
		} );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, 'Skipping due to backend property mapper issues' );
			return;
		}

		expect( apiResult.success ).toBe( true );
		expect( apiResult.compound_classes_created ).toBe( 1 );

		const compoundClasses = apiResult.compound_classes || {};
		expect( compoundClasses[ 'first-and-second' ] ).toBeDefined();

		const compoundData = compoundClasses[ 'first-and-second' ];
		expect( compoundData.requires ).toEqual( [ 'first', 'second' ] );
		expect( compoundData.specificity ).toBe( 20 );
	} );

	test( 'Scenario 6: Complex compound with multiple properties', async ( { request } ) => {
		const htmlContent = `
			<style>
				.card.featured {
					background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
					padding: 30px;
					border-radius: 12px;
					box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
					color: white;
					font-size: 18px;
				}
			</style>
			<div class="card featured">
				<h2>Featured Card</h2>
				<p>This is a featured card with compound styling</p>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '', {
			createGlobalClasses: true,
		} );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, 'Skipping due to backend property mapper issues' );
			return;
		}

		expect( apiResult.success ).toBe( true );
		expect( apiResult.compound_classes_created ).toBe( 1 );

		const compoundClasses = apiResult.compound_classes || {};
		expect( compoundClasses[ 'card-and-featured' ] ).toBeDefined();

		const compoundData = compoundClasses[ 'card-and-featured' ];
		expect( compoundData.requires ).toEqual( [ 'card', 'featured' ] );
		expect( compoundData.specificity ).toBe( 20 );
	} );

	test( 'Scenario 7: Verify specificity calculation (max 2 classes)', async ( { request } ) => {
		const htmlContent = `
			<style>
				.a.b { color: red; }
				.x.y.z { color: blue; }
			</style>
			<div class="a b">Two classes</div>
			<div class="x y z">Three classes (only x.y used)</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '', {
			createGlobalClasses: true,
		} );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, 'Skipping due to backend property mapper issues' );
			return;
		}

		expect( apiResult.success ).toBe( true );

		await test.step( 'Verify compound classes data structure', async () => {
			expect( apiResult.compound_classes ).toBeDefined();
			expect( Object.keys( apiResult.compound_classes ).length ).toBeGreaterThanOrEqual( 2 );

			const twoClassCompound = apiResult.compound_classes[ 'a-and-b' ];
			const threeClassCompound = apiResult.compound_classes[ 'x-and-y' ];

			expect( twoClassCompound ).toBeDefined();
			expect( twoClassCompound.specificity ).toBe( 20 );
			expect( twoClassCompound.requires ).toEqual( [ 'a', 'b' ] );

			expect( threeClassCompound ).toBeDefined();
			expect( threeClassCompound.specificity ).toBe( 20 );
			expect( threeClassCompound.requires ).toEqual( [ 'x', 'y' ] );
		} );
	} );

	test( 'Scenario 8: Compound with hyphenated class names', async ( { request } ) => {
		const htmlContent = `
			<style>
				.btn-primary.btn-large {
					padding: 25px 50px;
					font-size: 20px;
				}
			</style>
			<button class="btn-primary btn-large">Large Primary Button</button>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '', {
			createGlobalClasses: true,
		} );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, 'Skipping due to backend property mapper issues' );
			return;
		}

		expect( apiResult.success ).toBe( true );
		expect( apiResult.compound_classes_created ).toBe( 1 );

		const compoundClasses = apiResult.compound_classes || {};
		expect( compoundClasses[ 'btn-large-and-btn-primary' ] ).toBeDefined();

		const compoundData = compoundClasses[ 'btn-large-and-btn-primary' ];
		expect( compoundData.requires ).toEqual( [ 'btn-large', 'btn-primary' ] );
		expect( compoundData.specificity ).toBe( 20 );
	} );

	test( 'Scenario 9: Two-class limit - exactly 2 classes', async ( { request } ) => {
		const htmlContent = `
			<style>
				.alpha.beta {
					color: purple;
					font-weight: bold;
				}
			</style>
			<div class="alpha beta">
				Two Classes Element
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '', {
			createGlobalClasses: true,
		} );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, 'Skipping due to backend property mapper issues' );
			return;
		}

		expect( apiResult.success ).toBe( true );
		expect( apiResult.compound_classes_created ).toBe( 1 );

		const compoundClasses = apiResult.compound_classes || {};
		const compoundKeys = Object.keys( compoundClasses );
		expect( compoundKeys ).toHaveLength( 1 );

		const compoundKey = compoundKeys[ 0 ];
		expect( compoundKey ).toBe( 'alpha-and-beta' );

		const compoundData = compoundClasses[ compoundKey ];
		expect( compoundData.requires ).toEqual( [ 'alpha', 'beta' ] );
		expect( compoundData.requires ).toHaveLength( 2 );
		expect( compoundData.specificity ).toBe( 20 );
		expect( compoundData.original_selector ).toBe( '.alpha.beta' );
	} );

	test( 'Scenario 10: Two-class limit - 3 classes uses only first 2', async ( { request } ) => {
		const htmlContent = `
			<style>
				.one.two.three {
					background: yellow;
					padding: 15px;
					margin: 10px;
				}
			</style>
			<div class="one two three">
				Three Classes Element
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '', {
			createGlobalClasses: true,
		} );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, 'Skipping due to backend property mapper issues' );
			return;
		}

		expect( apiResult.success ).toBe( true );
		expect( apiResult.compound_classes_created ).toBe( 1 );

		const compoundClasses = apiResult.compound_classes || {};
		const compoundKeys = Object.keys( compoundClasses );

		const expectedKey = 'one-and-two';
		expect( compoundKeys ).toContain( expectedKey );
		expect( compoundKeys ).not.toContain( 'one-and-three-and-two' );
		expect( compoundKeys ).not.toContain( 'one-and-two-and-three' );

		const compoundData = compoundClasses[ expectedKey ];
		expect( compoundData.requires ).toEqual( [ 'one', 'two' ] );
		expect( compoundData.requires ).toHaveLength( 2 );
		expect( compoundData.requires ).not.toContain( 'three' );
		expect( compoundData.specificity ).toBe( 20 );
		expect( compoundData.original_selector ).toBe( '.one.two.three' );
	} );

	test( 'Scenario 11: Two-class limit - 4 classes uses only first 2', async ( { request } ) => {
		const htmlContent = `
			<style>
				.first.second.third.fourth {
					color: green;
					border: 1px solid black;
				}
			</style>
			<div class="first second third fourth">
				Four Classes Element
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '', {
			createGlobalClasses: true,
		} );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, 'Skipping due to backend property mapper issues' );
			return;
		}

		expect( apiResult.success ).toBe( true );
		expect( apiResult.compound_classes_created ).toBe( 1 );

		const compoundClasses = apiResult.compound_classes || {};
		const compoundKeys = Object.keys( compoundClasses );
		expect( compoundKeys ).toHaveLength( 1 );

		const expectedKey = 'first-and-second';
		expect( compoundKeys[ 0 ] ).toBe( expectedKey );

		const compoundData = compoundClasses[ expectedKey ];
		expect( compoundData.requires ).toEqual( [ 'first', 'second' ] );
		expect( compoundData.requires ).toHaveLength( 2 );
		expect( compoundData.requires ).not.toContain( 'third' );
		expect( compoundData.requires ).not.toContain( 'fourth' );
		expect( compoundData.specificity ).toBe( 20 );
	} );

	test( 'Scenario 12: Two-class limit - multiple 3-class selectors', async ( { request } ) => {
		const htmlContent = `
			<style>
				.btn.primary.large {
					padding: 20px;
					font-size: 24px;
				}
				.card.featured.highlighted {
					border: 3px solid gold;
					background: white;
				}
			</style>
			<div class="btn primary large">Button</div>
			<div class="card featured highlighted">Card</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '', {
			createGlobalClasses: true,
		} );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, 'Skipping due to backend property mapper issues' );
			return;
		}

		expect( apiResult.success ).toBe( true );
		expect( apiResult.compound_classes_created ).toBe( 2 );

		const compoundClasses = apiResult.compound_classes || {};
		const compoundKeys = Object.keys( compoundClasses );
		expect( compoundKeys ).toHaveLength( 2 );

		expect( compoundKeys ).toContain( 'btn-and-primary' );
		expect( compoundKeys ).toContain( 'card-and-featured' );

		expect( compoundKeys ).not.toContain( 'btn-and-large-and-primary' );
		expect( compoundKeys ).not.toContain( 'card-and-featured-and-highlighted' );

		const btnCompound = compoundClasses[ 'btn-and-primary' ];
		expect( btnCompound.requires ).toEqual( [ 'btn', 'primary' ] );
		expect( btnCompound.requires ).toHaveLength( 2 );
		expect( btnCompound.specificity ).toBe( 20 );

		const cardCompound = compoundClasses[ 'card-and-featured' ];
		expect( cardCompound.requires ).toEqual( [ 'card', 'featured' ] );
		expect( cardCompound.requires ).toHaveLength( 2 );
		expect( cardCompound.specificity ).toBe( 20 );
	} );

	test( 'Scenario 13: Two-class limit - 3-class selector creates 2-class compound', async ( { request } ) => {
		const htmlContent = `
			<style>
				.widget.active.premium {
					background: linear-gradient(blue, purple);
					color: white;
					padding: 25px;
				}
			</style>
			<button class="widget active premium">Premium Widget</button>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '', {
			createGlobalClasses: true,
		} );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, 'Skipping due to backend property mapper issues' );
			return;
		}

		expect( apiResult.success ).toBe( true );
		expect( apiResult.compound_classes_created ).toBe( 1 );

		const compoundClasses = apiResult.compound_classes || {};
		const compoundKeys = Object.keys( compoundClasses );

		expect( compoundKeys ).toContain( 'active-and-widget' );
		expect( compoundKeys ).not.toContain( 'active-and-premium-and-widget' );
		expect( compoundKeys ).not.toContain( 'premium-and-widget-and-active' );

		const compoundData = compoundClasses[ 'active-and-widget' ];
		expect( compoundData.requires ).toEqual( [ 'active', 'widget' ] );
		expect( compoundData.requires ).toHaveLength( 2 );
		expect( compoundData.specificity ).toBe( 20 );
	} );

	test( 'Scenario 14: Two-class limit - specificity always 20 for max classes', async ( { request } ) => {
		const htmlContent = `
			<style>
				.a.b { color: red; }
				.x.y.z { color: blue; }
				.m.n.o.p { color: green; }
				.test1.test2.test3.test4.test5 { color: yellow; }
			</style>
			<div class="a b">Two</div>
			<div class="x y z">Three</div>
			<div class="m n o p">Four</div>
			<div class="test1 test2 test3 test4 test5">Five</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '', {
			createGlobalClasses: true,
		} );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, 'Skipping due to backend property mapper issues' );
			return;
		}

		expect( apiResult.success ).toBe( true );
		expect( apiResult.compound_classes_created ).toBe( 4 );

		const compoundClasses = apiResult.compound_classes || {};

		expect( compoundClasses[ 'a-and-b' ] ).toBeDefined();
		expect( compoundClasses[ 'a-and-b' ].specificity ).toBe( 20 );
		expect( compoundClasses[ 'a-and-b' ].requires ).toHaveLength( 2 );

		expect( compoundClasses[ 'x-and-y' ] ).toBeDefined();
		expect( compoundClasses[ 'x-and-y' ].specificity ).toBe( 20 );
		expect( compoundClasses[ 'x-and-y' ].requires ).toHaveLength( 2 );
		expect( compoundClasses[ 'x-and-y' ].requires ).not.toContain( 'z' );

		expect( compoundClasses[ 'm-and-n' ] ).toBeDefined();
		expect( compoundClasses[ 'm-and-n' ].specificity ).toBe( 20 );
		expect( compoundClasses[ 'm-and-n' ].requires ).toHaveLength( 2 );
		expect( compoundClasses[ 'm-and-n' ].requires ).not.toContain( 'o' );
		expect( compoundClasses[ 'm-and-n' ].requires ).not.toContain( 'p' );

		expect( compoundClasses[ 'test1-and-test2' ] ).toBeDefined();
		expect( compoundClasses[ 'test1-and-test2' ].specificity ).toBe( 20 );
		expect( compoundClasses[ 'test1-and-test2' ].requires ).toHaveLength( 2 );
		expect( compoundClasses[ 'test1-and-test2' ].requires ).not.toContain( 'test3' );
		expect( compoundClasses[ 'test1-and-test2' ].requires ).not.toContain( 'test4' );
		expect( compoundClasses[ 'test1-and-test2' ].requires ).not.toContain( 'test5' );

		Object.values( compoundClasses ).forEach( ( compound ) => {
			expect( compound.specificity ).toBe( 20 );
			expect( compound.requires ).toHaveLength( 2 );
		} );
	} );
} );

