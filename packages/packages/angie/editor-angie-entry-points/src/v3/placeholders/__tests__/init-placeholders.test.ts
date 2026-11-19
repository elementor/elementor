import { clearV3AngieControls, getV3AngieControl } from '../../registry';
import { initV3PlaceholderControls } from '../init-placeholders';

describe( 'initV3PlaceholderControls', () => {
	afterEach( () => {
		clearV3AngieControls();
	} );

	it( 'registers media and excerpt placeholder controls', () => {
		initV3PlaceholderControls();
		expect( getV3AngieControl( 'media' ) ).toBeDefined();
		expect( getV3AngieControl( 'excerpt' ) ).toBeDefined();
	} );

	it( 'builds a site logo prompt that references kit identity tools and upload-media', () => {
		// Arrange
		initV3PlaceholderControls();
		const mediaControl = getV3AngieControl( 'media' );

		// Act
		const prompt = mediaControl?.buildPrompt( {
			type: 'media',
			controlType: 'media',
			getControlValue: () => ( {} ),
			context: {
				controlName: 'site_logo',
				elementId: 'kit',
			},
		} );

		// Assert
		expect( prompt ).toContain( 'v3-kit-site-identity' );
		expect( prompt ).toContain( 'elementor/upload-media' );
		expect( prompt ).toContain( 'image agent' );
	} );

	it( 'does not reference v3-kit-site-identity for generic media controls', () => {
		// Arrange
		initV3PlaceholderControls();
		const mediaControl = getV3AngieControl( 'media' );

		// Act
		const prompt = mediaControl?.buildPrompt( {
			type: 'media',
			controlType: 'media',
			getControlValue: () => ( {} ),
			context: {
				controlName: 'image',
				elementId: 'el-1',
			},
		} );

		// Assert
		expect( prompt ).not.toContain( 'v3-kit-site-identity' );
		expect( prompt ).toContain( 'el-1' );
		expect( prompt ).toContain( 'image' );
	} );
} );
