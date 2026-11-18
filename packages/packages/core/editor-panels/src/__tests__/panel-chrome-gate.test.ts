import { isExperimentActive } from '@elementor/editor-v1-adapters';

import { isSidebarPanelChromeEnabled } from '../panel-chrome-gate';

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	isExperimentActive: jest.fn(),
} ) );

describe( 'isSidebarPanelChromeEnabled', () => {
	beforeEach( () => {
		jest.mocked( isExperimentActive ).mockReturnValue( true );
	} );

	it( 'is enabled when both sidebar experiments are active', () => {
		expect( isSidebarPanelChromeEnabled() ).toBe( true );
		expect( isExperimentActive ).toHaveBeenCalledWith( 'e_atomic_elements' );
		expect( isExperimentActive ).toHaveBeenCalledWith( 'e_editor_sidebar' );
	} );

	it( 'is disabled when either experiment is off', () => {
		jest.mocked( isExperimentActive ).mockImplementation( ( name ) => name !== 'e_editor_sidebar' );

		expect( isSidebarPanelChromeEnabled() ).toBe( false );
	} );
} );