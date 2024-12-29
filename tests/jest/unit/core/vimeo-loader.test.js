jest.mock( 'elementor/assets/dev/js/frontend/utils/video-api/base-loader', () => {
	return class {};
} );

import VimeoLoader from 'elementor/assets/dev/js/frontend/utils/video-api/vimeo-loader';

describe( 'VimeoLoader', () => {
	let vimeoLoader;

	beforeEach( () => {
		vimeoLoader = new VimeoLoader();
	} );

	describe( 'getApiURL', () => {
		it( 'should return the correct API URL', () => {
			expect( vimeoLoader.getApiURL() ).toBe( 'https://player.vimeo.com/api/player.js' );
		} );
	} );

	describe( 'getURLRegex', () => {
		it( 'should return the correct URL regex', () => {
			expect( vimeoLoader.getURLRegex().toString() ).toBe( '/^(?:https?:\\/\\/)?(?:www|player\\.)?(?:vimeo\\.com\\/)?(?:video\\/|external\\/)?(\\d+)([^.?&#"\'>]?)/' );
		} );
	} );

	describe( 'getAutoplayURL', () => {
		it( 'should return the correct autoplay URL', () => {
			const videoURL = 'https://vimeo.com/123456#t=90s';
			const expectedURL = 'https://vimeo.com/123456#t=90s';
			expect( vimeoLoader.getAutoplayURL( videoURL ) ).toBe( expectedURL );
		} );

		it( 'should handle URLs without a time parameter', () => {
			const videoURL = 'https://vimeo.com/123456#t=';
			expect( vimeoLoader.getAutoplayURL( videoURL ) ).toBe( videoURL );
		} );
	} );
} );
