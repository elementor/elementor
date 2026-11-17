import { isExperimentActive } from '@elementor/editor-v1-adapters';

import { isAtomicElementsPanelEnabled } from '../gate';

jest.mock( '@elementor/editor-v1-adapters', () => ( { isExperimentActive: jest.fn() } ) );

describe( 'isAtomicElementsPanelEnabled', () => {
	it.each( [
		[ true, true, true ],
		[ true, false, false ],
		[ false, true, false ],
		[ false, false, false ],
	] )( 'should be %s/%s => %s', ( atomic, sidebar, expected ) => {
		// Arrange.
		jest.mocked( isExperimentActive ).mockImplementation( ( name ) =>
			name === 'e_atomic_elements' ? atomic : sidebar
		);

		// Act & Assert.
		expect( isAtomicElementsPanelEnabled() ).toBe( expected );
	} );
} );
