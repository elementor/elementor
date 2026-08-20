import { type PropsSchema } from '@elementor/editor-props';

import { applySchemaDefaults } from '../apply-schema-defaults';

const str = ( value: string ) => ( { $$type: 'string' as const, value } );

const propsSchema: PropsSchema = {
	tag: {
		kind: 'plain',
		key: 'string',
		default: str( 'h2' ),
		settings: {},
		meta: {},
		dependencies: undefined,
		initial_value: null,
	},
};

describe( 'applySchemaDefaults', () => {
	it( 'should apply schema default when a prop is null', () => {
		const result = applySchemaDefaults( { tag: null }, propsSchema );

		expect( result.tag ).toEqual( str( 'h2' ) );
	} );

	it( 'should apply schema default when a prop is missing', () => {
		const result = applySchemaDefaults( {}, propsSchema );

		expect( result.tag ).toEqual( str( 'h2' ) );
	} );

	it( 'should keep an explicit prop value', () => {
		const storedTag = str( 'h3' );

		const result = applySchemaDefaults( { tag: storedTag }, propsSchema );

		expect( result.tag ).toBe( storedTag );
	} );
} );
