import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { act, fireEvent, screen, within } from '@testing-library/react';

import { ColorField } from '../../fields/color-field';
import { VariableEditableCell } from '../variable-editable-cell';

describe( 'VariableEditableCell color format menu', () => {
	const renderEditingColorCell = () => {
		const onChange = jest.fn();

		renderWithTheme(
			<VariableEditableCell
				initialValue="#ff0000"
				autoEdit
				fieldType="value"
				editableElement={ ( props ) => <ColorField { ...props } /> }
				onChange={ onChange }
			>
				<span>#ff0000</span>
			</VariableEditableCell>
		);

		const colorIndicator = screen.getAllByRole( 'button' ).find( ( button ) => button.tagName === 'BUTTON' );
		fireEvent.click( colorIndicator! );

		return { onChange };
	};

	const activateClickAway = async () => {
		await act( async () => {
			await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );
		} );
	};

	it( 'keeps edit mode and the color picker open when the format dropdown opens', async () => {
		// Arrange
		const { onChange } = renderEditingColorCell();
		const formatSelect = screen.getByRole( 'combobox', { hidden: true } );
		await activateClickAway();

		// Act
		fireEvent.mouseDown( formatSelect );

		const colorPopover = screen.getAllByRole( 'presentation', { hidden: true } ).find( ( node ) => {
			return within( node ).queryByRole( 'slider', { name: 'Hue', hidden: true } );
		} );

		// Assert
		expect( colorPopover ).toBeTruthy();
		expect( within( colorPopover! ).getByRole( 'listbox', { hidden: true } ) ).toBeInTheDocument();

		fireEvent.click( screen.getByRole( 'option', { name: 'RGB', hidden: true } ) );

		expect( screen.getByRole( 'slider', { name: 'Hue', hidden: true } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'combobox', { hidden: true } ) ).toHaveTextContent( 'RGB' );
		expect( onChange ).not.toHaveBeenCalled();
	} );

	it( 'saves and closes when clicking outside the color field', async () => {
		// Arrange
		const { onChange } = renderEditingColorCell();
		await activateClickAway();

		// Act
		fireEvent.click( document.body );

		// Assert
		expect( screen.queryByRole( 'slider', { name: 'Hue', hidden: true } ) ).not.toBeInTheDocument();
		expect( onChange ).toHaveBeenCalledWith( '#ff0000' );
	} );
} );
