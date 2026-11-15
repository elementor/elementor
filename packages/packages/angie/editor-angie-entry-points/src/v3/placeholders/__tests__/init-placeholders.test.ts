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
} );
