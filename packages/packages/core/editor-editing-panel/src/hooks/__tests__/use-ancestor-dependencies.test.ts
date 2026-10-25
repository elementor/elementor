import { createMockElementType, createMockPropType, dispatchCommandAfter } from 'test-utils';
import { type ExtendedWindow, type V1Element, type V1ElementConfig } from '@elementor/editor-elements';
import { type PropValue } from '@elementor/editor-props';
import { act, renderHook } from '@testing-library/react';

import { useElement } from '../../contexts/element-context';
import { useAncestorDependencies } from '../use-ancestor-dependencies';

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

describe( 'useAncestorDependencies', () => {
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

	it( 'should not hide any bind while the ancestor dependency is met', () => {
		// Act.
		const { result } = renderHook( () => useAncestorDependencies() );

		// Assert.
		expect( result.current( HIDDEN_BIND ) ).toBe( false );
		expect( result.current( VISIBLE_BIND ) ).toBe( false );
	} );

	it( 'should hide only the binds that declare the unmet ancestor dependency', () => {
		// Arrange.
		formSettings[ EXPOSE ] = { $$type: 'boolean', value: false };

		// Act.
		const { result } = renderHook( () => useAncestorDependencies() );

		// Assert.
		expect( result.current( HIDDEN_BIND ) ).toBe( true );
		expect( result.current( VISIBLE_BIND ) ).toBe( false );
	} );

	it( 'should re-evaluate when the ancestor settings change', () => {
		// Arrange.
		const { result } = renderHook( () => useAncestorDependencies() );

		expect( result.current( HIDDEN_BIND ) ).toBe( false );

		// Act.
		formSettings[ EXPOSE ] = { $$type: 'boolean', value: false };
		act( () => dispatchCommandAfter( 'document/elements/set-settings' ) );

		// Assert.
		expect( result.current( HIDDEN_BIND ) ).toBe( true );
	} );
} );
