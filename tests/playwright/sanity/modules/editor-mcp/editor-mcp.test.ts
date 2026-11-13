import { type APIRequestContext, type Browser, type Page, expect as baseExpect, request as playwrightRequest } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import { wpCli } from '../../../assets/wp-cli';
import type ApiRequests from '../../../assets/api-requests';
import WpAdminPage from '../../../pages/wp-admin-page';
import EditorSelectors from '../../../selectors/editor-selectors';
import { fetchNonce } from '../../../wp-authentication';
import { ELEMENTOR_SERVER_ROUTE, McpClient } from './mcp-client';
import {
	buildComposition,
	collectStrings,
	createPage,
	getFrontendHtml,
	publish,
	resolvedIds,
	setElementorData,
	setMcpAbilitiesEnabled,
} from './editor-mcp-helpers';

// The wp-playground renders the canvas slowly; give UI assertions room.
const expect = baseExpect.configure( { timeout: 30_000 } );

const HTML_TAG = /<\/?[a-z][a-z0-9-]*(\s[^>]*)?>/i;
const EMAIL = /[\w.+-]+@[\w-]+\.[\w.]+/;
const AI_UPDATE_DIALOG = 'Page Updated by AI';

type TestUser = { id: string; username: string; password: string };

// The wp-playground auto-logs-in any request without this cookie as admin, so a second user needs it to stay themselves.
async function newUserContext( baseUrl: string, user: TestUser ): Promise<APIRequestContext> {
	const context = await playwrightRequest.newContext( {
		storageState: {
			cookies: [ { name: 'playground_auto_login_already_happened', value: '1', domain: new URL( baseUrl ).hostname, path: '/', expires: -1, httpOnly: false, secure: false, sameSite: 'Lax' } ],
			origins: [],
		},
	} );

	await context.get( `${ baseUrl }/wp-login.php` );
	await context.post( `${ baseUrl }/wp-login.php`, {
		form: { log: user.username, pwd: user.password, 'wp-submit': 'Log In', redirect_to: `${ baseUrl }/wp-admin/`, testcookie: '1' },
	} );

	return context;
}

async function createEditorUser( apiRequests: ApiRequests, request: APIRequestContext ): Promise<TestUser> {
	return apiRequests.createNewUser( request, { username: 'mcpeditor', password: 'password', email: '', roles: [ 'editor' ] } );
}

async function openEditor( browser: Browser, baseUrl: string, postId: number, user?: TestUser ) {
	const context = user
		? await browser.newContext( { baseURL: baseUrl, storageState: await ( await newUserContext( baseUrl, user ) ).storageState() } )
		: await browser.newContext( { baseURL: baseUrl } );
	const page = await context.newPage();

	await page.goto( `/wp-admin/post.php?post=${ postId }&action=elementor`, { waitUntil: 'domcontentloaded' } );
	await waitForEditorReady( page );

	return { context, page };
}

// The canvas is ready once the preview container exists, not when the iframe body appears.
async function waitForEditorReady( page: Page ) {
	await page.waitForFunction( () => !! ( window as unknown as { elementor?: { getPreviewContainer?: () => unknown } } ).elementor?.getPreviewContainer?.(), null, { timeout: 180_000 } );
}

async function triggerHeartbeat( page: Page ) {
	await page.evaluate( () => ( window as unknown as { wp: { heartbeat: { connectNow: () => void } } } ).wp.heartbeat.connectNow() );
}

async function getExperimentStateOnFeaturesPage( wpAdmin: WpAdminPage, name: string ): Promise<string> {
	await wpAdmin.openElementorSettings( 'tab-experiments' );
	// A repeat visit to the same #tab-experiments URL only changes the hash, so reload for the saved state.
	await wpAdmin.page.reload();

	return wpAdmin.page.locator( `#e-experiment-${ name }` ).inputValue();
}

test.describe( 'Editor MCP @editor-mcp', () => {
	// The wp-playground runs PHP as WASM on one worker, so editor loads take far longer than on wp-env.
	test.describe.configure( { timeout: 300_000 } );
	test.use( { navigationTimeout: 120_000, actionTimeout: 60_000 } );

	let mcpRequest: APIRequestContext;
	let mcp: McpClient;

	test.beforeAll( async ( { workerStorageState } ) => {
		await wpCli( 'wp elementor experiments activate e_atomic_elements' );
		mcpRequest = await playwrightRequest.newContext( { storageState: workerStorageState } );
	} );

	test.beforeEach( async ( { workerBaseURL } ) => {
		// Some tests turn the abilities off or toggle plugins; start each test enabled with a fresh session.
		await setMcpAbilitiesEnabled( true );
		mcp = await McpClient.connect( mcpRequest, workerBaseURL );
	} );

	test.afterAll( async () => {
		await setMcpAbilitiesEnabled( true );
		await mcpRequest.dispose();
	} );

	test( 'ED-25719 get-system-info returns plain-text reports and report_not_found for unknown names', async ( { request, baseURL } ) => {
		await test.step( 'Without a filter every report comes back as plain text', async () => {
			const result = await mcp.callToolOrThrow( 'elementor/get-system-info' );
			const reports = result.reports as Record<string, unknown>;

			expect( Object.keys( reports ).length ).toBeGreaterThan( 1 );
			expect( collectStrings( reports ).filter( ( value ) => HTML_TAG.test( value ) ) ).toEqual( [] );
		} );

		await test.step( 'reports ["server"] returns only the server report, as plain text', async () => {
			const result = await mcp.callToolOrThrow( 'elementor/get-system-info', { reports: [ 'server' ] } );
			const reports = result.reports as Record<string, unknown>;

			expect( Object.keys( reports ) ).toEqual( [ 'server' ] );
			expect( collectStrings( reports ).filter( ( value ) => HTML_TAG.test( value ) ) ).toEqual( [] );
		} );

		await test.step( 'reports ["nope"] returns report_not_found with the available names', async () => {
			const result = await mcp.callTool( 'elementor/get-system-info', { reports: [ 'nope' ] } );

			expect( result.isError ).toBe( true );
			expect( result.text ).toContain( 'server' );
			expect( result.text ).toContain( 'wordpress' );

			// The MCP result carries only the message, so read the error code from the Abilities REST API.
			const nonce = await fetchNonce( request, baseURL );
			const response = await request.get( `${ baseURL }/wp-json/wp-abilities/v1/abilities/elementor/get-system-info/run`, {
				headers: { 'X-WP-Nonce': nonce },
				params: { 'input[reports][0]': 'nope' },
			} );

			expect( ( await response.json() ).code ).toBe( 'report_not_found' );
		} );
	} );

	test( 'ED-25806 get-widget-schemas returns batch schemas and per-type errors', async () => {
		const result = await mcp.callToolOrThrow( 'elementor/get-widget-schemas', { widget_type: [ 'e-heading', 'e-button', 'not-a-widget' ] } );
		const single = await mcp.callToolOrThrow( 'elementor/get-widget-schemas', { widget_type: [ 'e-heading' ] } );
		const schemas = result.schemas as Record<string, unknown>;

		expect( Object.keys( schemas ).sort() ).toEqual( [ 'e-button', 'e-heading' ] );
		expect( schemas[ 'e-heading' ] ).toEqual( ( single.schemas as Record<string, unknown> )[ 'e-heading' ] );
		expect( ( result.errors as Record<string, unknown> )[ 'not-a-widget' ] ).toBeTruthy();

		const toolNames = ( await mcp.listTools() ).map( ( tool ) => tool.name );

		expect( toolNames ).toContain( 'elementor-get-widget-schemas' );
		expect( toolNames ).not.toContain( 'elementor-get-widget-schema' );
	} );

	// Core runs without Pro; the Pro license states are covered in the Pro suite.
	test( 'ED-25720 get-license-status reports pro_not_installed without Pro, with no key or email', async () => {
		const result = await mcp.callTool( 'elementor/get-license-status' );

		expect( result.isError ).toBe( false );
		expect( result.data ).toEqual( { status: 'pro_not_installed', tier: 'free', label: 'Free' } );
		expect( result.text ).not.toMatch( EMAIL );
	} );

	test( 'ED-25023 S2 setting an unknown icon on an e-svg fails with an actionable error', async () => {
		test.fixme( true, 'ED-25023 AC says unknown icons fail; the product saves them with an icon_not_found warning and renders a placeholder. Needs a product decision or bug ticket.' );

		const postId = await createPage( mcp, 'MCP unknown icon' );
		const result = await buildComposition( mcp, {
			post_id: postId,
			xml_structure: '<e-svg configuration-id="icon"></e-svg>',
			element_config: { icon: { svg: { value: 'fa-solid fa-arrow-right', library: 'fa-solid' } } },
		} );
		const svgId = resolvedIds( result ).icon;
		const before = await mcp.callToolOrThrow( 'elementor/get-page-structure', { post_id: postId, element_id: svgId, include_content: true } );

		const update = await mcp.callTool( 'elementor/manage-elements', {
			post_id: postId,
			operations: [ { action: 'update', element_id: svgId, settings: { svg: { value: 'fa-solid fa-not-a-real-icon-zzz', library: 'fa-solid' } } } ],
		} );
		const after = await mcp.callToolOrThrow( 'elementor/get-page-structure', { post_id: postId, element_id: svgId, include_content: true } );
		const opStatus = ( update.data?.results as { status: string }[] | undefined )?.[ 0 ]?.status;

		expect( update.isError || 'error' === opStatus, `Expected an error, got: ${ update.text }` ).toBe( true );
		expect( update.text ).toContain( 'find-icons' );
		expect( after ).toEqual( before );
	} );

	test( 'ED-25717 clear-cache regenerates the page CSS file', async ( { request, baseURL } ) => {
		await wpCli( 'wp option update elementor_css_print_method external' );

		const postId = await createPage( mcp, 'MCP clear cache' );

		await buildComposition( mcp, { post_id: postId, xml_structure: '<e-heading configuration-id="t"></e-heading>', element_config: { t: { title: 'Cached page' } }, style: { t: 'color: rgb(255, 0, 0);' } } );
		await publish( mcp, postId );

		// V3 pages load post-<id>.css, V4 (atomic) pages load local-<id>-frontend-<breakpoint>.css.
		const cssVersion = ( html: string ) => html.match( new RegExp( `(?:post|local)-${ postId }[a-z-]*\\.css\\?ver=(\\w+)` ) )?.[ 1 ];
		const before = cssVersion( await getFrontendHtml( request, baseURL, postId ) );

		expect( before ).toBeTruthy();
		// The version is a timestamp in seconds, so let it tick before regenerating.
		await new Promise( ( resolve ) => setTimeout( resolve, 1100 ) );

		const result = await mcp.callToolOrThrow( 'elementor/clear-cache' );

		expect( result.success ).toBe( true );

		const html = await getFrontendHtml( request, baseURL, postId );
		const after = cssVersion( html );

		expect( after ).toBeTruthy();
		expect( after ).not.toBe( before );
		expect( html ).toContain( 'Cached page' );
		expect( html ).not.toMatch( /Fatal error|Warning:/ );
	} );

	test( 'ED-25749 S2 without the MCP Adapter plugin, the Elementor MCP server exists and lists the tools', async ( { request, baseURL } ) => {
		const client = await McpClient.connect( request, baseURL, ELEMENTOR_SERVER_ROUTE );
		const names = ( await client.listTools() ).map( ( tool ) => tool.name );

		expect( names ).toContain( 'elementor-build-composition' );
		expect( names ).toContain( 'elementor-get-page-structure' );
	} );

	test( 'ED-25849 S1 while disabled the default server lists only the enable tool, which turns the abilities on', async ( { request, baseURL } ) => {
		await setMcpAbilitiesEnabled( false );

		const client = await McpClient.connect( request, baseURL );
		const elementorToolsBefore = ( await client.listTools() ).map( ( tool ) => tool.name ).filter( ( name ) => name.startsWith( 'elementor-' ) );

		expect( elementorToolsBefore ).toEqual( [ 'elementor-enable-elementor-abilities' ] );

		const result = await client.callTool( 'elementor/enable-elementor-abilities', { consent: true } );

		expect( result.isError ).toBe( false );

		const reconnected = await McpClient.connect( request, baseURL );
		const namesAfter = ( await reconnected.listTools() ).map( ( tool ) => tool.name );

		expect( namesAfter ).toContain( 'elementor-build-composition' );
		expect( namesAfter ).not.toContain( 'elementor-enable-elementor-abilities' );
	} );

	test( 'ED-25849 S2 an Editor-role user cannot enable the abilities', async ( { request, baseURL, apiRequests } ) => {
		await setMcpAbilitiesEnabled( false );

		const editor = await createEditorUser( apiRequests, request );
		const editorRequest = await newUserContext( baseURL, editor );

		try {
			const client = await McpClient.connect( editorRequest, baseURL );
			const { json } = await client.rawRpc( 'tools/call', { name: 'elementor-enable-elementor-abilities', arguments: { consent: true } } );

			expect( Boolean( json?.error ) || Boolean( json?.result?.isError ) ).toBe( true );

			const nonce = await fetchNonce( request, baseURL );
			const settings = await request.get( `${ baseURL }/wp-json/elementor-mcp-composer/v1.0.20/mcp-settings`, { headers: { 'X-WP-Nonce': nonce } } );

			expect( ( await settings.json() ).data.enabled ).toBe( false );
		} finally {
			await editorRequest.dispose();
			await apiRequests.deleteUser( request, editor.id );
			await setMcpAbilitiesEnabled( true );
		}
	} );

	test( 'ED-25734 every MCP write returns an undo_revision_id that restores and re-applies the change', async ( { request, baseURL, browser } ) => {
		test.fixme( true, 'Blocked: manage-elements on a published page sometimes returns no undo_revision_id in CI, which breaks this AC. Needs a bug ticket.' );

		const postId = await createPage( mcp, 'MCP undo' );
		const base = await buildComposition( mcp, {
			post_id: postId,
			xml_structure: '<e-div-block configuration-id="wrap"><e-heading configuration-id="title"></e-heading></e-div-block>',
			element_config: { title: { title: 'Original heading' } },
		} );
		const headingId = resolvedIds( base ).title;

		await publish( mcp, postId );

		const edit = await mcp.callToolOrThrow( 'elementor/manage-elements', {
			post_id: postId,
			operations: [ { action: 'update', element_id: headingId, settings: { title: 'Changed by MCP' } } ],
		} );
		const composition = await buildComposition( mcp, {
			post_id: postId,
			xml_structure: '<e-heading configuration-id="added"></e-heading>',
			element_config: { added: { title: 'Added by MCP' } },
		} );

		await test.step( 'Each write returns an undo_revision_id', async () => {
			for ( const result of [ edit, composition ] ) {
				expect( Number( result.undo_revision_id ) ).toBeGreaterThan( 0 );
			}
		} );

		const restore = await mcp.callToolOrThrow( 'elementor/manage-revisions', { action: 'restore', post_id: postId, revision_id: edit.undo_revision_id } );
		await publish( mcp, postId );

		await test.step( 'Restoring the first undo point brings back the page from before the first call', async () => {
			const html = await getFrontendHtml( request, baseURL, postId );

			expect( html ).toContain( 'Original heading' );
			expect( html ).not.toContain( 'Changed by MCP' );
			expect( html ).not.toContain( 'Added by MCP' );

			const { context, page } = await openEditor( browser, baseURL, postId );
			const frame = page.frameLocator( '#elementor-preview-iframe' );

			await expect( frame.getByText( 'Original heading' ) ).toBeVisible();
			await expect( frame.getByText( 'Added by MCP' ) ).toHaveCount( 0 );
			await context.close();
		} );

		await test.step( 'Redo re-applies the changes', async () => {
			expect( Number( restore.undo_revision_id ) ).toBeGreaterThan( 0 );

			await mcp.callToolOrThrow( 'elementor/manage-revisions', { action: 'restore', post_id: postId, revision_id: restore.undo_revision_id } );
			await publish( mcp, postId );

			// Checked in the editor: the frontend keeps the element cache from the previous render after a restore (see the fixme below).
			const { context, page } = await openEditor( browser, baseURL, postId );
			const frame = page.frameLocator( '#elementor-preview-iframe' );

			await expect( frame.getByText( 'Changed by MCP' ) ).toBeVisible();
			await expect( frame.getByText( 'Added by MCP' ) ).toBeVisible();
			await context.close();
		} );
	} );

	test( 'ED-26100 the frontend shows a restored revision after publish', async ( { request, baseURL } ) => {
		test.fixme( true, 'Blocked: manage-elements on a published page sometimes returns no undo_revision_id in CI (also hit ED-25734), so there is nothing to restore. Needs a bug ticket.' );

		const postId = await createPage( mcp, 'MCP restore cache' );
		const base = await buildComposition( mcp, { post_id: postId, xml_structure: '<e-heading configuration-id="t"></e-heading>', element_config: { t: { title: 'Original heading' } } } );

		await publish( mcp, postId );

		const edit = await mcp.callToolOrThrow( 'elementor/manage-elements', {
			post_id: postId,
			operations: [ { action: 'update', element_id: resolvedIds( base ).t, settings: { title: 'Changed by MCP' } } ],
		} );

		await publish( mcp, postId );
		expect( await getFrontendHtml( request, baseURL, postId ) ).toContain( 'Changed by MCP' );

		await mcp.callToolOrThrow( 'elementor/manage-revisions', { action: 'restore', post_id: postId, revision_id: edit.undo_revision_id } );
		await publish( mcp, postId );

		const html = await getFrontendHtml( request, baseURL, postId );

		expect( html ).toContain( 'Original heading' );
		expect( html ).not.toContain( 'Changed by MCP' );
	} );

	test( 'ED-26037 restoring an undo point also reverts Page Settings added after it', async ( { request, baseURL } ) => {
		test.fixme( true, 'ED-26037: restore copies only the meta stored in the revision, so Page Settings the undo point did not have are kept.' );

		const postId = await createPage( mcp, 'MCP undo page settings' );

		await buildComposition( mcp, { post_id: postId, xml_structure: '<e-heading configuration-id="t"></e-heading>', element_config: { t: { title: 'Page settings undo' } } } );
		await publish( mcp, postId );

		const settings = await mcp.callToolOrThrow( 'elementor/update-page-settings', { post_id: postId, settings: { hide_title: 'yes' } } );

		expect( Number( settings.undo_revision_id ) ).toBeGreaterThan( 0 );
		await publish( mcp, postId );
		expect( await getFrontendHtml( request, baseURL, postId ) ).not.toMatch( /class="[^"]*entry-title/ );

		await mcp.callToolOrThrow( 'elementor/manage-revisions', { action: 'restore', post_id: postId, revision_id: settings.undo_revision_id } );
		await publish( mcp, postId );

		expect( await getFrontendHtml( request, baseURL, postId ) ).toMatch( /class="[^"]*entry-title/ );
	} );

	test( 'ED-25698 editor_settings.name renames V3 and V4 layers in the Structure panel without changing content', async ( { request, baseURL, browser } ) => {
		const postId = await createPage( mcp, 'MCP layer names' );

		await setElementorData( postId, [ {
			id: 'a1b2c3d',
			elType: 'container',
			isInner: false,
			settings: {},
			elements: [ { id: 'd4e5f6a', elType: 'widget', widgetType: 'heading', settings: { title: 'V3 heading text' }, elements: [] } ],
		} ] );

		const v4 = await buildComposition( mcp, {
			post_id: postId,
			xml_structure: '<e-div-block configuration-id="v4-wrap"><e-heading configuration-id="v4-title"></e-heading></e-div-block>',
			element_config: { 'v4-title': { title: 'V4 heading text' } },
		} );
		const v4HeadingId = resolvedIds( v4 )[ 'v4-title' ];

		const rename = await mcp.callToolOrThrow( 'elementor/manage-elements', {
			post_id: postId,
			operations: [
				{ action: 'update', element_id: 'd4e5f6a', editor_settings: { name: 'Hero title' } },
				{ action: 'update', element_id: v4HeadingId, editor_settings: { name: 'Hero title' } },
			],
		} );

		expect( ( rename.results as { status: string }[] ).map( ( item ) => item.status ) ).toEqual( [ 'ok', 'ok' ] );
		await publish( mcp, postId );

		const { context, page } = await openEditor( browser, baseURL, postId );

		await test.step( 'Both layers are listed as "Hero title" in the Structure panel', async () => {
			await page.locator( EditorSelectors.panels.navigator.footerButton ).click();

			for ( const elementId of [ 'd4e5f6a', v4HeadingId ] ) {
				await expect( page.locator( EditorSelectors.panels.navigator.getElementItem( elementId ) ) ).toContainText( 'Hero title' );
			}
		} );

		await test.step( 'The heading text is unchanged on canvas and frontend', async () => {
			const frame = page.frameLocator( '#elementor-preview-iframe' );

			await expect( frame.getByText( 'V3 heading text' ) ).toBeVisible();
			await expect( frame.getByText( 'V4 heading text' ) ).toBeVisible();

			const html = await getFrontendHtml( request, baseURL, postId );

			expect( html ).toContain( 'V3 heading text' );
			expect( html ).toContain( 'V4 heading text' );
			expect( html ).not.toContain( 'Hero title' );
		} );

		await context.close();
	} );

	test( 'ED-25735 a decorative container has no editor min-height or drop placeholder', async ( { baseURL, browser } ) => {
		const postId = await createPage( mcp, 'MCP decorative containers' );
		const result = await buildComposition( mcp, {
			post_id: postId,
			xml_structure: '<e-div-block configuration-id="decorative"></e-div-block><e-div-block configuration-id="normal"></e-div-block>',
			editor_settings: { decorative: { decorative: true } },
		} );
		const ids = resolvedIds( result );
		const { context, page } = await openEditor( browser, baseURL, postId );
		const frame = page.frameLocator( '#elementor-preview-iframe' );
		const decorative = frame.locator( `[data-id="${ ids.decorative }"]` );
		const normal = frame.locator( `[data-id="${ ids.normal }"]` );

		await expect( normal ).toBeVisible();

		await test.step( 'The decorative container has no 120px min-height and no placeholder', async () => {
			expect( await decorative.evaluate( ( el ) => getComputedStyle( el ).minHeight ) ).not.toBe( '120px' );
			expect( ( await decorative.boundingBox() )?.height ?? 0 ).toBeLessThan( 120 );
			// The add-element placeholder stays in the DOM but collapses (about 2px) instead of the 120px drop area.
			expect( ( await decorative.locator( '.elementor-first-add' ).boundingBox() )?.height ?? 0 ).toBeLessThan( 5 );
		} );

		await test.step( 'The normal empty container keeps its placeholder', async () => {
			expect( await normal.evaluate( ( el ) => getComputedStyle( el ).minHeight ) ).toBe( '120px' );
			await expect( normal.locator( '.elementor-empty-view' ) ).toBeAttached();
		} );

		await context.close();
	} );

	test( 'ED-25700 the agent can list and toggle experiments, including the Atomic Editor', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const name = 'e_font_icon_svg';

		try {
			const list = await mcp.callToolOrThrow( 'elementor/list-experiments' );

			expect( ( list.experiments as { name: string }[] ).map( ( item ) => item.name ) ).toContain( name );

			for ( const [ action, state ] of [ [ 'activate', 'active' ], [ 'deactivate', 'inactive' ], [ 'reset', 'default' ] ] ) {
				await test.step( `${ action } → ${ state } on the Features page`, async () => {
					await mcp.callToolOrThrow( 'elementor/manage-experiments', { action, name } );
					expect( await getExperimentStateOnFeaturesPage( wpAdmin, name ) ).toBe( state );
				} );
			}

			await test.step( 'The Atomic Editor can be turned off and on', async () => {
				await mcp.callToolOrThrow( 'elementor/manage-experiments', { action: 'disable_atomic_editor' } );
				const enabled = await mcp.callToolOrThrow( 'elementor/manage-experiments', { action: 'enable_atomic_editor' } );

				expect( ( enabled.atomic_editor as { active: boolean } ).active ).toBe( true );
				expect( await getExperimentStateOnFeaturesPage( wpAdmin, 'e_atomic_elements' ) ).toBe( 'active' );
			} );

			await test.step( 'An unknown experiment name returns an error and changes nothing', async () => {
				const before = await mcp.callToolOrThrow( 'elementor/list-experiments' );
				const result = await mcp.callTool( 'elementor/manage-experiments', { action: 'activate', name: 'not-real' } );
				const after = await mcp.callToolOrThrow( 'elementor/list-experiments' );

				expect( result.isError ).toBe( true );
				expect( after ).toEqual( before );
			} );
		} finally {
			await wpCli( 'wp elementor experiments activate e_atomic_elements' );
		}
	} );

	test( 'ED-25023 S1 find-icons result set on an e-svg renders the same inline SVG as a manual pick', async ( { request, baseURL, browser } ) => {
		const found = await mcp.callToolOrThrow( 'elementor/find-icons', { queries: [ 'arrow' ] } );
		const icon = ( found.results as { matches: { value: string; library: string; name: string; label: string }[] }[] )[ 0 ].matches[ 0 ];
		const postId = await createPage( mcp, 'MCP icon' );
		const result = await buildComposition( mcp, {
			post_id: postId,
			xml_structure: '<e-svg configuration-id="icon"></e-svg>',
			element_config: { icon: { svg: { value: icon.value, library: icon.library } } },
		} );
		const svgId = resolvedIds( result ).icon;

		await publish( mcp, postId );

		const { context, page } = await openEditor( browser, baseURL, postId );
		const editorSvg = page.frameLocator( '#elementor-preview-iframe' ).locator( `[data-id="${ svgId }"] svg` );

		await expect( editorSvg ).toBeVisible();

		const mcpMarkup = await editorSvg.evaluate( ( el ) => el.innerHTML );
		const frontendHtml = await getFrontendHtml( request, baseURL, postId );

		expect( frontendHtml ).toContain( mcpMarkup.slice( 0, 80 ) );

		await test.step( 'Picking the same icon in the icon library gives the same markup', async () => {
			await page.evaluate( ( id ) => {
				const { $e, elementor } = window as unknown as { $e: { run: ( command: string, args: object ) => void }, elementor: { getContainer: ( elementId: string ) => object } };

				$e.run( 'document/elements/select', { container: elementor.getContainer( id ) } );
			}, svgId );
			await page.getByTestId( 'svg-media-control-container' ).hover();
			await page.getByRole( 'button', { name: 'Icon library' } ).click();

			const popover = page.locator( '#icon-library' );

			await popover.getByPlaceholder( 'Search' ).fill( icon.name );
			await popover.getByRole( 'button', { name: 'Switch to list view' } ).click();
			await popover.getByRole( 'option', { name: icon.label } ).first().click();
			await expect( popover ).toBeHidden();

			await expect( editorSvg ).toBeVisible();
			expect( await editorSvg.evaluate( ( el ) => el.innerHTML ) ).toBe( mcpMarkup );
		} );

		await context.close();
	} );

	test( 'ED-25808 S1 build-composition marks the open editor; class tools do not', async ( { baseURL, browser } ) => {
		const postId = await createPage( mcp, 'MCP editor sync' );

		await buildComposition( mcp, { post_id: postId, xml_structure: '<e-heading configuration-id="t"></e-heading>', element_config: { t: { title: 'Before' } } } );

		const { context, page } = await openEditor( browser, baseURL, postId );

		await test.step( 'build-composition has no destructive confirmation hint', async () => {
			// Global tools such as manage-classes stay destructive on purpose (see test-ability-annotations.php).
			const tool = ( await mcp.listTools() ).find( ( item ) => 'elementor-build-composition' === item.name ) as { annotations?: { destructiveHint?: boolean } };

			expect( tool.annotations?.destructiveHint ).not.toBe( true );
		} );

		await test.step( 'build-composition shows "Page Updated by AI" in the open editor', async () => {
			// The editor takes its sync time from the first heartbeat after load; let that happen before the AI change.
			await triggerHeartbeat( page );
			await page.waitForFunction( () => ! ( window as unknown as { elementor: { heartbeat?: { pendingSyncTime?: boolean } } } ).elementor.heartbeat?.pendingSyncTime );
			// Both mutated_at and the sync time are whole seconds.
			await page.waitForTimeout( 1100 );
			await buildComposition( mcp, { post_id: postId, xml_structure: '<e-heading configuration-id="t2"></e-heading>', element_config: { t2: { title: 'After' } } } );
			await triggerHeartbeat( page );
			await expect( page.getByText( AI_UPDATE_DIALOG ) ).toBeVisible( { timeout: 30000 } );
		} );

		await test.step( 'manage-classes does not show the modal', async () => {
			await page.reload( { waitUntil: 'domcontentloaded' } );
			await waitForEditorReady( page );

			const classes = await mcp.callToolOrThrow( 'elementor/manage-classes', { operations: [ { action: 'create', label: `mcp-sync-${ postId }`, css: 'color: red;' } ] } );

			expect( classes.status ).toBe( 'ok' );
			await triggerHeartbeat( page );
			await page.waitForTimeout( 5000 );
			await expect( page.getByText( AI_UPDATE_DIALOG ) ).toHaveCount( 0 );
		} );

		await context.close();
	} );

	test( 'ED-25808 S2 build-composition is blocked with 409 while another user has unsaved changes', async ( { baseURL, browser, apiRequests, request } ) => {
		const postId = await createPage( mcp, 'MCP lock' );

		await buildComposition( mcp, { post_id: postId, xml_structure: '<e-heading configuration-id="t"></e-heading>', element_config: { t: { title: 'Locked content' } } } );

		const editor = await createEditorUser( apiRequests, request );
		const { context, page } = await openEditor( browser, baseURL, postId, editor );

		try {
			// A real edit; flipping the modified flag alone does not make the heartbeat report unsaved changes.
			await page.evaluate( () => {
				const { $e, elementor } = window as unknown as { $e: { run: ( command: string, args: object ) => void }, elementor: { getPreviewContainer: () => object } };

				$e.run( 'document/elements/create', { container: elementor.getPreviewContainer(), model: { elType: 'container' } } );
			} );

			const heartbeat = page.waitForRequest( ( req ) => req.url().includes( 'admin-ajax.php' ) && ( req.postData() ?? '' ).includes( 'elementor_has_unsaved%5D=' + postId ) );

			await triggerHeartbeat( page );
			await heartbeat;

			const before = await mcp.callToolOrThrow( 'elementor/get-page-structure', { post_id: postId } );
			const result = await mcp.callTool( 'elementor/build-composition', { post_id: postId, xml_structure: '<e-heading configuration-id="x"></e-heading>' } );
			const after = await mcp.callToolOrThrow( 'elementor/get-page-structure', { post_id: postId } );

			expect( result.isError ).toBe( true );
			expect( result.text ).toMatch( /unsaved changes|409/i );
			expect( after ).toEqual( before );
		} finally {
			await context.close();
			await apiRequests.deleteUser( request, editor.id );
		}
	} );

	test( 'ED-25589 list-widget-schemas no longer offers e-flexbox; existing e-flexbox pages still render', async ( { request, baseURL, browser } ) => {
		const result = await mcp.callToolOrThrow( 'elementor/list-widget-schemas', { summary: true } );

		expect( ( result.widgets as { type: string }[] ).map( ( widget ) => widget.type ) ).not.toContain( 'e-flexbox' );

		const postId = await createPage( mcp, 'Existing e-flexbox' );

		await setElementorData( postId, [ {
			id: 'f1e2d3c',
			elType: 'e-flexbox',
			isInner: false,
			settings: {},
			elements: [ { id: 'b4a5c6d', elType: 'widget', widgetType: 'e-heading', settings: { title: { $$type: 'string', value: 'Inside a flexbox' } }, elements: [] } ],
		} ] );

		expect( await getFrontendHtml( request, baseURL, postId ) ).toContain( 'Inside a flexbox' );

		const { context, page } = await openEditor( browser, baseURL, postId );

		await expect( page.frameLocator( '#elementor-preview-iframe' ).locator( '[data-id="f1e2d3c"]' ) ).toBeVisible();
		await expect( page.frameLocator( '#elementor-preview-iframe' ).getByText( 'Inside a flexbox' ) ).toBeVisible();
		await context.close();
	} );

	test( 'ED-25848 S1 the MCP admin page asks for approval and closing it registers nothing', async ( { page, request, baseURL } ) => {
		await setMcpAbilitiesEnabled( false );

		await page.goto( '/wp-admin/admin.php?page=elementor-mcp' );
		await expect( page.getByText( /capabilities available to connected AI agents/ ) ).toBeVisible();
		await expect( page.getByRole( 'button', { name: 'Enable Elementor capabilities' } ) ).toBeVisible();
		await expect( page.getByText( /revoke access at any time/ ) ).toBeVisible();
		await page.goto( '/wp-admin/' );

		const client = await McpClient.connect( request, baseURL );
		const elementorTools = ( await client.listTools() ).map( ( tool ) => tool.name ).filter( ( name ) => name.startsWith( 'elementor-' ) );

		expect( elementorTools ).toEqual( [ 'elementor-enable-elementor-abilities' ] );
	} );

	test( 'ED-25848 S2 approving registers the abilities on the default server', async ( { page, request, baseURL } ) => {
		await setMcpAbilitiesEnabled( false );

		await page.goto( '/wp-admin/admin.php?page=elementor-mcp' );
		await page.getByRole( 'button', { name: 'Enable Elementor capabilities' } ).click();
		await expect( page.getByRole( 'button', { name: 'Enable Elementor capabilities' } ) ).toHaveCount( 0, { timeout: 15000 } );

		const client = await McpClient.connect( request, baseURL );
		const names = ( await client.listTools() ).map( ( tool ) => tool.name );

		expect( names ).toContain( 'elementor-build-composition' );
		expect( names ).not.toContain( 'elementor-enable-elementor-abilities' );
	} );

	test( 'ED-26036 an AI change made right after the editor opens shows "Page Updated by AI"', async ( { baseURL, browser } ) => {
		const postId = await createPage( mcp, 'MCP early AI change' );

		await buildComposition( mcp, { post_id: postId, xml_structure: '<e-heading configuration-id="t"></e-heading>', element_config: { t: { title: 'Before' } } } );
		await publish( mcp, postId );

		const { context, page } = await openEditor( browser, baseURL, postId );

		// No heartbeat wait here (unlike ED-25808 S1): the change lands before the editor has its sync time.
		await buildComposition( mcp, { post_id: postId, xml_structure: '<e-heading configuration-id="t2"></e-heading>', element_config: { t2: { title: 'After' } } } );
		await publish( mcp, postId );
		await triggerHeartbeat( page );
		await triggerHeartbeat( page );

		await expect( page.getByText( AI_UPDATE_DIALOG ) ).toBeVisible( { timeout: 30000 } );
		await context.close();
	} );
} );
