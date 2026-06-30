import { BrowserContext, expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { BorderTypeLabel, OffsetLabel, SizeSectionLabel } from '../../../../pages/atomic-elements-panel/style-tab';
import { timeouts } from '../../../../config/timeouts';
import { viewportSize } from '../../../../enums/viewport-sizes';
import { UNITS } from '../typography/typography-constants';

const BREAKPOINT_FONT_SIZES = {
	desktop: 32,
	tablet: 24,
	mobile: 16,
} as const;

const BREAKPOINT_FONT_WEIGHTS = {
	desktop: 400,
	tablet: 600,
	mobile: 800,
} as const;

const BREAKPOINT_BORDER_PANEL_TYPES = {
	desktop: BorderTypeLabel.SOLID,
	tablet: BorderTypeLabel.DOUBLE,
	mobile: BorderTypeLabel.DOTTED,
} as const;

const BREAKPOINT_BORDER_CSS_STYLES = {
	desktop: 'solid',
	tablet: 'double',
	mobile: 'dotted',
} as const;

const BREAKPOINT_BACKGROUND_COLORS = {
	desktop: '#ff0000',
	tablet: '#00ff00',
	mobile: '#0000ff',
} as const;

const BREAKPOINT_BACKGROUND_COLOR_RGB = {
	desktop: 'rgb(255, 0, 0)',
	tablet: 'rgb(0, 255, 0)',
	mobile: 'rgb(0, 0, 255)',
} as const;

const BREAKPOINT_DIVIDER_WIDTHS_PX = {
	desktop: 480,
	tablet: 360,
	mobile: 240,
} as const;

const BREAKPOINT_YOUTUBE_MARGINS_PX = {
	desktop: 40,
	tablet: 24,
	mobile: 12,
} as const;

const STATE_COLORS = {
	normal: '#ff0000',
	hover: '#00ff00',
} as const;

test.describe( 'Responsive Styles @v4-tests', () => {
	let wpAdmin: WpAdminPage;
	let editor: EditorPage;
	let context: BrowserContext;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		context = await browser.newContext();
		const page = await context.newPage();
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( { e_atomic_elements: 'active' } );
	} );

	test.afterAll( async () => {
		await wpAdmin?.resetExperiments();
		await context?.close();
	} );

	test.beforeEach( async () => {
		editor = await wpAdmin.openNewPage();
		await editor.page.setViewportSize( viewportSize.desktop );
	} );

	test( 'Breakpoint styles render correctly in editor and frontend for e-heading widget', async () => {
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		await editor.addWidget( { widgetType: 'e-heading', container: containerId } );

		await editor.v4Panel.openTab( 'style' );
		await editor.v4Panel.style.openSection( 'Typography' );

		await test.step( 'Set desktop font size', async () => {
			await editor.changeResponsiveView( 'desktop' );
			await editor.v4Panel.style.setFontSize( BREAKPOINT_FONT_SIZES.desktop, 'px' );
		} );

		await test.step( 'Set tablet font size', async () => {
			await editor.changeResponsiveView( 'tablet' );
			await editor.v4Panel.style.setFontSize( BREAKPOINT_FONT_SIZES.tablet, 'px' );
		} );

		await test.step( 'Set mobile font size', async () => {
			await editor.changeResponsiveView( 'mobile' );
			await editor.v4Panel.style.setFontSize( BREAKPOINT_FONT_SIZES.mobile, 'px' );
		} );

		const selector = '.e-heading-base';

		await test.step( 'Verify desktop style in editor', async () => {
			await editor.changeResponsiveView( 'desktop' );
			const element = editor.getPreviewFrame().locator( selector );
			await expect( element ).toHaveCSS( 'font-size', `${ BREAKPOINT_FONT_SIZES.desktop }px`, { timeout: timeouts.expect } );
		} );

		await test.step( 'Verify tablet style in editor', async () => {
			await editor.changeResponsiveView( 'tablet' );
			const element = editor.getPreviewFrame().locator( selector );
			await expect( element ).toHaveCSS( 'font-size', `${ BREAKPOINT_FONT_SIZES.tablet }px`, { timeout: timeouts.expect } );
		} );

		await test.step( 'Verify mobile style in editor', async () => {
			await editor.changeResponsiveView( 'mobile' );
			const element = editor.getPreviewFrame().locator( selector );
			await expect( element ).toHaveCSS( 'font-size', `${ BREAKPOINT_FONT_SIZES.mobile }px`, { timeout: timeouts.expect } );
		} );

		await test.step( 'Verify styles on frontend with viewport changes', async () => {
			await editor.publishAndViewPage();

			const publishedElement = editor.page.locator( selector );
			await expect( publishedElement ).toBeVisible( { timeout: timeouts.navigation } );

			await editor.page.setViewportSize( { width: 1400, height: 900 } );
			await expect( publishedElement ).toHaveCSS( 'font-size', `${ BREAKPOINT_FONT_SIZES.desktop }px` );

			await editor.page.setViewportSize( { width: 800, height: 600 } );
			await expect( publishedElement ).toHaveCSS( 'font-size', `${ BREAKPOINT_FONT_SIZES.tablet }px` );

			await editor.page.setViewportSize( { width: 375, height: 667 } );
			await expect( publishedElement ).toHaveCSS( 'font-size', `${ BREAKPOINT_FONT_SIZES.mobile }px` );
		} );
	} );

	test( 'State styles (hover) render correctly in editor and frontend', async () => {
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		await editor.addWidget( { widgetType: 'e-button', container: containerId } );

		await editor.v4Panel.openTab( 'style' );
		await editor.v4Panel.style.openSection( 'Background' );

		await test.step( 'Set normal state background', async () => {
			await editor.v4Panel.style.setBackgroundColor( STATE_COLORS.normal );
		} );

		await test.step( 'Set hover state background', async () => {
			await editor.v4Panel.style.selectClassState( 'hover', 'local' );
			await editor.v4Panel.style.openSection( 'Background' );
			await editor.v4Panel.style.setBackgroundColor( STATE_COLORS.hover );
		} );

		const selector = '.e-button-base';
		const element = editor.getPreviewFrame().locator( selector );

		await test.step( 'Verify normal state in editor', async () => {
			await editor.v4Panel.style.selectClassState( 'normal', 'local' );
			await expect( element ).toHaveCSS( 'background-color', 'rgb(255, 0, 0)', { timeout: timeouts.expect } );
		} );

		await test.step( 'Verify styles on frontend', async () => {
			await editor.publishAndViewPage();

			const publishedElement = editor.page.locator( selector );
			await expect( publishedElement ).toBeVisible( { timeout: timeouts.navigation } );

			await expect( publishedElement ).toHaveCSS( 'background-color', 'rgb(255, 0, 0)' );

			await publishedElement.hover();
			await expect( publishedElement ).toHaveCSS( 'background-color', 'rgb(0, 255, 0)' );
		} );
	} );

	test( 'Combined breakpoint + state styles render correctly', async () => {
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		await editor.addWidget( { widgetType: 'e-button', container: containerId } );

		await editor.v4Panel.openTab( 'style' );

		await test.step( 'Set desktop normal background', async () => {
			await editor.changeResponsiveView( 'desktop' );
			await editor.v4Panel.style.openSection( 'Background' );
			await editor.v4Panel.style.setBackgroundColor( '#ff0000' );
		} );

		await test.step( 'Set desktop hover background', async () => {
			await editor.v4Panel.style.selectClassState( 'hover', 'local' );
			await editor.v4Panel.style.openSection( 'Background' );
			await editor.v4Panel.style.setBackgroundColor( '#00ff00' );
		} );

		await test.step( 'Set mobile normal background', async () => {
			await editor.v4Panel.style.selectClassState( 'normal', 'local' );
			await editor.changeResponsiveView( 'mobile' );
			await editor.v4Panel.style.openSection( 'Background' );
			await editor.v4Panel.style.setBackgroundColor( '#0000ff' );
		} );

		await test.step( 'Set mobile hover background', async () => {
			await editor.v4Panel.style.selectClassState( 'hover', 'local' );
			await editor.v4Panel.style.openSection( 'Background' );
			await editor.v4Panel.style.setBackgroundColor( '#ffff00' );
		} );

		const selector = '.e-button-base';

		await test.step( 'Verify combined styles on frontend', async () => {
			await editor.publishAndViewPage();

			const publishedElement = editor.page.locator( selector );
			await expect( publishedElement ).toBeVisible( { timeout: timeouts.navigation } );

			await editor.page.setViewportSize( { width: 1400, height: 900 } );
			await expect( publishedElement ).toHaveCSS( 'background-color', 'rgb(255, 0, 0)' );
			await publishedElement.hover();
			await expect( publishedElement ).toHaveCSS( 'background-color', 'rgb(0, 255, 0)' );

			await editor.page.setViewportSize( { width: 375, height: 667 } );
			await expect( publishedElement ).toHaveCSS( 'background-color', 'rgb(0, 0, 255)' );
			await publishedElement.hover();
			await expect( publishedElement ).toHaveCSS( 'background-color', 'rgb(255, 255, 0)' );
		} );
	} );

	test( 'Breakpoint styles render correctly in editor and frontend for e-image widget', async () => {
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		await editor.addWidget( { widgetType: 'e-image', container: containerId } );

		await editor.v4Panel.openTab( 'style' );
		await editor.v4Panel.style.openSection( 'Border' );

		await test.step( 'Set desktop border type', async () => {
			await editor.changeResponsiveView( 'desktop' );
			await editor.v4Panel.style.setBorderType( BREAKPOINT_BORDER_PANEL_TYPES.desktop );
		} );

		await test.step( 'Set tablet border type', async () => {
			await editor.changeResponsiveView( 'tablet' );
			await editor.v4Panel.style.setBorderType( BREAKPOINT_BORDER_PANEL_TYPES.tablet );
		} );

		await test.step( 'Set mobile border type', async () => {
			await editor.changeResponsiveView( 'mobile' );
			await editor.v4Panel.style.setBorderType( BREAKPOINT_BORDER_PANEL_TYPES.mobile );
		} );

		const selector = '.e-image-base';

		await test.step( 'Verify desktop border style in editor', async () => {
			await editor.changeResponsiveView( 'desktop' );
			const element = editor.getPreviewFrame().locator( selector );
			await expect( element ).toHaveCSS( 'border-style', BREAKPOINT_BORDER_CSS_STYLES.desktop, { timeout: timeouts.expect } );
		} );

		await test.step( 'Verify tablet border style in editor', async () => {
			await editor.changeResponsiveView( 'tablet' );
			const element = editor.getPreviewFrame().locator( selector );
			await expect( element ).toHaveCSS( 'border-style', BREAKPOINT_BORDER_CSS_STYLES.tablet, { timeout: timeouts.expect } );
		} );

		await test.step( 'Verify mobile border style in editor', async () => {
			await editor.changeResponsiveView( 'mobile' );
			const element = editor.getPreviewFrame().locator( selector );
			await expect( element ).toHaveCSS( 'border-style', BREAKPOINT_BORDER_CSS_STYLES.mobile, { timeout: timeouts.expect } );
		} );

		await test.step( 'Verify border styles on frontend with viewport changes', async () => {
			await editor.publishAndViewPage();

			const publishedElement = editor.page.locator( selector );
			await expect( publishedElement ).toBeVisible( { timeout: timeouts.navigation } );

			await editor.page.setViewportSize( viewportSize.desktop );
			await expect( publishedElement ).toHaveCSS( 'border-style', BREAKPOINT_BORDER_CSS_STYLES.desktop );

			await editor.page.setViewportSize( viewportSize.tablet );
			await expect( publishedElement ).toHaveCSS( 'border-style', BREAKPOINT_BORDER_CSS_STYLES.tablet );

			await editor.page.setViewportSize( viewportSize.mobile );
			await expect( publishedElement ).toHaveCSS( 'border-style', BREAKPOINT_BORDER_CSS_STYLES.mobile );
		} );
	} );

	test( 'Breakpoint styles render correctly in editor and frontend for e-paragraph widget', async () => {
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		await editor.addWidget( { widgetType: 'e-paragraph', container: containerId } );

		await editor.v4Panel.openTab( 'style' );
		await editor.v4Panel.style.openSection( 'Typography' );

		await test.step( 'Set desktop font weight', async () => {
			await editor.changeResponsiveView( 'desktop' );
			await editor.v4Panel.style.setFontWeight( BREAKPOINT_FONT_WEIGHTS.desktop );
		} );

		await test.step( 'Set tablet font weight', async () => {
			await editor.changeResponsiveView( 'tablet' );
			await editor.v4Panel.style.setFontWeight( BREAKPOINT_FONT_WEIGHTS.tablet );
		} );

		await test.step( 'Set mobile font weight', async () => {
			await editor.changeResponsiveView( 'mobile' );
			await editor.v4Panel.style.setFontWeight( BREAKPOINT_FONT_WEIGHTS.mobile );
		} );

		const selector = '.e-paragraph-base';

		await test.step( 'Verify desktop style in editor', async () => {
			await editor.changeResponsiveView( 'desktop' );
			const element = editor.getPreviewFrame().locator( selector );
			await expect( element ).toHaveCSS( 'font-weight', String( BREAKPOINT_FONT_WEIGHTS.desktop ), { timeout: timeouts.expect } );
		} );

		await test.step( 'Verify tablet style in editor', async () => {
			await editor.changeResponsiveView( 'tablet' );
			const element = editor.getPreviewFrame().locator( selector );
			await expect( element ).toHaveCSS( 'font-weight', String( BREAKPOINT_FONT_WEIGHTS.tablet ), { timeout: timeouts.expect } );
		} );

		await test.step( 'Verify mobile style in editor', async () => {
			await editor.changeResponsiveView( 'mobile' );
			const element = editor.getPreviewFrame().locator( selector );
			await expect( element ).toHaveCSS( 'font-weight', String( BREAKPOINT_FONT_WEIGHTS.mobile ), { timeout: timeouts.expect } );
		} );

		await test.step( 'Verify styles on frontend with viewport changes', async () => {
			await editor.publishAndViewPage();

			const publishedElement = editor.page.locator( selector );
			await expect( publishedElement ).toBeVisible( { timeout: timeouts.navigation } );

			await editor.page.setViewportSize( viewportSize.desktop );
			await expect( publishedElement ).toHaveCSS( 'font-weight', String( BREAKPOINT_FONT_WEIGHTS.desktop ) );

			await editor.page.setViewportSize( viewportSize.tablet );
			await expect( publishedElement ).toHaveCSS( 'font-weight', String( BREAKPOINT_FONT_WEIGHTS.tablet ) );

			await editor.page.setViewportSize( viewportSize.mobile );
			await expect( publishedElement ).toHaveCSS( 'font-weight', String( BREAKPOINT_FONT_WEIGHTS.mobile ) );
		} );
	} );

	test( 'Breakpoint styles render correctly in editor and frontend for e-svg widget', async () => {
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		await editor.addWidget( { widgetType: 'e-svg', container: containerId } );

		await editor.v4Panel.openTab( 'style' );
		await editor.v4Panel.style.openSection( 'Background' );

		await test.step( 'Set desktop background color', async () => {
			await editor.changeResponsiveView( 'desktop' );
			await editor.v4Panel.style.setBackgroundColor( BREAKPOINT_BACKGROUND_COLORS.desktop );
		} );

		await test.step( 'Set tablet background color', async () => {
			await editor.changeResponsiveView( 'tablet' );
			await editor.v4Panel.style.setBackgroundColor( BREAKPOINT_BACKGROUND_COLORS.tablet );
		} );

		await test.step( 'Set mobile background color', async () => {
			await editor.changeResponsiveView( 'mobile' );
			await editor.v4Panel.style.setBackgroundColor( BREAKPOINT_BACKGROUND_COLORS.mobile );
		} );

		const selector = '.e-svg-base';

		await test.step( 'Verify desktop style in editor', async () => {
			await editor.changeResponsiveView( 'desktop' );
			const element = editor.getPreviewFrame().locator( selector );
			await expect( element ).toHaveCSS( 'background-color', BREAKPOINT_BACKGROUND_COLOR_RGB.desktop, { timeout: timeouts.expect } );
		} );

		await test.step( 'Verify tablet style in editor', async () => {
			await editor.changeResponsiveView( 'tablet' );
			const element = editor.getPreviewFrame().locator( selector );
			await expect( element ).toHaveCSS( 'background-color', BREAKPOINT_BACKGROUND_COLOR_RGB.tablet, { timeout: timeouts.expect } );
		} );

		await test.step( 'Verify mobile style in editor', async () => {
			await editor.changeResponsiveView( 'mobile' );
			const element = editor.getPreviewFrame().locator( selector );
			await expect( element ).toHaveCSS( 'background-color', BREAKPOINT_BACKGROUND_COLOR_RGB.mobile, { timeout: timeouts.expect } );
		} );

		await test.step( 'Verify styles on frontend with viewport changes', async () => {
			await editor.publishAndViewPage();

			const publishedElement = editor.page.locator( selector );
			await expect( publishedElement ).toBeVisible( { timeout: timeouts.navigation } );

			await editor.page.setViewportSize( viewportSize.desktop );
			await expect( publishedElement ).toHaveCSS( 'background-color', BREAKPOINT_BACKGROUND_COLOR_RGB.desktop );

			await editor.page.setViewportSize( viewportSize.tablet );
			await expect( publishedElement ).toHaveCSS( 'background-color', BREAKPOINT_BACKGROUND_COLOR_RGB.tablet );

			await editor.page.setViewportSize( viewportSize.mobile );
			await expect( publishedElement ).toHaveCSS( 'background-color', BREAKPOINT_BACKGROUND_COLOR_RGB.mobile );
		} );
	} );

	test( 'Breakpoint styles render correctly in editor and frontend for e-divider widget', async () => {
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		await editor.addWidget( { widgetType: 'e-divider', container: containerId } );

		await editor.v4Panel.openTab( 'style' );
		await editor.v4Panel.style.openSection( 'Size' );

		await test.step( 'Set desktop width', async () => {
			await editor.changeResponsiveView( 'desktop' );
			await editor.v4Panel.style.setSizeSectionValue( SizeSectionLabel.WIDTH, BREAKPOINT_DIVIDER_WIDTHS_PX.desktop, UNITS.px );
		} );

		await test.step( 'Set tablet width', async () => {
			await editor.changeResponsiveView( 'tablet' );
			await editor.v4Panel.style.setSizeSectionValue( SizeSectionLabel.WIDTH, BREAKPOINT_DIVIDER_WIDTHS_PX.tablet, UNITS.px );
		} );

		await test.step( 'Set mobile width', async () => {
			await editor.changeResponsiveView( 'mobile' );
			await editor.v4Panel.style.setSizeSectionValue( SizeSectionLabel.WIDTH, BREAKPOINT_DIVIDER_WIDTHS_PX.mobile, UNITS.px );
		} );

		const selector = '.e-divider-base';

		await test.step( 'Verify desktop style in editor', async () => {
			await editor.changeResponsiveView( 'desktop' );
			const element = editor.getPreviewFrame().locator( selector );
			await expect( element ).toHaveCSS( 'width', `${ BREAKPOINT_DIVIDER_WIDTHS_PX.desktop }px`, { timeout: timeouts.expect } );
		} );

		await test.step( 'Verify tablet style in editor', async () => {
			await editor.changeResponsiveView( 'tablet' );
			const element = editor.getPreviewFrame().locator( selector );
			await expect( element ).toHaveCSS( 'width', `${ BREAKPOINT_DIVIDER_WIDTHS_PX.tablet }px`, { timeout: timeouts.expect } );
		} );

		await test.step( 'Verify mobile style in editor', async () => {
			await editor.changeResponsiveView( 'mobile' );
			const element = editor.getPreviewFrame().locator( selector );
			await expect( element ).toHaveCSS( 'width', `${ BREAKPOINT_DIVIDER_WIDTHS_PX.mobile }px`, { timeout: timeouts.expect } );
		} );

		await test.step( 'Verify styles on frontend with viewport changes', async () => {
			await editor.publishAndViewPage();

			const publishedElement = editor.page.locator( selector );
			await expect( publishedElement ).toBeVisible( { timeout: timeouts.navigation } );

			await editor.page.setViewportSize( viewportSize.desktop );
			await expect( publishedElement ).toHaveCSS( 'width', `${ BREAKPOINT_DIVIDER_WIDTHS_PX.desktop }px` );

			await editor.page.setViewportSize( viewportSize.tablet );
			await expect( publishedElement ).toHaveCSS( 'width', `${ BREAKPOINT_DIVIDER_WIDTHS_PX.tablet }px` );

			await editor.page.setViewportSize( viewportSize.mobile );
			await expect( publishedElement ).toHaveCSS( 'width', `${ BREAKPOINT_DIVIDER_WIDTHS_PX.mobile }px` );
		} );
	} );

	test( 'Breakpoint styles render correctly in editor and frontend for e-youtube widget', async () => {
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		await editor.addWidget( { widgetType: 'e-youtube', container: containerId } );

		await editor.v4Panel.openTab( 'style' );
		await editor.v4Panel.style.openSection( 'Spacing' );

		await test.step( 'Set desktop margin', async () => {
			await editor.changeResponsiveView( 'desktop' );
			await editor.v4Panel.style.setSpacingSectionValue( 'Margin', OffsetLabel.TOP, BREAKPOINT_YOUTUBE_MARGINS_PX.desktop, UNITS.px );
		} );

		await test.step( 'Set tablet margin', async () => {
			await editor.changeResponsiveView( 'tablet' );
			await editor.v4Panel.style.setSpacingSectionValue( 'Margin', OffsetLabel.TOP, BREAKPOINT_YOUTUBE_MARGINS_PX.tablet, UNITS.px );
		} );

		await test.step( 'Set mobile margin', async () => {
			await editor.changeResponsiveView( 'mobile' );
			await editor.v4Panel.style.setSpacingSectionValue( 'Margin', OffsetLabel.TOP, BREAKPOINT_YOUTUBE_MARGINS_PX.mobile, UNITS.px );
		} );

		const selector = '.e-youtube-base';

		await test.step( 'Verify desktop style in editor', async () => {
			await editor.changeResponsiveView( 'desktop' );
			const element = editor.getPreviewFrame().locator( selector );
			await expect( element ).toHaveCSS( 'margin-top', `${ BREAKPOINT_YOUTUBE_MARGINS_PX.desktop }px`, { timeout: timeouts.expect } );
		} );

		await test.step( 'Verify tablet style in editor', async () => {
			await editor.changeResponsiveView( 'tablet' );
			const element = editor.getPreviewFrame().locator( selector );
			await expect( element ).toHaveCSS( 'margin-top', `${ BREAKPOINT_YOUTUBE_MARGINS_PX.tablet }px`, { timeout: timeouts.expect } );
		} );

		await test.step( 'Verify mobile style in editor', async () => {
			await editor.changeResponsiveView( 'mobile' );
			const element = editor.getPreviewFrame().locator( selector );
			await expect( element ).toHaveCSS( 'margin-top', `${ BREAKPOINT_YOUTUBE_MARGINS_PX.mobile }px`, { timeout: timeouts.expect } );
		} );

		await test.step( 'Verify styles on frontend with viewport changes', async () => {
			await editor.publishAndViewPage();

			const publishedElement = editor.page.locator( selector );
			await expect( publishedElement ).toBeVisible( { timeout: timeouts.navigation } );

			await editor.page.setViewportSize( viewportSize.desktop );
			await expect( publishedElement ).toHaveCSS( 'margin-top', `${ BREAKPOINT_YOUTUBE_MARGINS_PX.desktop }px` );

			await editor.page.setViewportSize( viewportSize.tablet );
			await expect( publishedElement ).toHaveCSS( 'margin-top', `${ BREAKPOINT_YOUTUBE_MARGINS_PX.tablet }px` );

			await editor.page.setViewportSize( viewportSize.mobile );
			await expect( publishedElement ).toHaveCSS( 'margin-top', `${ BREAKPOINT_YOUTUBE_MARGINS_PX.mobile }px` );
		} );
	} );
} );
