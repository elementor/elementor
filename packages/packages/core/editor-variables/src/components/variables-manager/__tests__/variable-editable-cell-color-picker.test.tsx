import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';

import { ColorField } from '../../fields/color-field';
import { type ValueFieldProps } from '../../../variables-registry/create-variable-type-registry';
import { VariableEditableCell } from '../variable-editable-cell';

jest.mock( '../../../context/variable-selection-popover.context', () => ( {
	usePopoverContentRef: jest.fn( () => null ),
} ) );

describe( 'VariableEditableCell color picker', () => {
	const mockOnChange = jest.fn();

	const ColorFieldElement = ( props: ValueFieldProps ) => <ColorField { ...props } />;

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'keeps edit mode when interacting with the portaled color format menu', async () => {
		renderWithTheme(
			<VariableEditableCell
				initialValue="#ff0000"
				editableElement={ ColorFieldElement }
				onChange={ mockOnChange }
				fieldType="value"
			>
				<span>#ff0000</span>
			</VariableEditableCell>
		);

		fireEvent.doubleClick( screen.getByRole( 'button', { name: 'Double click or press Space to edit' } ) );

		const colorField = document.getElementById( 'color-variable-field' );
		expect( colorField ).toBeTruthy();

		const pickerTrigger = within( colorField as HTMLElement ).getByRole( 'button' );
		fireEvent.click( pickerTrigger );

		const popover = await waitFor( () => {
			const popovers = Array.from( document.querySelectorAll( '.MuiPopover-root' ) );

			const colorPickerPopover = popovers.find( ( element ) =>
				within( element as HTMLElement ).queryByRole( 'combobox', { hidden: true } )
			);

			if ( ! colorPickerPopover ) {
				throw new Error( 'Color picker popover not found' );
			}

			return colorPickerPopover as HTMLElement;
		} );
		const formatSelect = within( popover ).getByRole( 'combobox', { hidden: true } );
		fireEvent.mouseDown( formatSelect );

		const listbox = await screen.findByRole( 'listbox', { hidden: true } );
		const rgbOption = within( listbox ).getByRole( 'option', { name: 'RGB', hidden: true } );
		fireEvent.click( rgbOption );

		await waitFor( () => {
			expect( within( popover ).getByRole( 'combobox', { hidden: true } ) ).toHaveTextContent( 'RGB' );
		} );

		expect( mockOnChange ).not.toHaveBeenCalled();
		expect( within( popover ).getByRole( 'combobox', { hidden: true } ) ).toBeInTheDocument();
	} );
} );
