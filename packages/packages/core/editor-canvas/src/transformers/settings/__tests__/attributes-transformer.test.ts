import { attributesTransformer } from '../attributes-transformer';
import { setShouldRenderAttributesGate } from '../../../render-gates';

describe( 'attributesTransformer with render gate', () => {
	beforeEach( () => {
		setShouldRenderAttributesGate( () => false );
	} );

	it( 'returns empty string when gate is false', () => {
		const result = attributesTransformer(
			[
				{ key: 'data-id', value: '123' },
				{ key: 'role', value: 'button' },
			],
			{ key: 'attributes' }
		);

		expect( result ).toBe( '' );
	} );

	it( 'returns concatenated string when gate is true', () => {
		setShouldRenderAttributesGate( () => true );

		const result = attributesTransformer(
			[
				{ key: 'data-id', value: '123' },
				{ key: 'role', value: 'button' },
			],
			{ key: 'attributes' }
		);

		expect( result ).toBe( 'data-id="123" role="button"' );
	} );
} );
