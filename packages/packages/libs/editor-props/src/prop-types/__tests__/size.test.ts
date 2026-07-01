import { sizePropTypeUtil } from '../size';

describe( 'sizePropTypeUtil', () => {
	it( 'should accept fr unit values used by grid auto track styles', () => {
		const value = sizePropTypeUtil.create( { size: 1, unit: 'fr' } );

		expect( sizePropTypeUtil.isValid( value ) ).toBe( true );
		expect( sizePropTypeUtil.extract( value ) ).toEqual( { size: 1, unit: 'fr' } );
	} );
} );
