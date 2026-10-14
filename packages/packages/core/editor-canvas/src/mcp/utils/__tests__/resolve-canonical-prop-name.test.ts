import { getWidgetsCache } from '@elementor/editor-elements';

import { resolveCanonicalPropKeys, resolveCanonicalPropName } from '../resolve-canonical-prop-name';

jest.mock( '@elementor/editor-elements', () => ( {
	getWidgetsCache: jest.fn(),
} ) );

const ELEMENT_TYPE = 'e-paragraph';

const widgetsCacheFixture = {
	[ ELEMENT_TYPE ]: {
		atomic_props_schema: {
			paragraph: {
				key: 'html-v3',
				meta: {
					aliases: [ 'text', 'content' ],
				},
			},
			tag: {
				key: 'string',
			},
		},
	},
};

describe( 'resolveCanonicalPropName', () => {
	beforeEach( () => {
		// @ts-ignore: Mock values for test
		jest.mocked( getWidgetsCache ).mockReturnValue( widgetsCacheFixture );
	} );

	it( 'returns canonical property names unchanged', () => {
		// Act
		const resolved = resolveCanonicalPropName( ELEMENT_TYPE, 'paragraph' );

		// Assert
		expect( resolved ).toBe( 'paragraph' );
	} );

	it( 'resolves alias property names to canonical keys', () => {
		// Act
		const resolved = resolveCanonicalPropName( ELEMENT_TYPE, 'text' );

		// Assert
		expect( resolved ).toBe( 'paragraph' );
	} );

	it( 'returns unknown property names unchanged', () => {
		// Act
		const resolved = resolveCanonicalPropName( ELEMENT_TYPE, 'unknown' );

		// Assert
		expect( resolved ).toBe( 'unknown' );
	} );

	it( 'returns property names unchanged when element type has no schema', () => {
		// Arrange
		jest.mocked( getWidgetsCache ).mockReturnValue( null );

		// Act
		const resolved = resolveCanonicalPropName( 'missing-widget', 'text' );

		// Assert
		expect( resolved ).toBe( 'text' );
	} );
} );

describe( 'resolveCanonicalPropKeys', () => {
	beforeEach( () => {
		// @ts-ignore: Mock values for test
		jest.mocked( getWidgetsCache ).mockReturnValue( widgetsCacheFixture );
	} );

	it( 'rewrites alias keys to canonical keys', () => {
		// Act
		const resolved = resolveCanonicalPropKeys( ELEMENT_TYPE, {
			text: 'hello',
		} );

		// Assert
		expect( resolved ).toEqual( {
			paragraph: 'hello',
		} );
	} );

	it( 'prefers canonical keys when alias and canonical are both provided', () => {
		// Act
		const resolved = resolveCanonicalPropKeys( ELEMENT_TYPE, {
			paragraph: 'canonical',
			text: 'alias',
		} );

		// Assert
		expect( resolved ).toEqual( {
			paragraph: 'canonical',
		} );
	} );

	it( 'passes unknown keys through for downstream validation', () => {
		// Act
		const resolved = resolveCanonicalPropKeys( ELEMENT_TYPE, {
			unknown: 'value',
		} );

		// Assert
		expect( resolved ).toEqual( {
			unknown: 'value',
		} );
	} );
} );
