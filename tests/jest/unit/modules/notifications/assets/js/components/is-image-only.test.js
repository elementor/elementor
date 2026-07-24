import { isImageOnly } from 'elementor/modules/notifications/assets/js/components/is-image-only';

const makeItem = ( overrides = {} ) => ( {
	id: 'test-item',
	...overrides,
} );

describe( 'isImageOnly', () => {
	it( 'returns truthy when item has media but no title or description', () => {
		expect( isImageOnly( makeItem( { imageSrc: 'https://example.com/img.png' } ) ) ).toBeTruthy();
	} );

	it( 'returns falsy when item has a title', () => {
		expect( isImageOnly( makeItem( { title: 'Some title', imageSrc: 'https://example.com/img.png' } ) ) ).toBeFalsy();
	} );

	it( 'returns falsy when item has no media', () => {
		expect( isImageOnly( makeItem() ) ).toBeFalsy();
	} );
} );
