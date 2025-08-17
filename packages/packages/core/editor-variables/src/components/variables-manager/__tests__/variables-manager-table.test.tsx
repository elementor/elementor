import * as React from 'react';
import { ColorFilterIcon } from '@elementor/icons';
import { render, screen } from '@testing-library/react';

import { type TVariablesList } from '../../../storage';
import { VariablesManagerTable } from '../variables-manager-table';

jest.mock( '@elementor/ui', () => {
	const actual = jest.requireActual( '@elementor/ui' );
	return {
		...actual,
		UnstableSortableProvider: ( { children, value, onChange }: any ) => (
			<div data-testid="sortable-provider" data-value={ JSON.stringify( value ) }>
				{ typeof children === 'function'
					? children( {
							itemProps: {},
							triggerProps: {},
							setTriggerRef: () => {},
					  } )
					: children }
			</div>
		),
		UnstableSortableItem: ( { children, render }: any ) =>
			render( {
				itemProps: {},
				triggerProps: {},
				setTriggerRef: () => {},
			} ),
		Table: ( props: any ) => <table { ...props } />,
		TableBody: ( props: any ) => <tbody { ...props } />,
		TableHead: ( props: any ) => <thead { ...props } />,
		TableRow: ( props: any ) => <tr { ...props } />,
		TableContainer: ( props: any ) => <div { ...props } />,
		Stack: ( props: any ) => <div { ...props } />,
		IconButton: ( props: any ) => <button { ...props } />,
	};
} );

jest.mock( '../variable-edit-menu', () => ( {
	VariableEditMenu: ( props: any ) => (
		<div
			data-testid="variable-edit-menu"
			data-props={ JSON.stringify( {
				menuActions: props.menuActions?.map( ( action: any ) => ( {
					name: action.name,
					color: action.color,
				} ) ),
				disabled: props.disabled,
			} ) }
		/>
	),
} ) );

jest.mock( '../variable-table-cell', () => ( {
	VariableTableCell: ( props: any ) => {
		const { children, ...rest } = props;
		const safeProps = {
			...rest,
			sx: rest.sx
				? {
						...rest.sx,
						__emotion_real: undefined,
				  }
				: undefined,
		};
		return (
			<td data-testid="variable-table-cell" data-props={ JSON.stringify( safeProps ) }>
				{ children }
			</td>
		);
	},
} ) );

jest.mock( '../variable-editable-cell', () => ( {
	VariableEditableCell: ( props: any ) => (
		<div
			data-testid="variable-editable-cell"
			data-props={ JSON.stringify( {
				initialValue: props.initialValue,
				prefixElement: !! props.prefixElement,
			} ) }
		>
			{ props.children }
		</div>
	),
} ) );

jest.mock( '@elementor/editor-ui', () => ( {
	EllipsisWithTooltip: ( { children }: any ) => <div data-testid="ellipsis-tooltip">{ children }</div>,
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

	const renderComponent = ( props = {} ) => {
		const defaultProps = {
			variables: mockVariables,
			menuActions: mockMenuActions,
		};

		return render( <VariablesManagerTable { ...defaultProps } { ...props } /> );
	};

	const originalConsoleError = console.error;

	beforeEach( () => {
		jest.clearAllMocks();
		console.error = jest.fn();
	} );

	afterEach( () => {
		console.error = originalConsoleError;
	} );

	it( 'should render table headers correctly', () => {
		renderComponent();

		const headers = screen.getAllByTestId( 'variable-table-cell' );
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
		renderComponent();

		const editableCells = screen.getAllByTestId( 'variable-editable-cell' );
		const cellProps = editableCells.map( ( cell ) => JSON.parse( cell.getAttribute( 'data-props' ) || '{}' ) );

		expect( cellProps ).toContainEqual( expect.objectContaining( { initialValue: 'Variable 1' } ) );
		expect( cellProps ).toContainEqual( expect.objectContaining( { initialValue: 'Variable 2' } ) );
		expect( cellProps ).toContainEqual( expect.objectContaining( { initialValue: 'value 1' } ) );
		expect( cellProps ).toContainEqual( expect.objectContaining( { initialValue: 'value 2' } ) );
	} );

	it( 'should render edit menu for each row', () => {
		renderComponent();

		const editMenus = screen.getAllByTestId( 'variable-edit-menu' );
		expect( editMenus ).toHaveLength( Object.keys( mockVariables ).length );

		const menuProps = editMenus.map( ( menu ) => JSON.parse( menu.getAttribute( 'data-props' ) || '{}' ) );
		menuProps.forEach( ( props ) => {
			expect( props.menuActions ).toEqual( [
				{
					name: 'Delete',
					color: 'error.main',
				},
			] );
		} );
	} );

	it( 'should handle reordering of variables', () => {
		const mockOnChange = jest.fn();
		jest.spyOn( React, 'useState' ).mockImplementation( () => [ Object.keys( mockVariables ), mockOnChange ] );

		renderComponent();

		const provider = screen.getByTestId( 'sortable-provider' );
		const currentOrder = JSON.parse( provider.getAttribute( 'data-value' ) || '[]' );
		expect( currentOrder ).toEqual( [ 'var-1', 'var-2' ] );
	} );

	it( 'should handle empty variables list', () => {
		renderComponent( { variables: {} } );

		const editableCells = screen.queryAllByTestId( 'variable-editable-cell' );
		expect( editableCells ).toHaveLength( 0 );
	} );

	it( 'should pass correct props to editable cells', () => {
		renderComponent();

		const editableCells = screen.getAllByTestId( 'variable-editable-cell' );
		const cellProps = editableCells.map( ( cell ) => JSON.parse( cell.getAttribute( 'data-props' ) || '{}' ) );

		cellProps.forEach( ( props ) => {
			if ( props.initialValue.startsWith( 'Variable' ) ) {
				// Label cells
				expect( props.prefixElement ).toBe( true );
			}
		} );
	} );
} );
