import { type PropType } from '@elementor/editor-props';

import { isInlineEditingAllowed } from '../inline-editing-eligibility';

const createPlainPropType = ( key: string ): PropType => ( { kind: 'plain', key, settings: {}, meta: {} } );

const createUnionPropType = ( keys: string[] ): PropType =>
	( {
		kind: 'union',
		prop_types: Object.fromEntries( keys.map( ( key ) => [ key, createPlainPropType( key ) ] ) ),
		settings: {},
		meta: {},
	} ) as PropType;

describe( 'isInlineEditingAllowed', () => {
	it( 'should allow inline editing for html-v3 prop values', () => {
		expect(
			isInlineEditingAllowed( {
				rawValue: { $$type: 'html-v3', value: { content: { $$type: 'string', value: 'Hello' }, children: [] } },
				propTypeFromSchema: null,
			} )
		).toBe( true );
	} );

	it( 'should allow inline editing for string prop values', () => {
		expect(
			isInlineEditingAllowed( {
				rawValue: { $$type: 'string', value: 'Hello' },
				propTypeFromSchema: null,
			} )
		).toBe( true );
	} );

	it.each( [ 'dynamic', 'overridable', 'override' ] )( 'should disallow non-core wrappers: %s', ( $$type ) => {
		expect(
			isInlineEditingAllowed( {
				rawValue: { $$type, value: {} },
				propTypeFromSchema: null,
			} )
		).toBe( false );
	} );

	it( 'should allow when value is unset but schema key is html-v3', () => {
		expect(
			isInlineEditingAllowed( {
				rawValue: undefined,
				propTypeFromSchema: createPlainPropType( 'html-v3' ),
			} )
		).toBe( true );
	} );

	it( 'should allow when value is unset but schema key is string', () => {
		expect(
			isInlineEditingAllowed( {
				rawValue: null,
				propTypeFromSchema: createPlainPropType( 'string' ),
			} )
		).toBe( true );
	} );

	it( 'should disallow when value is unset and schema is not core text', () => {
		expect(
			isInlineEditingAllowed( {
				rawValue: undefined,
				propTypeFromSchema: createPlainPropType( 'image' ),
			} )
		).toBe( false );
	} );

	it( 'should allow when value is unset and union schema includes html-v3', () => {
		expect(
			isInlineEditingAllowed( {
				rawValue: undefined,
				propTypeFromSchema: createUnionPropType( [ 'dynamic', 'html-v3' ] ),
			} )
		).toBe( true );
	} );

	it( 'should disallow when value is unset and union schema does not include html-v3/string', () => {
		expect(
			isInlineEditingAllowed( {
				rawValue: undefined,
				propTypeFromSchema: createUnionPropType( [ 'dynamic', 'image' ] ),
			} )
		).toBe( false );
	} );
} );
