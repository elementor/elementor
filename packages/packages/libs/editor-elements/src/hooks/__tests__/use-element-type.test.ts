import { createMockElementType, createMockPropType, dispatchCommandAfter } from 'test-utils';
import { type PropsSchema } from '@elementor/editor-props';
import { act, renderHook } from '@testing-library/react';

import { useElementType } from '../../hooks/use-element-type';
import { getWidgetsCache } from '../../sync/get-widgets-cache';
import { type Control } from '../../types';

jest.mock( '../../sync/get-widgets-cache' );

describe( 'useElementType', () => {
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
		const { result } = renderHook( () => useElementType() );

		// Assert.
		expect( result.current ).toBeNull();
	} );

	it( 'should return null if no element type is found', () => {
		// Arrange.
		jest.mocked( getWidgetsCache ).mockReturnValue( {
			'atomic-heading': {
				title: 'Heading',
				controls: {},
				atomic_controls: [],
				atomic_props_schema: {},
			},
		} );

		// Act.
		const { result } = renderHook( () => useElementType( 'unknown-type' ) );

		// Assert.
		expect( result.current ).toBeNull();
	} );

	it( 'should return null if the element type does not have atomic controls', () => {
		// Arrange.
		jest.mocked( getWidgetsCache ).mockReturnValue( {
			heading: {
				title: 'Heading',
				controls: {},
				atomic_controls: undefined,
				atomic_props_schema: {},
			},
		} );

		// Act.
		const { result } = renderHook( () => useElementType( 'heading' ) );

		// Assert.
		expect( result.current ).toBeNull();
	} );

	it( 'should return null if the widget cache is empty', () => {
		// Arrange.
		jest.mocked( getWidgetsCache ).mockReturnValue( null );

		// Act.
		const { result } = renderHook( () => useElementType( 'atomic-heading' ) );

		// Assert.
		expect( result.current ).toBeNull();
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
			},
		} );

		// Act.
		const { result } = renderHook( () => useElementType( 'atomic-heading' ) );

		// Assert.
		expect( result.current ).toEqual(
			createMockElementType( {
				key: 'atomic-heading',
				title: 'Heading',
				controls: [ mockAtomicControl ],
				propsSchema: mockAtomicPropsSchema,
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
			},
			'atomic-image': {
				title: 'Image',
				controls: {},
				atomic_controls: [],
				atomic_props_schema: {},
			},
		} );

		// Act.
		const { result, rerender } = renderHook( ( { type } ) => useElementType( type ), {
			initialProps: { type: 'atomic-heading' },
		} );

		// Assert.
		expect( result.current ).toEqual(
			createMockElementType( {
				key: 'atomic-heading',
				title: 'Heading',
			} )
		);

		// Act.
		rerender( { type: 'atomic-image' } );

		// Assert.
		expect( result.current ).toEqual(
			createMockElementType( {
				key: 'atomic-image',
				title: 'Image',
			} )
		);
	} );

	it( 'should update the response when the document load event fired', () => {
		// Arrange.
		jest.mocked( getWidgetsCache ).mockReturnValue( {
			'atomic-heading': {
				title: 'Heading',
				controls: {},
				atomic_controls: [ mockAtomicControl ],
				atomic_props_schema: {},
			},
		} );

		// Act.
		const { result } = renderHook( () => useElementType( 'atomic-heading' ) );

		// Assert.
		expect( result.current ).toEqual(
			createMockElementType( {
				key: 'atomic-heading',
				title: 'Heading',
				controls: [ mockAtomicControl ],
			} )
		);

		// Arrange.
		const newMockAtomicControl: Control = {
			type: 'control',
			value: { bind: 'new-bind', type: 'text', props: {} },
		};

		jest.mocked( getWidgetsCache ).mockReturnValue( {
			'atomic-heading': {
				title: 'Heading',
				controls: {},
				atomic_controls: [ newMockAtomicControl ],
				atomic_props_schema: {},
			},
		} );

		// Act.
		act( () => {
			dispatchCommandAfter( 'editor/documents/load' );
		} );

		// Assert.
		expect( result.current ).toEqual(
			createMockElementType( {
				key: 'atomic-heading',
				title: 'Heading',
				controls: [ newMockAtomicControl ],
			} )
		);
	} );
} );
