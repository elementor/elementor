import { getMixpanel } from '@elementor/events';

import { trackDefaultStyles } from '../tracking';

jest.mock( '@elementor/events', () => ( {
	getMixpanel: jest.fn(),
} ) );

describe( 'trackDefaultStyles', () => {
	const mockDispatchEvent = jest.fn();

	beforeEach( () => {
		jest.clearAllMocks();

		jest.mocked( getMixpanel ).mockReturnValue( {
			dispatchEvent: mockDispatchEvent,
			config: {
				appTypes: { editor: 'editor' },
				names: { default_styles: { tagSaved: 'default_styles_tag_saved' } },
			},
		} as never );
	} );

	it( 'should dispatch the event with the shared and event specific properties', () => {
		// Act
		trackDefaultStyles( { event: 'tagSaved', tag: 'h1', action: 'set', sections_modified: [ 'typography' ] } );

		// Assert
		expect( mockDispatchEvent ).toHaveBeenCalledWith( 'default_styles_tag_saved', {
			window_name: 'editor',
			app_type: 'editor',
			interaction_type: 'click',
			target_type: 'button',
			target_name: 'save_changes',
			target_location: 'design_system_panel',
			interaction_result: 'tag_saved',
			executed_by: 'user',
			tag: 'h1',
			action: 'set',
			sections_modified: [ 'typography' ],
		} );
	} );

	it( 'should not dispatch when the event name is not configured', () => {
		// Act
		trackDefaultStyles( { event: 'panelOpened' } );

		// Assert
		expect( mockDispatchEvent ).not.toHaveBeenCalled();
	} );
} );
