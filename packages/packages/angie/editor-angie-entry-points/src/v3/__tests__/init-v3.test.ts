jest.mock( '@elementor/editor-v1-adapters', () => ( {
	__privateListenTo: jest.fn(),
	isExperimentActive: jest.fn(),
	v1ReadyEvent: jest.fn( () => ( { type: 'v1-ready' } ) ),
} ) );

jest.mock( '../animation/init-animation', () => ( {
	initV3AnimationControls: jest.fn(),
} ) );

jest.mock( '../code/init-code', () => ( {
	initV3CodeControls: jest.fn(),
} ) );

jest.mock( '../layout/init-layout', () => ( {
	initV3Layout: jest.fn(),
} ) );

jest.mock( '../text/init-text', () => ( {
	initV3TextControls: jest.fn(),
} ) );

import { __privateListenTo as listenTo, isExperimentActive, v1ReadyEvent } from '@elementor/editor-v1-adapters';

import { initV3AnimationControls } from '../animation/init-animation';
import { applyAngieControlBehavior } from '../apply-angie-control-behavior';
import { initV3CodeControls } from '../code/init-code';
import { initV3 } from '../init-v3';
import { initV3Layout } from '../layout/init-layout';
import { initV3TextControls } from '../text/init-text';

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
		expect( initV3TextControls ).not.toHaveBeenCalled();
		expect( initV3CodeControls ).not.toHaveBeenCalled();
		expect( initV3AnimationControls ).not.toHaveBeenCalled();
		expect( initV3Layout ).not.toHaveBeenCalled();
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
		expect( initV3TextControls ).toHaveBeenCalled();
		expect( initV3CodeControls ).toHaveBeenCalled();
		expect( initV3AnimationControls ).toHaveBeenCalled();
		expect( initV3Layout ).toHaveBeenCalled();
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
