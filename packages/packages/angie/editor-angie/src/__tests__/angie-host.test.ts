import { AngieInteractionMode, AngieMcpSdk } from '@elementor-external/angie-sdk';

import { bootAngieSdk, resetAngieSdkForTests } from '../boot-angie-sdk';
import { resetHelpCenterAbilityForTests } from '../help-center-ability';
import { init } from '../init';
import { openAngie, registerAngiePanelOpener, resetAngiePanelOpenerForTests } from '../open-angie';

const mockLoadSidebarV2 = jest.fn();
const mockTriggerAngie = jest.fn();
const mockWaitForReady = jest.fn();
const mockRegisterLocalServer = jest.fn();
const mockSetAngieInteractionMode = jest.fn();
const mockToggleAngieSidebar = jest.fn();
const mockGetAngieIframe = jest.fn();
const mockSdkState = {
	pluginInstalled: false,
};
const mockWpSearchMcpServer = jest.fn();

jest.mock( '@elementor-external/wp-search-mcp', () => ( {
	WpSearchMcpServer: class {
		server = { name: 'elementor-help-center' };

		constructor( config: unknown ) {
			mockWpSearchMcpServer( config );
		}
	},
} ) );

jest.mock( '@elementor-external/angie-sdk', () => ( {
	AngieMcpSdk: jest.fn().mockImplementation( () => ( {
		loadSidebarV2: ( ...args: unknown[] ) => mockLoadSidebarV2( ...args ),
		triggerAngie: ( ...args: unknown[] ) => mockTriggerAngie( ...args ),
		waitForReady: () => mockWaitForReady(),
		registerLocalServer: ( ...args: unknown[] ) => mockRegisterLocalServer( ...args ),
	} ) ),
	LAYOUT_SIDEBAR: 'sidebar',
	AngieInteractionMode: {
		ASK: 'ask',
		AGENT: 'agent',
		PLAN: 'plan',
		SUPER_ADMIN: 'super-admin',
	},
	setAngieInteractionMode: ( ...args: unknown[] ) => mockSetAngieInteractionMode( ...args ),
	toggleAngieSidebar: ( ...args: unknown[] ) => mockToggleAngieSidebar( ...args ),
	isAngiePluginAvailable: () => mockSdkState.pluginInstalled,
	getAngieIframe: () => mockGetAngieIframe(),
} ) );

const AngieMcpSdkMock = AngieMcpSdk as jest.Mock;

const mountIframe = () => {
	const container = document.createElement( 'div' );
	container.id = 'elementor-editor-angie';
	const iframe = document.createElement( 'iframe' );
	container.append( iframe );
	document.body.append( container );

	return iframe;
};

describe( 'editor angie host', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		resetAngieSdkForTests();
		resetAngiePanelOpenerForTests();
		resetHelpCenterAbilityForTests();
		delete window.elementorEditorAngie;
		window.location.hash = '';
		mockSdkState.pluginInstalled = false;
		mockGetAngieIframe.mockReturnValue( null );
		Reflect.deleteProperty( window, 'toggleAngieSidebar' );
		document.body.innerHTML = '';
		mockLoadSidebarV2.mockResolvedValue( undefined );
		mockTriggerAngie.mockResolvedValue( { success: true, requestId: '1' } );
		mockRegisterLocalServer.mockResolvedValue( undefined );
		mockWaitForReady.mockResolvedValue( undefined );
	} );

	it( 'boots one SDK and opens the iframe it created', async () => {
		const iframe = mountIframe();
		mockGetAngieIframe.mockReturnValue( iframe );

		await bootAngieSdk();
		await bootAngieSdk();

		expect( AngieMcpSdkMock ).toHaveBeenCalledTimes( 1 );
		expect( mockLoadSidebarV2 ).toHaveBeenCalledWith( {
			host: {
				appId: 'elementor-editor-core',
				instanceId: 'elementor-editor-core',
			},
			container: {
				id: 'elementor-editor-angie',
				layout: 'sidebar',
				skipDefaultCss: true,
				persistOpenState: false,
				chatToggleButton: {
					enabled: false,
					selector: '',
				},
			},
		} );
		expect( mockToggleAngieSidebar ).toHaveBeenCalledWith( iframe, true );
		expect( mockWpSearchMcpServer ).toHaveBeenCalledWith( {
			url: 'https://elementor.com/help',
			server: {
				name: 'elementor-help-center',
				title: 'Elementor Help Center',
				version: '1.2.0',
			},
			postTypes: {
				post: 'posts',
				page: 'pages',
				videos: 'videos',
			},
		} );
		expect( mockRegisterLocalServer ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'keeps the SDK booted when the help-center ability fails to register', async () => {
		const consoleErrorSpy = jest.spyOn( console, 'error' ).mockImplementation( () => undefined );
		mockRegisterLocalServer.mockRejectedValueOnce( new Error( 'fail' ) );
		mountIframe();
		mockGetAngieIframe.mockReturnValue( document.querySelector( 'iframe' ) );

		const first = await bootAngieSdk();
		const second = await bootAngieSdk();

		expect( second ).toBe( first );
		expect( AngieMcpSdkMock ).toHaveBeenCalledTimes( 1 );
		expect( consoleErrorSpy ).toHaveBeenCalledWith(
			'Angie help-center ability registration failed:',
			expect.any( Error )
		);

		consoleErrorSpy.mockRestore();
	} );

	it( 'does not register the help-center ability when the Angie plugin is active', async () => {
		window.elementorEditorAngie = { isAngiePluginActive: true };
		mountIframe();
		mockGetAngieIframe.mockReturnValue( document.querySelector( 'iframe' ) );

		await bootAngieSdk();

		expect( mockWpSearchMcpServer ).not.toHaveBeenCalled();
		expect( mockRegisterLocalServer ).not.toHaveBeenCalled();
	} );

	it( 'fails boot when the Angie container is missing', async () => {
		await expect( bootAngieSdk() ).rejects.toThrow(
			/Angie container #elementor-editor-angie not found after 10 attempts/
		);

		expect( AngieMcpSdkMock ).not.toHaveBeenCalled();
	} );

	it( 'retries after a failed boot', async () => {
		mountIframe();
		mockGetAngieIframe.mockReturnValue( document.querySelector( 'iframe' ) );
		mockLoadSidebarV2.mockRejectedValueOnce( new Error( 'fail' ) );

		await expect( bootAngieSdk() ).rejects.toThrow( 'fail' );

		await bootAngieSdk();

		expect( AngieMcpSdkMock ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'opens the Core SDK in the docked panel when the plugin is inactive', async () => {
		const openPanel = jest.fn();
		registerAngiePanelOpener( openPanel );
		mountIframe();
		mockGetAngieIframe.mockReturnValueOnce( null );

		await openAngie( {
			prompt: 'Write a heading',
			mode: AngieInteractionMode.ASK,
			sdk: {
				options: { newChat: true },
			},
		} );

		expect( openPanel ).toHaveBeenCalledTimes( 1 );
		expect( mockSetAngieInteractionMode ).toHaveBeenCalledWith( 'ask' );
		expect( mockTriggerAngie ).toHaveBeenCalledWith( {
			prompt: 'Write a heading',
			context: { source: 'elementor-editor-core' },
			options: { newChat: true },
		} );
	} );

	it( 'waits for the SDK to be ready before setting the mode and triggering the prompt', async () => {
		let resolveReady: () => void = () => {};
		mockWaitForReady.mockReturnValueOnce(
			new Promise< void >( ( resolve ) => {
				resolveReady = resolve;
			} )
		);

		mountIframe();

		const pending = openAngie( { prompt: 'Write a heading', mode: AngieInteractionMode.AGENT } );

		await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

		expect( mockWaitForReady ).toHaveBeenCalledTimes( 1 );
		expect( mockSetAngieInteractionMode ).not.toHaveBeenCalled();
		expect( mockTriggerAngie ).not.toHaveBeenCalled();

		resolveReady();
		await pending;

		expect( mockSetAngieInteractionMode ).toHaveBeenCalledWith( 'agent' );
		expect( mockTriggerAngie ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'falls back to the Core SDK when the plugin is active but the sidebar is not openable yet', async () => {
		const openPanel = jest.fn();
		registerAngiePanelOpener( openPanel );
		window.elementorEditorAngie = { isAngiePluginActive: true };
		mockGetAngieIframe.mockReturnValue( null );
		mountIframe();

		await openAngie( { prompt: 'Write a heading', mode: AngieInteractionMode.ASK } );

		expect( openPanel ).toHaveBeenCalledTimes( 1 );
		expect( mockTriggerAngie ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'opens the Angie plugin and leaves the Core SDK closed when the plugin is active', async () => {
		const openPanel = jest.fn();
		registerAngiePanelOpener( openPanel );
		const pluginIframe = document.createElement( 'iframe' );
		mockGetAngieIframe.mockReturnValue( pluginIframe );
		window.elementorEditorAngie = { isAngiePluginActive: true };

		await openAngie( {
			prompt: 'Help me with ',
			mode: AngieInteractionMode.PLAN,
			sdk: {
				context: { source: 'should-not-be-sent' },
			},
		} );

		expect( mockGetAngieIframe ).toHaveBeenCalledTimes( 1 );
		expect( mockToggleAngieSidebar ).toHaveBeenCalledWith( pluginIframe, true );
		expect( mockSetAngieInteractionMode ).toHaveBeenCalledWith( 'plan' );
		expect( window.location.hash ).toBe( '#angie-prompt=Help%20me%20with%20' );
		expect( openPanel ).not.toHaveBeenCalled();
		expect( mockTriggerAngie ).not.toHaveBeenCalled();
		expect( AngieMcpSdkMock ).not.toHaveBeenCalled();
	} );

	it( 'opens the plugin sidebar with the prompt and mode when its container is already in the editor', async () => {
		const openPanel = jest.fn();
		const pluginToggle = jest.fn();
		const sidebar = document.createElement( 'div' );
		sidebar.id = 'angie-sidebar-container';
		document.body.append( sidebar );
		registerAngiePanelOpener( openPanel );
		window.toggleAngieSidebar = pluginToggle;

		await openAngie( { prompt: 'Write a heading', mode: AngieInteractionMode.ASK } );

		expect( pluginToggle ).toHaveBeenCalledWith( true );
		expect( mockSetAngieInteractionMode ).toHaveBeenCalledWith( 'ask' );
		expect( window.location.hash ).toBe( '#angie-prompt=Write%20a%20heading' );
		expect( openPanel ).not.toHaveBeenCalled();
		expect( mockTriggerAngie ).not.toHaveBeenCalled();
	} );

	it( 'opens the installed plugin sidebar instead of the SDK panel', async () => {
		const openPanel = jest.fn();
		const pluginToggle = jest.fn();
		const iframe = document.createElement( 'iframe' );
		const sidebar = document.createElement( 'div' );
		sidebar.id = 'angie-sidebar-container';
		document.body.append( sidebar );

		registerAngiePanelOpener( openPanel );
		mockSdkState.pluginInstalled = true;
		mockGetAngieIframe.mockReturnValue( iframe );
		window.toggleAngieSidebar = pluginToggle;

		await openAngie( { prompt: 'Write a heading', mode: AngieInteractionMode.ASK } );

		expect( pluginToggle ).toHaveBeenCalledWith( true );
		expect( mockToggleAngieSidebar ).toHaveBeenCalledWith( iframe, true );
		expect( openPanel ).not.toHaveBeenCalled();
		expect( mockTriggerAngie ).not.toHaveBeenCalled();
	} );

	it( 'does not boot the SDK when the library initializes', () => {
		init();

		expect( AngieMcpSdkMock ).not.toHaveBeenCalled();
	} );
} );
