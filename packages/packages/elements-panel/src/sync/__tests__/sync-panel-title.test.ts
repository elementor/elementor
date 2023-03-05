import syncPanelTitle from '../sync-panel-title';
import { isRouteActive } from '@elementor/v1-adapters';

type ExtendedWindow = Window & {
	elementor?: {
		getPanelView: () => {
			getHeaderView: () => {
				setTitle: jest.Mock;
			}
		}
	}
}

jest.mock( '@elementor/v1-adapters', () => ( {
	...jest.requireActual( '@elementor/v1-adapters' ),
	isRouteActive: jest.fn().mockReturnValue( false ),
} ) );

const mockIsRouteActive = jest.mocked( isRouteActive );

describe( '@elementor/elements-panel - syncPanelTitle', () => {
	let mockSetTitle: jest.Mock;

	beforeEach( () => {
		mockSetTitle = jest.fn();

		( window as unknown as ExtendedWindow ).elementor = {
			getPanelView: () => ( {
				getHeaderView: () => ( {
					setTitle: mockSetTitle,
				} ),
			} ),
		};
	} );

	it( 'should change the panel title when opening the elements panel', () => {
		// Arrange.
		syncPanelTitle();

		// Act.
		window.dispatchEvent( new CustomEvent( 'elementor/routes/open', {
			detail: {
				route: 'panel/elements/categories',
			},
		} ) );

		// Assert.
		expect( mockSetTitle ).toHaveBeenCalledWith( 'Elements' );
	} );

	it( 'should change the panel title when V1 is ready and the elements panel is open', () => {
		// Arrange.
		mockIsRouteActive.mockImplementation( ( route ) => route === 'panel/elements' );
		syncPanelTitle();

		// Act.
		window.dispatchEvent( new CustomEvent( 'elementor/initialized' ) );

		// Assert.
		expect( mockSetTitle ).toHaveBeenCalledWith( 'Elements' );
		expect( mockIsRouteActive ).toHaveBeenCalledWith( 'panel/elements' );
	} );

	it( 'should not change the panel title when V1 is ready and the elements panel is not open', () => {
		// Arrange.
		mockIsRouteActive.mockImplementation( ( route ) => route === 'not/the/panel' );
		syncPanelTitle();

		// Act.
		window.dispatchEvent( new CustomEvent( 'elementor/initialized' ) );

		// Assert.
		expect( mockSetTitle ).not.toHaveBeenCalled();
		expect( mockIsRouteActive ).toHaveBeenCalledWith( 'panel/elements' );
	} );

	it( 'should not change the panel title when opening the site settings', () => {
		// Arrange.
		mockIsRouteActive.mockImplementation( ( route ) => route === 'panel/global/menu' );
		syncPanelTitle();

		// Act.
		window.dispatchEvent( new CustomEvent( 'elementor/routes/open', {
			detail: {
				route: 'panel/global/menu',
			},
		} ) );

		// Assert.
		expect( mockSetTitle ).not.toHaveBeenCalled();
	} );
} );
