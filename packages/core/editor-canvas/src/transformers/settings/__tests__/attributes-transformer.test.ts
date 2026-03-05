import { attributesTransformer } from '../attributes-transformer';

describe( 'attributesTransformer', () => {
	it( 'always returns empty string in core', () => {
		const result = attributesTransformer(
			[
				{ key: 'data-id', value: '123' },
				{ key: 'role', value: 'button' },
			],
			{ key: 'attributes' }
		);

		expect( result ).toBe( '' );
	} );
} );
