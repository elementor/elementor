import { type ElementStateParam } from '@elementor/editor-elements';

import {
	fromControlValue,
	getExposedParams,
	MAX_EXPOSED_CONTROLS,
	toControlValue,
	toPropType,
} from '../exposed-state-values';

const numberParam: ElementStateParam = {
	key: 'rate',
	label: 'rate',
	type: 'number',
	prop_type: 'number',
	default: 4,
	exposed: { control: 'number', label: 'Rate' },
};

const sizeParam: ElementStateParam = {
	key: 'gap',
	label: 'gap',
	type: 'json',
	prop_type: 'size',
	default: { $$type: 'size', value: { size: 10, unit: 'px' } },
	exposed: { control: 'size', label: 'Gap' },
};

describe( 'exposed-state-values', () => {
	it( 'should wrap primitive defaults as typed prop values', () => {
		// Act
		const result = toControlValue( numberParam );

		// Assert
		expect( result ).toEqual( { $$type: 'number', value: 4 } );
	} );

	it( 'should pass object defaults through untouched', () => {
		// Act
		const result = toControlValue( sizeParam );

		// Assert
		expect( result ).toBe( sizeParam.default );
	} );

	it( 'should return null when the default is empty', () => {
		// Act
		const result = toControlValue( { ...numberParam, default: null } );

		// Assert
		expect( result ).toBeNull();
	} );

	it( 'should unwrap primitive control values back to raw state values', () => {
		// Act
		const result = fromControlValue( numberParam, { $$type: 'number', value: 9 } );

		// Assert
		expect( result ).toBe( 9 );
	} );

	it( 'should keep object control values typed', () => {
		// Arrange
		const next = { $$type: 'size', value: { size: 2, unit: 'em' } };

		// Act
		const result = fromControlValue( sizeParam, next );

		// Assert
		expect( result ).toBe( next );
	} );

	it( 'should fall back to the empty value when the control is cleared', () => {
		// Act
		const result = fromControlValue( numberParam, null );

		// Assert
		expect( result ).toBe( 0 );
	} );

	it( 'should build a select prop type with the declared options', () => {
		// Arrange
		const param: ElementStateParam = {
			key: 'style',
			label: 'style',
			type: 'string',
			prop_type: 'enum',
			options: [ 'a', 'b' ],
			default: 'a',
			exposed: { control: 'select', label: 'Style' },
		};

		// Act
		const propType = toPropType( param ) as unknown as { key: string; settings: { enum: string[] } };

		// Assert
		expect( propType.key ).toBe( 'string' );
		expect( propType.settings.enum ).toEqual( [ 'a', 'b' ] );
	} );

	it( 'should return only exposed params and cap them', () => {
		// Arrange
		const params = Array.from( { length: MAX_EXPOSED_CONTROLS + 2 }, ( _, index ) => ( {
			...numberParam,
			key: `key_${ index }`,
		} ) );

		// Act
		const result = getExposedParams( [ { ...numberParam, exposed: undefined }, ...params ] );

		// Assert
		expect( result ).toHaveLength( MAX_EXPOSED_CONTROLS );
	} );
} );
