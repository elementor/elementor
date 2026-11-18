import { registerPanel } from '@elementor/editor-panels';

import { isAtomicElementsPanelEnabled } from '../gate';
import { init } from '../init';

jest.mock( '@elementor/editor-panels', () => ( {
	createPanel: jest.fn( () => ( { panel: { id: 'atomic-elements-panel' } } ) ),
	registerPanel: jest.fn(),
} ) );
jest.mock( '../gate' );

describe( 'editor-atomic-elements-panel init', () => {
	beforeEach( () => {
		jest.mocked( registerPanel ).mockClear();
	} );

	it( 'should register the panel when the gate is on', () => {
		// Arrange.
		jest.mocked( isAtomicElementsPanelEnabled ).mockReturnValue( true );

		// Act.
		init();

		// Assert.
		expect( registerPanel ).toHaveBeenCalledWith( { id: 'atomic-elements-panel' } );
	} );

	it( 'should not register the panel when the gate is off', () => {
		// Arrange.
		jest.mocked( isAtomicElementsPanelEnabled ).mockReturnValue( false );

		// Act.
		init();

		// Assert.
		expect( registerPanel ).not.toHaveBeenCalled();
	} );

} );
