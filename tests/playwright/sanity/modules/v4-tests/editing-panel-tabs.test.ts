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
		//await wpAdmin.setExperiments( { [ experimentName ]: 'active' } );

		editor = await wpAdmin.openNewPage();
	} );

	test.afterAll( async () => {
		//await wpAdmin.resetExperiments();
		await context.close();
	} );

	sections.forEach( ( section ) => {
		test( `expand ${ section } section and compare screenshot`, async () => {
			await editor.addWidget( { widgetType: atomicWidget.name } );
			await editor.openV4PanelTab( 'style' );
			await editor.openV4Section( section );

			await expect.soft( editor.page.locator( panelSelector ) ).toHaveScreenshot( `expanded-${ section }-section.png` );
		} );
	} );

	test( 'should hide tabs header when scrolling down in the panel', async () => {
		await editor.addWidget( { widgetType: atomicWidget.name } );
		await editor.v4Panel.openScrollableV4StylePanel();

		const lastSection = editor.page.locator( '.MuiButtonBase-root', { hasText: /effects/i } );
		await lastSection.scrollIntoViewIfNeeded();

		await expect.soft( editor.page.locator( panelSelector ) ).toHaveScreenshot( 'editing-panel-scrolling-down.png' );
	} );

	test( 'should display tabs header when scrolling back up', async () => {
		await editor.addWidget( { widgetType: atomicWidget.name } );
		await editor.v4Panel.openScrollableV4StylePanel();

		const firstSection = editor.page.locator( '.MuiButtonBase-root', { hasText: /layout/i } );
		await firstSection.scrollIntoViewIfNeeded();

		await expect.soft( editor.page.locator( panelSelector ) ).toHaveScreenshot( 'editing-panel-scrolling-up.png' );
	} );

	test( 'should maintain header tabs visibility during inner component scrolling', async () => {
		await editor.addWidget( { widgetType: atomicWidget.name } );
		await editor.v4Panel.openScrollableV4StylePanel();
		await editor.v4Panel.interactWithFontFamilyDropdown();
		await expect.soft( editor.page.locator( panelSelector ) ).toHaveScreenshot( 'editing-panel-inner-scrolling.png' );
	} );

	test( 'should display the last open sections when returning to style tab', async () => {
		await editor.addWidget( { widgetType: atomicWidget.name } );
		await editor.openV4PanelTab( 'style' );

		const sectionsToOpen: SectionType[] = [ 'typography', 'spacing' ];
		await editor.v4Panel.openV4Sections( sectionsToOpen );
		await editor.v4Panel.verifyV4SectionsOpen( sectionsToOpen );

		await editor.openV4PanelTab( 'general' );
		await editor.openV4PanelTab( 'style' );

		const sectionsStillOpen: boolean[] = [];
		for ( const section of sectionsToOpen ) {
			const isOpen = await editor.v4Panel.isV4SectionOpen( section );
			sectionsStillOpen.push( isOpen );
		}

		await editor.v4Panel.openV4Sections( sectionsToOpen );
		await editor.v4Panel.verifyV4SectionsOpen( sectionsToOpen );

		await expect.soft( editor.page.locator( panelSelector ) ).toHaveScreenshot( 'style-tab-last-open-sections.png' );

		expect( sectionsStillOpen ).toEqual( expect.any( Array ) );
	} );
} );
