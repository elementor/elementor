import { __privateUseListenTo as useListenTo } from '@elementor/editor-v1-adapters';
import { renderHook } from '@testing-library/react';

import { useActiveSiteSettingsTab } from '../hooks/use-active-site-settings-tab';
import { registerSiteSettingsTab } from '../tabs';

jest.mock( '@elementor/editor-v1-adapters', () => ( {
  __privateUseListenTo: jest.fn( ( _events, callback: () => unknown ) => callback() ),
  routeCloseEvent: jest.fn( ( route: string ) => `route:close:${ route }` ),
  routeOpenEvent: jest.fn( ( route: string ) => `route:open:${ route }` ),
  v1ReadyEvent: jest.fn( () => 'v1:ready' ),
} ) );

const ExampleTab = () => null;
const EXAMPLE_TAB_ID = 'settings-example';

describe( 'useActiveSiteSettingsTab', () => {
  const originalRoutes = window.$e?.routes;
  const mockGetCurrent = jest.fn();

  beforeEach( () => {
    window.$e = {
      routes: {
        getCurrent: mockGetCurrent,
      },
    } as unknown as typeof window.$e;

    registerSiteSettingsTab( { id: EXAMPLE_TAB_ID, component: ExampleTab } );
  } );

  afterEach( () => {
    window.$e = originalRoutes ? ( { routes: originalRoutes } as typeof window.$e ) : undefined;
    jest.clearAllMocks();
  } );

  it( 'returns null when the current panel route is not a site settings tab', () => {
    // Arrange — editor canvas route, not panel/global/*.
    mockGetCurrent.mockReturnValue( { panel: 'panel/editor' } );

    // Act.
    const { result } = renderHook( () => useActiveSiteSettingsTab() );

    // Assert — no site settings tab component should mount.
    expect( result.current ).toBeNull();
    expect( useListenTo ).toHaveBeenCalled();
  } );

  it( 'returns the tab registered for the active panel/global/{tab-id} route', () => {
    // Arrange — user opened Site Settings on a tab with a React override.
    mockGetCurrent.mockReturnValue( {
      panel: `panel/global/${ EXAMPLE_TAB_ID }`,
    } );

    // Act.
    const { result } = renderHook( () => useActiveSiteSettingsTab() );

    // Assert — hook resolves tab id from the route and looks up the component.
    expect( result.current?.component ).toBe( ExampleTab );
  } );

  it( 'returns null when the site settings route has no registered React tab', () => {
    // Arrange — legacy PHP-only tab with no injectSiteSettingsTab() registration.
    mockGetCurrent.mockReturnValue( {
      panel: 'panel/global/settings-colors',
    } );

    // Act.
    const { result } = renderHook( () => useActiveSiteSettingsTab() );

    // Assert — portal host renders nothing until a package registers the tab.
    expect( result.current ).toBeNull();
  } );
} );
