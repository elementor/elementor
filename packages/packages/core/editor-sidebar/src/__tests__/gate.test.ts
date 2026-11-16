import { isExperimentActive } from '@elementor/editor-v1-adapters';

import { isSidebarEnabled } from '../gate';

jest.mock( '@elementor/editor-v1-adapters' );

describe( 'isSidebarEnabled', () => {
	it( 'should be enabled only when all the experiments are active', () => {
		// Arrange.
		jest.mocked( isExperimentActive ).mockReturnValue( true );

		// Assert.
		expect( isSidebarEnabled() ).toBe( true );
	} );

	it( 'should be disabled when one of the experiments is inactive', () => {
		// Arrange.
		jest.mocked( isExperimentActive ).mockImplementation( ( name ) => name !== 'e_editor_one' );

		// Assert.
		expect( isSidebarEnabled() ).toBe( false );
	} );
} );
