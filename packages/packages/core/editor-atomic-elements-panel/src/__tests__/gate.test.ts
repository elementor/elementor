import { isExperimentActive } from '@elementor/editor-v1-adapters';

import { isAtomicElementsPanelEnabled } from '../gate';

jest.mock( '@elementor/editor-v1-adapters', () => ( { isExperimentActive: jest.fn() } ) );

describe( 'isAtomicElementsPanelEnabled', () => {
	it.each( [ true, false ] )( 'should return %s when the experiment is %s', ( isActive ) => {
		// Arrange.
		jest.mocked( isExperimentActive ).mockImplementation( ( name ) => name === 'e_editor_atomic_panel' && isActive );

		// Act & Assert.
		expect( isAtomicElementsPanelEnabled() ).toBe( isActive );
	} );
} );
