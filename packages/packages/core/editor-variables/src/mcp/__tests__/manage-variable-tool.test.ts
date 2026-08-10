import { httpService } from '@elementor/http-client';

import { applyLocalMutation } from '../../service';
import { initManageVariableTool } from '../manage-variable-tool';
import { MANAGE_VARIABLES_GUIDE_URI } from '../variable-tool-prompt';

jest.mock( '@elementor/http-client', () => ( {
  httpService: jest.fn(),
} ) );

jest.mock( '../../service', () => ( {
  applyLocalMutation: jest.fn(),
} ) );

type ResourceHandler = ( uri: URL ) => Promise< unknown >;

function createMockRegistry() {
  const addProxyToolMock = jest.fn();
  const registeredResources: Array< { name: string; uri: string; handler: ResourceHandler } > = [];

  const reg = {
    addProxyTool: addProxyToolMock,
    addTool: jest.fn(),
    resource: ( name: string, uri: string, _opts: unknown, handler: ResourceHandler ) => {
      registeredResources.push( { name, uri, handler } );
    },
    sendResourceUpdated: jest.fn(),
    setMCPDescription: jest.fn(),
    waitForReady: jest.fn(),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initManageVariableTool( reg as any );

  return { addProxyToolMock, registeredResources };
}

describe( 'manage-variable-tool (addProxyTool wrapper)', () => {
  let httpMock: { get: jest.Mock };

  beforeEach( () => {
    httpMock = {
      get: jest.fn().mockResolvedValue( { data: { data: 'guide text' } } ),
    };
    ( httpService as jest.Mock ).mockReturnValue( httpMock );
    jest.mocked( applyLocalMutation ).mockClear();
  } );

  it( 'registers addProxyTool with manage-global-variable and beforeCall + afterResponse hooks', () => {
    // Arrange + Act
    const { addProxyToolMock } = createMockRegistry();

    // Assert
    expect( addProxyToolMock ).toHaveBeenCalledWith( 'manage-global-variable', {
      hooks: { beforeCall: expect.any( Function ), afterResponse: expect.any( Function ) },
    } );
  } );

  it( 'afterResponse hook calls applyLocalMutation with action captured from beforeCall', async () => {
    // Arrange
    const { addProxyToolMock } = createMockRegistry();
    const [ , options ] = addProxyToolMock.mock.calls[ 0 ] as [
      string,
      {
        hooks: {
          beforeCall: ( i: unknown ) => Promise< void >;
          afterResponse: ( r: unknown ) => Promise< void >;
        };
      },
    ];
    const variable = { id: 'v-1', type: 'global-color-variable', label: 'brand', value: '#000' };

    // Act
    await options.hooks.beforeCall( { action: 'create' } );
    await options.hooks.afterResponse( { variable, watermark: 42 } );

    // Assert
    expect( applyLocalMutation ).toHaveBeenCalledWith( 'create', variable, 42 );
  } );

  it( 'registers the manage-global-variable-guide resource', () => {
    // Arrange + Act
    const { registeredResources } = createMockRegistry();

    // Assert
    const guide = registeredResources.find( ( r ) => r.name === 'manage-global-variable-guide' );
    expect( guide ).toBeDefined();
    expect( guide?.uri ).toBe( MANAGE_VARIABLES_GUIDE_URI );
  } );

  it( 'fetches the guide resource from mcp-proxy GET', async () => {
    // Arrange
    const { registeredResources } = createMockRegistry();
    const guide = registeredResources.find( ( r ) => r.name === 'manage-global-variable-guide' );
    const uri = new URL( MANAGE_VARIABLES_GUIDE_URI );

    // Act
    const result = ( await guide?.handler( uri ) ) as {
      contents: Array< { text: string; mimeType: string } >;
    };

    // Assert
    expect( httpMock.get ).toHaveBeenCalledWith( 'elementor/v1/mcp-proxy', {
      params: { uri: uri.href },
    } );
    expect( result.contents[ 0 ].text ).toBe( 'guide text' );
    expect( result.contents[ 0 ].mimeType ).toBe( 'text/plain' );
  } );
} );
