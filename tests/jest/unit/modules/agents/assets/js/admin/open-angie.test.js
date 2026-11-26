import {
	AngieMcpSdk,
	clearReferrerRedirect,
	isAngiePluginAvailable,
	waitForAngiePluginActive,
} from '@elementor-external/angie-sdk';
import {
	deliverPendingAngiePrompt,
	openAngieAfterInstall,
	openAngieWithPrompt,
} from 'elementor/modules/agents/assets/js/admin/scanner/open-angie';

const mockSdk = {
	loadSidebarV2: jest.fn( () => Promise.resolve() ),
	waitForReady: jest.fn( () => Promise.resolve() ),
	triggerAngie: jest.fn( () => Promise.resolve() ),
};

jest.mock( '@elementor-external/angie-sdk', () => ( {
	ANGIE_SIDEBAR_STATE_OPEN: 'open',
	AngieMcpSdk: jest.fn( () => mockSdk ),
	clearReferrerRedirect: jest.fn(),
	getAngieIframe: jest.fn( () => null ),
	isAngiePluginActive: jest.fn( () => false ),
	isAngiePluginAvailable: jest.fn( () => false ),
	LAYOUT_SIDEBAR: 'sidebar',
	saveState: jest.fn(),
	setReferrerRedirect: jest.fn(),
	toggleAngieSidebar: jest.fn(),
	waitForAngiePluginActive: jest.fn(),
} ) );

const PROMPT = 'Add your opening hours to structured data.';
const PENDING_PROMPT_STORAGE_KEY = 'elementor_agent_ready_pending_angie_prompt';
const AGENT_READY_PATH = '/wp-admin/admin.php?page=elementor-agents-ready';

const setLocation = ( search, hash = '' ) => {
	window.history.replaceState( {}, '', `${ AGENT_READY_PATH }${ search }${ hash }` );
};

describe( 'deliverPendingAngiePrompt', () => {
	beforeEach( () => {
		sessionStorage.clear();
		clearReferrerRedirect.mockClear();
		waitForAngiePluginActive.mockReset().mockResolvedValue( true );
		setLocation( '' );
	} );

	it( 'puts the stored prompt into Angie when returning from the activation redirect', async () => {
		// Arrange
		sessionStorage.setItem( PENDING_PROMPT_STORAGE_KEY, PROMPT );
		setLocation( '&open-angie=1' );

		// Act
		await deliverPendingAngiePrompt();

		// Assert
		expect( window.location.hash ).toBe( `#angie-prompt=${ encodeURIComponent( PROMPT ) }` );
		expect( sessionStorage.getItem( PENDING_PROMPT_STORAGE_KEY ) ).toBeNull();
		expect( clearReferrerRedirect ).toHaveBeenCalled();
	} );

	it( 'keeps the stored prompt when Angie is not ready in time', async () => {
		// Arrange
		sessionStorage.setItem( PENDING_PROMPT_STORAGE_KEY, PROMPT );
		setLocation( '&open-angie=1' );
		waitForAngiePluginActive.mockResolvedValue( false );

		// Act
		await deliverPendingAngiePrompt();

		// Assert
		expect( window.location.hash ).toBe( '' );
		expect( sessionStorage.getItem( PENDING_PROMPT_STORAGE_KEY ) ).toBe( PROMPT );
		expect( clearReferrerRedirect ).not.toHaveBeenCalled();
	} );

	it( 'does nothing on a normal page load', async () => {
		// Arrange
		sessionStorage.setItem( PENDING_PROMPT_STORAGE_KEY, PROMPT );

		// Act
		await deliverPendingAngiePrompt();

		// Assert
		expect( window.location.hash ).toBe( '' );
		expect( sessionStorage.getItem( PENDING_PROMPT_STORAGE_KEY ) ).toBe( PROMPT );
	} );

	it( 'leaves delivery to the Angie SDK when the prompt hash is already present', async () => {
		// Arrange
		sessionStorage.setItem( PENDING_PROMPT_STORAGE_KEY, PROMPT );
		setLocation( '&open-angie=1', '#angie-prompt=from-sdk' );

		// Act
		await deliverPendingAngiePrompt();

		// Assert
		expect( window.location.hash ).toBe( '#angie-prompt=from-sdk' );
	} );

	it( 'stores the prompt before leaving for the Angie app page', () => {
		// Arrange
		const assign = jest.fn();
		Object.defineProperty( window, 'location', { configurable: true, value: { ...window.location, assign } } );

		// Act
		openAngieAfterInstall( PROMPT, '/wp-admin/admin.php?page=angie-app' );

		// Assert
		expect( sessionStorage.getItem( PENDING_PROMPT_STORAGE_KEY ) ).toBe( PROMPT );
		expect( assign ).toHaveBeenCalledWith( '/wp-admin/admin.php?page=angie-app' );
	} );
} );

describe( 'openAngieWithPrompt', () => {
	beforeEach( () => {
		AngieMcpSdk.mockClear();
		Object.values( mockSdk ).forEach( ( mock ) => mock.mockClear() );
		isAngiePluginAvailable.mockReturnValue( false );
		setLocation( '' );
	} );

	it( 'boots the Core SDK sidebar once and sends each prompt when the Angie plugin is not on the page', async () => {
		// Act
		await openAngieWithPrompt( PROMPT );
		await openAngieWithPrompt( PROMPT );

		// Assert
		expect( mockSdk.loadSidebarV2 ).toHaveBeenCalledTimes( 1 );
		expect( mockSdk.loadSidebarV2 ).toHaveBeenCalledWith( expect.objectContaining( {
			container: expect.objectContaining( { create: true, layout: 'sidebar' } ),
		} ) );
		expect( mockSdk.triggerAngie ).toHaveBeenCalledTimes( 2 );
		expect( mockSdk.triggerAngie ).toHaveBeenCalledWith( expect.objectContaining( { prompt: PROMPT } ) );
	} );

	it( 'hands the prompt to the Angie plugin when it is available', async () => {
		// Arrange
		isAngiePluginAvailable.mockReturnValue( true );

		// Act
		await openAngieWithPrompt( PROMPT );

		// Assert
		expect( window.location.hash ).toContain( `angie-prompt=${ encodeURIComponent( PROMPT ) }` );
		expect( mockSdk.loadSidebarV2 ).not.toHaveBeenCalled();
	} );
} );
