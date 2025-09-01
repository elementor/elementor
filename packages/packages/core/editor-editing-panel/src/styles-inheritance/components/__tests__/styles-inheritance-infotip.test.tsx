import * as React from 'react';
import { createMockPropType, initMockStylesTransformersRegistry, renderWithTheme } from 'test-utils';
import { createTransformer } from '@elementor/editor-canvas';
import { useBreakpoints } from '@elementor/editor-responsive';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';

import {
	mockInheritanceChainWithBaseLabels,
	mockInheritanceChainWithDisplay,
	mockInheritanceChainWithEmptyLabels,
	mockInheritanceChainWithMarginMultiSizeOnly,
	mockInheritanceChainWithTestProp,
	mockTestPropType,
} from '../../__tests__/mock-inheritance-chain';
import { initStylesInheritanceTransformers } from '../../init-styles-inheritance-transformers';
import { stylesInheritanceTransformersRegistry } from '../../styles-inheritance-transformers-registry';
import { StylesInheritanceInfotip } from '../styles-inheritance-infotip';

jest.mock( '@elementor/editor-responsive', () => ( {
	...jest.requireActual( '@elementor/editor-responsive' ),
	useBreakpoints: jest.fn(),
} ) );

describe( 'StylesInheritanceInfotip', () => {
	beforeAll( () => {
		initMockStylesTransformersRegistry();
		initStylesInheritanceTransformers();

		jest.mocked( useBreakpoints ).mockReturnValue( [
			{ id: 'desktop', label: 'Desktop' },
			{ id: 'tablet', label: 'Tablet' },
			{ id: 'mobile', label: 'Mobile' },
		] );
	} );

	it.each( [
		{
			should: 'render only two valid items even when more are available',
			expectedItems: [
				{
					breakpointTooltip: 'Desktop',
					chipLabel: 'local',
					value: 'flex',
				},
				{
					breakpointTooltip: 'Desktop',
					chipLabel: 'test',
					value: 'block',
				},
			],
			path: [ 'display' ],
			inheritanceChain: mockInheritanceChainWithDisplay,
			propType: createMockPropType( { kind: 'plain', key: 'string' } ),
		},
		{
			should: 'not render invalid item with empty label',
			expectedItems: [
				{
					breakpointTooltip: 'Desktop',
					chipLabel: 'local',
					value: 'flex',
				},
			],
			path: [ 'display' ],
			inheritanceChain: mockInheritanceChainWithEmptyLabels,
			propType: createMockPropType( { kind: 'plain', key: 'string' } ),
		},
		{
			should: 'render base labels and values correctly',
			expectedItems: [
				{
					breakpointTooltip: 'Desktop',
					chipLabel: 'local',
					value: 'flex',
				},
				{
					breakpointTooltip: 'Desktop',
					chipLabel: 'Base',
					value: 'inline-flex',
				},
			],
			path: [ 'display' ],
			inheritanceChain: mockInheritanceChainWithBaseLabels,
			propType: createMockPropType( { kind: 'plain', key: 'string' } ),
		},
		{
			should: 'render multi props values when all values are multi props',
			expectedItems: [
				{
					breakpointTooltip: 'Desktop',
					chipLabel: 'local',
					value: '50px',
				},
				{
					breakpointTooltip: 'Desktop',
					chipLabel: 'customMargin',
					value: '10px',
				},
			],
			path: [ 'margin', 'block-start' ],
			inheritanceChain: mockInheritanceChainWithMarginMultiSizeOnly,
			propType: createMockPropType( { kind: 'plain', key: 'size' } ),
		},
		{
			should: 'fallback to the default transformer when no transformer is registered',
			expectedItems: [
				{
					breakpointTooltip: 'Desktop',
					chipLabel: 'test-1',
					value: '1',
				},
				{
					breakpointTooltip: 'Desktop',
					chipLabel: 'test-2',
					value: '2',
				},
			],
			path: [ 'someTestProp' ],
			inheritanceChain: mockInheritanceChainWithTestProp,
			propType: mockTestPropType,
		},
		{
			should: 'use any transformers registered to the styles inheritance registry',
			expectedItems: [
				{
					breakpointTooltip: 'Desktop',
					chipLabel: 'test-1',
					value: '1-transformed',
				},
				{
					breakpointTooltip: 'Desktop',
					chipLabel: 'test-2',
					value: '2-transformed',
				},
			],
			path: [ 'someTestProp' ],
			inheritanceChain: mockInheritanceChainWithTestProp,
			propType: mockTestPropType,
			before: () => {
				stylesInheritanceTransformersRegistry.register(
					mockTestPropType.key,
					createTransformer( ( value: unknown ) => `${ value }-transformed` )
				);
			},
		},
	] )( 'should $should', async ( { expectedItems, path, inheritanceChain, propType, before } ) => {
		// Act.
		before?.();

		renderWithTheme(
			<StylesInheritanceInfotip { ...{ inheritanceChain, propType, path } } label="Test label">
				<div>Test indicator</div>
			</StylesInheritanceInfotip>
		);

		// Open the infotip by clicking the button
		const button = screen.getByRole( 'button', { name: 'Test label' } );
		fireEvent.click( button );

		// Assert.
		let allBoxItems!: HTMLElement[];

		await waitFor( () => {
			allBoxItems = screen.getAllByRole( 'listitem', { name: /inheritance/i } );
			expect( allBoxItems ).toHaveLength( expectedItems.length );
		} );

		expectedItems.forEach( ( item, index ) => {
			const boxItem = allBoxItems[ index ];

			const breakpointIcon = within( boxItem ).getByLabelText( item.breakpointTooltip );
			expect( breakpointIcon ).toBeInTheDocument();

			const chipLabel = within( boxItem ).getByText( item.chipLabel );
			expect( chipLabel ).toBeInTheDocument();

			const valueText = within( boxItem ).getByText( item.value );
			expect( valueText ).toBeInTheDocument();
		} );
	} );
} );
