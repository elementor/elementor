import {
	appendSetupRefreshQueryParams,
	isConnectPromotionMissingUrl,
	isReloadDueToMissingConnectUrl,
	shouldReloadEditorAfterSetupStep,
} from '../pro-setup-editor-refresh';
import { PRO_SETUP_CONNECT_RELOAD_QUERY_PARAM, PRO_SETUP_OPEN_CONNECT_QUERY_PARAM } from '../pro-setup-query-params';

describe( 'pro-setup-editor-refresh', () => {
	describe( 'isConnectPromotionMissingUrl', () => {
		it( 'returns true when connect state has no connectUrl', () => {
			expect(
				isConnectPromotionMissingUrl( {
					state: 'connect',
				} )
			).toBe( true );
		} );

		it( 'returns false when connectUrl is present', () => {
			expect(
				isConnectPromotionMissingUrl( {
					state: 'connect',
					connectUrl: 'https://example.com/connect',
				} )
			).toBe( false );
		} );
	} );

	describe( 'shouldReloadEditorAfterSetupStep', () => {
		it( 'returns true when server sets reload', () => {
			expect(
				shouldReloadEditorAfterSetupStep( {
					reload: true,
					proSetupPromotion: { state: 'install' },
				} )
			).toBe( true );
		} );

		it( 'returns true when connect promotion is missing connectUrl', () => {
			expect(
				shouldReloadEditorAfterSetupStep( {
					proSetupPromotion: { state: 'connect' },
				} )
			).toBe( true );
		} );

		it( 'returns false when install promotion is returned', () => {
			expect(
				shouldReloadEditorAfterSetupStep( {
					proSetupPromotion: { state: 'activate' },
				} )
			).toBe( false );
		} );
	} );

	describe( 'isReloadDueToMissingConnectUrl', () => {
		it( 'returns true when reload is set and promotion config is omitted', () => {
			expect(
				isReloadDueToMissingConnectUrl( {
					reload: true,
					proSetupPromotion: null,
				} )
			).toBe( true );
		} );

		it( 'returns false when reload is set but promotion config is present', () => {
			expect(
				isReloadDueToMissingConnectUrl( {
					reload: true,
					proSetupPromotion: { state: 'install' },
				} )
			).toBe( false );
		} );
	} );

	describe( 'appendSetupRefreshQueryParams', () => {
		it( 'sets open connect flag when requested', () => {
			const url = new URL( 'https://example.com/wp-admin/post.php?post=1&action=elementor' );

			appendSetupRefreshQueryParams( url, { openConnectPopover: true } );

			expect( url.searchParams.get( PRO_SETUP_OPEN_CONNECT_QUERY_PARAM ) ).toBe( '1' );
			expect( url.searchParams.has( PRO_SETUP_CONNECT_RELOAD_QUERY_PARAM ) ).toBe( true );
		} );
	} );
} );
