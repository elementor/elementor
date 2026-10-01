import { buildImageSizeKey } from '../image-size-key';

describe( 'buildImageSizeKey', () => {
	it( 'combines the attachment id and size into a composite key', () => {
		expect( buildImageSizeKey( { id: 1, size: 'medium' } ) ).toBe( '1:medium' );
	} );

	it( 'defaults to "full" when size is omitted', () => {
		expect( buildImageSizeKey( { id: 1 } ) ).toBe( '1:full' );
	} );

	it( 'defaults to "full" when size is an empty string', () => {
		expect( buildImageSizeKey( { id: 1, size: '' } ) ).toBe( '1:full' );
	} );

	it( 'produces distinct keys for the same id at different sizes', () => {
		const medium = buildImageSizeKey( { id: 7, size: 'medium' } );
		const full = buildImageSizeKey( { id: 7, size: 'full' } );

		expect( medium ).not.toBe( full );
	} );
} );
