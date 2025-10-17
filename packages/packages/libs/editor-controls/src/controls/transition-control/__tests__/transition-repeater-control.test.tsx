import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { screen, waitFor } from '@testing-library/react';

import { useProLicenseStatus } from '../../../hooks/use-pro-license-status';
import { TransitionRepeaterControl } from '../transition-repeater-control';

jest.mock( '../../../hooks/use-pro-license-status', () => ( {
	useProLicenseStatus: jest.fn( () => ( { active: true, expired: false } ) ),
} ) );
jest.mock( '@elementor/editor-elements', () => ( {
	...jest.requireActual( '@elementor/editor-elements' ),
	getSelectedElements: jest.fn( () => [
		{
			id: 'test-element-id',
			type: 'test-widget-type',
		},
	] ),
} ) );

const recentlyUsedGetter = () => Promise.resolve( [] );

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

jest.mock( '../data', () => ( {
	initialTransitionValue: {
		$$type: 'selection-size',
		value: {
			selection: {
				$$type: 'key-value',
				value: {
					key: { $$type: 'string', value: 'All properties' },
					value: { $$type: 'string', value: 'all' },
				},
			},
			size: { $$type: 'size', value: { size: 200, unit: 'ms' } },
		},
	},
	transitionProperties: [
		{
			category: 'Basic',
			properties: [ { label: 'All properties', value: 'all' } ],
		},
	],
} ) );

describe( 'TransitionRepeaterControl', () => {
	it( 'should render with default empty state', async () => {
		// Arrange
		const setValue = jest.fn();
		const value = { $$type: 'transition', value: [] };
		const propType = createTransitionPropType();
		const props = { setValue, value, bind: 'transition', propType };

		// Act
		renderControl(
			<TransitionRepeaterControl currentStyleState={ null } recentlyUsedListGetter={ recentlyUsedGetter } />,
			props
		);

		// Assert
		await waitFor( () => {
			expect( screen.getByText( 'Transitions' ) ).toBeInTheDocument();
		} );
	} );

	it( 'should display an enabled add button when rendered in normal style state', async () => {
		// Arrange
		const setValue = jest.fn();
		const value = { $$type: 'transition', value: [] };
		const propType = createTransitionPropType();
		const props = { setValue, value, bind: 'transition', propType };

		// Act
		renderControl(
			<TransitionRepeaterControl currentStyleState={ null } recentlyUsedListGetter={ recentlyUsedGetter } />,
			props
		);

		let addButton = null;
		// Assert
		await waitFor( () => {
			addButton = screen.getByLabelText( 'Add transitions item' );
			expect( addButton ).toBeInTheDocument();
		} );
		expect( addButton ).not.toBeNull();
		expect( addButton ).toBeEnabled();
	} );

	it( 'should display a disabled add button when not in normal style state', async () => {
		// Arrange
		const setValue = jest.fn();
		const value = { $$type: 'transition', value: [] };
		const propType = createTransitionPropType();
		const props = { setValue, value, bind: 'transition', propType };

		// Act
		let addButton = null;
		renderControl(
			<TransitionRepeaterControl currentStyleState={ 'hover' } recentlyUsedListGetter={ recentlyUsedGetter } />,
			props
		);

		// Assert
		await waitFor( () => {
			addButton = screen.getByLabelText( 'Add transitions item' );
			expect( addButton ).toBeInTheDocument();
		} );
		expect( addButton ).not.toBeNull();
		expect( addButton ).toBeDisabled();
	} );

	it( 'should disable the add item button when all properties are used', async () => {
		// Arrange
		const setValue = jest.fn();
		const value = {
			$$type: 'transition',
			value: [
				{
					$$type: 'selection-size',
					value: {
						selection: {
							$$type: 'key-value',
							value: {
								key: {
									value: 'All properties',
									$$type: 'string',
								},
								value: {
									value: 'all',
									$$type: 'string',
								},
							},
						},
						size: {
							$$type: 'size',
							value: {
								size: 200,
								unit: 'ms',
							},
						},
					},
				},
			],
		};
		const propType = createTransitionPropType();
		const props = { setValue, value, bind: 'transition', propType };

		// Act
		renderControl(
			<TransitionRepeaterControl currentStyleState={ null } recentlyUsedListGetter={ recentlyUsedGetter } />,
			props
		);

		// Assert
		const addButton = screen.getByLabelText( 'Add transitions item' );
		await waitFor( () => {
			expect( addButton ).toBeInTheDocument();
		} );

		expect( addButton ).toBeDisabled();
		expect( screen.getByText( 'All properties: 200ms' ) ).toBeInTheDocument();
	} );

	it( 'should enable the add item button when all properties are not used', async () => {
		// Arrange
		const setValue = jest.fn();
		const value = { $$type: 'transition', value: [] };
		const propType = createTransitionPropType();
		const props = { setValue, value, bind: 'transition', propType };

		// Act
		renderControl(
			<TransitionRepeaterControl currentStyleState={ null } recentlyUsedListGetter={ recentlyUsedGetter } />,
			props
		);

		const addButton = screen.getByLabelText( 'Add transitions item' );

		// Assert
		await waitFor( () => {
			expect( addButton ).toBeInTheDocument();
		} );

		expect( addButton ).toBeEnabled();
	} );

	it( 'should update the value according to the allowed properties list', async () => {
		// Arrange
		const setValue = jest.fn();
		const value = {
			$$type: 'transition',
			value: [
				{
					$$type: 'selection-size',
					value: {
						selection: {
							$$type: 'key-value',
							value: {
								key: {
									value: 'All properties',
									$$type: 'string',
								},
								value: {
									value: 'all',
									$$type: 'string',
								},
							},
						},
						size: {
							$$type: 'size',
							value: {
								size: 200,
								unit: 'ms',
							},
						},
					},
				},
				{
					$$type: 'selection-size',
					value: {
						selection: {
							$$type: 'key-value',
							value: {
								key: {
									value: 'Invalid',
									$$type: 'string',
								},
								value: {
									value: 'not-valid',
									$$type: 'string',
								},
							},
						},
						size: {
							$$type: 'size',
							value: {
								size: 500,
								unit: 'ms',
							},
						},
					},
				},
			],
		};
		const propType = createTransitionPropType();
		const props = { setValue, value, bind: 'transition', propType };

		// Act
		renderControl(
			<TransitionRepeaterControl currentStyleState={ null } recentlyUsedListGetter={ recentlyUsedGetter } />,
			props
		);

		// Assert
		await waitFor( () => expect( setValue ).toHaveBeenCalledTimes( 1 ) );
		const sanitized = setValue.mock.calls[ 0 ][ 0 ];
		expect( sanitized ).toEqual( {
			$$type: 'transition',
			value: [
				{
					$$type: 'selection-size',
					value: {
						selection: {
							$$type: 'key-value',
							value: {
								key: {
									$$type: 'string',
									value: 'All properties',
								},
								value: {
									$$type: 'string',
									value: 'all',
								},
							},
						},
						size: {
							$$type: 'size',
							value: {
								size: 200,
								unit: 'ms',
							},
						},
					},
				},
			],
		} );
	} );
} );

describe( 'TransitionRepeaterControl - License gating', () => {
	const propType = createTransitionPropType();
	const baseProps = { setValue: jest.fn(), value: { $$type: 'transition', value: [] }, bind: 'transition', propType };
	const mockUseProLicenseStatus = useProLicenseStatus as jest.MockedFunction< typeof useProLicenseStatus >;

	beforeEach( () => {
		jest.clearAllMocks();
		mockUseProLicenseStatus.mockReturnValue( { active: true, expired: false } );
	} );

	it( 'should disable Add button when license is expired and All properties already selected', async () => {
		// Arrange
		mockUseProLicenseStatus.mockReturnValue( { active: false, expired: true } );

		const value = {
			$$type: 'transition',
			value: [
				{
					$$type: 'selection-size',
					value: {
						selection: {
							$$type: 'key-value',
							value: {
								key: { $$type: 'string', value: 'All properties' },
								value: { $$type: 'string', value: 'all' },
							},
						},
						size: { $$type: 'size', value: { size: 200, unit: 'ms' } },
					},
				},
			],
		};

		// Act
		renderControl(
			<TransitionRepeaterControl currentStyleState={ null } recentlyUsedListGetter={ recentlyUsedGetter } />,
			{ ...baseProps, value }
		);

		// Assert
		const addButton = await screen.findByLabelText( 'Add transitions item' );
		expect( addButton ).toBeDisabled();
	} );

	it( 'should keep Add button enabled when license is expired but All properties not selected', async () => {
		// Arrange
		mockUseProLicenseStatus.mockReturnValue( { active: false, expired: true } );

		// Act
		renderControl(
			<TransitionRepeaterControl currentStyleState={ null } recentlyUsedListGetter={ recentlyUsedGetter } />,
			baseProps
		);

		// Assert
		const addButton = await screen.findByLabelText( 'Add transitions item' );
		expect( addButton ).toBeEnabled();
	} );
} );
