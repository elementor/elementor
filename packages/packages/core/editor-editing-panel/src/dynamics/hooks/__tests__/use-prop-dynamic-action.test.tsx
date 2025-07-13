import * as React from 'react';
import { createMockPropType, renderWithTheme } from 'test-utils';
import { useBoundProp } from '@elementor/editor-controls';
import { type ElementType } from '@elementor/editor-elements';
import { type PropType } from '@elementor/editor-props';
import { fireEvent, renderHook, screen } from '@testing-library/react';

import { useElement } from '../../../contexts/element-context';
import { type DynamicTag } from '../../types';
import { usePropDynamicAction } from '../use-prop-dynamic-action';
import { usePropDynamicTags } from '../use-prop-dynamic-tags';

jest.mock( '../../../contexts/element-context' );
jest.mock( '@elementor/editor-controls' );
jest.mock( '../../sync/get-atomic-dynamic-tags' );
jest.mock( '../use-prop-dynamic-tags' );

describe( 'usePropDynamicAction', () => {
	const originalGetBoundingClientRect = globalThis.Element.prototype.getBoundingClientRect;

	beforeEach( () => {
		globalThis.Element.prototype.getBoundingClientRect = jest.fn().mockReturnValue( { height: 1000, width: 1000 } );
	} );

	afterEach( () => {
		jest.clearAllMocks();

		globalThis.Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
	} );

	it.each( [
		{
			name: 'prop without sub types',
			propSchema: createMockPropType( { kind: 'plain', default: 'test value' } ),
			bind: 'title',
		},
		{
			name: 'prop without support of dynamics',
			propSchema: createMockPropType( {
				kind: 'union',
				prop_types: {
					string: createMockPropType( { kind: 'plain', key: 'string' } ),
					'something-else': createMockPropType( {
						kind: 'plain',
						key: 'something-else',
						settings: { categories: [] },
					} ),
				},
				default: 'test value',
			} ),
			bind: 'title',
		},
		{
			name: 'non-existing prop',
			propSchema: null as never,
			bind: 'title',
		},
	] )( 'return an invisible action for $name', ( { propSchema, bind } ) => {
		mockElementPropSchema( bind, propSchema );

		// Act.
		const { result } = renderHook( () => usePropDynamicAction() );

		// Assert.
		expect( result.current.visible ).toBeFalsy();
	} );

	it.skip( 'should return a valid control-action object - visible and functional', () => {
		// TODO: Fix me!
		// Arrange
		mockElementPropSchema(
			'title',
			createMockPropType( {
				kind: 'union',
				default: 'test value',
				prop_types: {
					string: createMockPropType( { kind: 'plain', key: 'string' } ),
					dynamic: createMockPropType( {
						kind: 'plain',
						key: 'dynamic',
						settings: { categories: [ 'url', 'string' ] },
					} ),
				},
			} )
		);

		mockDynamicTags( [
			{ name: 'tag1', label: 'Tag 1', group: 'group1' },
			{ name: 'tag2', label: 'Tag 2', group: 'group1' },
		] );

		// Act.
		const { result } = renderHook( usePropDynamicAction );

		// Assert.
		expect( result.current.visible ).toBeTruthy();

		// Arrange.
		const onClose = jest.fn();
		const PopoverContent = result.current.content;

		// Act.
		renderWithTheme( <PopoverContent close={ onClose } /> );

		const tag1 = screen.getByText( 'Tag 1' );

		// Assert.
		expect( tag1 ).toBeInTheDocument();

		// Act.
		fireEvent.click( tag1 );

		// Assert.
		expect( onClose ).toHaveBeenCalled();
	} );
} );

const mockElementPropSchema = ( bind: string, propSchema: PropType ) => {
	const mockElementType: ElementType = {
		key: 'heading',
		controls: [],
		title: 'Heading',
		propsSchema: {
			[ bind ]: propSchema,
		},
	};

	jest.mocked( useElement ).mockReturnValue( { elementType: mockElementType, element: {} as never } );
	jest.mocked( useBoundProp ).mockReturnValue( {
		value: '',
		setValue: jest.fn(),
		bind,
		propType: propSchema,
		path: [],
		restoreValue: jest.fn(),
	} );
};

const mockDynamicTags = ( tags: Partial< DynamicTag >[] ) => {
	jest.mocked( usePropDynamicTags ).mockReturnValue( tags as DynamicTag[] );
};
