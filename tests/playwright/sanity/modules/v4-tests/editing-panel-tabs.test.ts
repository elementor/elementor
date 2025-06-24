import WpAdminPage from '../../../pages/wp-admin-page';
import { parallelTest as test } from '../../../parallelTest';
import { BrowserContext, expect } from '@playwright/test';
import EditorPage from '../../../pages/editor-page';

test.describe( 'Editing panel tabs @v4-tests', () => {
	let editor: EditorPage;
	let wpAdmin: WpAdminPage;
	let context: BrowserContext;

	type SectionType = 'layout' | 'spacing' | 'size' | 'position' | 'typography' | 'background' | 'border';

	const atomicWidget = { name: 'e-heading', title: 'Heading' };
	const experimentName = 'e_atomic_elements';
	const panelSelector = '#elementor-panel-inner';

	const sections: SectionType[] = [
		'layout',
		'spacing',
		'size',
		'position',
		'typography',
		'background',
		'border',
	];

	test.beforeEach( async ( { browser, apiRequests }, testInfo ) => {
		context = await browser.newContext();
		const page = await context.newPage();

		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( { [ experimentName ]: 'active' } );

		editor = await wpAdmin.openNewPage();
	} );

	test.afterAll( async () => {
		await wpAdmin.resetExperiments();
		await context.close();
	} );

	async function openScrollableStylePanel() {
		const panel = editor.page.locator( '#elementor-panel-category-v4-elements' );
		await panel.isVisible();

		await editor.addWidget( { widgetType: atomicWidget.name } );
		await editor.openV2PanelTab( 'style' );
		await editor.openV2Section( 'size' );
		await editor.openV2Section( 'typography' );

		await editor.page.waitForSelector( 'label:has-text("Font family")', { timeout: 3000 } );
	}

	async function isSectionOpen( section: SectionType ): Promise<boolean> {
		const sectionButton = editor.page.locator( '.MuiButtonBase-root', { hasText: new RegExp( section, 'i' ) } );
		const contentSelector = await sectionButton.getAttribute( 'aria-controls' );
		return await editor.page.evaluate( ( selector ) => {
			return !! document.getElementById( selector );
		}, contentSelector );
	}

	async function verifySectionsOpen( sectionsToVerify: SectionType[] ): Promise<void> {
		for ( const section of sectionsToVerify ) {
			const isOpen = await isSectionOpen( section );
			expect( isOpen ).toBe( true );
		}
	}

	async function openSections( sectionsToOpen: SectionType[] ): Promise<void> {
		for ( const section of sectionsToOpen ) {
			await editor.openV2Section( section );
		}
	}

	sections.forEach( ( section ) => {
		test( `expand ${ section } section and compare screenshot`, async () => {
			await editor.addWidget( { widgetType: atomicWidget.name } );
			await editor.openV2PanelTab( 'style' );
			await editor.openV2Section( section );

			await expect.soft( editor.page.locator( panelSelector ) ).toHaveScreenshot( `expanded-${ section }-section.png` );
		} );
	} );

	test( 'should hide tabs header when scrolling down in the panel', async () => {
		await openScrollableStylePanel();

		const lastSection = editor.page.locator( '.MuiButtonBase-root', { hasText: /effects/i } );
		await lastSection.scrollIntoViewIfNeeded();

		await expect.soft( editor.page.locator( panelSelector ) ).toHaveScreenshot( 'editing-panel-scrolling-down.png' );
	} );

	test( 'should display tabs header when scrolling back up', async () => {
		await openScrollableStylePanel();

		const firstSection = editor.page.locator( '.MuiButtonBase-root', { hasText: /layout/i } );
		await firstSection.scrollIntoViewIfNeeded();

		await expect.soft( editor.page.locator( panelSelector ) ).toHaveScreenshot( 'editing-panel-scrolling-up.png' );
	} );

	test( 'should maintain header tabs visibility during inner component scrolling', async () => {
		await openScrollableStylePanel();

		// Wait for the font family dropdown to be fully loaded and interactable
		const fontFamilyContainer = editor.page.locator( 'div.MuiGrid-container' ).filter( {
			has: editor.page.locator( 'label', { hasText: 'Font family' } ),
		} );

		await fontFamilyContainer.waitFor( { state: 'visible', timeout: 10000 } );

		const fontFamilyButton = fontFamilyContainer.locator( '[role="button"]' );
		await fontFamilyButton.waitFor( { state: 'visible', timeout: 10000 } );

		// Ensure the button is stable before clicking
		await fontFamilyButton.hover();
		await editor.page.waitForTimeout( 500 );

		await fontFamilyButton.click( { timeout: 10000 } );

		// Wait for the dropdown to open and Google Fonts option to be available
		await editor.page.getByText( 'Google Fonts' ).waitFor( { state: 'visible', timeout: 10000 } );
		await editor.page.getByText( 'Google Fonts' ).scrollIntoViewIfNeeded();

		await expect.soft( editor.page.locator( panelSelector ) ).toHaveScreenshot( 'editing-panel-inner-scrolling.png' );
	} );

	test( 'should display the last open sections when returning to style tab', async () => {
		await editor.addWidget( { widgetType: atomicWidget.name } );
		await editor.openV2PanelTab( 'style' );

		const sectionsToOpen: SectionType[] = [ 'typography', 'spacing' ];
		await openSections( sectionsToOpen );
		await verifySectionsOpen( sectionsToOpen );

		await editor.openV2PanelTab( 'general' );
		await editor.openV2PanelTab( 'style' );

		const sectionsStillOpen: boolean[] = [];
		for ( const section of sectionsToOpen ) {
			const isOpen = await isSectionOpen( section );
			sectionsStillOpen.push( isOpen );
		}

		await openSections( sectionsToOpen );
		await verifySectionsOpen( sectionsToOpen );

		await expect.soft( editor.page.locator( panelSelector ) ).toHaveScreenshot( 'style-tab-last-open-sections.png' );

		expect( sectionsStillOpen ).toEqual( expect.any( Array ) );
	} );
} );
