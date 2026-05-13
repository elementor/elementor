import '@testing-library/jest-dom';

import * as React from 'react';
import { createMockPropType, renderField } from 'test-utils';
import { ControlActionsProvider } from '@elementor/editor-controls';
import type { PropValue } from '@elementor/editor-props';
import { type BreakpointId } from '@elementor/editor-responsive';
import { type StylesProvider } from '@elementor/editor-styles-repository';
import { useSessionStorage } from '@elementor/session';
import { screen } from '@testing-library/react';

import { useStyle } from '../../../../contexts/style-context';
import { useInheritedValues } from '../../../../contexts/styles-inheritance-context';
import { useStylesField } from '../../../../hooks/use-styles-field';
import { useStylesFields } from '../../../../hooks/use-styles-fields';
import { PositionSection } from '../position-section';
import { createPropTypeWithDependency, mockStyleFields, mockStylesFieldValues } from './position-test-utils';

const POSITION_INSET_KEYS = [
	'inset-block-start',
	'inset-block-end',
	'inset-inline-start',
	'inset-inline-end',
] as const;

type PositionDependentFieldKey = ( typeof POSITION_INSET_KEYS )[ number ] | 'z-index';

type PositionDependentValues = Record< PositionDependentFieldKey, PropValue | null >;

jest.mock( '@elementor/session' );
jest.mock( '@elementor/editor-styles', () => ( {
	...jest.requireActual( '@elementor/editor-styles' ),
	getStylesSchema: jest.fn(),
} ) );

jest.mock( '../../../../hooks/use-styles-field' );
jest.mock( '../../../../hooks/use-styles-fields' );
jest.mock( '../../../../contexts/style-context' );
jest.mock( '../../../../styles-inheritance/components/styles-inheritance-indicator' );
jest.mock( '../../../../contexts/styles-inheritance-context', () => ( {
	useStylesInheritanceChain: jest.fn( () => [] ),
	useInheritedValues: jest.fn( () => ( {} ) ),
} ) );

const renderPositionSection = () => {
	return renderField( <PositionSection />, {
		propTypes: {
			position: createMockPropType( { kind: 'plain', key: 'string' } ),
			'inset-block-start': createPropTypeWithDependency( { kind: 'object', key: 'size' } ),
			'inset-block-end': createPropTypeWithDependency( { kind: 'object', key: 'size' } ),
			'inset-inline-start': createPropTypeWithDependency( { kind: 'object', key: 'size' } ),
			'inset-inline-end': createPropTypeWithDependency( { kind: 'object', key: 'size' } ),
			'z-index': createMockPropType( { kind: 'plain', key: 'number' } ),
			'scroll-margin-top': createMockPropType( { kind: 'object', key: 'size' } ),
		},
	} );
};

const mockUseStyle = ( breakpoint: BreakpointId = 'desktop' ) => {
	jest.mocked( useStyle ).mockReturnValue( {
		id: 'styleDefId',
		setId: jest.fn(),
		meta: { breakpoint, state: null },
		setMetaState: jest.fn(),
		provider: {} as StylesProvider,
	} );
};

describe( '<PositionSection />', () => {
	beforeEach( () => {
		mockUseStyle();

		jest.mocked( useSessionStorage ).mockImplementation( () => [ null, jest.fn(), jest.fn() ] );

		jest.mocked( useInheritedValues ).mockReturnValue( {} );

		mockStyleFields();
	} );

	describe( 'Hide Position Dimension Controls Scenarios', () => {
		it( 'should hide position dimension controls if position is static', () => {
			// Arrange.
			mockStylesFieldValues( { position: { $$type: 'string', value: 'static' } } );

			// Act.
			renderPositionSection();

			// Assert.
			expect( screen.queryByText( 'Top' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'Bottom' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'Right' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'Left' ) ).not.toBeInTheDocument();
			expect( screen.getByText( 'Z-index' ) ).toBeInTheDocument();
		} );

		it( 'should hide position dimension controls if position is not selected value', () => {
			// Arrange.
			mockStylesFieldValues( { position: null } );

			// Act.
			renderPositionSection();

			// Assert.
			expect( screen.queryByText( 'Top' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'Bottom' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'Right' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'Left' ) ).not.toBeInTheDocument();
			expect( screen.getByText( 'Z-index' ) ).toBeInTheDocument();
		} );

		it( 'should hide position dimension controls when position value is null and placeholder is static', () => {
			// Arrange.
			mockStylesFieldValues( { position: null } );

			// Act.
			renderPositionSection();

			// Assert — placeholder is static, so no dimensional inputs should appear.
			expect( screen.queryByText( 'Top' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'Bottom' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'Right' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'Left' ) ).not.toBeInTheDocument();
			expect( screen.getByText( 'Z-index' ) ).toBeInTheDocument();
		} );
	} );

	describe( 'Show Position Dimension Controls Scenarios', () => {
		it( 'should show position dimension controls if position is not static', () => {
			// Arrange.
			mockStylesFieldValues( { position: { $$type: 'string', value: 'relative' } } );
			mockStyleFields( { position: 'relative' } );

			// Act.
			renderPositionSection();

			// Assert.
			expect( screen.getByText( 'Top' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Bottom' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Right' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Left' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Z-index' ) ).toBeInTheDocument();
		} );

		it( 'should show position dimension controls when position value is null but placeholder is non-static', () => {
			// Arrange.
			mockStylesFieldValues( { position: null } );
			jest.mocked( useInheritedValues ).mockReturnValue( {
				position: {
					$$type: 'string',
					value: 'absolute',
				},
			} );

			// Act.
			renderPositionSection();

			expect( screen.getByText( 'Top' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Bottom' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Right' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Left' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Z-index' ) ).toBeInTheDocument();
		} );

		it( 'should show position dimension when both position value and placeholder are non-static', () => {
			// Arrange.
			mockStylesFieldValues( { position: { $$type: 'string', value: 'fixed' } } );
			mockStyleFields( { position: 'fixed' } );

			jest.mocked( useInheritedValues ).mockReturnValue( {
				position: {
					$$type: 'string',
					value: 'sticky',
				},
			} );

			// Act.
			renderPositionSection();

			// Assert.
			expect( screen.getByText( 'Top' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Bottom' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Right' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Left' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Z-index' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Fixed' ) ).toBeInTheDocument();
		} );
	} );

	describe( 'Show anchor offset input in all cases', () => {
		it( 'should show when position is null', () => {
			// Arrange.
			mockStylesFieldValues( { position: null } );

			// Act.
			renderPositionSection();

			// Assert.
			expect( screen.getByText( 'Anchor offset' ) ).toBeVisible();
		} );

		it( 'should show when position is static', () => {
			// Arrange.
			mockStylesFieldValues( { position: { $$type: 'string', value: 'static' } } );

			// Act.
			renderPositionSection();

			// Assert.
			expect( screen.getByText( 'Anchor offset' ) ).toBeVisible();
		} );
	} );
} );

describe( 'Dimensions values persistence', () => {
	beforeEach( () => {
		mockUseStyle( 'mobile' );

		jest.mocked( useSessionStorage ).mockImplementation( () => [ null, jest.fn(), jest.fn() ] );

		mockStyleFields();
	} );

	it( 'should save dimension values to history when changing position to static', () => {
		// Arrange.
		mockStylesFieldValues( { position: { $$type: 'string', value: 'absolute' } } );
		mockStyleFields( { position: 'absolute', 'inset-block-start': 44 } );

		const setHistory = jest.fn();
		jest.mocked( useSessionStorage ).mockImplementation( () => [ null, setHistory, jest.fn() ] );

		const { rerender } = renderPositionSection();

		// Act. — user (or model) switches position to static while dimensions are still present.
		mockStylesFieldValues( { position: { $$type: 'string', value: 'static' } } );
		mockStyleFields( { position: 'static', 'inset-block-start': 44 } );

		rerender(
			<ControlActionsProvider items={ [] }>
				<PositionSection />
			</ControlActionsProvider>
		);

		// Assert.
		expect( useSessionStorage ).toHaveBeenCalledWith( `styles/styleDefId/mobile/null/dimensions` );
		expect( setHistory ).toHaveBeenCalledWith( {
			'inset-block-start': {
				value: {
					size: 44,
					unit: 'px',
				},
				$$type: 'size',
			},
			'inset-block-end': null,
			'inset-inline-start': null,
			'inset-inline-end': null,
			'z-index': null,
		} );
	} );

	it( 'should reset dimension values in the model when changing position to static', () => {
		// Insets are cleared when hidden via <ConditionalField /> (resetValue → setValue(null)).
		// z-index is cleared in PositionSection when position is static (setDependentValues({ 'z-index': null })).
		const positionState = {
			value: { $$type: 'string', value: 'absolute' },
		};

		const dependentSetValue: Record< PositionDependentFieldKey, jest.Mock > = {
			'inset-block-start': jest.fn(),
			'inset-block-end': jest.fn(),
			'inset-inline-start': jest.fn(),
			'inset-inline-end': jest.fn(),
			'z-index': jest.fn(),
		};

		const dependentValue: PositionDependentValues = {
			'inset-block-start': { $$type: 'size', value: { size: 44, unit: 'px' } },
			'inset-block-end': { $$type: 'size', value: { size: 10, unit: 'px' } },
			'inset-inline-start': { $$type: 'size', value: { size: 2, unit: 'px' } },
			'inset-inline-end': { $$type: 'size', value: { size: 3, unit: 'px' } },
			'z-index': { $$type: 'number', value: 7 },
		};

		const setDependentValuesBatch = jest.fn( ( props: Partial< PositionDependentValues > ) => {
			Object.assign( dependentValue, props );
		} );

		jest.mocked( useStylesField ).mockImplementation( ( key: string ) => {
			if ( key === 'position' ) {
				return {
					value: positionState.value,
					setValue: jest.fn(),
					canEdit: true,
				};
			}

			const depKey = key as PositionDependentFieldKey;

			if ( depKey in dependentSetValue ) {
				return {
					value: dependentValue[ depKey ],
					setValue: dependentSetValue[ depKey ],
					canEdit: true,
				};
			}

			return {
				value: null,
				setValue: jest.fn(),
				canEdit: true,
			};
		} );

		jest.mocked( useStylesFields ).mockImplementation( ( propNames: string[] ) => {
			const values = Object.fromEntries(
				propNames.map( ( name ) => [ name, dependentValue[ name as PositionDependentFieldKey ] ?? null ] )
			);

			return {
				values,
				setValues: setDependentValuesBatch,
				canEdit: true,
			};
		} );

		const { rerender } = renderPositionSection();

		positionState.value = { $$type: 'string', value: 'static' };

		rerender(
			<ControlActionsProvider items={ [] }>
				<PositionSection />
			</ControlActionsProvider>
		);

		POSITION_INSET_KEYS.forEach( ( key ) => {
			expect( dependentSetValue[ key ] ).toHaveBeenCalledWith( null );
		} );

		expect( setDependentValuesBatch ).toHaveBeenCalledWith(
			{ 'z-index': null },
			{ history: { propDisplayName: 'Dimensions' } }
		);
	} );

	it( 'should clear position-dependent props when position is cleared (ConditionalField path)', () => {
		// Hidden dimension fields reset via <ConditionalField />. z-index is also cleared in PositionSection when position is unset (same effect branch as static).
		const positionState = { value: null };

		const dependentSetValue: Record< PositionDependentFieldKey, jest.Mock > = {
			'inset-block-start': jest.fn(),
			'inset-block-end': jest.fn(),
			'inset-inline-start': jest.fn(),
			'inset-inline-end': jest.fn(),
			'z-index': jest.fn(),
		};

		const dependentValue: PositionDependentValues = {
			'inset-block-start': { $$type: 'size', value: { size: 20, unit: 'px' } },
			'inset-block-end': { $$type: 'size', value: { size: 1, unit: 'px' } },
			'inset-inline-start': { $$type: 'size', value: { size: 2, unit: 'px' } },
			'inset-inline-end': { $$type: 'size', value: { size: 3, unit: 'px' } },
			'z-index': { $$type: 'number', value: 5 },
		};

		const setDependentValuesBatch = jest.fn();

		jest.mocked( useStylesField ).mockImplementation( ( key: string ) => {
			if ( key === 'position' ) {
				return {
					value: positionState.value,
					setValue: jest.fn(),
					canEdit: true,
				};
			}

			const depKey = key as PositionDependentFieldKey;

			if ( depKey in dependentSetValue ) {
				return {
					value: dependentValue[ depKey ],
					setValue: dependentSetValue[ depKey ],
					canEdit: true,
				};
			}

			return {
				value: null,
				setValue: jest.fn(),
				canEdit: true,
			};
		} );

		jest.mocked( useStylesFields ).mockImplementation( ( propNames: string[] ) => {
			const values = Object.fromEntries(
				propNames.map( ( name ) => [ name, dependentValue[ name as PositionDependentFieldKey ] ?? null ] )
			);

			return {
				values,
				setValues: setDependentValuesBatch,
				canEdit: true,
			};
		} );

		renderPositionSection();

		POSITION_INSET_KEYS.forEach( ( key ) => {
			expect( dependentSetValue[ key ] ).toHaveBeenCalledWith( null );
		} );

		expect( setDependentValuesBatch ).toHaveBeenCalledWith(
			{ 'z-index': null },
			{ history: { propDisplayName: 'Dimensions' } }
		);
	} );

	it( `should populate the model's positioning values from history when switching from static to a different position`, () => {
		// Assert.
		// PositionSection restores from session when leaving static (setDependentValues); mocked useStylesField does not update from the Select.
		mockStylesFieldValues( { position: { $$type: 'string', value: 'static' } } );

		const setStylesFields = jest.fn();
		jest.mocked( useStylesFields ).mockReturnValue( {
			values: {
				position: {
					$$type: 'string',
					value: 'static',
				},
			},
			setValues: setStylesFields,
			canEdit: true,
		} );

		jest.mocked( useSessionStorage ).mockImplementation( () => [
			{
				'inset-inline-start': {
					value: {
						size: 54,
						unit: 'px',
					},
					$$type: 'size',
				},
			},
			jest.fn(),
			jest.fn(),
		] );

		const { rerender } = renderPositionSection();

		mockStylesFieldValues( { position: { $$type: 'string', value: 'absolute' } } );
		jest.mocked( useStylesFields ).mockReturnValue( {
			values: {
				position: {
					$$type: 'string',
					value: 'absolute',
				},
			},
			setValues: setStylesFields,
			canEdit: true,
		} );

		rerender(
			<ControlActionsProvider items={ [] }>
				<PositionSection />
			</ControlActionsProvider>
		);

		// Assert.
		expect( useSessionStorage ).toHaveBeenCalledWith( 'styles/styleDefId/mobile/null/dimensions' );
		expect( setStylesFields ).toHaveBeenCalledWith(
			{
				'inset-inline-start': {
					value: {
						size: 54,
						unit: 'px',
					},
					$$type: 'size',
				},
			},
			{ history: { propDisplayName: 'Dimensions' } }
		);
	} );
} );
