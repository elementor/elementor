import { injectIntoRepeaterItemLabel } from '@elementor/editor-controls';
import { type PropValue } from '@elementor/editor-props';

import { colorVariablePropTypeUtil, customSizeVariablePropTypeUtil, sizeVariablePropTypeUtil } from '../prop-types';
import { registerRepeaterInjections } from '../repeater-injections';

jest.mock( '@elementor/editor-controls', () => {
	const actual = jest.requireActual( '@elementor/editor-controls' );

	return {
		...actual,
		injectIntoRepeaterItemIcon: jest.fn(),
		injectIntoRepeaterItemLabel: jest.fn(),
	};
} );

const plainPx = ( size: number ): PropValue =>
	( {
		$$type: 'size',
		value: { unit: 'px', size },
	} ) as PropValue;

const createShadowValue = ( overrides: Partial< Record< 'hOffset' | 'vOffset' | 'blur' | 'spread', PropValue > > ) =>
	( {
		$$type: 'shadow' as const,
		value: {
			position: null,
			hOffset: overrides.hOffset ?? plainPx( 0 ),
			vOffset: overrides.vOffset ?? plainPx( 0 ),
			blur: overrides.blur ?? plainPx( 0 ),
			spread: overrides.spread ?? plainPx( 0 ),
			color: {
				$$type: 'color' as const,
				value: 'rgba(0, 0, 0, 1)',
			},
		},
	} ) as PropValue;

const boxShadowLabelCondition = () => {
	const injected = ( injectIntoRepeaterItemLabel as jest.Mock ).mock.calls.find(
		( call ) => call[ 0 ]?.id === 'color-variables-box-shadow-label'
	)?.[ 0 ] as { condition: ( args: { value: PropValue } ) => boolean };

	if ( ! injected?.condition ) {
		throw new Error( 'box shadow label injection not registered' );
	}

	return injected.condition;
};

describe( 'registerRepeaterInjections', () => {
	beforeEach( () => {
		( injectIntoRepeaterItemLabel as jest.Mock ).mockClear();
		registerRepeaterInjections();
	} );

	describe( 'box shadow repeater label condition', () => {
		const sizeKeys = [ 'hOffset', 'vOffset', 'blur', 'spread' ] as const;

		it.each( sizeKeys )( 'should be true when %s uses a global size variable', ( key ) => {
			// Arrange.
			const condition = boxShadowLabelCondition();
			const variableId = `size-var-${ key }`;
			const shadow = createShadowValue( {
				[ key ]: { $$type: sizeVariablePropTypeUtil.key, value: variableId },
			} );

			// Act.
			const result = condition( { value: shadow } );

			// Assert.
			expect( result ).toBe( true );
		} );

		it.each( sizeKeys )( 'should be true when %s uses a global custom size variable', ( key ) => {
			// Arrange.
			const condition = boxShadowLabelCondition();
			const variableId = `custom-size-var-${ key }`;
			const shadow = createShadowValue( {
				[ key ]: { $$type: customSizeVariablePropTypeUtil.key, value: variableId },
			} );

			// Act.
			const result = condition( { value: shadow } );

			// Assert.
			expect( result ).toBe( true );
		} );

		it( 'should be false when offsets blur and spread are plain sizes', () => {
			// Arrange.
			const condition = boxShadowLabelCondition();

			// Act.
			const result = condition( { value: createShadowValue( {} ) } );

			// Assert.
			expect( result ).toBe( false );
		} );

		it( 'should be false when only the shadow color uses a variable', () => {
			// Arrange.
			const condition = boxShadowLabelCondition();
			const base = createShadowValue( {} );
			const shadow = {
				...base,
				value: {
					...base.value,
					color: {
						$$type: colorVariablePropTypeUtil.key,
						value: 'e-gc-only-color',
					},
				},
			};

			// Act.
			const result = condition( { value: shadow } );

			// Assert.
			expect( result ).toBe( false );
		} );
	} );
} );
