import * as React from 'react';
import { createMockPropType } from 'test-utils';
import { useBoundProp } from '@elementor/editor-editing-panel';
import type { PropTypeUtil } from '@elementor/editor-props';
import { ColorFilterIcon, TextIcon } from '@elementor/icons';
import { render, renderHook, screen } from '@testing-library/react';

import { trackVariableEvent } from '../../utils/tracking';
import { getVariableType } from '../../variables-registry/variable-type-registry';
import { usePropVariableAction } from '../use-prop-variable-action';

const MockStartIcon = () => ( { type: 'div' } ) as JSX.Element;

// Mock dependencies
jest.mock( '@elementor/editor-editing-panel', () => ( {
	useBoundProp: jest.fn(),
} ) );

jest.mock( '@elementor/icons', () => ( {
	ColorFilterIcon: jest.fn( () => <div data-testid="color-filter-icon" /> ),
} ) );

jest.mock( '../../variables-registry/variable-type-registry', () => ( {
	getVariableType: jest.fn(),
} ) );

jest.mock( '../../utils/tracking', () => ( {
	trackVariableEvent: jest.fn(),
} ) );

jest.mock( '../../components/variable-selection-popover', () => ( {
	VariableSelectionPopover: jest.fn( ( { closePopover, propTypeKey } ) => (
		<div data-testid="variable-selection-popover">
			<div data-testid="prop-type-key">{ propTypeKey }</div>
			<button onClick={ closePopover } data-testid="close-button">
				Close
			</button>
		</div>
	) ),
} ) );

jest.mock( '@elementor/editor-ui', () => ( {
	CollapseIcon: jest.fn().mockReturnValue( <div /> ),
} ) );

const mockUseBoundProp = jest.mocked( useBoundProp );
const mockTrackVariableEvent = jest.mocked( trackVariableEvent );
const mockGetVariableType = getVariableType as jest.Mock;

const createMockPropTypeUtil = ( key: string ): PropTypeUtil< string, string > =>
	( { key } ) as PropTypeUtil< string, string >;

describe( 'usePropVariableAction', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'Visible Variable Action', () => {
		beforeEach( () => {
			const mockPropType = createMockPropType( {
				kind: 'union',
				prop_types: {
					color: createMockPropType( {
						kind: 'plain',
						key: 'color',
					} ),
					'color-variable': createMockPropType( {
						kind: 'plain',
						key: 'color-variable',
					} ),
				},
			} );

			mockUseBoundProp.mockReturnValue( {
				propType: mockPropType,
				path: [ 'background', 'color' ],
			} as unknown as ReturnType< typeof useBoundProp > );

			mockGetVariableType.mockImplementation( ( type ) => {
				if ( type === 'color-variable' ) {
					return {
						icon: TextIcon,
						valueField: jest.fn(),
						variableType: 'type-1',
						startIcon: MockStartIcon,
						propTypeUtil: createMockPropTypeUtil( 'color-variable' ),
						fallbackPropTypeUtil: createMockPropTypeUtil( 'string' ),
					};
				}

				return undefined;
			} );
		} );

		it( 'should return visible action', () => {
			// Act
			const { result } = renderHook( () => usePropVariableAction() );

			// Assert
			expect( result.current.visible ).toBe( true );
			expect( result.current.icon ).toBe( ColorFilterIcon );
			expect( result.current.title ).toBe( 'Variables' );
		} );

		it( 'should check all prop types and find the variable', () => {
			// Arrange
			const mockVariableType = {
				icon: TextIcon,
				propTypeUtil: createMockPropTypeUtil( 'color-variable' ),
				fallbackPropTypeUtil: createMockPropTypeUtil( 'string' ),
				valueField: jest.fn(),
				variableType: 'font',
				startIcon: MockStartIcon,
			};

			const mockPropType = createMockPropType( {
				kind: 'union',
				prop_types: {
					text: createMockPropType( { kind: 'plain', key: 'text' } ),
					'font-variable': createMockPropType( { kind: 'plain', key: 'font-variable' } ),
					image: createMockPropType( { kind: 'plain', key: 'image' } ),
				},
			} );

			mockUseBoundProp.mockReturnValue( {
				propType: mockPropType,
				path: [ 'typography', 'font' ],
			} as unknown as ReturnType< typeof useBoundProp > );

			mockGetVariableType
				.mockReturnValueOnce( undefined )
				.mockReturnValueOnce( mockVariableType )
				.mockReturnValueOnce( undefined );

			// Act
			const { result } = renderHook( () => usePropVariableAction() );

			// Assert
			expect( result.current.visible ).toBe( true );
			expect( mockGetVariableType ).toHaveBeenCalledTimes( 2 );
			expect( mockGetVariableType ).toHaveBeenCalledWith( 'text' );
			expect( mockGetVariableType ).toHaveBeenCalledWith( 'font-variable' );
		} );

		it( 'should render VariableSelectionPopover in content', () => {
			// Act
			const { result } = renderHook( () => usePropVariableAction() );
			const mockClosePopover = jest.fn();
			const Content = result.current.content;

			// Assert
			expect( Content ).not.toBeNull();

			render( <Content close={ mockClosePopover } /> );

			// eslint-disable-next-line testing-library/no-test-id-queries
			expect( screen.getByTestId( 'variable-selection-popover' ) ).toBeInTheDocument();

			expect( screen.getByText( 'color-variable' ) ).toBeInTheDocument();
		} );

		it( 'should track variable event when content is rendered', () => {
			// Act
			const { result } = renderHook( () => usePropVariableAction() );
			const mockClosePopover = jest.fn();
			const Content = result.current.content;

			render( <Content close={ mockClosePopover } /> );

			// Assert
			expect( mockTrackVariableEvent ).toHaveBeenCalledWith( {
				varType: 'type-1',
				controlPath: 'background.color',
				action: 'open',
			} );
		} );
	} );

	describe( 'Invisible Variable Action', () => {
		it( 'should return invisible action', () => {
			// Arrange
			const mockPropType = createMockPropType( {
				kind: 'union',
				prop_types: {
					'some-type': createMockPropType( { kind: 'plain', key: 'some-type' } ),
					'another-type': createMockPropType( { kind: 'plain', key: 'another-type' } ),
				},
			} );
			mockUseBoundProp.mockReturnValue( {
				propType: mockPropType,
				path: [ 'control', 'color' ],
			} as unknown as ReturnType< typeof useBoundProp > );
			mockGetVariableType.mockReturnValue( undefined );

			// Act
			const { result } = renderHook( () => usePropVariableAction() );

			// Assert
			expect( result.current.visible ).toBe( false );
			expect( mockGetVariableType ).toHaveBeenCalledWith( 'some-type' );
			expect( mockGetVariableType ).toHaveBeenCalledWith( 'another-type' );
		} );

		it( 'should not track if the action is invisible', () => {
			// Arrange
			const mockPropType = createMockPropType( {
				kind: 'union',
				prop_types: {
					'color-variable': createMockPropType( { kind: 'plain', key: 'color-variable' } ),
				},
			} );
			mockUseBoundProp.mockReturnValue( {
				propType: mockPropType,
				path: [ 'color' ],
			} as unknown as ReturnType< typeof useBoundProp > );

			mockGetVariableType.mockReturnValue( undefined );

			// Act
			const { result } = renderHook( () => usePropVariableAction() );
			const mockClosePopover = jest.fn();

			const Content = result.current.content;

			render( <Content close={ mockClosePopover } /> );
			// Assert
			expect( mockTrackVariableEvent ).not.toHaveBeenCalled();
		} );
	} );
} );
