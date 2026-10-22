import { createMockPropType } from 'test-utils';
import { getContainer, getWidgetsCache, type V1Element, type V1ElementConfig } from '@elementor/editor-elements';
import { type PropType, type PropValue } from '@elementor/editor-props';

import { isHiddenByAncestor } from '../ancestor-dependency-utils';

jest.mock( '@elementor/editor-elements', () => ( {
	...jest.requireActual( '@elementor/editor-elements' ),
	getContainer: jest.fn(),
	getWidgetsCache: jest.fn(),
} ) );

const FORM_TYPE = 'e-form';
const EXPOSE = 'webmcp-expose';

const paramDescriptionPropType = createMockPropType( {
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

const makeContainer = ( id: string, elType: string, settings: Record< string, PropValue > = {}, parent?: V1Element ) =>
	( {
		id,
		parent,
		model: { get: ( key: string ) => ( key === 'elType' ? elType : undefined ) },
		settings: { toJSON: () => settings },
	} ) as unknown as V1Element;

const registerContainers = ( containers: V1Element[] ) => {
	jest.mocked( getContainer ).mockImplementation(
		( id: string ) => containers.find( ( container ) => container.id === id ) ?? null
	);
};

describe( 'isHiddenByAncestor', () => {
	beforeEach( () => {
		jest.mocked( getWidgetsCache ).mockReturnValue( {
			[ FORM_TYPE ]: {
				atomic_props_schema: {
					[ EXPOSE ]: createMockPropType( { kind: 'plain', default: { $$type: 'boolean', value: true } } ),
				},
			} as unknown as V1ElementConfig,
		} );
	} );

	it( 'hides when the parent form is not exposed', () => {
		// Arrange
		const form = makeContainer( 'form', FORM_TYPE, { [ EXPOSE ]: { $$type: 'boolean', value: false } } );
		registerContainers( [ form, makeContainer( 'field', 'widget', {}, form ) ] );

		// Act & Assert
		expect( isHiddenByAncestor( 'field', paramDescriptionPropType ) ).toBe( true );
	} );

	it( 'hides a field nested inside another element of the form', () => {
		// Arrange
		const form = makeContainer( 'form', FORM_TYPE, { [ EXPOSE ]: { $$type: 'boolean', value: false } } );
		const row = makeContainer( 'row', 'e-flexbox', {}, form );
		registerContainers( [ form, row, makeContainer( 'field', 'widget', {}, row ) ] );

		// Act & Assert
		expect( isHiddenByAncestor( 'field', paramDescriptionPropType ) ).toBe( true );
	} );

	it( 'shows when the form is exposed', () => {
		// Arrange
		const form = makeContainer( 'form', FORM_TYPE, { [ EXPOSE ]: { $$type: 'boolean', value: true } } );
		registerContainers( [ form, makeContainer( 'field', 'widget', {}, form ) ] );

		// Act & Assert
		expect( isHiddenByAncestor( 'field', paramDescriptionPropType ) ).toBe( false );
	} );

	it( 'falls back to the form schema default when the setting is unset', () => {
		// Arrange
		const form = makeContainer( 'form', FORM_TYPE );
		registerContainers( [ form, makeContainer( 'field', 'widget', {}, form ) ] );

		// Act & Assert
		expect( isHiddenByAncestor( 'field', paramDescriptionPropType ) ).toBe( false );
	} );

	it( 'shows when there is no matching ancestor', () => {
		// Arrange
		registerContainers( [ makeContainer( 'field', 'widget' ) ] );

		// Act & Assert
		expect( isHiddenByAncestor( 'field', paramDescriptionPropType ) ).toBe( false );
	} );

	it.each( [
		[ 'no meta', createMockPropType( { kind: 'plain' } ) ],
		[
			'malformed meta',
			createMockPropType( { kind: 'plain', meta: { ancestor_dependency: { element_type: 1 } } } ),
		],
		[ 'undefined prop type', undefined ],
	] )( 'shows when the prop type has %s', ( _, propType ) => {
		// Arrange
		const form = makeContainer( 'form', FORM_TYPE, { [ EXPOSE ]: { $$type: 'boolean', value: false } } );
		registerContainers( [ form, makeContainer( 'field', 'widget', {}, form ) ] );

		// Act & Assert
		expect( isHiddenByAncestor( 'field', propType as PropType | undefined ) ).toBe( false );
	} );
} );
