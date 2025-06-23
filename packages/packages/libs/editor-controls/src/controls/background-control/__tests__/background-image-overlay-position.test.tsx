import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { BackgroundImageOverlayPosition } from '../background-overlay/background-image-overlay/background-image-overlay-position';

const propType = createMockPropType( {
	kind: 'union',
	prop_types: {
		string: createMockPropType( { kind: 'plain' } ),
		'background-image-position-offset': createMockPropType( {
			kind: 'object',
			shape: {
				x: createMockPropType( { kind: 'plain' } ),
				y: createMockPropType( { kind: 'plain' } ),
			},
		} ),
	},
} );

describe( 'BackgroundImageOverlayPosition', () => {
	it( 'should render position offset prop type values with custom position', () => {
		// Arrange.
		const setValue = jest.fn();

		const props = {
			setValue,
			propType,
			bind: 'position',
			value: {
				$$type: 'background-image-position-offset',
				value: {
					x: { $$type: 'size', value: { unit: 'px', size: 600 } },
					y: { $$type: 'size', value: { unit: 'px', size: 80 } },
				},
			},
		};

		// Act.
		renderControl( <BackgroundImageOverlayPosition />, props );

		const [ x, y ] = screen.getAllByRole( 'spinbutton' );
		expect( screen.getByText( 'Position' ) ).toBeInTheDocument();
		expect( x ).toHaveValue( 600 );
		expect( y ).toHaveValue( 80 );
	} );

	it( 'should render position offset prop type values with plain value', () => {
		// Arrange.
		const setValue = jest.fn();
		const props = {
			setValue,
			propType,
			bind: 'position',
			value: {
				$$type: 'string',
				value: 'center center',
			},
		};

		// Act.
		renderControl( <BackgroundImageOverlayPosition />, props );

		// Assert.
		expect( screen.getByText( 'Position' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Center center' ) ).toBeInTheDocument();
	} );

	it( 'should switch to custom position', async () => {
		// Arrange.
		const setValue = jest.fn();
		const props = {
			setValue,
			propType,
			bind: 'position',
			value: {
				$$type: 'string',
				value: 'center center',
			},
		};

		renderControl( <BackgroundImageOverlayPosition />, props );

		// Act.
		const select = screen.getByRole( 'combobox' );

		fireEvent.mouseDown( select );

		fireEvent.click( screen.getByText( 'Custom' ) );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'background-image-position-offset',
			value: {
				x: null,
				y: null,
			},
		} );
	} );

	it( 'should switch to plain position', async () => {
		// Arrange.
		const setValue = jest.fn();
		const props = {
			setValue,
			propType,
			bind: 'position',
			value: {
				$$type: 'background-image-position-offset',
				value: {
					x: null,
					y: null,
				},
			},
		};

		renderControl( <BackgroundImageOverlayPosition />, props );

		// Act.
		const select = screen.getByRole( 'combobox' );

		fireEvent.mouseDown( select );

		fireEvent.click( screen.getByText( 'Center center' ) );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'string',
			value: 'center center',
		} );
	} );
} );
