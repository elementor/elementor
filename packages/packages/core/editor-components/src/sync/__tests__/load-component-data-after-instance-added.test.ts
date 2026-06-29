import { createMockElement } from 'test-utils';
import { registerDataHook } from '@elementor/editor-v1-adapters';

import { loadComponentsAssets } from '../../store/actions/load-components-assets';
import { initLoadComponentDataAfterInstanceAdded } from '../load-component-data-after-instance-added';

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	...jest.requireActual( '@elementor/editor-v1-adapters' ),
	registerDataHook: jest.fn(),
} ) );

jest.mock( '../../store/actions/load-components-assets', () => ( {
	loadComponentsAssets: jest.fn(),
} ) );

const mockRegisterDataHook = jest.mocked( registerDataHook );
const mockLoadComponentsAssets = jest.mocked( loadComponentsAssets );

type DataHookCallback = ( args: unknown, result: unknown ) => void;

describe( 'initLoadComponentDataAfterInstanceAdded', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it.each( [ [ 'document/elements/paste' ], [ 'document/elements/import' ] ] )(
		'should load component assets when %s hook is triggered',
		( command ) => {
			// Arrange
			initLoadComponentDataAfterInstanceAdded();

			const callback = getRegisteredCallback( command );

			const mockElement = createMockElement( {
				model: {
					id: 'element-1',
					widgetType: 'e-component',
					elType: 'widget',
				},
			} );

			// Act
			callback( {}, mockElement );

			// Assert
			expect( mockLoadComponentsAssets ).toHaveBeenCalledTimes( 1 );
			expect( mockLoadComponentsAssets ).toHaveBeenCalledWith( [ mockElement.model.toJSON() ] );
		}
	);

	it( 'should handle array of elements', () => {
		// Arrange
		initLoadComponentDataAfterInstanceAdded();

		const callback = getRegisteredCallback( 'document/elements/paste' );

		const mockElements = [
			createMockElement( { model: { id: 'element-1', widgetType: 'e-component', elType: 'widget' } } ),
			createMockElement( { model: { id: 'element-2', widgetType: 'e-heading', elType: 'widget' } } ),
		];

		// Act
		callback( {}, mockElements );

		// Assert
		expect( mockLoadComponentsAssets ).toHaveBeenCalledTimes( 1 );
		expect( mockLoadComponentsAssets ).toHaveBeenCalledWith( [
			mockElements[ 0 ].model.toJSON(),
			mockElements[ 1 ].model.toJSON(), // this is expected, as loadComponentsAssets handles all filtering, and nested elements iterations
		] );
	} );
} );

function getRegisteredCallback( command: string ): DataHookCallback {
	const call = mockRegisterDataHook.mock.calls.find( ( [ , cmd ] ) => cmd === command );

	if ( ! call ) {
		throw new Error( `No callback registered for command: ${ command }` );
	}

	return call[ 2 ] as DataHookCallback;
}
