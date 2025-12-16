import * as React from 'react';
import { type PropsWithChildren } from 'react';
import { renderWithTheme } from 'test-utils';
import { PopoverMenuList } from '@elementor/editor-ui';
import { fireEvent, screen } from '@testing-library/react';
import { __ } from '@wordpress/i18n';

import { VariableTypeProvider } from '../../context/variable-type-context';
import { useFilteredVariables } from '../../hooks/use-prop-variables';
import * as tracking from '../../utils/tracking';
import * as variablesRegistry from '../../variables-registry/variable-type-registry';
import { VariablesSelection } from '../variables-selection';

jest.mock( '../../hooks/use-prop-variables' );
jest.mock( '../../variables-registry/variable-type-registry' );
jest.mock( '../../utils/tracking' );
jest.mock( '../../hooks/use-permissions' );
jest.mock( '@elementor/editor-controls', () => ( {
	useBoundProp: jest.fn(),
} ) );
jest.mock( '@elementor/editor-ui', () => ( {
	...jest.requireActual( '@elementor/editor-ui' ),
	PopoverMenuList: jest.fn(),
} ) );

jest.mocked( PopoverMenuList ).mockImplementation(
	( { items, menuItemContentTemplate, onSelect, selectedValue, ...props } ) => {
		return (
			<ul data-testid={ props[ 'data-testid' ] } role="listbox">
				{ items.map( ( item ) => (
					// eslint-disable-next-line jsx-a11y/click-events-have-key-events
					<li
						key={ item.value }
						role="option"
						aria-selected={ selectedValue === item.value }
						onClick={ () => onSelect( item.value ) }
					>
						<span> { menuItemContentTemplate ? menuItemContentTemplate( item ) : null }</span>
					</li>
				) ) }
			</ul>
		);
	}
);

jest.mock( '../ui/no-search-results', () => ( {
	NoSearchResults: () => <span>No results found</span>,
} ) );
jest.mock( '@elementor/editor-editing-panel', () => ( {
	PopoverBody: ( { children }: PropsWithChildren ) => children,
} ) );

const TestWrapper = ( { children, propTypeKey = 'color' }: { children: React.ReactNode; propTypeKey?: string } ) => {
	return <VariableTypeProvider propTypeKey={ propTypeKey }>{ children }</VariableTypeProvider>;
};

const defaultProps = {
	closePopover: jest.fn(),
	onAdd: jest.fn(),
	onEdit: jest.fn(),
	onSettings: jest.fn(),
};

const mockVariableType = {
	icon: () => <span>ColorIcon</span>,
	startIcon: null,
	variableType: 'Color',
	propTypeUtil: { key: 'color' },
	selectionFilter: null,
	isUpgradeRequired: false,
};

const mockBoundProp = {
	value: '',
	setValue: jest.fn(),
	path: [ 'controls', 'color' ],
	propType: { key: 'color' },
};

describe( 'VariablesSelection', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		( variablesRegistry.getVariableType as jest.Mock ).mockReturnValue( mockVariableType );
		( require( '@elementor/editor-controls' ).useBoundProp as jest.Mock ).mockReturnValue( mockBoundProp );
		( tracking.trackVariableEvent as jest.Mock ).mockImplementation( () => {} );
		( require( '../../hooks/use-permissions' ).usePermissions as jest.Mock ).mockReturnValue( {
			canAdd: () => true,
			canEdit: () => true,
			canManageSettings: () => true,
		} );
	} );

	describe( 'Search', () => {
		it( 'should filter variables when searching', () => {
			// Arrange.
			const mockVariables = [ { key: 'var1', label: 'Primary Color', value: '#ff0000' } ];

			( useFilteredVariables as jest.Mock ).mockReturnValue( {
				list: mockVariables,
				hasMatches: true,
				isSourceNotEmpty: true,
				hasNoCompatibleVariables: false,
			} );

			// Act.
			renderWithTheme(
				<TestWrapper>
					<VariablesSelection { ...defaultProps } />
				</TestWrapper>
			);

			const searchInput = screen.getByPlaceholderText( __( 'Search', 'elementor' ) );
			fireEvent.change( searchInput, { target: { value: 'primary' } } );

			// Assert.
			expect( useFilteredVariables ).toHaveBeenCalledWith( 'primary', 'color' );
		} );

		it( 'should show no search results when search has no matches', () => {
			// Arrange.
			( useFilteredVariables as jest.Mock ).mockReturnValue( {
				list: [],
				hasMatches: false,
				isSourceNotEmpty: true,
				hasNoCompatibleVariables: false,
			} );

			// Act.
			renderWithTheme(
				<TestWrapper>
					<VariablesSelection { ...defaultProps } />
				</TestWrapper>
			);

			// Assert.
			expect( screen.getByText( /No results found/i ) ).toBeInTheDocument();
		} );
	} );

	describe( 'No Variables', () => {
		it( 'should show empty state when no variables exist', () => {
			// Arrange.
			( useFilteredVariables as jest.Mock ).mockReturnValue( {
				list: [],
				hasMatches: false,
				isSourceNotEmpty: false,
				hasNoCompatibleVariables: false,
			} );

			// Act.
			renderWithTheme(
				<TestWrapper>
					<VariablesSelection { ...defaultProps } />
				</TestWrapper>
			);

			// Assert.
			expect( screen.getByText( /Create your first .* variable/i ) ).toBeInTheDocument();
			expect( screen.getByText( /Variables are saved attributes/ ) ).toBeInTheDocument();
		} );

		it( 'should not show search input when no variables exist', () => {
			// Arrange.
			( useFilteredVariables as jest.Mock ).mockReturnValue( {
				list: [],
				hasMatches: false,
				isSourceNotEmpty: false,
				hasNoCompatibleVariables: false,
			} );

			// Act.
			renderWithTheme(
				<TestWrapper>
					<VariablesSelection { ...defaultProps } />
				</TestWrapper>
			);

			// Assert.
			expect( screen.queryByPlaceholderText( __( 'Search', 'elementor' ) ) ).not.toBeInTheDocument();
		} );

		it( 'should call onAdd when create button is clicked', () => {
			// Arrange.
			( useFilteredVariables as jest.Mock ).mockReturnValue( {
				list: [],
				hasMatches: false,
				isSourceNotEmpty: false,
				hasNoCompatibleVariables: false,
			} );

			// Act.
			renderWithTheme(
				<TestWrapper>
					<VariablesSelection { ...defaultProps } />
				</TestWrapper>
			);

			const createButton = screen.getByText( __( 'Create a variable', 'elementor' ) );
			fireEvent.click( createButton );

			// Assert.
			expect( defaultProps.onAdd ).toHaveBeenCalled();
		} );
	} );

	describe( 'No Compatible Variables', () => {
		it( 'should show no compatible variables message when variables exist but none are compatible', () => {
			// Arrange.
			( useFilteredVariables as jest.Mock ).mockReturnValue( {
				list: [],
				hasMatches: false,
				isSourceNotEmpty: false,
				hasNoCompatibleVariables: true,
			} );

			// Act.
			renderWithTheme(
				<TestWrapper>
					<VariablesSelection { ...defaultProps } />
				</TestWrapper>
			);

			// Assert.
			expect( screen.getByText( __( 'No compatible variables', 'elementor' ) ) ).toBeInTheDocument();
			expect( screen.getByText( /none of your variables work with this control/ ) ).toBeInTheDocument();
		} );

		it( 'should prioritize no compatible variables over no variables', () => {
			// Arrange.
			( useFilteredVariables as jest.Mock ).mockReturnValue( {
				list: [],
				hasMatches: false,
				isSourceNotEmpty: true,
				hasNoCompatibleVariables: true,
			} );

			// Act.
			renderWithTheme(
				<TestWrapper>
					<VariablesSelection { ...defaultProps } />
				</TestWrapper>
			);

			// Assert.
			expect( screen.getByText( __( 'No compatible variables', 'elementor' ) ) ).toBeInTheDocument();
			expect( screen.queryByText( /Create your first .* variable/i ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'Variable Selection', () => {
		it( 'should render variables list when variables exist and match search', () => {
			// Arrange.
			const mockVariables = [
				{ key: 'var1', label: 'Primary Color', value: '#ff0000' },
				{ key: 'var2', label: 'Secondary Color', value: '#00ff00' },
			];

			( useFilteredVariables as jest.Mock ).mockReturnValue( {
				list: mockVariables,
				hasMatches: true,
				isSourceNotEmpty: true,
				hasNoCompatibleVariables: false,
			} );

			// Act.
			renderWithTheme(
				<TestWrapper>
					<VariablesSelection { ...defaultProps } />
				</TestWrapper>
			);

			// Assert.
			expect( screen.getByText( 'Primary Color' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Secondary Color' ) ).toBeInTheDocument();
		} );

		it( 'should call setValue and closePopover when variable is selected', () => {
			// Arrange.
			const mockVariables = [ { key: 'var1', label: 'Primary Color', value: '#ff0000' } ];

			( useFilteredVariables as jest.Mock ).mockReturnValue( {
				list: mockVariables,
				hasMatches: true,
				isSourceNotEmpty: true,
				hasNoCompatibleVariables: false,
			} );

			// Act.
			renderWithTheme(
				<TestWrapper>
					<VariablesSelection { ...defaultProps } />
				</TestWrapper>
			);

			const variableItem = screen.getByText( 'Primary Color' );
			fireEvent.click( variableItem );

			// Assert.
			expect( mockBoundProp.setValue ).toHaveBeenCalledWith( 'var1' );
			expect( defaultProps.closePopover ).toHaveBeenCalled();
			expect( tracking.trackVariableEvent ).toHaveBeenCalledWith( {
				varType: 'Color',
				controlPath: 'controls.color',
				action: 'connect',
			} );
		} );

		it( 'should show selected variable as active', () => {
			// Arrange.
			const mockVariables = [ { key: 'var1', label: 'Primary Color', value: '#ff0000' } ];

			( useFilteredVariables as jest.Mock ).mockReturnValue( {
				list: mockVariables,
				hasMatches: true,
				isSourceNotEmpty: true,
				hasNoCompatibleVariables: false,
			} );

			( require( '@elementor/editor-controls' ).useBoundProp as jest.Mock ).mockReturnValue( {
				...mockBoundProp,
				value: 'var1',
			} );

			// Act.
			renderWithTheme(
				<TestWrapper>
					<VariablesSelection { ...defaultProps } />
				</TestWrapper>
			);

			// Assert.
			// eslint-disable-next-line testing-library/no-node-access
			const selectedItem = screen.getByText( 'Primary Color' ).closest( '[aria-selected="true"]' );
			expect( selectedItem ).toBeInTheDocument();
		} );
	} );

	describe( 'Upgrade Promotion', () => {
		it( 'should show promotion empty state when upgrade required', () => {
			// Arrange.
			( variablesRegistry.getVariableType as jest.Mock ).mockReturnValue( {
				...mockVariableType,
				emptyState: <button>Upgrade Now</button>,
			} );
			( useFilteredVariables as jest.Mock ).mockReturnValue( {
				list: [],
				hasMatches: false,
				isSourceNotEmpty: false,
				hasNoCompatibleVariables: false,
			} );

			// Act.
			renderWithTheme(
				<TestWrapper propTypeKey="size">
					<VariablesSelection { ...defaultProps } disabled={ true } />
				</TestWrapper>
			);

			// Assert.
			expect( screen.getByText( /No .* variable yet/i ) ).toBeInTheDocument();
			expect(
				screen.getByText( /Upgrade to create .* variables and maintain consistent element sizing/i )
			).toBeInTheDocument();

			expect( screen.getByText( 'Upgrade Now' ) ).toBeInTheDocument();

			const addButton = screen.getByRole( 'button', { name: __( 'Create variable', 'elementor' ) } );
			expect( addButton ).toBeDisabled();
		} );
	} );
} );
