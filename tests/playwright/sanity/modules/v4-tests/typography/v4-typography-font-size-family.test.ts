import { parallelTest as test } from '../../../../parallelTest';
import {
	WIDGET_CONFIGS,
	FONT_SIZES,
	FONT_FAMILIES,
	setupTypographyTestSuite,
	teardownTypographyTestSuite,
	beforeEachTypographyTest,
	setupWidgetWithTypography,
	verifyFontSizeWithPublishing,
	type TypographyTestSetup,
} from './typography-test-helpers';

// Combined test settings
const FONT_SIZE = FONT_SIZES.DESKTOP;
const FONT_FAMILY = { name: FONT_FAMILIES.system, type: 'system' as const };

test.describe( 'V4 Typography Combined Font Size and Family Tests @v4-tests', () => {
	let setup: TypographyTestSetup;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		setup = await setupTypographyTestSuite( browser, apiRequests, testInfo );
	} );

	test.afterAll( async () => {
		await teardownTypographyTestSuite( setup );
	} );

	test.beforeEach( async () => {
		await beforeEachTypographyTest( setup );
	} );

	test( 'Heading font size and family apply correctly in editor and published page', async () => {
		// Add container and heading widget
		await setupWidgetWithTypography( setup.driver, WIDGET_CONFIGS.HEADING.type );

		// Apply settings to heading
		await setup.driver.editor.v4Panel.style.typography.setTypography( { fontSize: FONT_SIZE } );
		await setup.driver.editor.v4Panel.style.typography.setFontFamily( FONT_FAMILY.name, FONT_FAMILY.type );

		// Verify font size with publishing
		await verifyFontSizeWithPublishing( setup.driver, WIDGET_CONFIGS.HEADING.selector, FONT_SIZE );
	} );

	test( 'Paragraph font size and family apply correctly in editor and published page', async () => {
		// Add container and paragraph widget
		await setupWidgetWithTypography( setup.driver, WIDGET_CONFIGS.PARAGRAPH.type );

		// Apply settings to paragraph
		await setup.driver.editor.v4Panel.style.typography.setTypography( { fontSize: FONT_SIZE } );
		await setup.driver.editor.v4Panel.style.typography.setFontFamily( FONT_FAMILY.name, FONT_FAMILY.type );

		// Verify font size with publishing
		await verifyFontSizeWithPublishing( setup.driver, WIDGET_CONFIGS.PARAGRAPH.selector, FONT_SIZE );
	} );
} );
