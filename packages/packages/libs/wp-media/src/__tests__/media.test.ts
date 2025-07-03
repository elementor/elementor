import { WpMediaNotAvailableError } from '../errors';
import media from '../media';
import { type WpMediaWindow } from '../types/wp-media';

describe( 'media', () => {
	const extendedWindow = window as unknown as WpMediaWindow;

	it( 'should throw when `wp` is not available', () => {
		// Arrange.
		delete extendedWindow.wp;

		// Act & Assert.
		expect( () => media() ).toThrow( WpMediaNotAvailableError );
	} );

	it( 'should throw when `wp.media` is not available', () => {
		// Arrange.
		extendedWindow.wp = {};

		// Act & Assert.
		expect( () => media() ).toThrow( WpMediaNotAvailableError );
	} );

	it( 'should return `wp.media`', () => {
		// Arrange.
		extendedWindow.wp = {
			media: {} as never,
		};

		// Act & Assert.
		expect( media() ).toBe( extendedWindow.wp.media );
	} );
} );
