import { createMockElementType, createMockPropType } from 'test-utils';
import { type PropsSchema } from '@elementor/editor-props';

import { type Control } from '../../types';
import { getElementType } from '../get-element-type';
import { getWidgetsCache } from '../get-widgets-cache';

jest.mock( '../get-widgets-cache' );

describe( 'getElementType', () => {
	const bind = 'tag';

	const mockAtomicControl: Control = {
		type: 'control',
		value: { bind, type: 'select', props: {} },
	};

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should return null if no type is provided', () => {
		// Act.
		const result = getElementType( '' );

		// Assert.
		expect( result ).toBeNull();
	} );

	it( 'should return null if no element type is found', () => {
		// Arrange.
		jest.mocked( getWidgetsCache ).mockReturnValue( {
			'atomic-heading': {
				title: 'Heading',
				controls: {},
				atomic_controls: [],
				atomic_props_schema: {},
				atomic_style_states: [],
			},
		} );

		// Act.
		const result = getElementType( 'unknown-type' );

		// Assert.
		expect( result ).toBeNull();
	} );

	it( 'should return null if the element type does not have atomic controls', () => {
		// Arrange.
		jest.mocked( getWidgetsCache ).mockReturnValue( {
			heading: {
				title: 'Heading',
				controls: {},
				atomic_controls: undefined,
				atomic_props_schema: {},
				atomic_style_states: [],
			},
		} );

		// Act.
		const result = getElementType( 'heading' );

		// Assert.
		expect( result ).toBeNull();
	} );

	it( 'should return null if the widget cache is empty', () => {
		// Arrange.
		jest.mocked( getWidgetsCache ).mockReturnValue( null );

		// Act.
		const result = getElementType( 'atomic-heading' );

		// Assert.
		expect( result ).toBeNull();
	} );

	it( 'should return the correct parameters if the element type found', () => {
		// Arrange.
		const mockAtomicPropsSchema: PropsSchema = {
			[ bind ]: createMockPropType( { key: 'string', default: '' } ),
		};

		jest.mocked( getWidgetsCache ).mockReturnValue( {
			'atomic-heading': {
				title: 'Heading',
				controls: {},
				atomic_controls: [ mockAtomicControl ],
				atomic_props_schema: mockAtomicPropsSchema,
				atomic_style_states: [ { name: 'selected', value: 'e--selected' } ],
			},
		} );

		// Act.
		const result = getElementType( 'atomic-heading' );

		// Assert.
		expect( result ).toEqual(
			createMockElementType( {
				key: 'atomic-heading',
				title: 'Heading',
				controls: [ mockAtomicControl ],
				propsSchema: mockAtomicPropsSchema,
				styleStates: [ { name: 'selected', value: 'e--selected' } ],
			} )
		);
	} );

	it( 'should update the response when "type" param changes', () => {
		// Arrange.
		jest.mocked( getWidgetsCache ).mockReturnValue( {
			'atomic-heading': {
				title: 'Heading',
				controls: {},
				atomic_controls: [],
				atomic_props_schema: {},
				atomic_style_states: [],
			},
			'atomic-image': {
				title: 'Image',
				controls: {},
				atomic_controls: [],
				atomic_props_schema: {},
				atomic_style_states: [],
			},
		} );

		// Act.
		const result = getElementType( 'atomic-heading' );

		// Assert.
		expect( result ).toEqual(
			createMockElementType( {
				key: 'atomic-heading',
				title: 'Heading',
			} )
		);

		// Act.
		const result2 = getElementType( 'atomic-image' );

		// Assert.
		expect( result2 ).toEqual(
			createMockElementType( {
				key: 'atomic-image',
				title: 'Image',
			} )
		);
	} );
} );
