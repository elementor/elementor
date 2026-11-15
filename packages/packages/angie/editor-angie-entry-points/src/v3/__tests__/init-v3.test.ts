jest.mock( '@elementor/editor-v1-adapters', () => ( {
	__privateListenTo: jest.fn(),
	isExperimentActive: jest.fn(),
	v1ReadyEvent: jest.fn( () => ( { type: 'v1-ready' } ) ),
} ) );

import { __privateListenTo as listenTo, isExperimentActive, v1ReadyEvent } from '@elementor/editor-v1-adapters';

import { applyAngieControlBehavior } from '../apply-angie-control-behavior';
import { initV3 } from '../init-v3';

describe( 'initV3', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		delete ( window as { elementor?: unknown } ).elementor;
	} );

	it( 'does not listen or register when experiment is off', () => {
		// Arrange
		jest.mocked( isExperimentActive ).mockReturnValue( false );

		// Act
		initV3();

		// Assert
		expect( listenTo ).not.toHaveBeenCalled();
	} );

	it( 'listens to v1 ready and registers filter with priority 20 when experiment is on', () => {
		// Arrange
		jest.mocked( isExperimentActive ).mockReturnValue( true );
		const addFilter = jest.fn();
		( window as { elementor?: { hooks: { addFilter: typeof addFilter } } } ).elementor = {
			hooks: { addFilter },
		};

		// Act
		initV3();

		// Assert
		expect( listenTo ).toHaveBeenCalledWith( v1ReadyEvent(), expect.any( Function ) );

		const readyCallback = jest.mocked( listenTo ).mock.calls[ 0 ][ 1 ];
		readyCallback( {
			type: 'window-event',
			event: 'elementor:init',
			originalEvent: new Event( 'elementor:init' ),
		} );

		expect( addFilter ).toHaveBeenCalledWith( 'controls/base/behaviors', applyAngieControlBehavior, 20 );
	} );
} );