import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { colorPropTypeUtil, stringPropTypeUtil } from '@elementor/editor-props';
import { BrushIcon, TextIcon } from '@elementor/icons';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { colorVariablePropTypeUtil } from '../../../prop-types/color-variable-prop-type';
import { fontVariablePropTypeUtil } from '../../../prop-types/font-variable-prop-type';
import { type TVariablesList } from '../../../storage';
import { getVariableType } from '../../../variables-registry/variable-type-registry';
import { VariablesManagerTable } from '../variables-manager-table';

jest.mock( '../../../variables-registry/variable-type-registry', () => ( {
	getVariableType: jest.fn(),
} ) );

const mockGetVariableType = jest.mocked( getVariableType );

jest.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
} ) );

describe( 'VariablesManagerTable', () => {
	const mockOnChange = jest.fn();
	const mockOnAutoEditComplete = jest.fn();
	const mockOnFieldError = jest.fn();

	const mockMenuActions = () => [
		{
			name: 'Delete',
			icon: BrushIcon,
			color: 'error.main',
			onClick: jest.fn(),
		},
	];

	const createMockVariableType = ( type: string ) => ( {
		icon: type === 'color' ? BrushIcon : TextIcon,
		variableType: type,
		propTypeUtil: type === 'color' ? colorVariablePropTypeUtil : fontVariablePropTypeUtil,
		fallbackPropTypeUtil: type === 'color' ? colorPropTypeUtil : stringPropTypeUtil,
		valueField: ( { value, onChange }: { value: string; onChange: ( val: string ) => void } ) => (
			<input
				aria-label={ `Edit ${ type } value` }
				value={ value }
				onChange={ ( e ) => onChange( e.target.value ) }
			/>
		),
	} );

	const defaultVariables: TVariablesList = {
		'var-1': {
			label: 'PrimaryColor',
			value: '#ff0000',
			type: 'color',
			order: 1,
		},
		'var-2': {
			label: 'FontFamily',
			value: 'Roboto',
			type: 'font',
			order: 2,
		},
		'var-3': {
			label: 'SecondaryColor',
			value: '#00ff00',
			type: 'color',
			order: 3,
		},
	};

	beforeEach( () => {
		jest.clearAllMocks();
		mockGetVariableType.mockImplementation( ( type: string ) => {
			return createMockVariableType( type );
		} );

		Element.prototype.scrollIntoView = jest.fn();
	} );

	const renderComponent = ( props: Partial< React.ComponentProps< typeof VariablesManagerTable > > = {} ) => {
		const defaultProps = {
			menuActions: mockMenuActions,
			variables: defaultVariables,
			onChange: mockOnChange,
			...props,
		};

		return renderWithTheme( <VariablesManagerTable { ...defaultProps } /> );
	};

	describe( 'Rendering', () => {
		it( 'should render table with correct structure', () => {
			renderComponent();

			expect( screen.getByRole( 'table' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Name' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Value' ) ).toBeInTheDocument();
		} );

		it( 'should render all variables as rows', () => {
			renderComponent();

			expect( screen.getByText( 'PrimaryColor' ) ).toBeInTheDocument();
			expect( screen.getByText( 'FontFamily' ) ).toBeInTheDocument();
			expect( screen.getByText( 'SecondaryColor' ) ).toBeInTheDocument();
		} );

		it( 'should render variable values', () => {
			renderComponent();

			expect( screen.getByText( '#ff0000' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Roboto' ) ).toBeInTheDocument();
			expect( screen.getByText( '#00ff00' ) ).toBeInTheDocument();
		} );

		it( 'should render drag handles for each row', () => {
			renderComponent();

			const dragHandles = screen.getAllByRole( 'button' ).filter( ( button ) => {
				return button.getAttribute( 'draggable' ) === 'true';
			} );
			expect( dragHandles.length ).toBe( 3 );
		} );

		it( 'should not render variables with unknown types', () => {
			mockGetVariableType.mockImplementation( ( type: string ) => {
				if ( type === 'unknown' ) {
					return undefined as unknown as ReturnType< typeof getVariableType >;
				}
				return createMockVariableType( type );
			} );

			const variablesWithUnknown: TVariablesList = {
				...defaultVariables,
				'var-unknown': {
					label: 'Unknown Variable',
					value: 'unknown',
					type: 'unknown',
					order: 4,
				},
			};

			renderComponent( { variables: variablesWithUnknown } );

			expect( screen.queryByText( 'Unknown Variable' ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'Sorting', () => {
		it( 'should sort variables by order', () => {
			const unorderedVariables: TVariablesList = {
				'var-3': {
					label: 'Third',
					value: 'value3',
					type: 'color',
					order: 3,
				},
				'var-1': {
					label: 'First',
					value: 'value1',
					type: 'color',
					order: 1,
				},
				'var-2': {
					label: 'Second',
					value: 'value2',
					type: 'color',
					order: 2,
				},
			};

			renderComponent( { variables: unorderedVariables } );

			expect( screen.getByText( 'First' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Second' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Third' ) ).toBeInTheDocument();
		} );

		it( 'should handle variables without order', () => {
			const variablesWithoutOrder: TVariablesList = {
				'var-1': {
					label: 'No Order 1',
					value: 'value1',
					type: 'color',
				},
				'var-2': {
					label: 'No Order 2',
					value: 'value2',
					type: 'color',
					order: 1,
				},
			};

			renderComponent( { variables: variablesWithoutOrder } );

			expect( screen.getByText( 'No Order 2' ) ).toBeInTheDocument();
			expect( screen.getByText( 'No Order 1' ) ).toBeInTheDocument();
		} );
	} );

	describe( 'Editing', () => {
		it( 'should allow editing variable name', async () => {
			renderComponent();

			// eslint-disable-next-line testing-library/no-node-access
			const nameCell = screen.getByText( 'PrimaryColor' ).closest( '[role="button"]' );
			expect( nameCell ).toBeInTheDocument();

			if ( nameCell ) {
				fireEvent.doubleClick( nameCell );
			}

			const input = await screen.findByRole( 'textbox' );
			expect( input ).toHaveAttribute( 'id', 'variable-label-var-1' );

			fireEvent.change( input, { target: { value: 'UpdatedColor' } } );

			await waitFor( () => {
				expect( input ).toHaveValue( 'UpdatedColor' );
			} );

			fireEvent.keyDown( input, { key: 'Enter' } );

			await waitFor(
				() => {
					expect( mockOnChange ).toHaveBeenCalledWith(
						expect.objectContaining( {
							'var-1': expect.objectContaining( {
								label: 'UpdatedColor',
							} ),
						} )
					);
				},
				{ timeout: 2000 }
			);
		} );

		it( 'should allow editing variable value', async () => {
			renderComponent();

			// eslint-disable-next-line testing-library/no-node-access
			const valueCell = screen.getByText( '#ff0000' ).closest( '[role="button"]' );
			expect( valueCell ).toBeInTheDocument();

			if ( valueCell ) {
				fireEvent.doubleClick( valueCell );
			}

			const input = await screen.findByLabelText( /Edit color value/i );
			expect( input ).toBeInTheDocument();

			fireEvent.change( input, { target: { value: '#0000ff' } } );
			fireEvent.keyDown( input, { key: 'Enter' } );

			await waitFor( () => {
				expect( mockOnChange ).toHaveBeenCalledWith( {
					...defaultVariables,
					'var-1': {
						...defaultVariables[ 'var-1' ],
						value: '#0000ff',
					},
				} );
			} );
		} );

		it( 'should not call onChange when value is unchanged', async () => {
			renderComponent();

			// eslint-disable-next-line testing-library/no-node-access
			const nameCell = screen.getByText( 'PrimaryColor' ).closest( '[role="button"]' );
			if ( nameCell ) {
				fireEvent.doubleClick( nameCell );
			}

			const input = await screen.findByRole( 'textbox' );
			expect( input ).toHaveAttribute( 'id', 'variable-label-var-1' );
			fireEvent.keyDown( input, { key: 'Enter' } );

			await waitFor( () => {
				expect( mockOnChange ).not.toHaveBeenCalled();
			} );
		} );

		it( 'should cancel editing on Escape key', async () => {
			renderComponent();

			// eslint-disable-next-line testing-library/no-node-access
			const nameCell = screen.getByText( 'PrimaryColor' ).closest( '[role="button"]' );
			if ( nameCell ) {
				fireEvent.doubleClick( nameCell );
			}

			const input = await screen.findByRole( 'textbox' );
			expect( input ).toHaveAttribute( 'id', 'variable-label-var-1' );
			fireEvent.change( input, { target: { value: 'ChangedName' } } );
			fireEvent.keyDown( input, { key: 'Escape' } );

			await waitFor( () => {
				expect( screen.getByText( 'PrimaryColor' ) ).toBeInTheDocument();
			} );

			expect( mockOnChange ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'Auto Edit', () => {
		it( 'should auto-edit variable when autoEditVariableId is provided', async () => {
			renderComponent( { autoEditVariableId: 'var-2' } );

			await waitFor(
				() => {
					const input = screen.queryByRole( 'textbox' );
					expect( input ).toBeInTheDocument();
				},
				{
					timeout: 200,
				}
			);

			const input = screen.queryByRole( 'textbox' );
			expect( input ).toHaveAttribute( 'id', 'variable-label-var-2' );
		} );

		it( 'should call onAutoEditComplete when auto-edit starts', async () => {
			renderComponent( {
				autoEditVariableId: 'var-1',
				onAutoEditComplete: mockOnAutoEditComplete,
			} );

			await waitFor(
				() => {
					expect( mockOnAutoEditComplete ).toHaveBeenCalled();
				},
				{
					timeout: 200,
				}
			);
		} );

		it( 'should scroll to auto-edit variable', async () => {
			renderComponent( { autoEditVariableId: 'var-2' } );

			await waitFor(
				() => {
					expect( Element.prototype.scrollIntoView ).toHaveBeenCalled();
				},
				{ timeout: 200 }
			);
		} );

		it( 'should select text when auto-editing', async () => {
			renderComponent( { autoEditVariableId: 'var-1' } );

			await waitFor(
				() => {
					const input = screen.queryByRole( 'textbox' ) as HTMLInputElement;
					expect( input ).toBeInTheDocument();
				},
				{ timeout: 200 }
			);

			const input = screen.queryByRole( 'textbox' ) as HTMLInputElement;
			expect( input ).toHaveAttribute( 'id', 'variable-label-var-1' );
			expect( input.selectionStart ).toBe( 0 );
			expect( input.selectionEnd ).toBe( input.value.length );
		} );
	} );

	describe( 'Reordering', () => {
		it( 'should render variables in order', () => {
			renderComponent();

			expect( screen.getByText( 'PrimaryColor' ) ).toBeInTheDocument();
			expect( screen.getByText( 'FontFamily' ) ).toBeInTheDocument();
			expect( screen.getByText( 'SecondaryColor' ) ).toBeInTheDocument();
		} );

		it( 'should render variables in updated order when order changes', () => {
			const updatedVariables: TVariablesList = {
				'var-2': { ...defaultVariables[ 'var-2' ], order: 1 },
				'var-1': { ...defaultVariables[ 'var-1' ], order: 2 },
				'var-3': { ...defaultVariables[ 'var-3' ], order: 3 },
			};

			renderComponent( { variables: updatedVariables } );

			expect( screen.getByText( 'FontFamily' ) ).toBeInTheDocument();
			expect( screen.getByText( 'PrimaryColor' ) ).toBeInTheDocument();
			expect( screen.getByText( 'SecondaryColor' ) ).toBeInTheDocument();
		} );

		it( 'should handle reordering variable to top position', () => {
			const updatedVariables: TVariablesList = {
				'var-3': { ...defaultVariables[ 'var-3' ], order: 1 },
				'var-1': { ...defaultVariables[ 'var-1' ], order: 2 },
				'var-2': { ...defaultVariables[ 'var-2' ], order: 3 },
			};

			renderComponent( { variables: updatedVariables } );

			expect( screen.getByText( 'SecondaryColor' ) ).toBeInTheDocument();
			expect( screen.getByText( 'PrimaryColor' ) ).toBeInTheDocument();
			expect( screen.getByText( 'FontFamily' ) ).toBeInTheDocument();
		} );

		it( 'should handle reordering variable to bottom position', () => {
			const updatedVariables: TVariablesList = {
				'var-2': { ...defaultVariables[ 'var-2' ], order: 1 },
				'var-3': { ...defaultVariables[ 'var-3' ], order: 2 },
				'var-1': { ...defaultVariables[ 'var-1' ], order: 3 },
			};

			renderComponent( { variables: updatedVariables } );

			expect( screen.getByText( 'FontFamily' ) ).toBeInTheDocument();
			expect( screen.getByText( 'SecondaryColor' ) ).toBeInTheDocument();
			expect( screen.getByText( 'PrimaryColor' ) ).toBeInTheDocument();
		} );

		it( 'should have drag handles configured for reordering', () => {
			renderComponent();

			const dragHandles = screen.getAllByRole( 'button' ).filter( ( button ) => {
				return button.getAttribute( 'draggable' ) === 'true';
			} );

			expect( dragHandles.length ).toBe( 3 );
		} );
	} );

	describe( 'Error Handling', () => {
		it( 'should call onFieldError when field has error', async () => {
			renderComponent( { onFieldError: mockOnFieldError } );

			// eslint-disable-next-line testing-library/no-node-access
			const nameCell = screen.getByText( 'PrimaryColor' ).closest( '[role="button"]' );
			if ( nameCell ) {
				fireEvent.doubleClick( nameCell );
			}

			const input = await screen.findByRole( 'textbox' );
			expect( input ).toHaveAttribute( 'id', 'variable-label-var-1' );

			fireEvent.change( input, { target: { value: '' } } );
			fireEvent.blur( input );

			await waitFor( () => {
				expect( mockOnFieldError ).toHaveBeenCalled();
			} );
		} );

		it( 'should call onFieldError with false when error is cleared', async () => {
			renderComponent( { onFieldError: mockOnFieldError } );

			// eslint-disable-next-line testing-library/no-node-access
			const nameCell = screen.getByText( 'PrimaryColor' ).closest( '[role="button"]' );
			if ( nameCell ) {
				fireEvent.doubleClick( nameCell );
			}

			const input = await screen.findByRole( 'textbox' );
			expect( input ).toHaveAttribute( 'id', 'variable-label-var-1' );

			fireEvent.change( input, { target: { value: '' } } );
			await waitFor(
				() => {
					expect( mockOnFieldError ).toHaveBeenCalledWith( true );
				},
				{ timeout: 1000 }
			);

			jest.clearAllMocks();

			fireEvent.change( input, { target: { value: 'ValidName' } } );
			fireEvent.blur( input );

			await waitFor(
				() => {
					expect( mockOnFieldError ).toHaveBeenCalledWith( false );
				},
				{ timeout: 1000 }
			);
		} );
	} );

	describe( 'Menu Actions', () => {
		it( 'should render menu button for each variable', () => {
			renderComponent();

			const menuButtons = screen.getAllByRole( 'button' ).filter( ( button ) => {
				return (
					button.getAttribute( 'draggable' ) !== 'true' &&
					button.getAttribute( 'aria-label' ) !== 'Double click or press Space to edit'
				);
			} );

			expect( menuButtons.length ).toBeGreaterThanOrEqual( 3 );
		} );

		it( 'should trigger menu actions when clicked', async () => {
			const mockAction = jest.fn();
			const menuActionsWithHandler = () => [
				{
					name: 'Delete',
					icon: BrushIcon,
					color: 'error.main',
					onClick: mockAction,
				},
			];

			renderComponent( { menuActions: menuActionsWithHandler } );

			const allButtons = screen.getAllByRole( 'button' );
			const menuTriggerButtons = allButtons.filter( ( button ) => {
				return (
					button.getAttribute( 'draggable' ) !== 'true' &&
					button.getAttribute( 'aria-label' ) !== 'Double click or press Space to edit'
				);
			} );

			expect( menuTriggerButtons.length ).toBeGreaterThan( 0 );

			const firstMenuButton = menuTriggerButtons[ 0 ];
			fireEvent.click( firstMenuButton );

			await waitFor(
				() => {
					const menuItem = screen.queryByRole( 'menuitem', { name: 'Delete' } );
					if ( menuItem ) {
						fireEvent.click( menuItem );
						expect( mockAction ).toHaveBeenCalledWith( 'var-1' );
					}
				},
				{ timeout: 2000 }
			);
		} );
	} );

	describe( 'Accessibility', () => {
		it( 'should have correct ARIA label for table', () => {
			renderComponent();

			const table = screen.getByRole( 'table' );
			expect( table ).toHaveAttribute( 'aria-label', 'Variables manager list with drag and drop reordering' );
		} );

		it( 'should have correct table headers', () => {
			renderComponent();

			expect( screen.getByText( 'Name' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Value' ) ).toBeInTheDocument();
		} );
	} );
} );
