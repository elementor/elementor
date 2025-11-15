import { transitionProperties } from '@elementor/editor-controls';

import { transitionTransformer, type TransitionValue } from '../transition-transformer';

function run( values: TransitionValue[] ) {
	return transitionTransformer( values, { key: 'transition', signal: undefined } );
}

describe( 'transition-transformer', () => {
	it( 'returns null when all transitions are invalid', () => {
		const invalidTransitions: TransitionValue[] = [
			{
				selection: { key: 'invalid-property', value: 'invalid-property' },
				size: '200ms',
			},
		];

		expect( run( invalidTransitions ) ).toBeNull();
	} );

	it( 'returns valid transition string for allowed property', () => {
		const allowedProperty = transitionProperties[ 0 ].properties[ 0 ].value;
		const validTransitions: TransitionValue[] = [
			{
				selection: { key: 'all', value: allowedProperty },
				size: '200ms',
			},
		];

		expect( run( validTransitions ) ).toBe( `${ allowedProperty } 200ms` );
	} );

	it( 'filters out non-allowed transitions and returns only valid ones', () => {
		const allowedProperty = transitionProperties[ 0 ].properties[ 0 ].value;
		const transitionsWithMixedValidity: TransitionValue[] = [
			{
				selection: { key: 'all', value: allowedProperty },
				size: '200ms',
			},
			{
				selection: { key: 'invalid', value: 'invalid-property' },
				size: '300ms',
			},
			{
				selection: { key: 'another-invalid', value: 'another-invalid-property' },
				size: '400ms',
			},
		];

		expect( run( transitionsWithMixedValidity ) ).toBe( `${ allowedProperty } 200ms` );
	} );
} );
