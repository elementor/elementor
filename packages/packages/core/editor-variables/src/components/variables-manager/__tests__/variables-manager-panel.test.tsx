import * as React from 'react';
import { render, screen } from '@testing-library/react';

import { VariablesManagerPanel } from '../variables-manager-panel';

jest.mock( '@elementor/editor-panels', () => ( {
	__createPanel: () => ( {
		panel: {},
		usePanelActions: () => ( {
			close: jest.fn(),
		} ),
	} ),
	Panel: ( { children }: any ) => <div data-testid="panel">{ children }</div>,
	PanelBody: ( { children, sx }: any ) => (
		<div data-testid="panel-body" data-props={ JSON.stringify( { sx } ) }>{ children }</div>
	),
	PanelHeader: ( { children }: any ) => <div data-testid="panel-header">{ children }</div>,
	PanelHeaderTitle: ( { children, sx }: any ) => (
		<div data-testid="panel-header-title" data-props={ JSON.stringify( { sx } ) }>{ children }</div>
	),
	PanelFooter: ( { children }: any ) => <div data-testid="panel-footer">{ children }</div>,
} ) );

jest.mock( '@elementor/editor-ui', () => ( {
	ThemeProvider: ( { children }: any ) => <div data-testid="theme-provider">{ children }</div>,
	EllipsisWithTooltip: ( { children }: any ) => <div data-testid="ellipsis-tooltip">{ children }</div>,
} ) );

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	changeEditMode: jest.fn(),
} ) );

jest.mock( '@elementor/ui', () => {
	const actual = jest.requireActual( '@elementor/ui' );
	return {
		...actual,
		Button: ( { children, ...props }: any ) => (
			<button { ...props } data-testid="button">{ children }</button>
		),
		IconButton: ( props: any ) => <button { ...props } data-testid="icon-button" />,
		Stack: ( { children, ...props }: any ) => (
			<div data-testid="stack" data-props={ JSON.stringify( props ) }>{ children }</div>
		),
		Alert: ( { children, severity, ...props }: any ) => (
			<div data-testid="alert" data-props={ JSON.stringify( { severity, ...props } ) }>{ children }</div>
		),
		Box: ( { children, ...props }: any ) => (
			<div data-testid="box" data-props={ JSON.stringify( props ) }>{ children }</div>
		),
		Divider: () => <hr data-testid="divider" />,
		ErrorBoundary: ( { children, fallback }: any ) => {
			const [ hasError, setHasError ] = React.useState( false );

			React.useEffect( () => {
				try {
					if ( children.props?.throwError ) {
						throw new Error( 'Test error' );
					}
				} catch ( error ) {
					setHasError( true );
				}
			}, [ children ] );

			if ( hasError ) {
				return fallback;
			}

			return children;
		},
	};
} );

jest.mock( '../../../hooks/use-prop-variables', () => ( {
	getVariables: jest.fn().mockReturnValue( {
		'var-1': {
			label: 'Variable 1',
			value: 'value 1',
			type: 'color',
		},
	} ),
} ), { virtual: true } );

jest.mock( '../variables-manager-table', () => ( {
	VariablesManagerTable: ( props: any ) => (
		<div data-testid="variables-manager-table" data-props={ JSON.stringify( {
			...props,
			menuActions: props.menuActions?.map( ( action: any ) => ( {
				...action,
				icon: action.icon?.name || 'IconComponent',
				onClick: 'function',
			} ) ),
		} ) } />
	),
} ) );

describe( 'VariablesManagerPanel', () => {
	const originalConsoleError = console.error;

	beforeEach( () => {
		jest.clearAllMocks();
		console.error = jest.fn();
	} );

	afterEach( () => {
		console.error = originalConsoleError;
	} );

	it( 'should render panel structure correctly', () => {
		render( <VariablesManagerPanel /> );

		expect( screen.getByTestId( 'theme-provider' ) ).toBeInTheDocument();
		expect( screen.getByTestId( 'panel' ) ).toBeInTheDocument();
		expect( screen.getByTestId( 'panel-header' ) ).toBeInTheDocument();
		expect( screen.getByTestId( 'panel-body' ) ).toBeInTheDocument();
		expect( screen.getByTestId( 'panel-footer' ) ).toBeInTheDocument();
	} );

	it( 'should render panel title with icon', () => {
		render( <VariablesManagerPanel /> );

		const title = screen.getByTestId( 'panel-header-title' );
		const props = JSON.parse( title.getAttribute( 'data-props' ) || '{}' );

		expect( props.sx ).toEqual( {
			display: 'flex',
			alignItems: 'center',
			gap: 0.5,
		} );
		expect( title ).toHaveTextContent( 'Variable Manager' );
	} );

	it( 'should pass variables and menu actions to table', () => {
		render( <VariablesManagerPanel /> );

		const table = screen.getByTestId( 'variables-manager-table' );
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
		render( <VariablesManagerPanel /> );

		const button = screen.getByTestId( 'button' );
		expect( button ).toHaveTextContent( 'Save changes' );
		expect( button ).toBeDisabled();
	} );

	it( 'should prevent unload when dirty', () => {
		const addEventListenerSpy = jest.spyOn( window, 'addEventListener' );
		const removeEventListenerSpy = jest.spyOn( window, 'removeEventListener' );

		const { unmount } = render( <VariablesManagerPanel /> );

		expect( addEventListenerSpy ).toHaveBeenCalledWith( 'beforeunload', expect.any( Function ) );

		unmount();

		expect( removeEventListenerSpy ).toHaveBeenCalledWith( 'beforeunload', expect.any( Function ) );

		addEventListenerSpy.mockRestore();
		removeEventListenerSpy.mockRestore();
	} );

	it( 'should apply correct styles to panel body', () => {
		render( <VariablesManagerPanel /> );

		const body = screen.getByTestId( 'panel-body' );
		const props = JSON.parse( body.getAttribute( 'data-props' ) || '{}' );

		expect( props.sx ).toEqual( {
			display: 'flex',
			flexDirection: 'column',
			height: '100%',
		} );
	} );
} );