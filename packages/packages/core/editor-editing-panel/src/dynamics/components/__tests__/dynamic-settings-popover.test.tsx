import * as React from 'react';
import { createMockPropType, renderWithTheme } from 'test-utils';
import { useBoundProp } from '@elementor/editor-controls';
import { fireEvent, screen } from '@testing-library/react';

import { ElementProvider } from '../../../contexts/element-context';
import { useDynamicTag } from '../../hooks/use-dynamic-tag';
import { type DynamicTag } from '../../types';
import { DynamicSettingsPopover } from '../dynamic-selection-control';

jest.mock( '@elementor/editor-controls', () => ( {
	...jest.requireActual( '@elementor/editor-controls' ),
	useBoundProp: jest.fn(),
} ) );

jest.mock( '../../hooks/use-dynamic-tag' );

const elementProviderProps = {
	element: { type: 'element', id: '1' },
	elementType: {
		controls: [],
		title: '',
		key: '',
		propsSchema: {},
	},
};

describe( '<DynamicSettingsPopover />', () => {
	beforeEach( () => {
		jest.mocked( useBoundProp ).mockReturnValue( {
			value: '',
			setValue: jest.fn(),
			bind: '',
			propType: createMockPropType( { kind: 'object' } ),
			path: [],
			restoreValue: jest.fn(),
		} );
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should not render settings popover button if the dynamic tag does not have controls', () => {
		// Arrange.
		const dynamicTag = mockDynamicTag( {
			atomic_controls: [],
		} );

		// Act.
		renderWithTheme( <DynamicSettingsPopover dynamicTag={ dynamicTag } /> );

		// Assert.
		expect( screen.queryByRole( 'button', { name: 'Settings' } ) ).not.toBeInTheDocument();
	} );

	it( 'should render settings popover button if the dynamic tag has controls', () => {
		// Arrange.
		const dynamicTag = mockDynamicTag( {
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
		} );

		// Act.
		renderWithTheme( <DynamicSettingsPopover dynamicTag={ dynamicTag } /> );

		// Assert.
		expect( screen.getByRole( 'button', { name: 'Settings' } ) ).toBeInTheDocument();
	} );

	it( 'should open the settings popover when the settings button is clicked, and show its tabs and controls', () => {
		// Arrange.
		const dynamicTag = mockDynamicTag( {
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
									label: 'Before',
									props: {},
								},
							},
						],
					},
				},
				{
					type: 'section',
					value: {
						label: 'Settings',
						items: [
							{
								type: 'control',
								value: {
									type: 'text',
									bind: 'after',
									label: 'After',
									props: {},
								},
							},
						],
					},
				},
			],
		} );

		// Act.
		renderWithTheme(
			<ElementProvider { ...elementProviderProps }>
				<DynamicSettingsPopover dynamicTag={ dynamicTag } />
			</ElementProvider>
		);
		fireEvent.click( screen.getByRole( 'button', { name: 'Settings' } ) );

		// Assert.
		expect( screen.getByText( 'Advanced' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Before' ) ).toBeInTheDocument();

		// Act.
		fireEvent.click( screen.getByText( 'Settings' ) ); // Move to second tab.

		// Assert.
		expect( screen.getByText( 'After' ) ).toBeInTheDocument();
	} );

	it( 'should not render top-level non-section controls', () => {
		// Arrange.
		const dynamicTag = mockDynamicTag( {
			atomic_controls: [
				{
					type: 'control',
					value: {
						type: 'text',
						bind: 'before',
						label: 'Before',
						props: {},
					},
				},
				{
					type: 'section',
					value: {
						label: 'Settings',
						items: [
							{
								type: 'control',
								value: {
									type: 'text',
									bind: 'after',
									label: 'After',
									props: {},
								},
							},
						],
					},
				},
			],
		} );

		// Act.
		renderWithTheme(
			<ElementProvider { ...elementProviderProps }>
				<DynamicSettingsPopover dynamicTag={ dynamicTag } />
			</ElementProvider>
		);
		fireEvent.click( screen.getByRole( 'button', { name: 'Settings' } ) );

		// Assert.
		expect( screen.queryByText( 'Before' ) ).not.toBeInTheDocument();
	} );
} );

const mockDynamicTag = ( params: Partial< DynamicTag > = {} ) => {
	const dynamicTag = {
		name: 'author-info',
		categories: [ 'text' ],
		label: 'Author Info',
		group: 'author',
		atomic_controls: [],
		props_schema: {},
		...params,
	} as DynamicTag;

	jest.mocked( useDynamicTag ).mockReturnValue( dynamicTag );

	return dynamicTag;
};
