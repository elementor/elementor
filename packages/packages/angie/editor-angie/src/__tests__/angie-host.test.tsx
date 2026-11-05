import { AngieInteractionMode, AngieMcpSdk } from '@elementor-external/angie-sdk';

import { bootAngieSdk, resetAngieSdkForTests } from '../boot-angie-sdk';
import { resetHelpCenterAbilityForTests } from '../help-center-ability';
import { init } from '../init';
import { openAngie, registerAngiePanelOpener, resetAngiePanelOpenerForTests } from '../open-angie';

const mockLoadSidebarV2 = jest.fn();
const mockTriggerAngie = jest.fn();
const mockRegisterLocalServer = jest.fn();
const mockSetAngieInteractionMode = jest.fn();
const mockToggleAngieSidebar = jest.fn();
const mockGetAngieIframe = jest.fn();
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
	getAngieIframe: () => mockGetAngieIframe(),
	MessageEventType: {
		SDK_TRIGGER_ANGIE: 'sdk-trigger-angie',
	},
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
		document.body.innerHTML = '';
		mockLoadSidebarV2.mockResolvedValue( undefined );
		mockTriggerAngie.mockResolvedValue( { success: true, requestId: '1' } );
		mockRegisterLocalServer.mockResolvedValue( undefined );
	} );

	it( 'boots one SDK and opens the iframe it created', async () => {
		const iframe = mountIframe();

		await bootAngieSdk();
		await bootAngieSdk();

		expect( AngieMcpSdkMock ).toHaveBeenCalledTimes( 1 );
		expect( mockLoadSidebarV2 ).toHaveBeenCalledWith( {
			host: { appId: 'elementor-editor' },
			container: {
				id: 'elementor-editor-angie',
				layout: 'sidebar',
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

	it( 'does not register the help-center ability when the Angie plugin is active', async () => {
		window.elementorEditorAngie = { isAngiePluginActive: true };

		await bootAngieSdk();

		expect( mockWpSearchMcpServer ).not.toHaveBeenCalled();
		expect( mockRegisterLocalServer ).not.toHaveBeenCalled();
	} );

	it( 'retries after a failed boot', async () => {
		mockLoadSidebarV2.mockRejectedValueOnce( new Error( 'fail' ) );

		await expect( bootAngieSdk() ).rejects.toThrow( 'fail' );

		await bootAngieSdk();

		expect( AngieMcpSdkMock ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'opens the Core SDK in the docked panel when the plugin is inactive', async () => {
		const openPanel = jest.fn();
		registerAngiePanelOpener( openPanel );

		await openAngie( {
			prompt: 'Write a heading',
			mode: AngieInteractionMode.ASK,
			sdk: {
				options: { newChat: true },
			},
		} );

		expect( openPanel ).toHaveBeenCalledTimes( 1 );
		expect( mockGetAngieIframe ).not.toHaveBeenCalled();
		expect( mockSetAngieInteractionMode ).toHaveBeenCalledWith( 'ask' );
		expect( mockTriggerAngie ).toHaveBeenCalledWith( {
			prompt: 'Write a heading',
			context: { source: 'elementor-editor' },
			options: { newChat: true },
		} );
	} );

	it( 'opens the Angie plugin and leaves the Core SDK closed when the plugin is active', async () => {
		const openPanel = jest.fn();
		registerAngiePanelOpener( openPanel );
		const pluginIframe = document.createElement( 'iframe' );
		pluginIframe.src = 'https://angie.example/angie/';
		const postMessage = jest.fn();
		Object.defineProperty( pluginIframe, 'contentWindow', {
			configurable: true,
			value: { postMessage },
		} );
		mockGetAngieIframe.mockReturnValue( pluginIframe );
		window.elementorEditorAngie = { isAngiePluginActive: true };

		await openAngie( {
			prompt: 'Help me with ',
			mode: AngieInteractionMode.PLAN,
			sdk: {
				context: { source: 'should-not-be-sent' },
			},
		} );

		expect( mockToggleAngieSidebar ).toHaveBeenCalledWith( pluginIframe, true );
		expect( mockSetAngieInteractionMode ).toHaveBeenCalledWith( 'plan' );
		expect( postMessage ).toHaveBeenCalledWith(
			{
				type: 'sdk-trigger-angie',
				payload: {
					prompt: 'Help me with ',
				},
			},
			'https://angie.example'
		);
		expect( window.location.hash ).toBe( '' );
		expect( openPanel ).not.toHaveBeenCalled();
		expect( mockTriggerAngie ).not.toHaveBeenCalled();
	} );

	it( 'does not boot the SDK when the library initializes', () => {
		init();

		expect( AngieMcpSdkMock ).not.toHaveBeenCalled();
	} );
} );
