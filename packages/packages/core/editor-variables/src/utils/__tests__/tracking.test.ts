import { getMixpanel } from '@elementor/events';

import { trackVariableSyncToV3 } from '../tracking';

jest.mock( '@elementor/events', () => ( {
	getMixpanel: jest.fn(),
} ) );

describe( 'trackVariableSyncToV3', () => {
	const mockDispatchEvent = jest.fn();

	beforeEach( () => {
		jest.clearAllMocks();

		jest.mocked( getMixpanel ).mockReturnValue( {
			dispatchEvent: mockDispatchEvent,
			config: {
				names: {
					variables: {
						variableSyncToV3: 'variable_sync_to_v3',
					},
				},
			},
		} as never );
	} );

	it( 'should dispatch sync event with correct payload', () => {
		trackVariableSyncToV3( { variableLabel: 'Primary Color', action: 'sync' } );

		expect( mockDispatchEvent ).toHaveBeenCalledWith( 'variable_sync_to_v3', {
			interaction_type: 'click',
			target_type: 'Primary Color',
			target_name: 'sync_to_v3',
			interaction_result: 'var_is_synced_to_V3',
			target_location: 'widget_panel',
			location_l1: 'var_manager',
			interaction_description: 'user_synced_Primary Color_to_v3',
		} );
	} );

	it( 'should dispatch unsync event with correct payload', () => {
		trackVariableSyncToV3( { variableLabel: 'Primary Color', action: 'unsync' } );

		expect( mockDispatchEvent ).toHaveBeenCalledWith( 'variable_sync_to_v3', {
			interaction_type: 'click',
			target_type: 'Primary Color',
			target_name: 'unsync_to_v3',
			interaction_result: 'var_is_unsynced_from_V3',
			target_location: 'widget_panel',
			location_l1: 'var_manager',
			interaction_description: 'user_unsync_Primary Color_from_v3',
		} );
	} );

	it( 'should not dispatch when config is missing', () => {
		jest.mocked( getMixpanel ).mockReturnValue( {
			dispatchEvent: mockDispatchEvent,
			config: {
				names: {
					variables: {},
				},
			},
		} as never );

		trackVariableSyncToV3( { variableLabel: 'Primary Color', action: 'sync' } );

		expect( mockDispatchEvent ).not.toHaveBeenCalled();
	} );
} );
