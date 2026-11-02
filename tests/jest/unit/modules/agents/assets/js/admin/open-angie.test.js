import { clearReferrerRedirect, waitForAngiePluginActive } from '@elementor-external/angie-sdk';
import {
	deliverPendingAngiePrompt,
	openAngieAfterInstall,
} from 'elementor/modules/agents/assets/js/admin/scanner/open-angie';

jest.mock( '@elementor-external/angie-sdk', () => ( {
	ANGIE_SIDEBAR_STATE_OPEN: 'open',
	clearReferrerRedirect: jest.fn(),
	getAngieIframe: jest.fn( () => null ),
	isAngiePluginActive: jest.fn( () => false ),
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
