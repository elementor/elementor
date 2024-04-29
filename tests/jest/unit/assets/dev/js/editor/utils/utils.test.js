import { convertSizeToFrString } from 'elementor-editor-utils/helpers';

describe( 'convertSizeToFrString', () => {
	test( 'Size 1 to 1fr', () => {
		expect( convertSizeToFrString( 1 ) ).toBe( '1fr' );
	} );

	test( 'Size 3 to 1fr 1fr 1fr', () => {
		expect( convertSizeToFrString( 3 ) ).toBe( '1fr 1fr 1fr' );
	} );

	test( 'Return original value if not a number was passed', () => {
		expect( convertSizeToFrString( '3' ) ).toBe( '3' );
	} );
} );
