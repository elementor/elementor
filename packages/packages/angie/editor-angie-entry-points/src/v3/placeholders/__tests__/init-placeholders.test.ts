import { clearV3AngieControls, getV3AngieControl } from '../../registry';
import { initV3PlaceholderControls } from '../init-placeholders';

describe( 'initV3PlaceholderControls', () => {
	afterEach( () => {
		clearV3AngieControls();
	} );

	it( 'registers media and excerpt placeholder controls', () => {
		// Act
		initV3PlaceholderControls();

		// Assert
		expect( getV3AngieControl( 'media' ) ).toBeDefined();
		expect( getV3AngieControl( 'excerpt' ) ).toBeDefined();
	} );

	it( 'gates media placeholder on image media_types', () => {
		// Arrange
		initV3PlaceholderControls();
		const entry = getV3AngieControl( 'media' );
		const imageView = {
			options: {
				model: {
					get: ( key: string ) => {
						if ( 'media_types' === key ) {
							return [ 'image' ];
						}
						if ( 'type' === key ) {
							return 'media';
						}
						return undefined;
					},
				},
			},
		};
		const videoView = {
			options: {
				model: {
					get: ( key: string ) => {
						if ( 'media_types' === key ) {
							return [ 'video' ];
						}
						if ( 'type' === key ) {
							return 'media';
						}
						return undefined;
					},
				},
			},
		};

		// Assert
		expect( entry?.shouldApply?.( imageView, 'media' ) ).toBe( true );
		expect( entry?.shouldApply?.( videoView, 'media' ) ).toBe( false );
	} );
} );
