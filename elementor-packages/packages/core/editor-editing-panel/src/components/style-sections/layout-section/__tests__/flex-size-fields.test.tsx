import * as React from 'react';
import { createMockPropType, renderWithTheme } from 'test-utils';
import { ControlActionsProvider } from '@elementor/editor-controls';
import { type NumberPropValue, type SizePropValue } from '@elementor/editor-props';
import { getStylesSchema } from '@elementor/editor-styles';
import { fireEvent, screen } from '@testing-library/react';

import { useDirection } from '../../../../hooks/use-direction';
import { useStylesFields } from '../../../../hooks/use-styles-fields';
import { FlexSizeField } from '../flex-size-field';

jest.mock( '@elementor/editor-styles' );
jest.mock( '../../../../hooks/use-direction' );
jest.mock( '../../../../hooks/use-styles-fields' );
jest.mock( '../../../../styles-inheritance/components/styles-inheritance-indicator' );

jest.mock( '@elementor/editor-controls', () => {
	const actual = jest.requireActual( '@elementor/editor-controls' );
	return {
		...actual,
		useControlActions: () => ( {
			items: [],
		} ),
	};
} );

describe( '<FlexSizeField />', () => {
	const styleFields = {
		'flex-grow': { value: null as NumberPropValue | null },
		'flex-shrink': { value: null as NumberPropValue | null },
		'flex-basis': { value: null as SizePropValue | null },
	};

	const useStylesFieldsMock = ( propNames: string[] ) => {
		const values = propNames.reduce(
			( acc, propName ) => {
				acc[ propName ] = styleFields[ propName as keyof typeof styleFields ]?.value;

				return acc;
			},
			{} as Record< string, NumberPropValue | SizePropValue | null >
		);

		const setValues = ( newValues: Record< string, NumberPropValue | SizePropValue | null > ) => {
			Object.entries( newValues ).forEach( ( [ key, value ] ) => {
				styleFields[ key as keyof typeof styleFields ].value = value;
			} );
		};

		return { values, setValues, canEdit: true };
	};

	beforeEach( () => {
		jest.mocked( useDirection ).mockReturnValue( { isUiRtl: false, isSiteRtl: false } );

		jest.mocked( getStylesSchema ).mockReturnValue( {
			'flex-grow': createMockPropType( { kind: 'plain' } ),
			'flex-shrink': createMockPropType( { kind: 'plain' } ),
			'flex-basis': createMockPropType( { kind: 'plain' } ),
		} );

		jest.mocked( useStylesFields ).mockImplementation( useStylesFieldsMock as never );
	} );

	afterEach( () => {
		styleFields[ 'flex-grow' ].value = null;
		styleFields[ 'flex-shrink' ].value = null;
		styleFields[ 'flex-basis' ].value = null;
	} );

	it( 'should not have any toggle button marked as "selected" when no value is set', () => {
		// Act.
		renderWithTheme(
			<ControlActionsProvider items={ [] }>
				<FlexSizeField />
			</ControlActionsProvider>
		);

		const buttons = screen.getAllByRole( 'button' );

		// Assert.
		buttons.forEach( ( button ) => expect( button ).not.toHaveAttribute( 'aria-pressed', 'true' ) );
	} );

	it( 'should affect flex-grow prop when "Grow" button is clicked', () => {
		// Act.
		renderWithTheme(
			<ControlActionsProvider items={ [] }>
				<FlexSizeField />
			</ControlActionsProvider>
		);

		const growButton = screen.getByLabelText( 'Grow' );

		fireEvent.click( growButton );

		// Assert.
		expect( styleFields[ 'flex-grow' ].value?.value ).toBe( 1 );
		expect( styleFields[ 'flex-shrink' ].value ).toBe( null );
		expect( styleFields[ 'flex-basis' ].value ).toBe( null );

		fireEvent.click( growButton );

		// Assert.
		expect( styleFields[ 'flex-grow' ].value ).toBe( null );
		expect( styleFields[ 'flex-shrink' ].value ).toBe( null );
		expect( styleFields[ 'flex-basis' ].value ).toBe( null );
	} );

	it( 'should mark the "Grow" button as "selected" when flex-grow is 1', () => {
		// Arrange.
		styleFields[ 'flex-grow' ].value = { $$type: 'number', value: 1 };

		// Act.
		renderWithTheme(
			<ControlActionsProvider items={ [] }>
				<FlexSizeField />
			</ControlActionsProvider>
		);

		const growButton = screen.getByLabelText( 'Grow' );

		// Assert.
		expect( growButton ).toHaveAttribute( 'aria-pressed', 'true' );
	} );

	it( 'should affect flex-shrink prop when "Shrink" button is clicked', () => {
		// Act.
		renderWithTheme(
			<ControlActionsProvider items={ [] }>
				<FlexSizeField />
			</ControlActionsProvider>
		);

		const shrinkButton = screen.getByLabelText( 'Shrink' );

		fireEvent.click( shrinkButton );

		// Assert.
		expect( styleFields[ 'flex-grow' ].value ).toBe( null );
		expect( styleFields[ 'flex-shrink' ].value?.value ).toBe( 1 );
		expect( styleFields[ 'flex-basis' ].value ).toBe( null );

		// Act.
		fireEvent.click( shrinkButton );

		// Assert.
		expect( styleFields[ 'flex-grow' ].value ).toBe( null );
		expect( styleFields[ 'flex-shrink' ].value ).toBe( null );
		expect( styleFields[ 'flex-basis' ].value ).toBe( null );
	} );

	it( 'should mark the "Shrink" button as "selected" when flex-shrink is 1', () => {
		// Arrange.
		styleFields[ 'flex-shrink' ].value = { $$type: 'number', value: 1 };

		// Act.
		renderWithTheme(
			<ControlActionsProvider items={ [] }>
				<FlexSizeField />
			</ControlActionsProvider>
		);

		const shrinkButton = screen.getByLabelText( 'Shrink' );

		// Assert.
		expect( shrinkButton ).toHaveAttribute( 'aria-pressed', 'true' );
	} );

	it( 'Flex custom button functionality', () => {
		// Act.
		renderWithTheme(
			<ControlActionsProvider items={ [] }>
				<FlexSizeField />
			</ControlActionsProvider>
		);

		const customButton = screen.getByLabelText( 'Custom' );

		fireEvent.click( customButton );

		const basisInputLabel = screen.getByText( 'Basis' );

		// Assert.
		expect( styleFields[ 'flex-grow' ].value ).toBe( null );
		expect( styleFields[ 'flex-shrink' ].value ).toBe( null );
		expect( styleFields[ 'flex-basis' ].value ).toBe( null );
		expect( basisInputLabel ).toBeVisible();

		// Act.
		fireEvent.click( customButton );

		// Assert.
		expect( styleFields[ 'flex-grow' ].value ).toBe( null );
		expect( styleFields[ 'flex-shrink' ].value ).toBe( null );
		expect( styleFields[ 'flex-basis' ].value ).toBe( null );
		expect( basisInputLabel ).not.toBeVisible();
	} );

	it( 'should mark "Custom" button as "selected" when flex-grow is not 1', () => {
		// Arrange.
		styleFields[ 'flex-grow' ].value = { $$type: 'number', value: 2 };

		// Act.
		renderWithTheme(
			<ControlActionsProvider items={ [] }>
				<FlexSizeField />
			</ControlActionsProvider>
		);

		const customButton = screen.getByLabelText( 'Custom' );

		// Assert.
		expect( customButton ).toHaveAttribute( 'aria-pressed', 'true' );
	} );

	it( 'should mark "Custom" button as "selected" when flex-shrink is not 1', () => {
		// Arrange.
		styleFields[ 'flex-shrink' ].value = { $$type: 'number', value: 2 };

		// Act.
		renderWithTheme(
			<ControlActionsProvider items={ [] }>
				<FlexSizeField />
			</ControlActionsProvider>
		);

		const customButton = screen.getByLabelText( 'Custom' );

		// Assert.
		expect( customButton ).toHaveAttribute( 'aria-pressed', 'true' );
	} );

	it( 'should mark "Custom" button as "selected" when flex-basis is set', () => {
		// Arrange.
		styleFields[ 'flex-basis' ].value = {
			$$type: 'size',
			value: { size: 1, unit: 'px' },
		};

		// Act.
		renderWithTheme(
			<ControlActionsProvider items={ [] }>
				<FlexSizeField />
			</ControlActionsProvider>
		);

		const customButton = screen.getByLabelText( 'Custom' );

		// Assert.
		expect( customButton ).toHaveAttribute( 'aria-pressed', 'true' );
	} );

	it( 'should mark "Custom" button as "selected" when both flex-grow and flex-shrink are set', () => {
		// Arrange.
		styleFields[ 'flex-grow' ].value = {
			$$type: 'number',
			value: 1,
		};
		styleFields[ 'flex-shrink' ].value = {
			$$type: 'number',
			value: 1,
		};

		// Act.
		renderWithTheme(
			<ControlActionsProvider items={ [] }>
				<FlexSizeField />
			</ControlActionsProvider>
		);

		const customButton = screen.getByLabelText( 'Custom' );

		// Assert.
		expect( customButton ).toHaveAttribute( 'aria-pressed', 'true' );
	} );

	it( 'should mark "Grow" button as "selected" when flex-grow is 1 and flex-shrink is 0', () => {
		// Arrange.
		styleFields[ 'flex-grow' ].value = {
			$$type: 'number',
			value: 1,
		};
		styleFields[ 'flex-shrink' ].value = {
			$$type: 'number',
			value: 0,
		};

		// Act.
		renderWithTheme(
			<ControlActionsProvider items={ [] }>
				<FlexSizeField />
			</ControlActionsProvider>
		);

		const growButton = screen.getByLabelText( 'Grow' );

		// Assert.
		expect( growButton ).toHaveAttribute( 'aria-pressed', 'true' );
	} );

	it( 'should mark "Shrink" button as "selected" when flex-grow is 0 and flex-shrink is 1', () => {
		// Arrange.
		styleFields[ 'flex-grow' ].value = {
			$$type: 'number',
			value: 0,
		};
		styleFields[ 'flex-shrink' ].value = {
			$$type: 'number',
			value: 1,
		};

		// Act.
		renderWithTheme(
			<ControlActionsProvider items={ [] }>
				<FlexSizeField />
			</ControlActionsProvider>
		);

		const customButton = screen.getByLabelText( 'Shrink' );

		// Assert.
		expect( customButton ).toHaveAttribute( 'aria-pressed', 'true' );
	} );
} );
