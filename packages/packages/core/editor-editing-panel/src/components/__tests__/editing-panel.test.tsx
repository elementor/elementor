import * as React from 'react';
import { createMockElementType, renderWithTheme } from 'test-utils';
import { type Element, type ElementType, useSelectedElement } from '@elementor/editor-elements';
import { act, screen } from '@testing-library/react';

import {
	notifyEditingPanelReplacementRegistryChanged,
	registerEditingPanelReplacement,
} from '../../editing-panel-replacement-registry';
import { EditingPanel } from '../editing-panel';

jest.mock( '@elementor/editor-elements', () => ( {
	...jest.requireActual( '@elementor/editor-elements' ),
	useSelectedElement: jest.fn(),
} ) );

describe( '<EditingPanel />', () => {
	it( 'should render the selected element editing panel', () => {
		// Arrange
		jest.mocked( useSelectedElement ).mockReturnValue( {
			element: { id: '1', type: 'atomic-heading' },
			elementType: createMockElementType( { key: 'atomic-heading', title: 'Heading' } ),
		} );

		// Act.
		renderWithTheme( <EditingPanel /> );

		// Assert.
		expect( screen.getByText( 'Edit Heading' ) ).toBeInTheDocument();
	} );

	it.each( [
		{
			title: 'element is empty',
			element: null,
			elementType: createMockElementType( { key: 'atomic-heading', title: 'Heading' } ),
		},
		{
			title: 'element type is empty',
			element: { id: '1', type: 'atomic-heading' },
			elementType: null,
		},
	] )( 'should not render panel when $title', ( { element, elementType } ) => {
		// Arrange.
		jest.mocked( useSelectedElement ).mockReturnValue( {
			element: element as Element,
			elementType: elementType as ElementType,
		} );

		// Act.
		renderWithTheme( <EditingPanel /> );

		// Assert.
		expect( screen.queryByText( 'Edit Heading' ) ).not.toBeInTheDocument();
	} );

	it( 'should recalculate replacement when notify is called', () => {
		// Arrange
		let isReplacementEnabled = false;

		jest.mocked( useSelectedElement ).mockReturnValue( {
			element: { id: '1', type: 'atomic-heading' },
			elementType: createMockElementType( { key: 'atomic-heading', title: 'Heading' } ),
		} );

		const ReplacementPanel = () => <div>Replacement Panel</div>;

		registerEditingPanelReplacement( {
			id: 'test-reactive-replacement',
			condition: () => isReplacementEnabled,
			component: ReplacementPanel,
		} );

		renderWithTheme( <EditingPanel /> );

		expect( screen.getByText( 'Edit Heading' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Replacement Panel' ) ).not.toBeInTheDocument();

		// Act
		isReplacementEnabled = true;

		act( () => {
			notifyEditingPanelReplacementRegistryChanged();
		} );

		// Assert
		expect( screen.getByText( 'Replacement Panel' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Edit Heading' ) ).not.toBeInTheDocument();
	} );
} );
