import { createMockElementType, createMockPropType, dispatchCommandAfter } from 'test-utils';
import { type ExtendedWindow, type V1Element, type V1ElementConfig } from '@elementor/editor-elements';
import { type PropValue } from '@elementor/editor-props';
import { act, renderHook } from '@testing-library/react';

import { useElement } from '../../contexts/element-context';
import { useIsHiddenByAncestor } from '../use-is-hidden-by-ancestor';

jest.mock( '../../contexts/element-context' );

const FORM_TYPE = 'e-form';
const EXPOSE = 'webmcp-expose';
const HIDDEN_BIND = 'webmcp-param-description';
const VISIBLE_BIND = 'label';

const ancestorHiddenPropType = createMockPropType( {
	kind: 'plain',
	meta: {
		ancestor_dependency: {
			element_type: FORM_TYPE,
			dependency: {
				relation: 'or',
				terms: [ { operator: 'eq', path: [ EXPOSE ], value: true, effect: 'hide' } ],
			},
		},
	},
} );

describe( 'useIsHiddenByAncestor', () => {
	let formSettings: Record< string, PropValue >;

	beforeEach( () => {
		formSettings = { [ EXPOSE ]: { $$type: 'boolean', value: true } };

		const form = {
			id: 'form',
			model: { get: ( key: string ) => ( key === 'elType' ? FORM_TYPE : undefined ) },
			settings: { get: ( key: string ) => formSettings[ key ] },
		} as unknown as V1Element;

		const field = { id: 'field', parent: form } as unknown as V1Element;

		( window as unknown as ExtendedWindow ).elementor = {
			getContainer: ( id: string ) => [ form, field ].find( ( container ) => container.id === id ),
			widgetsCache: {
				[ FORM_TYPE ]: {
					atomic_props_schema: {
						[ EXPOSE ]: createMockPropType( {
							kind: 'plain',
							default: { $$type: 'boolean', value: true },
						} ),
					},
				} as unknown as V1ElementConfig,
			},
		};

		jest.mocked( useElement ).mockReturnValue( {
			element: { type: 'e-form-input', id: 'field' },
			elementType: createMockElementType( {
				propsSchema: {
					[ HIDDEN_BIND ]: ancestorHiddenPropType,
					[ VISIBLE_BIND ]: createMockPropType( { kind: 'plain' } ),
				},
			} ),
			settings: {},
		} );
	} );

	it( 'should not hide the bind while the ancestor dependency is met', () => {
		// Act.
		const { result } = renderHook( () => useIsHiddenByAncestor( HIDDEN_BIND ) );

		// Assert.
		expect( result.current ).toBe( false );
	} );

	it( 'should hide the bind when the ancestor dependency is not met', () => {
		// Arrange.
		formSettings[ EXPOSE ] = { $$type: 'boolean', value: false };

		// Act.
		const { result } = renderHook( () => useIsHiddenByAncestor( HIDDEN_BIND ) );

		// Assert.
		expect( result.current ).toBe( true );
	} );

	it( 'should not hide a bind that does not declare an ancestor dependency', () => {
		// Arrange.
		formSettings[ EXPOSE ] = { $$type: 'boolean', value: false };

		// Act.
		const { result } = renderHook( () => useIsHiddenByAncestor( VISIBLE_BIND ) );

		// Assert.
		expect( result.current ).toBe( false );
	} );

	it( 'should re-evaluate when the ancestor settings change', () => {
		// Arrange.
		const { result } = renderHook( () => useIsHiddenByAncestor( HIDDEN_BIND ) );

		expect( result.current ).toBe( false );

		// Act.
		formSettings[ EXPOSE ] = { $$type: 'boolean', value: false };
		act( () => dispatchCommandAfter( 'document/elements/set-settings' ) );

		// Assert.
		expect( result.current ).toBe( true );
	} );
} );
