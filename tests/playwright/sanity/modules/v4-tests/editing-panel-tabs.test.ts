import WpAdminPage from '../../../pages/wp-admin-page';
import { parallelTest as test } from '../../../parallelTest';
import { BrowserContext, expect } from '@playwright/test';
import EditorPage from '../../../pages/editor-page';
import { timeouts } from '../../../config/timeouts';
import { FONT_FAMILIES } from './typography/typography-constants';

test.describe( 'Editing panel tabs @v4-tests', () => {
	let editor: EditorPage;
	let wpAdmin: WpAdminPage;
	let context: BrowserContext;

	type SectionType = 'layout' | 'spacing' | 'size' | 'position' | 'typography' | 'background' | 'border';

	const atomicWidget = { name: 'e-heading', title: 'Heading' };
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
		await editor.v4Panel.openTab( 'style' );
		await editor.openV2Section( 'size' );
		await editor.openV2Section( 'typography' );

		await editor.page.waitForSelector( 'label:has-text("Font family")', { timeout: timeouts.action } );
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

	test( `expand sections and compare screenshot`, async () => {
		for ( const section of sections ) {
			await editor.addWidget( { widgetType: atomicWidget.name } );
			await editor.v4Panel.openTab( 'style' );
			await editor.openV2Section( section );

			await expect.soft( editor.page.locator( panelSelector ) ).toHaveScreenshot( `expanded-${ section }-section.png` );
		}
	} );

	test( 'should show/hide tabs header when scrolling up/down in the panel', async () => {
		const panelHeader = editor.page.locator( 'button', { hasText: /^Style$/g } ).locator( '../../../..' );

		await openScrollableStylePanel();

		// Scroll down
		await editor.page.mouse.wheel( 0, 100 );
		await editor.page.waitForTimeout( 1000 );

		await expect.soft( panelHeader ).toHaveScreenshot( 'editing-panel-scrolling-down.png' );

		// Scroll up
		await editor.page.mouse.wheel( 0, -100 );
		await editor.page.waitForTimeout( 1000 );

		await expect.soft( panelHeader ).toHaveScreenshot( 'editing-panel-scrolling-up.png' );
	} );

	test( 'should maintain header tabs visibility during inner component scrolling', async () => {
		await openScrollableStylePanel();

		await test.step( 'Close the size section', async () => {
			const sectionButton = editor.page.locator( '.MuiButtonBase-root', { hasText: 'Size' } );
			await sectionButton.click();
		} );

		const panelHeader = editor.page.locator( 'button', { hasText: /^Style$/g } ).locator( '../../../..' );

		await test.step( 'Open the font family control', async () => {
			const fontFamilyControl = editor.page
				.locator( '#font-family-control' ).getByRole( 'button' );
			await fontFamilyControl.click();
		} );

		await test.step( 'Scroll the font family popover list slightly', async () => {
			const scrollContainer = editor.page.locator( '[data-testid="item-list"]' ).locator( 'xpath=parent::*' );
			const arialFontFamilyLocator = editor.page.locator( '.MuiListItem-root', { hasText: FONT_FAMILIES.system } );
			await expect( arialFontFamilyLocator ).toBeVisible();
			await scrollContainer.evaluate(
				( el: HTMLElement ) => el.scrollBy( 0, 100 ),
			);
			await expect( arialFontFamilyLocator ).toBeHidden();
		} );

		await expect.soft( panelHeader ).toHaveScreenshot( 'editing-panel-inner-scrolling.png' );
	} );

	test( 'should display the last open sections when returning to style tab', async () => {
		await editor.addWidget( { widgetType: atomicWidget.name } );
		await editor.v4Panel.openTab( 'style' );

		const sectionsToOpen: SectionType[] = [ 'typography', 'spacing' ];
		await openSections( sectionsToOpen );
		await verifySectionsOpen( sectionsToOpen );

		await editor.v4Panel.openTab( 'general' );
		await editor.v4Panel.openTab( 'style' );

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
