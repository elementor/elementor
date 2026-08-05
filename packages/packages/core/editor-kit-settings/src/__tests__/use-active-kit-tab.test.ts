import { __privateUseListenTo as useListenTo } from '@elementor/editor-v1-adapters';
import { renderHook } from '@testing-library/react';

import { useActiveKitTab } from '../hooks/use-active-kit-tab';
import { registerKitTab } from '../tabs';

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	__privateUseListenTo: jest.fn( ( _events, callback: () => unknown ) => callback() ),
	routeCloseEvent: jest.fn( ( route: string ) => `route:close:${ route }` ),
	routeOpenEvent: jest.fn( ( route: string ) => `route:open:${ route }` ),
	v1ReadyEvent: jest.fn( () => 'v1:ready' ),
} ) );

const AgentsTab = () => null;

describe( 'useActiveKitTab', () => {
	const originalRoutes = window.$e?.routes;
	const mockGetCurrent = jest.fn();

	beforeEach( () => {
		window.$e = {
			routes: {
				getCurrent: mockGetCurrent,
			},
		} as unknown as typeof window.$e;

		registerKitTab( { id: 'settings-agents', component: AgentsTab } );
	} );

	afterEach( () => {
		window.$e = originalRoutes ? ( { routes: originalRoutes } as typeof window.$e ) : undefined;
		jest.clearAllMocks();
	} );

	it( 'returns null when the panel route is outside kit settings', () => {
		// Arrange.
		mockGetCurrent.mockReturnValue( { panel: 'panel/editor' } );

		// Act.
		const { result } = renderHook( () => useActiveKitTab() );

		// Assert.
		expect( result.current ).toBeNull();
		expect( useListenTo ).toHaveBeenCalled();
	} );

	it( 'returns the registered tab for the active kit settings route', () => {
		// Arrange.
		mockGetCurrent.mockReturnValue( {
			panel: 'panel/global/settings-agents',
		} );

		// Act.
		const { result } = renderHook( () => useActiveKitTab() );

		// Assert.
		expect( result.current?.component ).toBe( AgentsTab );
	} );

	it( 'returns null when the kit settings route has no registered tab', () => {
		// Arrange.
		mockGetCurrent.mockReturnValue( {
			panel: 'panel/global/settings-colors',
		} );

		// Act.
		const { result } = renderHook( () => useActiveKitTab() );

		// Assert.
		expect( result.current ).toBeNull();
	} );
} );
