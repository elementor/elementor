import { AngieInteractionMode, AngieMcpSdk } from '@elementor-external/angie-sdk';

import { ANGIE_SIDEBAR_ACTIVE_BODY_CLASS, bootAngieSdk, resetAngieSdkForTests } from '../boot-angie-sdk';
import { init } from '../init';
import { openAngie } from '../open-angie';

const mockLoadSidebarV2 = jest.fn();
const mockTriggerAngie = jest.fn();
const mockWaitForReady = jest.fn();
const mockSetAngieInteractionMode = jest.fn();
const mockToggleAngieSidebar = jest.fn();
const mockGetAngieIframe = jest.fn();

jest.mock( '@elementor-external/angie-sdk', () => ( {
	AngieMcpSdk: jest.fn().mockImplementation( () => ( {
		loadSidebarV2: ( ...args: unknown[] ) => mockLoadSidebarV2( ...args ),
		triggerAngie: ( ...args: unknown[] ) => mockTriggerAngie( ...args ),
		waitForReady: () => mockWaitForReady(),
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
		document.body.innerHTML = '';
		mockGetAngieIframe.mockReturnValue( null );
		mockLoadSidebarV2.mockResolvedValue( undefined );
		mockTriggerAngie.mockResolvedValue( { success: true, requestId: '1' } );
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
				appId: 'elementor-editor',
				instanceId: 'elementor-editor',
			},
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
		expect( document.body ).not.toHaveClass( ANGIE_SIDEBAR_ACTIVE_BODY_CLASS );
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

	it( 'waits for the SDK to be ready before setting the mode and triggering the prompt', async () => {
		let resolveReady: () => void = () => {};
		mockWaitForReady.mockReturnValueOnce(
			new Promise< void >( ( resolve ) => {
				resolveReady = resolve;
			} )
		);

		mountIframe();
		mockGetAngieIframe.mockReturnValue( document.querySelector( 'iframe' ) );

		const pending = openAngie( 'Write a heading', AngieInteractionMode.AGENT );

		await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

		expect( mockWaitForReady ).toHaveBeenCalledTimes( 1 );
		expect( mockSetAngieInteractionMode ).not.toHaveBeenCalled();
		expect( mockTriggerAngie ).not.toHaveBeenCalled();

		resolveReady();
		await pending;

		expect( mockSetAngieInteractionMode ).toHaveBeenCalledWith( 'agent' );
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
