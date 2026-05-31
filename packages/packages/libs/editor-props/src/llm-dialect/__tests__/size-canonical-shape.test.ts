import {
	canonicalizeSizePropValue,
	dialectizeSizePropValue,
	isFlatSizeInnerValue,
	isNestedSizeInnerValue,
	isSizePropValue,
} from '../size-canonical-shape';

describe( 'size canonical shape conversion', () => {
	it( 'should flatten nested size PropValues for canonical storage', () => {
		// Arrange
		const nestedSize = {
			$$type: 'size',
			value: {
				unit: { $$type: 'string', value: 'px' },
				size: { $$type: 'number', value: 16 },
			},
		};

		// Act
		const canonical = canonicalizeSizePropValue( nestedSize );

		// Assert
		expect( canonical ).toEqual( {
			$$type: 'size',
			value: {
				unit: 'px',
				size: 16,
			},
		} );
	} );

	it( 'should expand nested size values for LLM dialect output', () => {
		// Arrange
		const nestedSize = {
			$$type: 'size',
			value: {
				unit: { $$type: 'string', value: 'rem' },
				size: { $$type: 'number', value: 2 },
			},
		};

		// Act
		const dialect = dialectizeSizePropValue( nestedSize );

		// Assert
		expect( dialect ).toEqual( {
			$$type: 'size',
			value: {
				unit: { $$type: 'string', value: 'rem' },
				size: { $$type: 'number', value: 2 },
			},
		} );
	} );

	it( 'should expand flat size values to nested LLM dialect output', () => {
		// Arrange
		const flatSize = {
			$$type: 'size',
			value: {
				unit: 'rem',
				size: 2,
			},
		};

		// Act
		const dialect = dialectizeSizePropValue( flatSize );

		// Assert
		expect( dialect ).toEqual( {
			$$type: 'size',
			value: {
				unit: { $$type: 'string', value: 'rem' },
				size: { $$type: 'number', value: 2 },
			},
		} );
	} );

	it( 'should normalize mixed flat and nested size inner fields', () => {
		// Arrange
		const mixedSize = {
			$$type: 'size',
			value: {
				unit: 'px',
				size: { $$type: 'number', value: 12 },
			},
		};

		// Act
		const dialect = dialectizeSizePropValue( mixedSize );

		// Assert
		expect( dialect ).toEqual( {
			$$type: 'size',
			value: {
				unit: { $$type: 'string', value: 'px' },
				size: { $$type: 'number', value: 12 },
			},
		} );
	} );

	it( 'should identify flat and nested size inner values', () => {
		// Arrange
		const flatInner = { unit: 'px', size: 16 };
		const nestedInner = {
			unit: { $$type: 'string', value: 'px' },
			size: { $$type: 'number', value: 16 },
		};

		// Act
		const isFlat = isFlatSizeInnerValue( flatInner );
		const isNested = isNestedSizeInnerValue( nestedInner );

		// Assert
		expect( isFlat ).toBe( true );
		expect( isNested ).toBe( true );
	} );

	it( 'should leave already flat size values unchanged when canonicalizing', () => {
		// Arrange
		const flatSize = {
			$$type: 'size',
			value: {
				unit: 'px',
				size: 0,
			},
		};

		// Act
		const canonical = canonicalizeSizePropValue( flatSize );

		// Assert
		expect( canonical ).toEqual( flatSize );
	} );

	it( 'should identify size prop values', () => {
		// Arrange
		const flatSize = {
			$$type: 'size',
			value: {
				unit: 'px',
				size: 10,
			},
		};

		// Act
		const isSize = isSizePropValue( flatSize );

		// Assert
		expect( isSize ).toBe( true );
	} );
} );
