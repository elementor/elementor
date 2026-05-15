import { injectIntoRepeaterItemIcon, injectIntoRepeaterItemLabel } from '@elementor/editor-controls';
import { type PropValue } from '@elementor/editor-props';

import { customSizeVariablePropTypeUtil, sizeVariablePropTypeUtil } from '../prop-types';
import { registerRepeaterInjections } from '../repeater-injections';

jest.mock( '@elementor/editor-controls', () => {
	const actual = jest.requireActual( '@elementor/editor-controls' );
	return {
		...actual,
		injectIntoRepeaterItemIcon: jest.fn(),
		injectIntoRepeaterItemLabel: jest.fn(),
	};
} );

const labelInjectMock = injectIntoRepeaterItemLabel as jest.MockedFunction< typeof injectIntoRepeaterItemLabel >;

const plainPx = ( size: number ): PropValue =>
	( {
		$$type: 'size',
		value: { unit: 'px', size },
	} ) as PropValue;

const createMoveTransformValue = ( overrides: Partial< Record< 'x' | 'y' | 'z', PropValue > > ): PropValue =>
	( {
		$$type: 'transform-move',
		value: {
			x: overrides.x ?? plainPx( 0 ),
			y: overrides.y ?? plainPx( 0 ),
			z: overrides.z ?? plainPx( 0 ),
		},
	} ) as PropValue;

describe( 'registerRepeaterInjections transform-move label condition', () => {
	const getTransformMoveLabelCondition = () => {
		labelInjectMock.mockClear();
		( injectIntoRepeaterItemIcon as jest.Mock ).mockClear();
		registerRepeaterInjections();
		const registration = labelInjectMock.mock.calls
			.map( ( [ config ] ) => config )
			.find( ( config ) => config.id === 'transform-size-variables-label' );
		if ( ! registration?.condition ) {
			throw new Error( 'transform-size-variables-label injection not found' );
		}
		return registration.condition as ( args: { value: PropValue } ) => boolean;
	};

	it( 'returns false when the value is not a transform-move prop', () => {
		const condition = getTransformMoveLabelCondition();
		const value = { $$type: 'string' as const, value: 'not-move' } as PropValue;

		expect( condition( { value } ) ).toBe( false );
	} );

	it( 'returns false when move axes use only plain size values', () => {
		const condition = getTransformMoveLabelCondition();

		expect( condition( { value: createMoveTransformValue( {} ) } ) ).toBe( false );
	} );

	it.each( [
		[ 'x', 'e-tr-mv-x-sz', sizeVariablePropTypeUtil.key ],
		[ 'y', 'e-tr-mv-y-sz', sizeVariablePropTypeUtil.key ],
		[ 'z', 'e-tr-mv-z-sz', sizeVariablePropTypeUtil.key ],
		[ 'x', 'e-tr-mv-x-cs', customSizeVariablePropTypeUtil.key ],
		[ 'y', 'e-tr-mv-y-cs', customSizeVariablePropTypeUtil.key ],
		[ 'z', 'e-tr-mv-z-cs', customSizeVariablePropTypeUtil.key ],
	] as const )( 'returns true when move %s uses a %s variable', ( axis, variableId, variableType ) => {
		const condition = getTransformMoveLabelCondition();
		const axisValue = { $$type: variableType, value: variableId } as PropValue;

		expect( condition( { value: createMoveTransformValue( { [ axis ]: axisValue } ) } ) ).toBe( true );
	} );
} );
