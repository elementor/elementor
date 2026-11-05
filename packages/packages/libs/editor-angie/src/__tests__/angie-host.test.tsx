import { AngieInteractionMode, AngieMcpSdk } from '@elementor-external/angie-sdk';

import { bootAngieSdk, resetAngieSdkForTests } from '../boot-angie-sdk';
import { init } from '../init';
import { openAngie, registerAngiePanelOpener, resetAngiePanelOpenerForTests } from '../open-angie';

const mockLoadSidebarV2 = jest.fn();
const mockTriggerAngie = jest.fn();
const mockSetAngieInteractionMode = jest.fn();
const mockToggleAngieSidebar = jest.fn();

jest.mock( '@elementor-external/angie-sdk', () => ( {
	AngieMcpSdk: jest.fn().mockImplementation( () => ( {
		loadSidebarV2: ( ...args: unknown[] ) => mockLoadSidebarV2( ...args ),
		triggerAngie: ( ...args: unknown[] ) => mockTriggerAngie( ...args ),
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
		document.body.innerHTML = '';
		mockLoadSidebarV2.mockResolvedValue( undefined );
		mockTriggerAngie.mockResolvedValue( { success: true, requestId: '1' } );
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
	} );

	it( 'retries after a failed boot', async () => {
		mockLoadSidebarV2.mockRejectedValueOnce( new Error( 'fail' ) );

		await expect( bootAngieSdk() ).rejects.toThrow( 'fail' );

		await bootAngieSdk();

		expect( AngieMcpSdkMock ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'opens Angie with the prompt and mode', async () => {
		const openPanel = jest.fn();
		registerAngiePanelOpener( openPanel );

		await openAngie( 'Write a heading', AngieInteractionMode.ASK );

		expect( openPanel ).toHaveBeenCalledTimes( 1 );
		expect( mockSetAngieInteractionMode ).toHaveBeenCalledWith( 'ask' );
		expect( mockTriggerAngie ).toHaveBeenCalledWith( {
			prompt: 'Write a heading',
			context: { source: 'elementor-editor' },
		} );
	} );

	it( 'does not boot the SDK when the library initializes', () => {
		init();

		expect( AngieMcpSdkMock ).not.toHaveBeenCalled();
	} );
} );
