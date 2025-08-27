import * as React from 'react';
import { createMockPropType, renderControl, renderField } from 'test-utils';
import { ControlActionsProvider } from '@elementor/editor-controls';
import { fireEvent, screen } from '@testing-library/react';

import { useStylesFields } from '../../../../hooks/use-styles-fields';
import { FontStyleField } from '../font-style-field';

jest.mock( '@elementor/editor-styles' );
jest.mock( '../../../../hooks/use-styles-fields' );
jest.mock( '../../../../contexts/styles-inheritance-context', () => ( {
	useStylesInheritanceChain: () => [],
} ) );

const renderFontStyleField = () => {
	return renderField( <FontStyleField />, {
		propTypes: {
			'font-style': createMockPropType( { kind: 'plain' } ),
		},
	} );
};

describe( '<FontStyleField />', () => {
	it.each( [
		[ 'Italic', 'Normal' ],
		[ 'Normal', 'Italic' ],
	] )( 'should toggle between %s and %s when clicked', ( initialValue, expectedValue ) => {
		// Arrange.
		const setValues = jest.fn();

		jest.mocked( useStylesFields ).mockReturnValue( {
			values: {
				'font-style': {
					$$type: 'string',
					value: initialValue.toLowerCase(),
				},
			},
			setValues,
			canEdit: true,
		} );

		renderFontStyleField();

		const toggleButton = screen.getByRole( 'button', { name: initialValue } );
		const expectedToggleButton = screen.getByRole( 'button', { name: expectedValue } );

		// Assert.
		expect( toggleButton ).toHaveAttribute( 'aria-pressed', 'true' );

		// Act.
		fireEvent.click( expectedToggleButton );

		// Assert.
		expect( setValues ).toHaveBeenCalledWith(
			{
				'font-style': {
					$$type: 'string',
					value: expectedValue.toLowerCase(),
				},
			},
			{ history: { propDisplayName: 'Font style' } }
		);
	} );

	it.each( [ 'Italic', 'Normal' ] )( 'should pass null on click if `%s` was selected before', ( param ) => {
		// Arrange.
		const setValues = jest.fn();

		jest.mocked( useStylesFields ).mockReturnValue( {
			values: {
				'font-style': {
					$$type: 'string',
					value: param.toLowerCase(),
				},
			},
			setValues,
			canEdit: true,
		} );

		// Act.
		renderFontStyleField();

		const toggleButton = screen.getByRole( 'button', { name: param } );

		// Assert.
		expect( toggleButton ).toHaveAttribute( 'aria-pressed', 'true' );

		// Act.
		fireEvent.click( toggleButton );

		// Assert.
		expect( setValues ).toHaveBeenCalledWith(
			{ 'font-style': null },
			{ history: { propDisplayName: 'Font style' } }
		);
	} );

	it( 'should render font style prop type with plain value', () => {
		// Arrange.
		const setValue = jest.fn();
		const props = {
			setValue,
			propType: createMockPropType( { kind: 'plain' } ),
			bind: 'font-style',
			value: {
				$$type: 'string',
				value: 'normal',
			},
		};

		// Act.
		renderControl(
			<ControlActionsProvider items={ [] }>
				<FontStyleField />
			</ControlActionsProvider>,
			props
		);

		const button = screen.getByLabelText( 'Normal' );

		// Assert.
		expect( screen.getByText( 'Font style' ) ).toBeInTheDocument();
		expect( button ).toBeInTheDocument();
		expect( button ).toHaveAttribute( 'aria-pressed', 'true' );
	} );
} );
