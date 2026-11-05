import { AngieInteractionMode, AngieMcpSdk } from '@elementor-external/angie-sdk';

import { bootAngieSdk, resetAngieSdkForTests } from '../boot-angie-sdk';
import { helpCenterAbility, resetHelpCenterAbilityForTests } from '../help-center-ability';
import { init } from '../init';
import { openAngie } from '../open-angie';

const mockLoadSidebarV2 = jest.fn();
const mockTriggerAngie = jest.fn();
const mockSetAngieInteractionMode = jest.fn();
const mockToggleAngieSidebar = jest.fn();
const mockOpenAngieInAskMode = jest.fn();

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

jest.mock( '@elementor/editor-mcp', () => ( {
  openAngieInAskMode: ( ...args: unknown[] ) => mockOpenAngieInAskMode( ...args ),
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
    resetHelpCenterAbilityForTests();
    delete window.elementorEditorAngie;
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

  it( 'opens the Core SDK with common properties and SDK-only options', async () => {
    const registerSpy = jest.spyOn( helpCenterAbility, 'register' );

    await openAngie( {
      prompt: 'Write a heading',
      mode: AngieInteractionMode.ASK,
      sdk: {
        options: { newChat: true },
      },
    } );

    expect( mockOpenAngieInAskMode ).not.toHaveBeenCalled();
    expect( registerSpy ).toHaveBeenCalledTimes( 1 );
    expect( mockSetAngieInteractionMode ).toHaveBeenCalledWith( 'ask' );
    expect( mockTriggerAngie ).toHaveBeenCalledWith( {
      prompt: 'Write a heading',
      context: { source: 'elementor-editor' },
      options: { newChat: true },
    } );

    registerSpy.mockRestore();
  } );

  it( 'opens the Angie plugin when it is active and does not register the help-center ability', async () => {
    const registerSpy = jest.spyOn( helpCenterAbility, 'register' );
    window.elementorEditorAngie = {
      isAngiePluginActive: true,
    };

    await openAngie( {
      prompt: 'Help me with ',
      mode: AngieInteractionMode.PLAN,
      sdk: {
        context: { source: 'should-not-be-sent' },
      },
    } );

    expect( mockOpenAngieInAskMode ).toHaveBeenCalledWith( 'Help me with ' );
    expect( mockSetAngieInteractionMode ).toHaveBeenCalledWith( 'plan' );
    expect( mockTriggerAngie ).not.toHaveBeenCalled();
    expect( registerSpy ).not.toHaveBeenCalled();

    registerSpy.mockRestore();
  } );

  it( 'registers the empty help-center ability once when the plugin is inactive', async () => {
    const registerSpy = jest.spyOn( helpCenterAbility, 'register' );

    init();
    await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );
    init();
    await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

    expect( registerSpy ).toHaveBeenCalledTimes( 1 );

    registerSpy.mockRestore();
  } );

  it( 'boots when the package initializes and reports a boot failure', async () => {
    const consoleErrorSpy = jest.spyOn( console, 'error' ).mockImplementation( () => undefined );
    mockLoadSidebarV2.mockRejectedValue( new Error( 'fail' ) );

    init();
    await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

    expect( AngieMcpSdkMock ).toHaveBeenCalledTimes( 1 );
    expect( consoleErrorSpy ).toHaveBeenCalledWith( 'Angie SDK boot failed:', expect.any( Error ) );

    consoleErrorSpy.mockRestore();
  } );
} );
