import { sizePropTypeUtil, type SizePropValue } from '../size';

const sizeUnitCases: SizePropValue[ 'value' ][] = [
	{ unit: 'px', size: 10 },
	{ unit: 'em', size: 1.5 },
	{ unit: 'rem', size: 2 },
	{ unit: '%', size: 50 },
	{ unit: 'vw', size: 100 },
	{ unit: 'vh', size: 50 },
	{ unit: 'ch', size: 40 },
	{ unit: 'fr', size: 1 },
	{ unit: 'deg', size: 90 },
	{ unit: 'rad', size: 1 },
	{ unit: 'grad', size: 100 },
	{ unit: 'turn', size: 0.5 },
	{ unit: 's', size: 1 },
	{ unit: 'ms', size: 300 },
	{ unit: 'auto', size: '' },
	{ unit: 'custom', size: 'calc(100% - 10px)' },
];

describe( 'sizePropTypeUtil', () => {
	it.each( sizeUnitCases )( 'should accept $unit unit values', ( sizeValue ) => {
		const value = sizePropTypeUtil.create( sizeValue );

		expect( sizePropTypeUtil.isValid( value ) ).toBe( true );
		expect( sizePropTypeUtil.extract( value ) ).toEqual( sizeValue );
	} );
} );
