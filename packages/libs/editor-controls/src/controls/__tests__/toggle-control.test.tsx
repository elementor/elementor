import * as React from 'react';
import { createMockPropType, renderControl, type RenderControlProps } from 'test-utils';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { fireEvent, screen } from '@testing-library/react';

import { ToggleControl } from '../toggle-control';

const propType = createMockPropType( { kind: 'plain' } );
const setValue = jest.fn();
const mockOptions = [
	{ label: 'Option 1', value: 'value1', renderContent: () => 'Option 1' },
	{ label: 'Option 2', value: 'value2', renderContent: () => 'Option 2' },
	{ label: 'Option 3', value: 'value3', renderContent: () => 'Option 3' },
];

const renderWithTheme = ( ui: React.ReactElement, themeOptions = {}, props: RenderControlProps ) => {
	const theme = createTheme( themeOptions );
	return renderControl( <ThemeProvider theme={ theme }>{ ui }</ThemeProvider>, props );
};

describe( 'ToggleControl', () => {
	describe( 'exclusive mode', () => {
		it( 'should allow only one option to be selected at a time', () => {
			// Arrange.
			const props = {
				setValue,
				value: { $$type: 'string', value: 'value1' },
				propType,
			};

			renderControl( <ToggleControl options={ mockOptions } exclusive={ true } />, props );

			const button1 = screen.getByRole( 'button', { name: 'Option 1' } );
			const button2 = screen.getByRole( 'button', { name: 'Option 2' } );
			const button3 = screen.getByRole( 'button', { name: 'Option 3' } );

			// Assert.
			expect( button1 ).toHaveAttribute( 'aria-pressed', 'true' );
			expect( button2 ).toHaveAttribute( 'aria-pressed', 'false' );
			expect( button3 ).toHaveAttribute( 'aria-pressed', 'false' );

			// Act.
			fireEvent.click( button2 );

			// Assert.
			expect( setValue ).toHaveBeenCalledWith( {
				$$type: 'string',
				value: 'value2',
			} );
		} );
	} );

	describe( ' non-exclusive mode', () => {
		it( 'should allow multiple selection', () => {
			// Arrange.
			const props = {
				setValue,
				value: { $$type: 'string', value: 'value1 value2' },
				propType,
			};

			renderControl( <ToggleControl options={ mockOptions } exclusive={ false } />, props );

			const button1 = screen.getByRole( 'button', { name: 'Option 1' } );
			const button2 = screen.getByRole( 'button', { name: 'Option 2' } );
			const button3 = screen.getByRole( 'button', { name: 'Option 3' } );

			// Assert.
			expect( button1 ).toHaveAttribute( 'aria-pressed', 'true' );
			expect( button2 ).toHaveAttribute( 'aria-pressed', 'true' );
			expect( button3 ).toHaveAttribute( 'aria-pressed', 'false' );

			// Act.
			fireEvent.click( button3 );

			// Assert.
			expect( setValue ).toHaveBeenCalledWith( {
				$$type: 'string',
				value: 'value1 value2 value3',
			} );
		} );

		it( 'should select only the exclusive option when clicked, while other options are selected', () => {
			// Arrange.
			const options = [
				{ label: 'Option 1', value: 'value1', renderContent: () => 'Option 1' },
				{ label: 'Option 2', value: 'value2', renderContent: () => 'Option 2' },
				{ label: 'Option 3', value: 'value3', exclusive: true, renderContent: () => 'Option 3' },
				{ label: 'Option 4', value: 'value4', exclusive: true, renderContent: () => 'Option 4' },
			];

			const props = {
				setValue,
				value: { $$type: 'string', value: 'value1 value2' },
				propType,
			};

			// Act.
			renderControl( <ToggleControl options={ options } exclusive={ false } />, props );

			fireEvent.click( screen.getByRole( 'button', { name: 'Option 3' } ) );

			// Assert.
			expect( setValue ).toHaveBeenCalledWith( {
				$$type: 'string',
				value: 'value3',
			} );

			// Act.
			fireEvent.click( screen.getByRole( 'button', { name: 'Option 4' } ) );

			// Assert.
			expect( setValue ).toHaveBeenCalledWith( {
				$$type: 'string',
				value: 'value4',
			} );
		} );

		it( 'should replace exclusive selection with non-exclusive one', () => {
			// Arrange.
			const options = [
				{ label: 'Option 1', value: 'value1', renderContent: () => 'Option 1' },
				{ label: 'Option 2', value: 'value2', exclusive: true, renderContent: () => 'Option 2' },
			];

			const props = {
				setValue,
				value: { $$type: 'string', value: 'value2' },
				propType,
			};

			// Act.
			renderControl( <ToggleControl options={ options } exclusive={ false } />, props );

			fireEvent.click( screen.getByRole( 'button', { name: 'Option 1' } ) );

			// Assert.
			expect( setValue ).toHaveBeenCalledWith( {
				$$type: 'string',
				value: 'value1',
			} );
		} );
	} );

	describe( 'placeholder styling', () => {
		it( 'does not apply placeholder style if no placeholder is set', () => {
			const props = {
				setValue,
				value: { $$type: 'string', value: '' },
				propType,
			};

			renderWithTheme(
				<ToggleControl options={ mockOptions } exclusive={ true } />,
				{ palette: { mode: 'light' } },
				props
			);

			const button1 = screen.getByRole( 'button', { name: 'Option 1' } );
			const button2 = screen.getByRole( 'button', { name: 'Option 2' } );
			const button3 = screen.getByRole( 'button', { name: 'Option 3' } );

			expect( button1 ).not.toHaveStyle( 'background-color: rgba(0,0,0,0.02)' );
			expect( button2 ).not.toHaveStyle( 'background-color: rgba(0,0,0,0.02)' );
			expect( button3 ).not.toHaveStyle( 'background-color: rgba(0,0,0,0.02)' );
		} );

		it( 'removes placeholder style when a value is selected', () => {
			const props = {
				setValue,
				value: { $$type: 'string', value: 'value1' },
				propType,
				placeholder: 'value2',
			};

			renderWithTheme(
				<ToggleControl options={ mockOptions } exclusive={ true } />,
				{ palette: { mode: 'light' } },
				props
			);

			const button1 = screen.getByRole( 'button', { name: 'Option 1' } );
			const button2 = screen.getByRole( 'button', { name: 'Option 2' } );

			expect( button2 ).not.toHaveStyle( 'background-color: rgba(0,0,0,0.02)' );
			expect( button1 ).toHaveAttribute( 'aria-pressed', 'true' );
		} );
	} );
} );
