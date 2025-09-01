import * as React from 'react';
import { createMockElementType, createMockPropType, renderWithTheme } from 'test-utils';
import { useBoundProp } from '@elementor/editor-controls';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { mockElement } from '../../../__tests__/utils';
import { useElement } from '../../../contexts/element-context';
import { usePersistDynamicValue } from '../../../hooks/use-persist-dynamic-value';
import { useDynamicTag } from '../../hooks/use-dynamic-tag';
import { usePropDynamicTags } from '../../hooks/use-prop-dynamic-tags';
import { type DynamicTag } from '../../types';
import { DynamicSelectionControl } from '../dynamic-selection-control';

jest.mock( '@elementor/editor-controls' );
jest.mock( '../../hooks/use-dynamic-tag' );
jest.mock( '../../hooks/use-prop-dynamic-tags' );
jest.mock( '../../../hooks/use-persist-dynamic-value' );
jest.mock( '../../../contexts/element-context' );

describe( '<DynamicSelectionControl />', () => {
	beforeEach( () => {
		jest.mocked( useBoundProp ).mockReturnValue( {
			value: 'value',
			setValue: jest.fn(),
			bind: '',
			propType: createMockPropType( { kind: 'plain' } ),
			path: [],
			restoreValue: jest.fn(),
		} );

		jest.mocked( useDynamicTag ).mockReturnValue( {
			name: 'author-info',
			label: 'Author Info',
			categories: [],
			props_schema: {},
			group: 'author',
			atomic_controls: [],
		} );

		jest.mocked( usePersistDynamicValue ).mockReturnValue( [] as never );

		const element = mockElement();
		const elementType = createMockElementType();
		jest.mocked( useElement ).mockReturnValue( { element, elementType } );
	} );

	afterEach( () => {
		jest.clearAllMocks();
		jest.resetAllMocks();
	} );

	it( 'should render the control label', () => {
		// Act.
		renderWithTheme( <DynamicSelectionControl /> );

		// Assert.
		expect( screen.getByText( 'Author Info' ) ).toBeInTheDocument();
	} );

	it( 'should open the selection popover when the control is clicked', async () => {
		// Arrange.
		const dynamicTag: DynamicTag = {
			name: 'author-info',
			categories: [ 'text' ],
			label: 'Author Info',
			group: 'author',
			props_schema: {},
			atomic_controls: [
				{
					type: 'section',
					value: {
						label: 'Advanced',
						items: [
							{
								type: 'control',
								value: {
									type: 'text',
									bind: 'before',
									props: {},
								},
							},
						],
					},
				},
			],
		};

		jest.mocked( useDynamicTag ).mockReturnValue( dynamicTag );

		jest.mocked( usePropDynamicTags ).mockReturnValue( [ dynamicTag ] );

		// Act.
		renderWithTheme( <DynamicSelectionControl /> );

		fireEvent.click( screen.getByRole( 'button' ) );

		// Assert.
		await waitFor( () => {
			expect( screen.getByText( 'Dynamic tags' ) ).toBeInTheDocument();
		} );
	} );

	it( 'should set the the prop value from saved history on remove', () => {
		// Arrange.
		const setValue = jest.fn();
		jest.mocked( useBoundProp ).mockReturnValue( {
			value: 'value',
			setValue,
			bind: '',
			propType: createMockPropType( { kind: 'plain' } ),
			path: [],
			restoreValue: jest.fn(),
		} );
		jest.mocked( usePersistDynamicValue ).mockReturnValue( [ 'My last title', jest.fn(), jest.fn() ] );

		// Act.
		renderWithTheme( <DynamicSelectionControl /> );

		// eslint-disable-next-line testing-library/no-node-access
		const removeButton = document.querySelector( 'button[aria-label="Remove dynamic value"]' );

		if ( removeButton ) {
			fireEvent.click( removeButton );
		}

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( 'My last title' );
	} );

	it( 'should set null if there is no value saved in history on remove', () => {
		// Arrange.
		const setValue = jest.fn();
		jest.mocked( useBoundProp ).mockReturnValue( {
			value: 'value',
			setValue,
			bind: '',
			propType: createMockPropType( { kind: 'plain' } ),
			path: [],
			restoreValue: jest.fn(),
		} );
		jest.mocked( usePersistDynamicValue ).mockReturnValue( [ undefined, jest.fn(), jest.fn() ] );

		// Act.
		renderWithTheme( <DynamicSelectionControl /> );

		// eslint-disable-next-line testing-library/no-node-access
		const removeButton = document.querySelector( 'button[aria-label="Remove dynamic value"]' );

		// make sure the button exists
		expect( removeButton ).not.toBeNull();

		if ( removeButton ) {
			fireEvent.click( removeButton );
		}

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( null );
	} );
} );
