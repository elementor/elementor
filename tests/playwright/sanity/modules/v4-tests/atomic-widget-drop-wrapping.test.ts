import { expect, type Locator } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import { wpCli } from '../../../assets/wp-cli';

test.describe( 'Atomic widget drop wrapping (ED-23790) @v4-tests', () => {
	const flexboxType = 'e-flexbox';
	const headingTitle = 'Heading';
	const headingName = 'e-heading';

	test.beforeAll( async () => {
		await wpCli( 'wp elementor experiments activate e_atomic_elements' );
		await wpCli( 'wp elementor experiments activate e_twig_containers' );
	} );

	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.resetExperiments();
		await page.close();
	} );

	const getElementIds = async ( widgetElement: Locator ): Promise<{ wrapperId: string; widgetId: string }> => {
		const widgetId = await widgetElement.getAttribute( 'data-id' );
		const wrapperId = await widgetElement.locator( '..' ).getAttribute( 'data-id' );

		expect( widgetId ).toBeTruthy();
		expect( wrapperId ).toBeTruthy();

		return { wrapperId: wrapperId as string, widgetId: widgetId as string };
	};

	test( 'Dropping an atomic widget wraps it in a flexbox and selects the widget', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		const widgetElement = await editor.v4Panel.addAtomicWidget( headingTitle, headingName );
		const { wrapperId, widgetId } = await getElementIds( widgetElement );

		const wrapper = widgetElement.locator( '..' );

		await expect( wrapper ).toHaveAttribute( 'data-element_type', flexboxType );
		await expect( widgetElement ).toHaveAttribute( 'data-widget_type', `${ headingName }.default` );

		const getSelectedIds = () => page.evaluate( () => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const selected = ( window as any ).elementor.selection.getElements() as Array<{ id: string }>;
			return selected.map( ( container ) => container.id );
		} );

		await expect.poll( getSelectedIds ).toContain( widgetId );
		expect( await getSelectedIds() ).not.toContain( wrapperId );
	} );

	test( 'Undo removes both wrapper and widget; redo restores both; second undo stays clean', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		const widgetElement = await editor.v4Panel.addAtomicWidget( headingTitle, headingName );
		const { wrapperId, widgetId } = await getElementIds( widgetElement );

		const wrapper = editor.getPreviewFrame().locator( `[data-id="${ wrapperId }"]` );
		const widget = editor.getPreviewFrame().locator( `[data-id="${ widgetId }"]` );

		const runUndo = () => page.evaluate( () => ( window as unknown as { $e: { run: ( cmd: string ) => void } } ).$e.run( 'document/history/undo' ) );
		const runRedo = () => page.evaluate( () => ( window as unknown as { $e: { run: ( cmd: string ) => void } } ).$e.run( 'document/history/redo' ) );

		await runUndo();
		await expect( widget ).toHaveCount( 0 );
		await expect( wrapper ).toHaveCount( 0 );

		await runRedo();
		await expect( wrapper ).toBeVisible();
		await expect( widget ).toBeVisible();

		await runUndo();
		await expect( widget ).toHaveCount( 0 );
		await expect( wrapper ).toHaveCount( 0 );
	} );
} );
