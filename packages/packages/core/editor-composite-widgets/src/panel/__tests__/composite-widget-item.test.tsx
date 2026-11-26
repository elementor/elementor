import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { startDragElementFromPanel } from '@elementor/editor-canvas';
import { dropElement } from '@elementor/editor-elements';
import { act, fireEvent, screen } from '@testing-library/react';

import { CompositeWidgetItem } from '../composite-widget-item';
import { createDefinition } from './panel-definitions-fixture';

jest.mock( '@elementor/editor-elements', () => ( {
	...jest.requireActual( '@elementor/editor-elements' ),
	dropElement: jest.fn( () => ( {} ) ),
} ) );

jest.mock( '@elementor/editor-canvas', () => ( {
	startDragElementFromPanel: jest.fn(),
	endDragElementFromPanel: jest.fn(),
} ) );

type Listener = () => void;

const PREVIEW_ID = 'document';
const DEFINITION = createDefinition( 'site/card', { title: 'Card' } );
const EXPECTED_MODEL = {
	elType: 'e-flexbox',
	custom: { originalWidget: 'e-flexbox', compositeWidgetId: 'site/card' },
};

describe( 'CompositeWidgetItem', () => {
	const listeners: Record< string, Listener > = {};

	beforeEach( () => {
		jest.mocked( dropElement ).mockClear();

		( window as never as Record< string, unknown > ).elementor = {
			selection: { getElements: () => [] },
			getPreviewContainer: () => ( { id: PREVIEW_ID } ),
			userCan: () => true,
			channels: {
				panelElements: {
					on: ( event: string, callback: Listener ) => {
						listeners[ event ] = callback;
					},
					off: jest.fn(),
				},
			},
		};
	} );

	it( 'should drop the widget with its composite id on click', () => {
		// Arrange.
		renderWithTheme( <CompositeWidgetItem definition={ DEFINITION } /> );

		// Act.
		fireEvent.click( screen.getByText( 'Card' ) );

		// Assert.
		expect( dropElement ).toHaveBeenCalledWith( {
			containerId: PREVIEW_ID,
			model: EXPECTED_MODEL,
			options: { at: undefined, scrollIntoView: true },
		} );
	} );

	it( 'should start a panel drag with its composite id', () => {
		// Arrange.
		renderWithTheme( <CompositeWidgetItem definition={ DEFINITION } /> );

		// Act.
		fireEvent.dragStart( screen.getByRole( 'button' ) );

		// Assert.
		expect( startDragElementFromPanel ).toHaveBeenCalledWith( EXPECTED_MODEL, expect.anything() );
	} );

	it( 'should not insert on click while dragging', () => {
		// Arrange.
		renderWithTheme( <CompositeWidgetItem definition={ DEFINITION } /> );
		act( () => listeners[ 'element:drag:start' ]() );

		// Act.
		fireEvent.click( screen.getByText( 'Card' ) );

		// Assert.
		expect( dropElement ).not.toHaveBeenCalled();
	} );
} );
