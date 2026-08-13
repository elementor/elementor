import {
  isNonceInvalidError,
  refreshAuditsNonce,
  SessionExpiredError,
  showSessionExpiredModal,
} from '../session-expiration';

describe( 'isNonceInvalidError', () => {
  it( 'returns true for a 403 rest_cookie_invalid_nonce error', () => {
    // Arrange.
    const error = { response: { status: 403, data: { code: 'rest_cookie_invalid_nonce' } } };

    // Act & Assert.
    expect( isNonceInvalidError( error ) ).toBe( true );
  } );

  it( 'returns false for a 403 with a different error code', () => {
    // Arrange.
    const error = { response: { status: 403, data: { code: 'rest_forbidden' } } };

    // Act & Assert.
    expect( isNonceInvalidError( error ) ).toBe( false );
  } );

  it( 'returns false for a non-403 status', () => {
    // Arrange.
    const error = { response: { status: 500, data: { code: 'rest_cookie_invalid_nonce' } } };

    // Act & Assert.
    expect( isNonceInvalidError( error ) ).toBe( false );
  } );

  it( 'returns false for errors without a response', () => {
    // Act & Assert.
    expect( isNonceInvalidError( new Error( 'network down' ) ) ).toBe( false );
    expect( isNonceInvalidError( null ) ).toBe( false );
    expect( isNonceInvalidError( undefined ) ).toBe( false );
  } );
} );

describe( 'refreshAuditsNonce', () => {
  const originalFetch = global.fetch;

  beforeEach( () => {
    ( window as unknown as { elementorAudits: unknown } ).elementorAudits = {
      restNamespace: 'elementor/v1',
      nonce: 'stale-nonce',
    };
    ( window as unknown as { elementorCommon?: unknown } ).elementorCommon = {
      ajax: { config: { url: 'https://example.test/wp-admin/admin-ajax.php' } },
    };
  } );

  afterEach( () => {
    global.fetch = originalFetch;
  } );

  it( 'requests a fresh nonce from the WP core rest-nonce ajax action', async () => {
    // Arrange.
    const fetchMock = jest
      .fn()
      .mockResolvedValue( { ok: true, text: () => Promise.resolve( 'fresh-nonce' ) } );
    global.fetch = fetchMock as unknown as typeof fetch;

    // Act.
    const nonce = await refreshAuditsNonce();

    // Assert.
    expect( nonce ).toBe( 'fresh-nonce' );
    const [ requestedUrl, requestOptions ] = fetchMock.mock.calls[ 0 ];
    expect( requestedUrl ).toBe( 'https://example.test/wp-admin/admin-ajax.php?action=rest-nonce' );
    expect( requestOptions ).toEqual( { credentials: 'same-origin' } );
  } );

  it( 'updates window.elementorAudits.nonce with the fresh nonce', async () => {
    // Arrange.
    global.fetch = jest.fn().mockResolvedValue( {
      ok: true,
      text: () => Promise.resolve( 'fresh-nonce' ),
    } ) as unknown as typeof fetch;

    // Act.
    await refreshAuditsNonce();

    // Assert.
    expect(
      ( window as unknown as { elementorAudits: { nonce: string } } ).elementorAudits.nonce
    ).toBe( 'fresh-nonce' );
  } );

  it( 'throws a SessionExpiredError when the ajax action returns "0"', async () => {
    // Arrange.
    global.fetch = jest.fn().mockResolvedValue( {
      ok: true,
      text: () => Promise.resolve( '0' ),
    } ) as unknown as typeof fetch;

    // Act & Assert.
    await expect( refreshAuditsNonce() ).rejects.toBeInstanceOf( SessionExpiredError );
  } );

  it( 'throws a SessionExpiredError when the ajax request fails', async () => {
    // Arrange.
    global.fetch = jest.fn().mockResolvedValue( {
      ok: false,
      text: () => Promise.resolve( '' ),
    } ) as unknown as typeof fetch;

    // Act & Assert.
    await expect( refreshAuditsNonce() ).rejects.toBeInstanceOf( SessionExpiredError );
  } );
} );

describe( 'showSessionExpiredModal', () => {
  it( 'triggers the WP core interim-login heartbeat event via jQuery', () => {
    // Arrange.
    const trigger = jest.fn();
    const jQueryMock = jest.fn().mockReturnValue( { trigger } );
    ( window as unknown as { jQuery?: unknown } ).jQuery = jQueryMock;

    // Act.
    showSessionExpiredModal();

    // Assert.
    expect( jQueryMock ).toHaveBeenCalledWith( document );
    expect( trigger ).toHaveBeenCalledWith( 'heartbeat-tick.wp-auth-check', [
      { 'wp-auth-check': false },
    ] );

    delete ( window as unknown as { jQuery?: unknown } ).jQuery;
  } );

  it( 'does not throw when jQuery is not available', () => {
    // Arrange.
    delete ( window as unknown as { jQuery?: unknown } ).jQuery;

    // Act & Assert.
    expect( () => showSessionExpiredModal() ).not.toThrow();
  } );
} );
