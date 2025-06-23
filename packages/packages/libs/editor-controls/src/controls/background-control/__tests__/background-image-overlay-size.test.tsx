import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { BackgroundImageOverlaySize } from '../background-overlay/background-image-overlay/background-image-overlay-size';

const propType = createMockPropType( {
	kind: 'union',
	prop_types: {
		string: createMockPropType( { kind: 'plain' } ),
		'background-image-size-scale': createMockPropType( {
			kind: 'object',
			shape: {
				width: createMockPropType( { kind: 'plain' } ),
				height: createMockPropType( { kind: 'plain' } ),
			},
		} ),
	},
} );

describe( 'BackgroundImageOverlaySize', () => {
	it( 'should render size scale prop type values with custom size', () => {
		// Arrange.
		const setValue = jest.fn();

		const props = {
			setValue,
			propType,
			bind: 'size',
			value: {
				$$type: 'background-image-size-scale',
				value: {
					width: { $$type: 'size', value: { unit: 'px', size: 400 } },
					height: { $$type: 'size', value: { unit: 'px', size: 247 } },
				},
			},
		};

		// Act.
		renderControl( <BackgroundImageOverlaySize />, props );

		const [ width, height ] = screen.getAllByRole( 'spinbutton' );

		// Assert.
		expect( screen.getByText( 'Size' ) ).toBeInTheDocument();
		expect( width ).toHaveValue( 400 );
		expect( height ).toHaveValue( 247 );
	} );

	it( 'should render size scale prop type values with plain value', () => {
		// Arrange.
		const setValue = jest.fn();
		const props = {
			setValue,
			propType,
			bind: 'size',
			value: {
				$$type: 'string',
				value: 'cover',
			},
		};

		// Act.
		renderControl( <BackgroundImageOverlaySize />, props );

		const button = screen.getByLabelText( 'Cover' );

		// Assert.
		expect( screen.getByText( 'Size' ) ).toBeInTheDocument();
		expect( button ).toBeInTheDocument();
		expect( button ).toHaveAttribute( 'aria-pressed', 'true' );
	} );

	it( 'should switch to custom size', () => {
		// Arrange.
		const setValue = jest.fn();
		const props = {
			setValue,
			propType,
			bind: 'size',
			value: {
				$$type: 'string',
				value: 'contain',
			},
		};

		// Act.
		renderControl( <BackgroundImageOverlaySize />, props );

		fireEvent.click( screen.getByLabelText( 'Custom' ) );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'background-image-size-scale',
			value: {
				width: null,
				height: null,
			},
		} );
	} );

	it( 'should switch to plain size', () => {
		// Arrange.
		const setValue = jest.fn();
		const props = {
			setValue,
			propType,
			bind: 'size',
			value: {
				$$type: 'background-image-size-scale',
				value: {
					width: null,
					height: null,
				},
			},
		};

		// Act.
		renderControl( <BackgroundImageOverlaySize />, props );

		fireEvent.click( screen.getByLabelText( 'Auto' ) );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'string',
			value: 'auto',
		} );
	} );
} );
