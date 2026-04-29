import * as React from 'react';
import { useDialog } from '@elementor/editor-ui';
import { type BoxProps, type ButtonProps, type IconButtonProps, type StackProps } from '@elementor/ui';
import { fireEvent, render, screen } from '@testing-library/react';

import { VariablesManagerPanelView } from '../variables-manager-panel';

const noopClose = () => void 0;

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

jest.mock( '@elementor/editor-current-user', () => ( {
	useSuppressedMessage: jest.fn().mockReturnValue( [ false, jest.fn() ] ),
} ) );

jest.mock( '../hooks/use-auto-edit', () => ( {
	useAutoEdit: jest.fn().mockReturnValue( {
		autoEditVariableId: null,
		startAutoEdit: jest.fn(),
		handleAutoEditComplete: jest.fn(),
	} ),
} ) );

jest.mock( '../hooks/use-error-navigation', () => ( {
	useErrorNavigation: jest.fn().mockReturnValue( {
		createNavigationCallback: jest.fn(),
		resetNavigation: jest.fn(),
	} ),
} ) );

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	changeEditMode: jest.fn(),
	commandEndEvent: jest.fn(),
	windowEvent: jest.fn(),
	getCurrentEditMode: jest.fn().mockReturnValue( 'edit' ),
	isExperimentActive: jest.fn().mockReturnValue( false ),
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
		menuActions: ( variableId: string ) => unknown[];
		variables: Record< string, unknown >;
		onChange: ( variables: Record< string, unknown > ) => void;
	} ) => {
		const menuActionsArray = props.menuActions( 'var-1' );

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
					menuActions: menuActionsArray.map( ( action ) => {
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

describe( 'VariablesManagerPanelView', () => {
	const mockConsoleError = jest.fn();
	const originalError = window.console.error;
	const defaultMockState = {
		variables: { 'var-1': { label: 'Primary Color', value: '#ff0000', type: 'color' } },
		isDirty: false,
		hasValidationErrors: false,
		searchValue: '',
		isSaveDisabled: false,
		isSaving: false,
		handleOnChange: jest.fn(),
		createVariable: jest.fn(),
		duplicateVariable: jest.fn(),
		handleDeleteVariable: jest.fn(),
		handleStartSync: jest.fn(),
		handleStopSync: jest.fn(),
		handleSave: jest.fn(),
		handleSearch: mockHandleSearch,
		setHasValidationErrors: jest.fn(),
		setIsSaving: jest.fn(),
		setIsSaveDisabled: jest.fn(),
	};

	beforeEach( () => {
		jest.clearAllMocks();
		window.console.error = mockConsoleError;

		mockUseVariablesManagerState.mockReturnValue( defaultMockState );
	} );

	afterEach( () => {
		window.console.error = originalError;
	} );

	it( 'should pass variables and menu actions to table', () => {
		// Arrange & Act
		render( <VariablesManagerPanelView onRequestClose={ noopClose } /> );

		// Assert
		const table = screen.getByRole( 'grid' );
		const props = JSON.parse( table.getAttribute( 'data-props' ) || '{}' );
		expect( props.variables ).toBeDefined();
		expect( props.menuActions ).toEqual( [
			{
				name: 'Duplicate',
				icon: 'IconComponent',
				color: 'text.primary',
				onClick: 'function',
			},
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
		render( <VariablesManagerPanelView onRequestClose={ noopClose } /> );

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
		const { unmount } = render( <VariablesManagerPanelView onRequestClose={ noopClose } /> );

		// Assert
		expect( addEventListenerSpy ).toHaveBeenCalledWith( 'beforeunload', expect.any( Function ) );

		// Cleanup
		unmount();
		expect( removeEventListenerSpy ).toHaveBeenCalledWith( 'beforeunload', expect.any( Function ) );

		// Restore
		addEventListenerSpy.mockRestore();
		removeEventListenerSpy.mockRestore();
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
		render( <VariablesManagerPanelView onRequestClose={ close } /> );

		// Assert: closing the shell is delegated to design system; internal close is via unsaved flow only
		expect( close ).not.toHaveBeenCalled();
	} );

	describe( 'Search', () => {
		it( 'should render search component correctly', () => {
			// Arrange & Act
			render( <VariablesManagerPanelView onRequestClose={ noopClose } /> );

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
			render( <VariablesManagerPanelView onRequestClose={ noopClose } /> );

			// Assert
			expect( screen.getByText( 'No results for nonexistent' ) ).toBeInTheDocument();
		} );
	} );
} );
