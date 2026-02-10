import * as React from 'react';
import { ColorFilterIcon } from '@elementor/icons';
import { type IconButtonProps, type StackProps, type TableCellProps } from '@elementor/ui';
import { render, screen } from '@testing-library/react';

import { type TVariablesList } from '../../../storage';
import { VariablesManagerTable } from '../variables-manager-table';

type SortableProviderChildrenFn = ( props: {
	itemProps: Record< string, unknown >;
	triggerProps: Record< string, unknown >;
	setTriggerRef: () => void;
} ) => React.ReactNode;

jest.mock( '@elementor/ui', () => {
	const actual = jest.requireActual( '@elementor/ui' );
	return {
		...actual,
		UnstableSortableProvider: ( {
			children,
			value,
		}: {
			children: React.ReactNode | SortableProviderChildrenFn;
			value: string[];
		} ) => (
			<div aria-label="Sortable variables list" data-value={ JSON.stringify( value ) }>
				{ typeof children === 'function'
					? children( {
							itemProps: {},
							triggerProps: {},
							setTriggerRef: () => {},
					  } )
					: children }
			</div>
		),
		UnstableSortableItem: ( {
			render: renderItem,
		}: {
			render: ( props: Record< string, unknown > ) => React.ReactNode;
		} ) =>
			renderItem( {
				itemProps: {},
				triggerProps: {},
				setTriggerRef: () => {},
			} ),
		Table: ( props: { children: React.ReactNode } ) => <table { ...props } />,
		TableBody: ( props: { children: React.ReactNode } ) => <tbody { ...props } />,
		TableHead: ( props: { children: React.ReactNode } ) => <thead { ...props } />,
		TableRow: ( props: { children: React.ReactNode } ) => <tr { ...props } />,
		TableContainer: ( props: { children: React.ReactNode } ) => <div { ...props } />,
		Stack: ( { children, direction, spacing, ...props }: StackProps ) => (
			<div
				data-direction={ direction }
				data-spacing={ spacing }
				{ ...( props as React.HTMLAttributes< HTMLDivElement > ) }
			>
				{ children }
			</div>
		),
		IconButton: ( props: IconButtonProps ) => <button type="button" { ...props } />,
	};
} );

jest.mock( '../ui/variable-edit-menu', () => ( {
	VariableEditMenu: ( props: { menuActions: unknown[]; disabled?: boolean } ) => (
		<div
			aria-label="Actions menu"
			data-props={ JSON.stringify( {
				menuActions: props.menuActions?.map( ( action ) => {
					const typedAction = action as { name: string; icon: unknown; color: string };
					return {
						...typedAction,
						icon: typedAction.icon ? 'IconComponent' : undefined,
					};
				} ),
				disabled: props.disabled,
			} ) }
		/>
	),
} ) );

<<<<<<< HEAD
jest.mock( '../ui/variable-table-cell', () => ( {
	VariableTableCell: ( { children, ...props }: TableCellProps ) => {
		const safeProps = {
			...props,
			sx: props.sx
				? {
						...props.sx,
						// Remove circular references
						__emotion_real: undefined,
				  }
				: undefined,
		};
		return <td data-props={ JSON.stringify( safeProps ) }>{ children }</td>;
	},
=======
const mockGetVariableType = jest.mocked( getVariableType );

jest.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
	sprintf: jest.fn( ( format: string ) => format ),
} ) );

const mockCanEdit = jest.fn( () => true );
const mockCanCreate = jest.fn( () => true );
const mockCanDelete = jest.fn( () => true );

jest.mock( '../../../hooks/use-quota-permissions', () => ( {
	useQuotaPermissions: jest.fn( () => ( {
		canEdit: mockCanEdit,
		canCreate: mockCanCreate,
		canDelete: mockCanDelete,
	} ) ),
>>>>>>> 10d9820496 (Internal: Enhances variable manager with renew promotions [ED-21889] (#34699))
} ) );

jest.mock( '../variable-editable-cell', () => ( {
	VariableEditableCell: ( props: {
		initialValue: string;
		prefixElement?: React.ReactNode;
		children: React.ReactNode;
	} ) => {
		const [ isEditing, setIsEditing ] = React.useState( false );
		return isEditing ? (
			<input
				type="text"
				aria-label="Edit value"
				value={ props.initialValue }
				onChange={ () => {} }
				data-props={ JSON.stringify( {
					initialValue: props.initialValue,
					prefixElement: !! props.prefixElement,
				} ) }
			/>
		) : (
			<button
				type="button"
				onClick={ () => setIsEditing( true ) }
				data-props={ JSON.stringify( {
					initialValue: props.initialValue,
					prefixElement: !! props.prefixElement,
				} ) }
			>
				{ props.children }
			</button>
		);
	},
} ) );

jest.mock( '@elementor/editor-ui', () => ( {
	EllipsisWithTooltip: ( { children }: { children: React.ReactNode } ) => <div>{ children }</div>,
} ) );

jest.mock(
	'../../../variables-registry/variable-type-registry',
	() => ( {
		getVariableType: () => ( {
			icon: ColorFilterIcon,
			valueField: () => <input />,
		} ),
	} ),
	{ virtual: true }
);

describe( 'VariablesManagerTable', () => {
	const mockVariables: TVariablesList = {
		'var-1': {
			label: 'Variable 1',
			value: 'value 1',
			type: 'color',
		},
		'var-2': {
			label: 'Variable 2',
			value: 'value 2',
			type: 'color',
		},
	};

	const mockMenuActions = [
		{
			name: 'Delete',
			icon: ColorFilterIcon,
			color: 'error.main',
			onClick: jest.fn(),
		},
	];

	const renderTable = ( props = {} ) => {
		const defaultProps = {
			variables: mockVariables,
			menuActions: mockMenuActions,
			onChange: jest.fn(),
			ids: Object.keys( mockVariables ),
			onIdsChange: jest.fn(),
		};

		return render( <VariablesManagerTable { ...defaultProps } { ...props } /> );
	};

	const mockConsoleError = jest.fn();
	const originalError = window.console.error;

	beforeEach( () => {
		jest.clearAllMocks();
<<<<<<< HEAD
		// Suppress error for expected React warnings
		window.console.error = mockConsoleError;
=======
		mockGetVariableType.mockImplementation( ( type: string ) => {
			return createMockVariableType( type );
		} );

		mockCanEdit.mockReturnValue( true );
		mockCanCreate.mockReturnValue( true );
		mockCanDelete.mockReturnValue( true );

		Element.prototype.scrollIntoView = jest.fn();
>>>>>>> 10d9820496 (Internal: Enhances variable manager with renew promotions [ED-21889] (#34699))
	} );

	afterEach( () => {
		window.console.error = originalError;
	} );

	it( 'should render table headers correctly', () => {
		renderTable();

		const headers = screen.getAllByRole( 'cell' );
		const headerProps = headers
			.slice( 0, 4 )
			.map( ( header ) => JSON.parse( header.getAttribute( 'data-props' ) || '{}' ) );

		expect( headerProps ).toContainEqual(
			expect.objectContaining( { isHeader: true, noPadding: true, width: 10, maxWidth: 10 } )
		);
		expect( headerProps ).toContainEqual( expect.objectContaining( { isHeader: true } ) );
		expect( screen.getByText( 'Name' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Value' ) ).toBeInTheDocument();
	} );

	it( 'should render variables as rows', () => {
		renderTable();

		const editableCells = screen.getAllByRole( 'button' );
		const cellProps = editableCells.map( ( cell ) => JSON.parse( cell.getAttribute( 'data-props' ) || '{}' ) );

<<<<<<< HEAD
		expect( cellProps ).toContainEqual( expect.objectContaining( { initialValue: 'Variable 1' } ) );
		expect( cellProps ).toContainEqual( expect.objectContaining( { initialValue: 'Variable 2' } ) );
		expect( cellProps ).toContainEqual( expect.objectContaining( { initialValue: 'value 1' } ) );
		expect( cellProps ).toContainEqual( expect.objectContaining( { initialValue: 'value 2' } ) );
=======
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

		it( 'should not allow editing when quota permissions deny edit', async () => {
			mockCanEdit.mockReturnValue( false );

			renderComponent();

			// eslint-disable-next-line testing-library/no-node-access
			const nameCell = screen.getByText( 'PrimaryColor' ).closest( '[role="button"]' );
			expect( nameCell ).toBeInTheDocument();

			if ( nameCell ) {
				fireEvent.doubleClick( nameCell );
			}

			await waitFor(
				() => {
					const input = screen.queryByRole( 'textbox' );
					expect( input ).not.toBeInTheDocument();
				},
				{ timeout: 500 }
			);

			expect( mockOnChange ).not.toHaveBeenCalled();
		} );
>>>>>>> 10d9820496 (Internal: Enhances variable manager with renew promotions [ED-21889] (#34699))
	} );

	it( 'should render edit menu for each row', () => {
		renderTable();

		const editMenus = screen.getAllByLabelText( 'Actions menu' );
		expect( editMenus ).toHaveLength( Object.keys( mockVariables ).length );

		const menuProps = editMenus.map( ( menu ) => JSON.parse( menu.getAttribute( 'data-props' ) || '{}' ) );
		menuProps.forEach( ( props ) => {
			expect( props.menuActions ).toEqual( [
				{
					name: 'Delete',
					icon: 'IconComponent',
					color: 'error.main',
				},
			] );
		} );
	} );

	it( 'should handle reordering of variables', () => {
		const mockOnChange = jest.fn();
		jest.spyOn( React, 'useState' ).mockImplementation( () => [ Object.keys( mockVariables ), mockOnChange ] );

		renderTable();

		const provider = screen.getByLabelText( 'Sortable variables list' );
		const currentOrder = JSON.parse( provider.getAttribute( 'data-value' ) || '[]' );
		expect( currentOrder ).toEqual( [ 'var-1', 'var-2' ] );
	} );

	it( 'should handle empty variables list', () => {
		renderTable( { variables: {}, ids: [] } );

		const editableCells = screen.queryAllByRole( 'button' );
		expect( editableCells ).toHaveLength( 0 );
	} );

	it( 'should pass correct props to editable cells', () => {
		renderTable();

		const editableCells = screen.getAllByRole( 'button' );
		const cellProps = editableCells.map( ( cell ) => JSON.parse( cell.getAttribute( 'data-props' ) || '{}' ) );

		cellProps.forEach( ( props ) => {
			if ( props?.initialValue?.startsWith( 'Variable' ) ) {
				expect( props.prefixElement ).toBe( true );
			}
		} );
	} );

	it( 'should render variable type icons correctly', () => {
		// Arrange
		const mockVariablesWithDifferentTypes = {
			'var-1': {
				label: 'Variable 1',
				value: 'value 1',
				type: 'color',
			},
			'var-2': {
				label: 'Variable 2',
				value: 'value 2',
				type: 'color',
			},
		};

		// Act
		renderTable( { variables: mockVariablesWithDifferentTypes } );

		// Assert
		const editableCells = screen.getAllByRole( 'button' );
		const cellProps = editableCells.map( ( cell ) => JSON.parse( cell.getAttribute( 'data-props' ) || '{}' ) );

		cellProps.forEach( ( props ) => {
			if ( props?.initialValue?.startsWith( 'Variable' ) ) {
				expect( props.prefixElement ).toBe( true );
			}
		} );
	} );

	it( 'should call onChange with reordered variables', () => {
		// Arrange
		const mockOnChange = jest.fn();
		const mockReorderedVariables = [ 'var-2', 'var-1' ];
		jest.spyOn( React, 'useState' ).mockImplementation( () => [ mockReorderedVariables, mockOnChange ] );

		// Act
		renderTable( { onChange: mockOnChange } );

		// Assert
		const provider = screen.getByLabelText( 'Sortable variables list' );
		const currentOrder = JSON.parse( provider.getAttribute( 'data-value' ) || '[]' );
		expect( currentOrder ).toEqual( [ 'var-1', 'var-2' ] );
	} );
} );
