import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { transitionProperties, TransitionRepeaterControl } from '@elementor/editor-controls';
import { sizePropTypeUtil } from '@elementor/editor-props';
import { screen, waitFor } from '@testing-library/react';

import { customSizeVariablePropTypeUtil, sizeVariablePropTypeUtil } from '../../prop-types';
import { registerRepeaterInjections } from '../../repeater-injections';
import { service } from '../../service';

const recentlyUsedListGetter = (): Promise< string[] > => Promise.resolve( [] );

const createTransitionPropType = () =>
	createMockPropType( {
		kind: 'array',
		key: 'transition',
		item_prop_type: createMockPropType( {
			kind: 'object',
			key: 'selection-size',
			shape: {
				selection: createMockPropType( {
					kind: 'union',
					prop_types: {
						'key-value': createMockPropType( {
							kind: 'object',
							shape: {
								key: createMockPropType( { kind: 'plain' } ),
								value: createMockPropType( { kind: 'plain' } ),
							},
						} ),
						string: createMockPropType( { kind: 'plain' } ),
					},
				} ),
				size: createMockPropType( {
					kind: 'object',
					shape: {
						size: createMockPropType( { kind: 'plain' } ),
						unit: createMockPropType( { kind: 'plain' } ),
					},
				} ),
			},
		} ),
	} );

const firstTransitionProperty = transitionProperties[ 0 ].properties[ 0 ];

const createTransitionRow = ( size: unknown ) => ( {
	$$type: 'selection-size' as const,
	value: {
		selection: {
			$$type: 'key-value' as const,
			value: {
				key: { $$type: 'string' as const, value: firstTransitionProperty.label },
				value: { $$type: 'string' as const, value: firstTransitionProperty.value },
			},
		},
		size,
	},
} );

describe( 'TransitionRepeaterControl with editor-variables', () => {
	let variablesSpy: jest.SpiedFunction< typeof service.variables >;

	beforeEach( () => {
		registerRepeaterInjections();
		variablesSpy = jest.spyOn( service, 'variables' ).mockReturnValue( {} );
	} );

	afterEach( () => {
		variablesSpy.mockRestore();
	} );

	const renderTransitionRepeater = ( items: unknown[] ) => {
		const propType = createTransitionPropType();

		renderControl(
			<TransitionRepeaterControl currentStyleState={ null } recentlyUsedListGetter={ recentlyUsedListGetter } />,
			{
				setValue: jest.fn(),
				value: { $$type: 'transition', value: items },
				bind: 'transition',
				propType,
			}
		);
	};

	it( 'should render transitions repeater with a regular duration size', async () => {
		// Arrange.
		const plainSize = sizePropTypeUtil.create( { unit: 'ms', size: 350 } );

		// Act.
		renderTransitionRepeater( [ createTransitionRow( plainSize ) ] );

		// Assert.
		await waitFor( () => {
			expect( screen.getByText( `${ firstTransitionProperty.label }: 350ms` ) ).toBeInTheDocument();
		} );
	} );

	it( 'should render transitions repeater label with resolved global size variable duration', async () => {
		// Arrange.
		const SIZE_VARIABLE_ID = 'e-gs-panel';
		const RESOLVED_DURATION = '999ms';
		variablesSpy.mockReturnValue( {
			[ SIZE_VARIABLE_ID ]: {
				type: sizeVariablePropTypeUtil.key,
				label: 'named-duration',
				value: RESOLVED_DURATION,
			},
		} );

		// Act.
		renderTransitionRepeater( [
			createTransitionRow( { $$type: sizeVariablePropTypeUtil.key, value: SIZE_VARIABLE_ID } ),
		] );

		// Assert.
		await waitFor( () => {
			expect(
				screen.getByText( `${ firstTransitionProperty.label }: ${ RESOLVED_DURATION }` )
			).toBeInTheDocument();
		} );
	} );

	it( 'should render transitions repeater label with resolved global custom size variable duration', async () => {
		// Arrange.
		const CUSTOM_SIZE_VARIABLE_ID = 'e-gcs-panel';
		const RESOLVED_DURATION = '1.5s';
		variablesSpy.mockReturnValue( {
			[ CUSTOM_SIZE_VARIABLE_ID ]: {
				type: customSizeVariablePropTypeUtil.key,
				label: 'custom-duration',
				value: RESOLVED_DURATION,
			},
		} );

		// Act.
		renderTransitionRepeater( [
			createTransitionRow( {
				$$type: customSizeVariablePropTypeUtil.key,
				value: CUSTOM_SIZE_VARIABLE_ID,
			} ),
		] );

		// Assert.
		await waitFor( () => {
			expect(
				screen.getByText( `${ firstTransitionProperty.label }: ${ RESOLVED_DURATION }` )
			).toBeInTheDocument();
		} );
	} );
} );
