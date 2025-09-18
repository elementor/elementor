import * as React from 'react';
import { useDialog } from '@elementor/editor-ui';
import { type BoxProps, type ButtonProps, type IconButtonProps, type StackProps } from '@elementor/ui';
import { fireEvent, render, screen } from '@testing-library/react';

import { VariablesManagerPanel } from '../variables-manager-panel';

jest.mock( '@elementor/editor-panels', () => ( {
	__createPanel: () => ( {
		panel: {},
		usePanelActions: () => ( {
			close: jest.fn(),
		} ),
	} ),
	Panel: ( { children }: { children: React.ReactNode } ) => <div role="dialog">{ children }</div>,
	PanelBody: ( { children, sx }: { children: React.ReactNode; sx?: StackProps[ 'sx' ] } ) => (
		<div role="region" data-props={ JSON.stringify( { sx } ) }>
			{ children }
		</div>
	),
	PanelHeader: ( { children }: { children: React.ReactNode } ) => <header>{ children }</header>,
	PanelHeaderTitle: ( { children, sx }: { children: React.ReactNode; sx?: StackProps[ 'sx' ] } ) => (
		<h2 data-props={ JSON.stringify( { sx } ) }>{ children }</h2>
	),
	PanelFooter: ( { children }: { children: React.ReactNode } ) => <footer>{ children }</footer>,
} ) );

jest.mock( '../../ui/no-search-results', () => ( {
	NoSearchResults: ( { searchValue, onClear }: { searchValue: string; onClear: () => void } ) => (
		<div data-testid="no-search-results">
			<p>No results for { searchValue }</p>
			<button onClick={ onClear }>Clear Search</button>
		</div>
	),
} ) );

jest.mock( '@elementor/editor-ui', () => {
	const actual = jest.requireActual( '@elementor/editor-ui' );

	return {
		__esModule: true,
		...actual,
		ThemeProvider: ( { children }: { children: React.ReactNode } ) => <div>{ children }</div>,
		EllipsisWithTooltip: ( { children }: { children: React.ReactNode } ) => <div>{ children }</div>,
		useDialog: jest.fn().mockReturnValue( {
			open: jest.fn(),
			close: jest.fn(),
			isOpen: false,
		} ),
	};
} );

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	changeEditMode: jest.fn(),
	commandEndEvent: jest.fn(),
	windowEvent: jest.fn(),
	getCurrentEditMode: jest.fn().mockReturnValue( 'edit' ),
} ) );

jest.mock( '@elementor/ui', () => {
	const actual = jest.requireActual( '@elementor/ui' );
	return {
		...actual,
		Button: ( { children, ...props }: ButtonProps ) => <button { ...props }>{ children }</button>,
		IconButton: ( props: IconButtonProps ) => <button type="button" { ...props } />,
		Stack: ( { children, ...props }: StackProps ) => <div data-props={ JSON.stringify( props ) }>{ children }</div>,
		Alert: ( { children, severity, ...props }: { children: React.ReactNode; severity: string } ) => (
			<div role="alert" data-props={ JSON.stringify( { severity, ...props } ) }>
				{ children }
			</div>
		),
		Box: ( { children, ...props }: BoxProps ) => <div data-props={ JSON.stringify( props ) }>{ children }</div>,
		Divider: () => <hr />,
	};
} );

jest.mock(
	'../../../hooks/use-prop-variables',
	() => ( {
		getVariables: jest.fn().mockReturnValue( {
			'var-1': {
				label: 'Variable 1',
				value: 'value 1',
				type: 'color',
			},
		} ),
	} ),
	{ virtual: true }
);

jest.mock( '../hooks/use-variables-manager-state', () => ( {
	useVariablesManagerState: jest.fn(),
} ) );

jest.mock( '../variables-manager-table', () => {
	const VariablesManagerTable = ( props: {
		menuActions: unknown[];
		variables: Record< string, unknown >;
		onChange: ( variables: Record< string, unknown > ) => void;
	} ) => {
		return (
			<button
				type="button"
				role="grid"
				aria-label="Variables Table"
				tabIndex={ 0 }
				onClick={ () => {
					props.onChange( { 'var-1': { label: 'Changed', value: 'new value', type: 'color' } } );
				} }
				onKeyDown={ ( event ) => {
					if ( event.key === 'Enter' || event.key === ' ' ) {
						props.onChange( { 'var-1': { label: 'Changed', value: 'new value', type: 'color' } } );
					}
				} }
				data-props={ JSON.stringify( {
					...props,
					menuActions: props.menuActions?.map( ( action ) => {
						const typedAction = action as { name: string; icon: unknown; color: string; onClick: unknown };
						return {
							...typedAction,
							icon: typedAction.icon ? 'IconComponent' : undefined,
							onClick: 'function',
						};
					} ),
				} ) }
			/>
		);
	};
	return { VariablesManagerTable };
} );

const mockUseVariablesManagerState = require( '../hooks/use-variables-manager-state' ).useVariablesManagerState;

const mockHandleSearch = jest.fn();

describe( 'VariablesManagerPanel', () => {
	const mockConsoleError = jest.fn();
	const originalError = window.console.error;
	const defaultMockState = {
		variables: { 'var-1': { label: 'Primary Color', value: '#ff0000', type: 'color' } },
		isDirty: false,
		hasValidationErrors: false,
		searchValue: '',
		handleOnChange: jest.fn(),
		createVariable: jest.fn(),
		handleDeleteVariable: jest.fn(),
		handleSave: jest.fn(),
		handleSearch: mockHandleSearch,
		setHasValidationErrors: jest.fn(),
	};

	beforeEach( () => {
		jest.clearAllMocks();
		window.console.error = mockConsoleError;

		mockUseVariablesManagerState.mockReturnValue( defaultMockState );
	} );

	afterEach( () => {
		window.console.error = originalError;
	} );

	it( 'should render panel structure correctly', () => {
		// Arrange & Act
		render( <VariablesManagerPanel /> );

		// Assert
		expect( screen.getByRole( 'dialog' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'region' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'heading', { level: 2 } ) ).toBeInTheDocument();
	} );

	it( 'should render panel title with icon', () => {
		// Arrange & Act
		render( <VariablesManagerPanel /> );

		// Assert
		const title = screen.getByRole( 'heading', { level: 2 } );
		const props = JSON.parse( title.getAttribute( 'data-props' ) || '{}' );
		expect( props.sx ).toEqual( {
			display: 'flex',
			alignItems: 'center',
			gap: 0.5,
		} );
		expect( title ).toHaveTextContent( 'Variable Manager' );
	} );

	it( 'should pass variables and menu actions to table', () => {
		// Arrange & Act
		render( <VariablesManagerPanel /> );

		// Assert
		const table = screen.getByRole( 'grid' );
		const props = JSON.parse( table.getAttribute( 'data-props' ) || '{}' );
		expect( props.variables ).toBeDefined();
		expect( props.menuActions ).toEqual( [
			{
				name: 'Delete',
				icon: 'IconComponent',
				color: 'error.main',
				onClick: 'function',
			},
		] );
	} );

	it( 'should render save button in footer', () => {
		// Arrange & Act
		render( <VariablesManagerPanel /> );

		// Assert
		const button = screen.getByRole( 'button', { name: 'Save changes' } );
		expect( button ).toHaveTextContent( 'Save changes' );
		expect( button ).toBeDisabled();
	} );

	it( 'should prevent unload when dirty', () => {
		// Arrange
		const addEventListenerSpy = jest.spyOn( window, 'addEventListener' );
		const removeEventListenerSpy = jest.spyOn( window, 'removeEventListener' );

		// Act
		const { unmount } = render( <VariablesManagerPanel /> );

		// Assert
		expect( addEventListenerSpy ).toHaveBeenCalledWith( 'beforeunload', expect.any( Function ) );

		// Cleanup
		unmount();
		expect( removeEventListenerSpy ).toHaveBeenCalledWith( 'beforeunload', expect.any( Function ) );

		// Restore
		addEventListenerSpy.mockRestore();
		removeEventListenerSpy.mockRestore();
	} );

	it( 'should apply correct styles to panel body', () => {
		// Arrange & Act
		render( <VariablesManagerPanel /> );

		// Assert
		const body = screen.getByRole( 'region' );
		const props = JSON.parse( body.getAttribute( 'data-props' ) || '{}' );
		expect( props.sx ).toEqual( {
			display: 'flex',
			flexDirection: 'column',
			height: '100%',
		} );
	} );

	it( 'should close the panel when trying to close with no unsaved changes', () => {
		// Arrange
		const close = jest.fn();
		jest.mocked( useDialog ).mockReturnValue( {
			open: jest.fn(),
			close,
			isOpen: false,
		} );

		// Act
		render( <VariablesManagerPanel /> );

		// Assert
		expect( close ).not.toHaveBeenCalled();
	} );

	it( 'should open save changes dialog when there is unsaved changes', async () => {
		// Arrange
		const openDialog = jest.fn();
		jest.mocked( useDialog ).mockReturnValue( {
			open: openDialog,
			close: jest.fn(),
			isOpen: false,
		} );

		let isDirty = false;
		const mockHandleOnChange = jest.fn( () => {
			isDirty = true;
		} );

		mockUseVariablesManagerState.mockImplementation( () => ( {
			...defaultMockState,
			isDirty,
			handleOnChange: mockHandleOnChange,
		} ) );

		// Act
		const { rerender } = render( <VariablesManagerPanel /> );

		await screen.findByRole( 'grid', { name: 'Variables Table' } );

		fireEvent.click( screen.getByRole( 'grid', { name: 'Variables Table' } ) );

		rerender( <VariablesManagerPanel /> );

		fireEvent.click( screen.getByLabelText( 'Close' ) );

		// Assert
		expect( openDialog ).toHaveBeenCalled();
	} );

	describe( 'Search', () => {
		it( 'should render search component correctly', () => {
			// Arrange & Act
			render( <VariablesManagerPanel /> );

			const searchInput = screen.getByPlaceholderText( 'Search' );
			expect( searchInput ).toBeInTheDocument();

			fireEvent.change( searchInput, { target: { value: 'primary' } } );

			expect( mockHandleSearch ).toHaveBeenCalledWith( 'primary' );
		} );

		it( 'should show no search results component when search returns empty', () => {
			// Arrange
			mockUseVariablesManagerState.mockReturnValue( {
				...defaultMockState,
				variables: {},
				searchValue: 'nonexistent',
			} );

			// Act
			render( <VariablesManagerPanel /> );

			// Assert
			expect( screen.getByText( 'No results for nonexistent' ) ).toBeInTheDocument();
		} );
	} );
} );
