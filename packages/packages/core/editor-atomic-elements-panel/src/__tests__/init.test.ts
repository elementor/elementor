import { injectIntoLogic, injectIntoTop } from '@elementor/editor';
import { registerPanel } from '@elementor/editor-panels';
import { blockCommand } from '@elementor/editor-v1-adapters';

import { isAtomicElementsPanelEnabled } from '../gate';
import { init } from '../init';
import { registerLegacyHiding } from '../legacy-hiding/register-legacy-hiding';

jest.mock( '@elementor/editor-panels', () => ( {
	createPanel: jest.fn( () => ( { panel: { id: 'atomic-elements-panel' }, isPanelOpen: jest.fn() } ) ),
	registerPanel: jest.fn(),
} ) );
jest.mock( '@elementor/editor', () => ( {
	injectIntoLogic: jest.fn(),
	injectIntoTop: jest.fn(),
} ) );
jest.mock( '@elementor/editor-v1-adapters', () => ( {
	...jest.requireActual( '@elementor/editor-v1-adapters' ),
	blockCommand: jest.fn(),
} ) );
jest.mock( '../gate' );
jest.mock( '../legacy-hiding/register-legacy-hiding' );

describe( 'editor-atomic-elements-panel init', () => {
	beforeEach( () => {
		jest.mocked( registerPanel ).mockClear();
		jest.mocked( injectIntoLogic ).mockClear();
		jest.mocked( injectIntoTop ).mockClear();
		jest.mocked( registerLegacyHiding ).mockClear();
		jest.mocked( blockCommand ).mockClear();
	} );

	it( 'should register the panel when the gate is on', () => {
		// Arrange.
		jest.mocked( isAtomicElementsPanelEnabled ).mockReturnValue( true );

		// Act.
		init();

		// Assert.
		expect( registerPanel ).toHaveBeenCalledWith( { id: 'atomic-elements-panel' } );
		expect( injectIntoLogic ).toHaveBeenCalledTimes( 1 );
		expect( injectIntoTop ).toHaveBeenCalledTimes( 1 );
		expect( registerLegacyHiding ).toHaveBeenCalledTimes( 1 );
		expect( blockCommand ).toHaveBeenCalledWith( expect.objectContaining( { command: 'panel/open-default' } ) );
	} );

	it( 'should not register the panel when the gate is off', () => {
		// Arrange.
		jest.mocked( isAtomicElementsPanelEnabled ).mockReturnValue( false );

		// Act.
		init();

		// Assert.
		expect( registerPanel ).not.toHaveBeenCalled();
		expect( injectIntoLogic ).not.toHaveBeenCalled();
		expect( injectIntoTop ).not.toHaveBeenCalled();
		expect( registerLegacyHiding ).not.toHaveBeenCalled();
		expect( blockCommand ).not.toHaveBeenCalled();
	} );
} );
