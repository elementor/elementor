import { expect } from '@playwright/test';
import { wpCli } from '../../../assets/wp-cli';
import { timeouts } from '../../../config/timeouts';
import EditorPage from '../../../pages/editor-page';
import WpAdminPage from '../../../pages/wp-admin-page';
import { parallelTest as test } from '../../../parallelTest';
import EditorSelectors from '../../../selectors/editor-selectors';

const ROLE_MANAGER_OPTION = 'elementor_role-manager';
const DESIGN_RESTRICTION = 'design';
const EDITOR_ROLE = 'editor';
const CONTENT_ONLY_ROLE_RESTRICTIONS = { [ EDITOR_ROLE ]: [ DESIGN_RESTRICTION ] };
const TAB_GENERAL = 'General';
const TAB_STYLE = 'Style';
const TAB_INTERACTIONS = 'Interactions';
const INFOTIP_POPPER_SELECTOR = '.MuiTooltip-tooltip';
const INFOTIP_TITLE = 'Content-only access';
const INFOTIP_BODY = 'Your Site Admin has limited this role to content editing.';
const INFOTIP_LEARN_MORE_LABEL = 'Learn More';
const INFOTIP_LEARN_MORE_URL = 'https://go.elementor.com/content-only-access-infotip';
const HEADING_WIDGET = EditorSelectors.v4.atoms.heading;
const UPDATED_HEADING_TEXT = 'Content-only heading edit';

test.describe( 'Content-only editing panel access @v4-tests', () => {
	let contentOnlyUser: { id: string; username: string; password: string };
	let sharedPostId: string;
	let headingWidgetId: string;

	test.beforeAll( async ( { browser, apiRequests, request }, testInfo ) => {
		const adminContext = await browser.newContext( { storageState: undefined } );
		const adminPage = await adminContext.newPage();
		const adminWpAdmin = new WpAdminPage( adminPage, testInfo, apiRequests );

		await adminWpAdmin.customLogin( process.env.USERNAME || 'admin', process.env.PASSWORD || 'password' );
		await adminWpAdmin.setExperiments( {
			e_atomic_elements: 'active',
			e_opt_in_v4: 'active',
		} );
		// wpCli runs through docker compose without a shell, so the JSON must not be shell-quoted.
		await wpCli( `wp option update ${ ROLE_MANAGER_OPTION } ${ JSON.stringify( CONTENT_ONLY_ROLE_RESTRICTIONS ) } --format=json` );

		contentOnlyUser = await apiRequests.createNewUser( request, {
			username: 'contentOnlyEditor',
			password: 'password',
			email: 'content-only-editor@test.com',
			roles: [ EDITOR_ROLE ],
		} );

		sharedPostId = await adminWpAdmin.createNewPostWithAPI();
		await adminPage.waitForLoadState( 'load', { timeout: timeouts.action } );
		await adminWpAdmin.waitForPanel();
		await adminWpAdmin.closeAnnouncementsIfVisible();

		const editor = new EditorPage( adminPage, testInfo );

		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		headingWidgetId = await editor.addWidget( { widgetType: HEADING_WIDGET, container: containerId } );

		await adminContext.close();
	} );

	test.afterAll( async ( { browser, apiRequests, request }, testInfo ) => {
		if ( contentOnlyUser?.id ) {
			try {
				await apiRequests.deleteUser( request, contentOnlyUser.id );
			} catch {
				// Cleanup should not fail the test run.
			}
		}

		const cleanupContext = await browser.newContext( { storageState: undefined } );
		const cleanupPage = await cleanupContext.newPage();
		const cleanupWpAdmin = new WpAdminPage( cleanupPage, testInfo, apiRequests );

		try {
			await cleanupWpAdmin.customLogin( process.env.USERNAME || 'admin', process.env.PASSWORD || 'password' );
			await wpCli( `wp option delete ${ ROLE_MANAGER_OPTION }` );
			await cleanupWpAdmin.resetExperiments();
		} catch {
			// Cleanup should not fail the test run.
		} finally {
			await cleanupContext.close();
		}
	} );

	test( 'content-only editor sees restricted panel tabs while admin does not', async ( { browser, apiRequests, page }, testInfo ) => {
		const editorContext = await browser.newContext( { storageState: undefined } );
		const editorPage = await editorContext.newPage();
		const wpAdmin = new WpAdminPage( editorPage, testInfo, apiRequests );

		await wpAdmin.customLogin( contentOnlyUser.username, contentOnlyUser.password );
		const editor = await wpAdmin.editExistingPostWithElementor( sharedPostId, { page: editorPage, testInfo } );
		await editor.selectElement( headingWidgetId );

		const generalTab = editorPage.getByRole( 'tab', { name: TAB_GENERAL } );
		const styleTab = editorPage.getByRole( 'tab', { name: TAB_STYLE } );
		const interactionsTab = editorPage.getByRole( 'tab', { name: TAB_INTERACTIONS } );

		await test.step( 'Style and Interactions tabs are present but disabled; General is enabled and selected', async () => {
			await expect( generalTab ).toBeVisible();
			await expect( styleTab ).toBeVisible();
			await expect( interactionsTab ).toBeVisible();
			await expect( generalTab ).toBeEnabled();
			await expect( generalTab ).toHaveAttribute( 'aria-selected', 'true' );
			await expect( styleTab ).toBeDisabled();
			await expect( interactionsTab ).toBeDisabled();
		} );

		await test.step( 'Hovering the disabled Style tab shows the content-only infotip', async () => {
			await styleTab.hover();

			// The infotip renders in a portal, so scope the assertions to the popper itself.
			const infotip = editorPage.locator( INFOTIP_POPPER_SELECTOR ).filter( { hasText: INFOTIP_TITLE } );

			await expect( infotip ).toBeVisible( { timeout: timeouts.action } );
			await expect( infotip.getByText( INFOTIP_BODY ) ).toBeVisible();
			const learnMoreLink = infotip.getByRole( 'link', { name: INFOTIP_LEARN_MORE_LABEL } );
			await expect( learnMoreLink ).toBeVisible();
			await expect( learnMoreLink ).toHaveAttribute( 'href', INFOTIP_LEARN_MORE_URL );
		} );

		await test.step( 'Content-only user can edit a General tab control', async () => {
			const panelInlineEditor = editor.getPanelInlineEditor();
			await expect( panelInlineEditor ).toBeVisible();
			await panelInlineEditor.clear();
			await panelInlineEditor.fill( UPDATED_HEADING_TEXT );

			const headingOnCanvas = editor.getPreviewFrame().locator(
				`.elementor-element-${ headingWidgetId } ${ EditorSelectors.v4.atomSelectors.heading.base }`,
			);
			await expect( headingOnCanvas ).toHaveText( UPDATED_HEADING_TEXT, { timeout: timeouts.longAction } );
		} );

		await editorContext.close();

		await test.step( 'Administrator sees all editing panel tabs enabled on the same page', async () => {
			const adminWpAdmin = new WpAdminPage( page, testInfo, apiRequests );
			const adminEditor = await adminWpAdmin.editExistingPostWithElementor( sharedPostId, { page, testInfo } );
			await adminEditor.selectElement( headingWidgetId );

			await expect( page.getByRole( 'tab', { name: TAB_GENERAL } ) ).toBeEnabled();
			await expect( page.getByRole( 'tab', { name: TAB_STYLE } ) ).toBeEnabled();
			await expect( page.getByRole( 'tab', { name: TAB_INTERACTIONS } ) ).toBeEnabled();
		} );
	} );
} );
