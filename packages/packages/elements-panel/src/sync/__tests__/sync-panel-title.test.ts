import syncPanelTitle from '../sync-panel-title';
import { flushListeners, runCommand } from '@elementor/v1-adapters';

jest.mock( '@elementor/v1-adapters', () => ( {
	...jest.requireActual( '@elementor/v1-adapters' ),
	runCommand: jest.fn(),
} ) );

const mockRunCommand = jest.mocked( runCommand );

describe( '@elementor/elements-panel - syncPanelTitle', () => {
	afterEach( () => {
		flushListeners();

		jest.clearAllMocks();
	} );

	it( 'should change the panel title when opening the elements panel', () => {
		// Act.
		syncPanelTitle();

		window.dispatchEvent( new CustomEvent( 'elementor/routes/open', {
			detail: {
				route: 'panel/elements/categories',
			},
		} ) );

		// Assert.
		expect( mockRunCommand ).toHaveBeenCalledWith( 'panel/set-title', { title: 'Widget Panel' } );
	} );

	it( 'should change the panel title when V1 is ready', () => {
		// Act.
		syncPanelTitle();

		window.dispatchEvent( new CustomEvent( 'elementor/initialized' ) );

		// Assert.
		expect( mockRunCommand ).toHaveBeenCalledWith( 'panel/set-title', { title: 'Widget Panel' } );
	} );

	it( 'should not change the panel title when opening the site settings', () => {
		// Act.
		syncPanelTitle();

		window.dispatchEvent( new CustomEvent( 'elementor/routes/open', {
			detail: {
				route: 'panel/global/menu',
			},
		} ) );

		// Assert.
		expect( mockRunCommand ).not.toHaveBeenCalled();
	} );
} );
